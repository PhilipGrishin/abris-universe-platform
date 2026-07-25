import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  validateCanonicalPatternVersion,
  validateProject,
  type ImportJob,
  type Project,
} from "@abris-universe/domain-core";
import {
  validateOxsImportReport,
  type OxsImportReport,
} from "@abris-universe/oxs-importer";
import {
  PersistenceError,
  STORE_NAMES,
  type ImportAttemptInput,
  type ImportCommitInput,
  type ImportRejectionInput,
  type PatternTileRecord,
  type StoredImportJob,
  type StoredSourceFile,
  type TileSetMetadata,
} from "./contracts.ts";
import {
  requestResult,
  runReadonly,
  runReadwrite,
  type AbrisDatabase,
} from "./database.ts";

function requireRecord<T>(record: T | undefined, label: string): T {
  if (record === undefined) {
    throw new PersistenceError(
      "PERSISTENCE_RECORD_NOT_FOUND",
      `${label} does not exist.`,
    );
  }
  return record;
}

function assertImportAttempt(input: ImportAttemptInput): void {
  if (
    input.sourceFile.retentionStatus !== "retained" ||
    input.sourceFile.bytesRef === null ||
    input.sourceFile.byteLength !== input.sourceBlob.size ||
    !Number.isSafeInteger(input.maxSourceBytes) ||
    input.maxSourceBytes <= 0 ||
    input.sourceBlob.size > input.maxSourceBytes
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Source bytes do not satisfy the approved preflight contract.",
    );
  }
  if (
    input.importJob.status !== "importing" ||
    input.importJob.sourceFileId !== input.sourceFile.id ||
    input.project.status !== "importing" ||
    input.project.importJobId !== input.importJob.id
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Import attempt records do not form an importing lifecycle.",
    );
  }
  validateProject(input.project);
}

async function hashBlob(blob: Blob): Promise<string> {
  return bytesToHex(sha256(new Uint8Array(await blob.arrayBuffer())));
}

export async function startImportAttempt(
  database: AbrisDatabase,
  input: ImportAttemptInput,
): Promise<void> {
  assertImportAttempt(input);
  if ((await hashBlob(input.sourceBlob)) !== input.sourceFile.sha256) {
    throw new PersistenceError(
      "PERSISTENCE_INTEGRITY_CORRUPTION",
      "Source Blob bytes do not match SourceFile.sha256.",
    );
  }
  await runReadwrite(
    database,
    [
      STORE_NAMES.sourceFiles,
      STORE_NAMES.importJobs,
      STORE_NAMES.projects,
    ],
    async (transaction) => {
      transaction.objectStore(STORE_NAMES.sourceFiles).add({
        ...input.sourceFile,
        bytes: input.sourceBlob,
      } satisfies StoredSourceFile);
      transaction.objectStore(STORE_NAMES.importJobs).add({
        ...input.importJob,
        report: null,
      } satisfies StoredImportJob);
      transaction.objectStore(STORE_NAMES.projects).add(input.project);
    },
  );
}

function assertReportMatches(
  report: unknown,
  importJob: ImportJob,
  sourceSha256: string,
  canonicalContentHash?: string,
): asserts report is OxsImportReport {
  try {
    validateOxsImportReport(report);
  } catch (error) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "ImportReport is malformed or exceeds its approved bound.",
      { cause: error },
    );
  }
  if (
    report.importJobId !== importJob.id ||
    report.status !== importJob.status ||
    report.sourceSha256 !== sourceSha256 ||
    report.canonicalContentHash !== canonicalContentHash
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "ImportReport does not match its import lifecycle and content hashes.",
    );
  }
}

function assertSuccessfulCommit(input: ImportCommitInput): void {
  validateCanonicalPatternVersion({
    sourceFile: input.sourceFile,
    importJob: input.importJob,
    pattern: input.pattern,
    patternVersion: input.patternVersion,
    stitches: input.stitches,
  });
  validateProject(input.project);
  if (
    !["completed", "completed_with_warnings"].includes(input.importJob.status) ||
    input.project.status !== "ready" ||
    input.project.patternVersionId !== input.patternVersion.id ||
    input.project.importJobId !== input.importJob.id
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Successful import records do not form a completed lifecycle.",
    );
  }
  assertReportMatches(
    input.report,
    input.importJob,
    input.sourceFile.sha256,
    input.patternVersion.canonicalContentHash,
  );

  if (!Number.isSafeInteger(input.tileSize) || input.tileSize <= 0) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Tile size must be a positive safe integer.",
    );
  }
  const canonicalStitches = new Map(
    input.stitches.map((stitch) => [stitch.id, stitch] as const),
  );
  const stitchIds = new Set<string>();
  const tileKeys = new Set<string>();
  for (const tile of input.tiles) {
    if (
      tile.patternVersionId !== input.patternVersion.id ||
      !Number.isSafeInteger(tile.tileX) ||
      tile.tileX < 0 ||
      !Number.isSafeInteger(tile.tileY) ||
      tile.tileY < 0
    ) {
      throw new PersistenceError(
        "PERSISTENCE_STATE_CONFLICT",
        "Pattern tile identity is invalid.",
      );
    }
    const tileKey = `${tile.tileY}:${tile.tileX}`;
    if (tileKeys.has(tileKey) || tile.stitches.length === 0) {
      throw new PersistenceError(
        "PERSISTENCE_STATE_CONFLICT",
        "Pattern tiles must be unique and non-empty.",
      );
    }
    tileKeys.add(tileKey);
    let previousLocalIndex = -1;
    for (const stitch of tile.stitches) {
      const canonical = canonicalStitches.get(stitch.id);
      if (stitchIds.has(stitch.id)) {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          `Stitch ${stitch.id} appears in more than one tile.`,
        );
      }
      if (
        canonical === undefined ||
        canonical.type !== stitch.type ||
        canonical.x !== stitch.x ||
        canonical.y !== stitch.y ||
        canonical.symbolId !== stitch.symbolId ||
        canonical.paletteItemId !== stitch.paletteItemId ||
        canonical.strandCount !== stitch.strandCount ||
        Math.floor(stitch.x / input.tileSize) !== tile.tileX ||
        Math.floor(stitch.y / input.tileSize) !== tile.tileY
      ) {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          `Stitch ${stitch.id} does not match its canonical tile assignment.`,
        );
      }
      const localIndex =
        (stitch.y % input.tileSize) * input.tileSize +
        (stitch.x % input.tileSize);
      if (localIndex <= previousLocalIndex) {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          "Tile stitches must be sorted by unique local cell index.",
        );
      }
      previousLocalIndex = localIndex;
      stitchIds.add(stitch.id);
    }
  }
  if (
    stitchIds.size !== input.stitches.length ||
    input.stitches.some((stitch) => !stitchIds.has(stitch.id))
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Pattern tiles must contain every canonical stitch exactly once.",
    );
  }
}

export async function commitSuccessfulImport(
  database: AbrisDatabase,
  input: ImportCommitInput,
): Promise<void> {
  assertSuccessfulCommit(input);
  await runReadwrite(
    database,
    [
      STORE_NAMES.sourceFiles,
      STORE_NAMES.importJobs,
      STORE_NAMES.patterns,
      STORE_NAMES.patternVersions,
      STORE_NAMES.patternTiles,
      STORE_NAMES.projects,
      STORE_NAMES.metadata,
    ],
    async (transaction) => {
      const sourceStore = transaction.objectStore(STORE_NAMES.sourceFiles);
      const importStore = transaction.objectStore(STORE_NAMES.importJobs);
      const projectStore = transaction.objectStore(STORE_NAMES.projects);
      const storedSource = requireRecord(
        (await requestResult(sourceStore.get(input.sourceFile.id))) as
          | StoredSourceFile
          | undefined,
        `SourceFile ${input.sourceFile.id}`,
      );
      const storedJob = requireRecord(
        (await requestResult(importStore.get(input.importJob.id))) as
          | StoredImportJob
          | undefined,
        `ImportJob ${input.importJob.id}`,
      );
      const storedProject = requireRecord(
        (await requestResult(projectStore.get(input.project.id))) as
          | Project
          | undefined,
        `Project ${input.project.id}`,
      );
      if (
        storedJob.status !== "importing" ||
        storedProject.status !== "importing" ||
        storedSource.bytes === null ||
        storedSource.id !== input.sourceFile.id ||
        storedSource.originalName !== input.sourceFile.originalName ||
        storedSource.mediaType !== input.sourceFile.mediaType ||
        storedSource.declaredFormat !== input.sourceFile.declaredFormat ||
        storedSource.byteLength !== input.sourceFile.byteLength ||
        storedSource.sha256 !== input.sourceFile.sha256 ||
        storedSource.bytesRef !== input.sourceFile.bytesRef ||
        storedSource.receivedAt !== input.sourceFile.receivedAt ||
        storedJob.sourceFileId !== input.importJob.sourceFileId ||
        storedJob.importerId !== input.importJob.importerId ||
        storedJob.importerVersion !== input.importJob.importerVersion ||
        storedJob.startedAt !== input.importJob.startedAt ||
        storedProject.importJobId !== input.project.importJobId ||
        storedProject.createdAt !== input.project.createdAt
      ) {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          "Only a retained importing attempt can be committed.",
        );
      }

      sourceStore.put({
        ...input.sourceFile,
        bytes: storedSource.bytes,
      } satisfies StoredSourceFile);
      importStore.put({
        ...input.importJob,
        report: structuredClone(input.report),
      } satisfies StoredImportJob);
      transaction.objectStore(STORE_NAMES.patterns).add(input.pattern);
      transaction
        .objectStore(STORE_NAMES.patternVersions)
        .add(input.patternVersion);
      const tileStore = transaction.objectStore(STORE_NAMES.patternTiles);
      for (const tile of input.tiles) {
        tileStore.add(tile);
      }
      transaction.objectStore(STORE_NAMES.metadata).add({
        key: `tileSet:${input.patternVersion.id}`,
        value: {
          patternVersionId: input.patternVersion.id,
          tileSize: input.tileSize,
        } satisfies TileSetMetadata,
      });
      projectStore.put(input.project);
    },
  );
}

export async function rejectImportAttempt(
  database: AbrisDatabase,
  input: ImportRejectionInput,
): Promise<void> {
  validateProject(input.project);
  if (
    input.importJob.status !== "rejected" ||
    input.importJob.completedAt === null ||
    input.project.status !== "import_failed" ||
    input.project.importJobId !== input.importJob.id ||
    input.importJob.sourceFileId !== input.sourceFileId
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Rejected import records do not form a failed lifecycle.",
    );
  }

  let invalidReport: PersistenceError | undefined;
  try {
    assertReportMatches(
      input.report,
      input.importJob,
      (
        await getStoredSourceFile(database, input.sourceFileId)
      )?.sha256 ?? "",
    );
  } catch (error) {
    invalidReport =
      error instanceof PersistenceError
        ? error
        : new PersistenceError(
            "PERSISTENCE_STATE_CONFLICT",
            "Rejected ImportReport failed validation.",
            { cause: error },
          );
  }

  await runReadwrite(
    database,
    [
      STORE_NAMES.sourceFiles,
      STORE_NAMES.importJobs,
      STORE_NAMES.projects,
    ],
    async (transaction) => {
      const sourceStore = transaction.objectStore(STORE_NAMES.sourceFiles);
      const importStore = transaction.objectStore(STORE_NAMES.importJobs);
      const projectStore = transaction.objectStore(STORE_NAMES.projects);
      const source = requireRecord(
        (await requestResult(sourceStore.get(input.sourceFileId))) as
          | StoredSourceFile
          | undefined,
        `SourceFile ${input.sourceFileId}`,
      );
      const job = requireRecord(
        (await requestResult(importStore.get(input.importJob.id))) as
          | StoredImportJob
          | undefined,
        `ImportJob ${input.importJob.id}`,
      );
      const project = requireRecord(
        (await requestResult(projectStore.get(input.project.id))) as
          | Project
          | undefined,
        `Project ${input.project.id}`,
      );
      if (job.status !== "importing" || project.status !== "importing") {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          "Only an importing attempt can be rejected.",
        );
      }

      sourceStore.put({
        ...source,
        bytesRef: null,
        retentionStatus: "deleted-after-failure",
        bytes: null,
      } satisfies StoredSourceFile);
      if (invalidReport === undefined) {
        importStore.put({
          ...input.importJob,
          report: structuredClone(input.report),
        } satisfies StoredImportJob);
      } else {
        importStore.put({
          ...job,
          status: "interrupted",
          completedAt: input.importJob.completedAt,
          reportRef: null,
          warningCodes: [],
          report: null,
        } satisfies StoredImportJob);
      }
      projectStore.put(input.project);
    },
  );
  if (invalidReport !== undefined) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Rejected ImportReport was invalid; source bytes were deleted and the attempt was recorded as interrupted.",
      { cause: invalidReport },
    );
  }
}

export async function recoverInterruptedImports(
  database: AbrisDatabase,
  interruptedAt: string,
): Promise<number> {
  const projects = await runReadonly(
    database,
    [STORE_NAMES.projects],
    async (transaction) =>
      (await requestResult(
        transaction.objectStore(STORE_NAMES.projects).getAll(),
      )) as Project[],
  );
  const importingProjects = projects.filter(
    (project) => project.status === "importing",
  );

  let recovered = 0;
  for (const project of importingProjects) {
    await runReadwrite(
      database,
      [
        STORE_NAMES.sourceFiles,
        STORE_NAMES.importJobs,
        STORE_NAMES.projects,
      ],
      async (transaction) => {
        const importStore = transaction.objectStore(STORE_NAMES.importJobs);
        const sourceStore = transaction.objectStore(STORE_NAMES.sourceFiles);
        const projectStore = transaction.objectStore(STORE_NAMES.projects);
        const job = requireRecord(
          (await requestResult(importStore.get(project.importJobId))) as
            | StoredImportJob
            | undefined,
          `ImportJob ${project.importJobId}`,
        );
        const source = requireRecord(
          (await requestResult(sourceStore.get(job.sourceFileId))) as
            | StoredSourceFile
            | undefined,
          `SourceFile ${job.sourceFileId}`,
        );
        const currentProject = requireRecord(
          (await requestResult(projectStore.get(project.id))) as
            | Project
            | undefined,
          `Project ${project.id}`,
        );
        if (job.status !== "importing" || currentProject.status !== "importing") {
          return;
        }
        const interruptedJob: ImportJob = {
          ...job,
          status: "interrupted",
          completedAt: interruptedAt,
        };
        const failedProject: Project = {
          ...currentProject,
          status: "import_failed",
          updatedAt: interruptedAt,
        };
        importStore.put({
          ...interruptedJob,
          report: job.report,
        } satisfies StoredImportJob);
        sourceStore.put({
          ...source,
          bytesRef: null,
          retentionStatus: "deleted-after-failure",
          bytes: null,
        } satisfies StoredSourceFile);
        projectStore.put(failedProject);
        recovered += 1;
      },
    );
  }
  return recovered;
}

export async function getStoredSourceFile(
  database: AbrisDatabase,
  id: string,
): Promise<StoredSourceFile | undefined> {
  return runReadonly(database, [STORE_NAMES.sourceFiles], async (transaction) =>
    requestResult(transaction.objectStore(STORE_NAMES.sourceFiles).get(id)),
  );
}

export async function getStoredImportJob(
  database: AbrisDatabase,
  id: string,
): Promise<StoredImportJob | undefined> {
  return runReadonly(database, [STORE_NAMES.importJobs], async (transaction) =>
    requestResult(transaction.objectStore(STORE_NAMES.importJobs).get(id)),
  );
}

export async function getProject(
  database: AbrisDatabase,
  id: string,
): Promise<Project | undefined> {
  return runReadonly(database, [STORE_NAMES.projects], async (transaction) =>
    requestResult(transaction.objectStore(STORE_NAMES.projects).get(id)),
  );
}

export async function getPatternVersion(
  database: AbrisDatabase,
  id: string,
) {
  return runReadonly(
    database,
    [STORE_NAMES.patternVersions],
    async (transaction) =>
      requestResult(transaction.objectStore(STORE_NAMES.patternVersions).get(id)),
  );
}

export async function listPatternTiles(
  database: AbrisDatabase,
  patternVersionId: string,
): Promise<PatternTileRecord[]> {
  return runReadonly(
    database,
    [STORE_NAMES.patternTiles],
    async (transaction) =>
      (await requestResult(
        transaction.objectStore(STORE_NAMES.patternTiles).getAll(
          IDBKeyRange.bound(
            [patternVersionId, 0, 0],
            [patternVersionId, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
          ),
        ),
      )) as PatternTileRecord[],
  );
}

export async function getTileSetMetadata(
  database: AbrisDatabase,
  patternVersionId: string,
): Promise<TileSetMetadata | undefined> {
  return runReadonly(database, [STORE_NAMES.metadata], async (transaction) => {
    const record = (await requestResult(
      transaction
        .objectStore(STORE_NAMES.metadata)
        .get(`tileSet:${patternVersionId}`),
    )) as { readonly value: TileSetMetadata } | undefined;
    return record?.value;
  });
}
