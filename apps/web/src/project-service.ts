/**
 * Application service coordinating approved importer, persistence, and
 * renderer contracts. It contains lifecycle orchestration, not domain rules.
 */
import type {
  ImportJob,
  Pattern,
  PatternVersion,
  Project,
  SourceFile,
} from "@abris-universe/domain-core";
import {
  OXS_LIMITS,
  OxsImportBoundaryError,
  assertOxsSourcePreflight,
  type OxsImportReport,
} from "@abris-universe/oxs-importer";
import {
  appendProgressEvent,
  commitSuccessfulImport,
  getPattern,
  getPatternVersion,
  getPersistenceCapability,
  getProject,
  getStoredImportJob,
  getTileSetMetadata,
  listPatternTilesInRange,
  openAbrisDatabase,
  rebuildProgressProjection,
  recoverInterruptedImports,
  rejectImportAttempt,
  requestPersistentStorage,
  startImportAttempt,
  type AbrisDatabase,
  type LockManagerLike,
  type PersistenceCapability,
  type ProgressProjectionRecord,
} from "@abris-universe/persistence";
import {
  INITIAL_TILE_SIZE,
  MAX_RENDER_REQUESTED_TILES,
  type PatternSummary,
  type PatternTileProvider,
  type StitchHit,
  type TileRange,
} from "@abris-universe/renderer";

import { runOxsImportWorker } from "./import-client.ts";

const ACTIVE_PROJECT_KEY = "abris-universe:active-project";
const DEVICE_ID_KEY = "abris-universe:device-id";

export interface LoadedProject {
  readonly project: Extract<Project, { readonly status: "ready" }>;
  readonly pattern: Pattern;
  readonly patternVersion: PatternVersion;
  readonly report: OxsImportReport;
  readonly summary: PatternSummary;
  readonly progress: readonly ProgressProjectionRecord[];
  readonly tileProvider: PatternTileProvider;
  readonly persistenceCapability: PersistenceCapability | undefined;
}

export interface StitchDescription {
  readonly coordinate: { readonly x: number; readonly y: number };
  readonly symbol: string;
  readonly color: string;
  readonly brandCode: string | null;
}

export class ImportRejectedError extends Error {
  readonly report: OxsImportReport;

  constructor(report: OxsImportReport) {
    super("The OXS import was rejected.");
    this.name = "ImportRejectedError";
    this.report = report;
  }
}

function stableDeviceId(storage: Storage): string {
  const existing = storage.getItem(DEVICE_ID_KEY);
  if (existing !== null && existing.trim().length > 0) return existing;
  const created = `device:${crypto.randomUUID()}`;
  storage.setItem(DEVICE_ID_KEY, created);
  return created;
}

async function sha256Hex(bytes: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

class IndexedDbTileProvider implements PatternTileProvider {
  readonly #database: AbrisDatabase;
  readonly #summary: PatternSummary;

  constructor(database: AbrisDatabase, summary: PatternSummary) {
    this.#database = database;
    this.#summary = summary;
  }

  async getPatternSummary(patternVersionId: string): Promise<PatternSummary> {
    if (patternVersionId !== this.#summary.patternVersionId) {
      throw new Error("Pattern summary identity does not match the active project.");
    }
    return this.#summary;
  }

  async getTiles(
    patternVersionId: string,
    range: TileRange,
    signal: AbortSignal,
  ) {
    if (signal.aborted) throw new DOMException("Aborted.", "AbortError");
    const tiles = await listPatternTilesInRange(this.#database, patternVersionId, {
      range,
      maxTileCoordinates: MAX_RENDER_REQUESTED_TILES,
    });
    if (signal.aborted) throw new DOMException("Aborted.", "AbortError");
    return tiles;
  }
}

export class ProjectService {
  readonly #database: AbrisDatabase;
  readonly #storage: Storage;

  private constructor(database: AbrisDatabase, storage: Storage) {
    this.#database = database;
    this.#storage = storage;
  }

  static async open(storage: Storage = localStorage): Promise<ProjectService> {
    const database = await openAbrisDatabase({
      deviceId: stableDeviceId(storage),
    });
    await recoverInterruptedImports(database, new Date().toISOString());
    return new ProjectService(database, storage);
  }

  async loadActiveProject(): Promise<LoadedProject | null> {
    const projectId = this.#storage.getItem(ACTIVE_PROJECT_KEY);
    if (projectId === null) return null;
    try {
      return await this.loadProject(projectId);
    } catch {
      this.#storage.removeItem(ACTIVE_PROJECT_KEY);
      return null;
    }
  }

  async importFile(
    file: File,
    signal?: AbortSignal,
  ): Promise<LoadedProject> {
    assertOxsSourcePreflight(file.size);
    const bytes = await file.arrayBuffer();
    const sourceSha256 = await sha256Hex(bytes.slice(0));
    const receivedAt = new Date().toISOString();
    const sourceFileId = `source:${crypto.randomUUID()}`;
    const importJobId = `import:${crypto.randomUUID()}`;
    const projectId = `project:${crypto.randomUUID()}`;
    const patternId = `pattern:${crypto.randomUUID()}`;
    const patternVersionId = `pattern-version:${crypto.randomUUID()}`;
    const sourceFile: SourceFile = {
      id: sourceFileId,
      originalName: file.name,
      mediaType: file.type || "application/xml",
      declaredFormat: "oxs",
      detectedFormatVersion: null,
      byteLength: file.size,
      sha256: sourceSha256,
      bytesRef: `idb:sourceFiles:${sourceFileId}:bytes`,
      retentionStatus: "retained",
      receivedAt,
    };
    const importJob: ImportJob = {
      id: importJobId,
      sourceFileId,
      importerId: "oxs",
      importerVersion: "0.1.0",
      status: "importing",
      startedAt: receivedAt,
      completedAt: null,
      reportRef: null,
      warningCodes: [],
    };
    const importingProject: Project = {
      id: projectId,
      patternVersionId: null,
      importJobId,
      createdAt: receivedAt,
      updatedAt: receivedAt,
      status: "importing",
    };

    await startImportAttempt(this.#database, {
      sourceFile,
      sourceBlob: file,
      importJob,
      project: importingProject,
      maxSourceBytes: OXS_LIMITS.maxSourceBytes,
    });

    try {
      const completedAt = new Date().toISOString();
      const response = await runOxsImportWorker(
        bytes,
        {
          originalName: file.name,
          mediaType: file.type || "application/xml",
          bytesRef: sourceFile.bytesRef!,
          sourceFileId,
          importJobId,
          patternId,
          patternVersionId,
          tileSetRef: `idb:patternTiles:${patternVersionId}`,
          receivedAt,
          startedAt: receivedAt,
          completedAt,
        },
        signal,
      );
      const result = response.result;
      if (result.status === "rejected") {
        await rejectImportAttempt(this.#database, {
          sourceFileId,
          importJob: result.importJob,
          project: {
            ...importingProject,
            status: "import_failed",
            updatedAt: completedAt,
          },
          report: result.report,
        });
        throw new ImportRejectedError(result.report);
      }

      const readyProject: Extract<Project, { readonly status: "ready" }> = {
        ...importingProject,
        patternVersionId: result.canonical.patternVersion.id,
        status: "ready",
        updatedAt: completedAt,
      };
      await commitSuccessfulImport(this.#database, {
        sourceFile: result.sourceFile,
        importJob: result.importJob,
        pattern: result.canonical.pattern,
        patternVersion: result.canonical.patternVersion,
        stitches: result.canonical.stitches,
        tiles: response.tiles,
        tileSize: INITIAL_TILE_SIZE,
        project: readyProject,
        report: result.report,
      });
      this.#storage.setItem(ACTIVE_PROJECT_KEY, readyProject.id);
      try {
        await requestPersistentStorage(
          this.#database,
          navigator.storage,
          new Date().toISOString(),
        );
      } catch {
        // The ready project remains valid; the UI reports durability as ungranted.
      }
      return this.loadProject(readyProject.id);
    } catch (error) {
      if (!(error instanceof ImportRejectedError)) {
        await recoverInterruptedImports(this.#database, new Date().toISOString());
      }
      throw error;
    }
  }

  async toggleProgress(
    loaded: LoadedProject,
    hit: StitchHit,
    type: "mark" | "unmark",
  ): Promise<void> {
    const occurredAt = new Date().toISOString();
    await appendProgressEvent(
      this.#database,
      navigator.locks as unknown as LockManagerLike | undefined,
      {
        id: `progress:${crypto.randomUUID()}`,
        projectId: loaded.project.id,
        patternVersionId: loaded.patternVersion.id,
        type,
        targetStitchId: hit.stitchId,
        targetX: hit.x,
        targetY: hit.y,
        occurredAt,
        updatedAt: occurredAt,
      },
    );
  }

  async describeStitch(
    loaded: LoadedProject,
    hit: StitchHit,
  ): Promise<StitchDescription> {
    const tileX = Math.floor(hit.x / loaded.summary.tileSize);
    const tileY = Math.floor(hit.y / loaded.summary.tileSize);
    const tiles = await listPatternTilesInRange(
      this.#database,
      loaded.patternVersion.id,
      {
        range: {
          minTileX: tileX,
          maxTileX: tileX,
          minTileY: tileY,
          maxTileY: tileY,
        },
        maxTileCoordinates: 1,
      },
    );
    const stitch = tiles[0]?.stitches.find(
      (candidate) =>
        candidate.id === hit.stitchId &&
        candidate.x === hit.x &&
        candidate.y === hit.y,
    );
    const symbol = loaded.pattern.symbols.find(
      (candidate) => candidate.id === stitch?.symbolId,
    );
    const palette = loaded.pattern.paletteItems.find(
      (candidate) => candidate.id === stitch?.paletteItemId,
    );
    if (stitch === undefined || symbol === undefined || palette === undefined) {
      throw new Error("Selected stitch references are incomplete.");
    }
    return {
      coordinate: { x: stitch.x, y: stitch.y },
      symbol:
        symbol.visual.kind === "text-code-point"
          ? symbol.visual.value
          : `generated ${symbol.visual.ordinal}`,
      color: palette.displayColor,
      brandCode: palette.brandCode,
    };
  }

  close(): void {
    this.#database.close();
  }

  private async loadProject(projectId: string): Promise<LoadedProject> {
    const project = await getProject(this.#database, projectId);
    if (project?.status !== "ready") {
      throw new Error("Active project is not ready.");
    }
    const patternVersion = await getPatternVersion(
      this.#database,
      project.patternVersionId,
    );
    if (patternVersion === undefined) {
      throw new Error("Active PatternVersion is missing.");
    }
    const pattern = await getPattern(this.#database, patternVersion.patternId);
    const importJob = await getStoredImportJob(
      this.#database,
      project.importJobId,
    );
    const tileSet = await getTileSetMetadata(
      this.#database,
      patternVersion.id,
    );
    if (
      pattern === undefined ||
      importJob?.report === null ||
      importJob?.report === undefined ||
      tileSet === undefined
    ) {
      throw new Error("Active project records are incomplete.");
    }
    const progress = await rebuildProgressProjection(
      this.#database,
      project.id,
    );
    const summary: PatternSummary = {
      patternVersionId: patternVersion.id,
      grid: pattern.grid,
      paletteItems: pattern.paletteItems,
      symbols: pattern.symbols,
      tileSize: tileSet.tileSize,
      stitchCount: importJob.report.counts.fullCrossStitches,
    };
    return {
      project,
      pattern,
      patternVersion,
      report: importJob.report,
      summary,
      progress,
      tileProvider: new IndexedDbTileProvider(this.#database, summary),
      persistenceCapability: await getPersistenceCapability(this.#database),
    };
  }
}

export function isImportBoundaryError(
  value: unknown,
): value is OxsImportBoundaryError {
  return value instanceof OxsImportBoundaryError;
}
