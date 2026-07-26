import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import "fake-indexeddb/auto";
import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import type {
  FullCrossStitch,
  ImportJob,
  Pattern,
  PatternVersion,
  Project,
  SourceFile,
} from "@abris-universe/domain-core";
import type { OxsImportReport } from "@abris-universe/oxs-importer";
import {
  PersistenceError,
  STORE_NAMES,
  appendProgressEvent,
  commitSuccessfulImport,
  getPattern,
  getPatternVersion,
  getPersistenceCapability,
  getProgressProjection,
  getProject,
  getStoredImportJob,
  getStoredSourceFile,
  getTileSetMetadata,
  listPatternTiles,
  listPatternTilesInRange,
  listProgressEvents,
  openAbrisDatabase,
  requestPersistentStorage,
  requestResult,
  runReadwrite,
  rebuildProgressProjection,
  recoverInterruptedImports,
  rejectImportAttempt,
  startImportAttempt,
  type AbrisDatabase,
  type LockManagerLike,
} from "../src/index.ts";

const ISO_1 = "2026-07-25T10:00:00.000Z";
const ISO_2 = "2026-07-25T10:01:00.000Z";
const ISO_3 = "2026-07-25T10:02:00.000Z";
const HASH_A =
  "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f";
const HASH_B = "b".repeat(64);
const openDatabases: AbrisDatabase[] = [];
const databaseNames: string[] = [];

const locks: LockManagerLike = {
  request: async (name, _options, callback) => callback({ name }),
};

function nextDatabaseName(): string {
  const name = `abris-universe-test-${crypto.randomUUID()}`;
  databaseNames.push(name);
  return name;
}

async function openDatabase(name = nextDatabaseName()): Promise<AbrisDatabase> {
  const database = await openAbrisDatabase({
    name,
    deviceId: "device-test-001",
  });
  openDatabases.push(database);
  return database;
}

afterEach(async () => {
  while (openDatabases.length > 0) {
    openDatabases.pop()?.close();
  }
  while (databaseNames.length > 0) {
    const name = databaseNames.pop();
    if (name !== undefined) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase(name);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    }
  }
});

function records(suffix = "") {
  const sourceFile: SourceFile = {
    id: `source${suffix}`,
    originalName: "sample.oxs",
    mediaType: "application/xml",
    declaredFormat: "oxs",
    detectedFormatVersion: "1.0",
    byteLength: 8,
    sha256: HASH_A,
    bytesRef: `idb:sourceFiles:source${suffix}:bytes`,
    retentionStatus: "retained",
    receivedAt: ISO_1,
  };
  const importingJob: ImportJob = {
    id: `job${suffix}`,
    sourceFileId: sourceFile.id,
    importerId: "oxs",
    importerVersion: "0.1.0",
    status: "importing",
    startedAt: ISO_1,
    completedAt: null,
    reportRef: null,
    warningCodes: [],
  };
  const importingProject: Project = {
    id: `project${suffix}`,
    patternVersionId: null,
    importJobId: importingJob.id,
    createdAt: ISO_1,
    updatedAt: ISO_1,
    status: "importing",
  };
  const pattern: Pattern = {
    id: `pattern${suffix}`,
    metadata: {
      name: "Sample",
      width: 2,
      height: 2,
      fabric: {
        type: null,
        countX: null,
        countY: null,
        countUnit: null,
        clothPaletteItemId: null,
      },
    },
    grid: {
      width: 2,
      height: 2,
      origin: "top-left",
      coordinateBase: 0,
      xDirection: "right",
      yDirection: "down",
    },
    paletteItems: [
      {
        id: `palette${suffix}`,
        sourceIndex: 0,
        role: "thread",
        threadBrand: null,
        brandCode: null,
        displayName: "Black",
        displayColor: "#000000",
      },
    ],
    symbols: [
      {
        id: `symbol${suffix}`,
        sourceCode: "X",
        visual: {
          kind: "text-code-point",
          value: "X",
          fontFamily: "sans-serif",
        },
      },
    ],
    createdAt: ISO_1,
    provenanceRef: sourceFile.id,
  };
  const patternVersion: PatternVersion = {
    id: `version${suffix}`,
    patternId: pattern.id,
    canonicalFormatVersion: "1.0.0",
    createdAt: ISO_2,
    sourceFileId: sourceFile.id,
    importJobId: importingJob.id,
    canonicalContentHash: HASH_B,
    tileSetRef: `idb:patternTiles:version${suffix}`,
  };
  const stitch: FullCrossStitch = {
    id: `stitch${suffix}`,
    type: "full-cross",
    x: 0,
    y: 1,
    symbolId: `symbol${suffix}`,
    paletteItemId: `palette${suffix}`,
  };
  const completedJob: ImportJob = {
    ...importingJob,
    status: "completed",
    completedAt: ISO_2,
    reportRef: `idb:importJobs:job${suffix}:report`,
  };
  const readyProject: Project = {
    ...importingProject,
    status: "ready",
    patternVersionId: patternVersion.id,
    updatedAt: ISO_2,
  };
  return {
    sourceFile,
    importingJob,
    importingProject,
    pattern,
    patternVersion,
    stitch,
    completedJob,
    readyProject,
  };
}

function importReport(
  data: ReturnType<typeof records>,
  status: "completed" | "rejected" = "completed",
): OxsImportReport {
  return {
    schemaVersion: 1,
    importJobId: data.importingJob.id,
    status,
    errors:
      status === "rejected"
        ? [
            {
              code: "OXS_ROOT_INVALID",
              severity: "error",
              messageKey: "import.oxs.oxs_root_invalid",
              location: null,
              details: {},
            },
          ]
        : [],
    warnings: [],
    counts: {
      paletteItems: status === "completed" ? 1 : 0,
      symbols: status === "completed" ? 1 : 0,
      fullCrossStitches: status === "completed" ? 1 : 0,
      unsupportedByKind: {},
    },
    sourceSha256: data.sourceFile.sha256,
    ...(status === "completed"
      ? { canonicalContentHash: data.patternVersion.canonicalContentHash }
      : {}),
  };
}

function progressEventHash(event: Record<string, unknown>): string {
  return bytesToHex(
    sha256(
      new TextEncoder().encode(
        JSON.stringify({
          schemaVersion: event.schemaVersion,
          id: event.id,
          projectId: event.projectId,
          patternVersionId: event.patternVersionId,
          localSequence: event.localSequence,
          type: event.type,
          targetStitchId: event.targetStitchId,
          occurredAt: event.occurredAt,
          deviceId: event.deviceId,
          source: event.source,
        }),
      ),
    ),
  );
}

async function stage(
  database: AbrisDatabase,
  data = records(),
): Promise<void> {
  await startImportAttempt(database, {
    sourceFile: data.sourceFile,
    sourceBlob: new Blob(["12345678"], { type: "application/xml" }),
    importJob: data.importingJob,
    project: data.importingProject,
    maxSourceBytes: 64 * 1024 * 1024,
  });
}

async function complete(
  database: AbrisDatabase,
  data = records(),
): Promise<void> {
  await commitSuccessfulImport(database, {
    sourceFile: data.sourceFile,
    importJob: data.completedJob,
    pattern: data.pattern,
    patternVersion: data.patternVersion,
    stitches: [data.stitch],
    tiles: [
      {
        patternVersionId: data.patternVersion.id,
        tileY: 0,
        tileX: 0,
        stitches: [data.stitch],
      },
    ],
    tileSize: 32,
    project: data.readyProject,
    report: importReport(data),
  });
}

test("creates the exact schema-v1 stores and retains a stable device ID", async () => {
  const name = nextDatabaseName();
  const database = await openDatabase(name);
  assert.deepEqual(
    [...database.connection.objectStoreNames],
    Object.values(STORE_NAMES).sort(),
  );
  database.close();
  openDatabases.pop();

  const reopened = await openAbrisDatabase({
    name,
    deviceId: "a-different-installation-candidate",
  });
  openDatabases.push(reopened);
  assert.equal(reopened.deviceId, "device-test-001");
});

test("surfaces blocked upgrades and quota failures with typed errors", async () => {
  const blockedRequest: Partial<IDBOpenDBRequest> = {};
  const blockedFactory = {
    open: () => {
      queueMicrotask(() => blockedRequest.onblocked?.(new Event("blocked")));
      return blockedRequest as IDBOpenDBRequest;
    },
  } as unknown as IDBFactory;
  await assert.rejects(
    openAbrisDatabase({
      name: "blocked",
      deviceId: "device-test-001",
      factory: blockedFactory,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_UPGRADE_BLOCKED",
  );

  const database = await openDatabase();
  await assert.rejects(
    runReadwrite(database, [STORE_NAMES.metadata], async () => {
      throw new DOMException("Simulated quota exhaustion.", "QuotaExceededError");
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_QUOTA_EXCEEDED",
  );
  assert.equal(
    await requestResult(
      database.connection
        .transaction(STORE_NAMES.metadata)
        .objectStore(STORE_NAMES.metadata)
        .get("uncommitted"),
    ),
    undefined,
  );
});

test("records persistence capability and exposes denial without claiming backup", async () => {
  const database = await openDatabase();
  const denied = await requestPersistentStorage(
    database,
    {
      persisted: async () => false,
      persist: async () => false,
    },
    ISO_1,
  );
  assert.deepEqual(denied, {
    supported: true,
    alreadyPersistent: false,
    granted: false,
    checkedAt: ISO_1,
  });
  assert.deepEqual(await getPersistenceCapability(database), denied);

  const unsupported = await requestPersistentStorage(database, undefined, ISO_2);
  assert.deepEqual(unsupported, {
    supported: false,
    alreadyPersistent: false,
    granted: false,
    checkedAt: ISO_2,
  });
});

test("commits retained source, canonical records, tiles, and ready Project atomically", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);

  const source = await getStoredSourceFile(database, data.sourceFile.id);
  assert.equal(source?.bytes?.size, 8);
  assert.equal(source?.retentionStatus, "retained");
  assert.equal(
    (await getStoredImportJob(database, data.completedJob.id))?.status,
    "completed",
  );
  assert.equal(
    (await getProject(database, data.readyProject.id))?.status,
    "ready",
  );
  assert.equal(
    (await getPatternVersion(database, data.patternVersion.id))?.id,
    data.patternVersion.id,
  );
  assert.deepEqual(await getPattern(database, data.pattern.id), data.pattern);
  assert.deepEqual(await listPatternTiles(database, data.patternVersion.id), [
    {
      patternVersionId: data.patternVersion.id,
      tileY: 0,
      tileX: 0,
      stitches: [data.stitch],
    },
  ]);
  assert.deepEqual(
    await listPatternTilesInRange(database, data.patternVersion.id, {
      range: {
        minTileX: 0,
        maxTileX: 0,
        minTileY: 0,
        maxTileY: 0,
      },
      maxTileCoordinates: 1,
    }),
    [
      {
        patternVersionId: data.patternVersion.id,
        tileY: 0,
        tileX: 0,
        stitches: [data.stitch],
      },
    ],
  );
  assert.deepEqual(
    await getTileSetMetadata(database, data.patternVersion.id),
    {
      patternVersionId: data.patternVersion.id,
      tileSize: 32,
    },
  );
});

test("bounded tile-range reads reject excessive requests", async () => {
  const database = await openDatabase();
  await assert.rejects(
    listPatternTilesInRange(database, "version", {
      range: {
        minTileX: 0,
        maxTileX: 1,
        minTileY: 0,
        maxTileY: 1,
      },
      maxTileCoordinates: 3,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_STATE_CONFLICT",
  );
});

test("rejects a staged Blob whose bytes do not match SourceFile.sha256", async () => {
  const database = await openDatabase();
  const data = records();
  await assert.rejects(
    startImportAttempt(database, {
      sourceFile: { ...data.sourceFile, sha256: "a".repeat(64) },
      sourceBlob: new Blob(["12345678"], { type: "application/xml" }),
      importJob: data.importingJob,
      project: data.importingProject,
      maxSourceBytes: 64 * 1024 * 1024,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_INTEGRITY_CORRUPTION",
  );
  assert.equal(
    await getStoredSourceFile(database, data.sourceFile.id),
    undefined,
  );
});

test("aborts the complete-import transaction without partial canonical records", async () => {
  const database = await openDatabase();
  const first = records("-first");
  await stage(database, first);
  await complete(database, first);

  const second = records("-second");
  await stage(database, second);
  const conflicting = {
    ...second,
    pattern: { ...second.pattern, id: first.pattern.id },
    patternVersion: {
      ...second.patternVersion,
      patternId: first.pattern.id,
    },
  };
  await assert.rejects(
    complete(database, conflicting),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_TRANSACTION_FAILED",
  );
  assert.equal(
    (await getStoredImportJob(database, second.importingJob.id))?.status,
    "importing",
  );
  assert.equal(
    (await getProject(database, second.importingProject.id))?.status,
    "importing",
  );
  assert.equal(
    await getPatternVersion(database, second.patternVersion.id),
    undefined,
  );
  assert.deepEqual(
    await listPatternTiles(database, second.patternVersion.id),
    [],
  );
});

test("rejects tile data that diverges from canonical stitches", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await assert.rejects(
    commitSuccessfulImport(database, {
      sourceFile: data.sourceFile,
      importJob: data.completedJob,
      pattern: data.pattern,
      patternVersion: data.patternVersion,
      stitches: [data.stitch],
      tiles: [
        {
          patternVersionId: data.patternVersion.id,
          tileY: 0,
          tileX: 0,
          stitches: [{ ...data.stitch, x: 1 }],
        },
      ],
      tileSize: 32,
      project: data.readyProject,
      report: importReport(data),
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_STATE_CONFLICT",
  );
  assert.equal(
    (await getStoredImportJob(database, data.importingJob.id))?.status,
    "importing",
  );
  assert.equal(
    await getPatternVersion(database, data.patternVersion.id),
    undefined,
  );
});

test("deletes failed source bytes while retaining bounded provenance and diagnostics", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await rejectImportAttempt(database, {
    sourceFileId: data.sourceFile.id,
    importJob: {
      ...data.importingJob,
      status: "rejected",
      completedAt: ISO_2,
      reportRef: "idb:importJobs:job:report",
    },
    project: {
      ...data.importingProject,
      status: "import_failed",
      updatedAt: ISO_2,
    },
    report: importReport(data, "rejected"),
  });

  const source = await getStoredSourceFile(database, data.sourceFile.id);
  assert.equal(source?.bytes, null);
  assert.equal(source?.bytesRef, null);
  assert.equal(source?.retentionStatus, "deleted-after-failure");
  assert.deepEqual(
    (await getStoredImportJob(database, data.importingJob.id))?.report,
    importReport(data, "rejected"),
  );
});

test("cleans source bytes and records interruption when a rejected report is malformed", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  const malformed = {
    ...importReport(data, "rejected"),
    errors: [
      {
        code: "OXS_ROOT_INVALID",
        severity: "error",
        messageKey: "import.oxs.oxs_root_invalid",
        location: null,
        details: { value: "x".repeat(513) },
      },
    ],
  } as unknown as OxsImportReport;
  await assert.rejects(
    rejectImportAttempt(database, {
      sourceFileId: data.sourceFile.id,
      importJob: {
        ...data.importingJob,
        status: "rejected",
        completedAt: ISO_2,
        reportRef: "idb:importJobs:job:report",
      },
      project: {
        ...data.importingProject,
        status: "import_failed",
        updatedAt: ISO_2,
      },
      report: malformed,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_STATE_CONFLICT",
  );
  assert.equal(
    (await getStoredSourceFile(database, data.sourceFile.id))?.bytes,
    null,
  );
  const job = await getStoredImportJob(database, data.importingJob.id);
  assert.equal(job?.status, "interrupted");
  assert.equal(job?.report, null);
});

test("recovers interrupted imports without preserving opaque source bytes", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  assert.equal(await recoverInterruptedImports(database, ISO_2), 1);
  assert.equal(
    (await getStoredImportJob(database, data.importingJob.id))?.status,
    "interrupted",
  );
  assert.equal(
    (await getProject(database, data.importingProject.id))?.status,
    "import_failed",
  );
  assert.equal(
    (await getStoredSourceFile(database, data.sourceFile.id))?.bytes,
    null,
  );
  assert.equal(await recoverInterruptedImports(database, ISO_3), 0);
});

test("appends ordered progress events, makes identical retries no-ops, and detects conflicts", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);

  const mark = {
    id: "event-1",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark" as const,
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  };
  const first = await appendProgressEvent(database, locks, mark);
  const retry = await appendProgressEvent(database, locks, mark);
  const unmark = await appendProgressEvent(database, locks, {
    ...mark,
    id: "event-2",
    type: "unmark",
    occurredAt: ISO_3,
    updatedAt: ISO_3,
  });

  assert.equal(first.idempotentReplay, false);
  assert.equal(retry.idempotentReplay, true);
  assert.equal(retry.event.localSequence, 1);
  assert.equal(unmark.event.localSequence, 2);
  const idRecord = await requestResult(
    database.connection
      .transaction(STORE_NAMES.progressEventIds)
      .objectStore(STORE_NAMES.progressEventIds)
      .get(mark.id),
  );
  assert.equal(
    idRecord.payloadSha256,
    progressEventHash(first.event as unknown as Record<string, unknown>),
  );
  assert.equal((await listProgressEvents(database, data.readyProject.id)).length, 2);
  assert.deepEqual(
    await getProgressProjection(database, data.readyProject.id),
    [
      {
        projectId: data.readyProject.id,
        stitchId: data.stitch.id,
        state: "unmarked",
      },
    ],
  );
  await assert.rejects(
    appendProgressEvent(database, locks, {
      ...mark,
      targetStitchId: "different-stitch",
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_IDEMPOTENCY_CONFLICT",
  );
});

test("rejects a progress target that is absent from the exact PatternVersion", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);
  await assert.rejects(
    appendProgressEvent(database, locks, {
      id: "event-phantom",
      projectId: data.readyProject.id,
      patternVersionId: data.patternVersion.id,
      type: "mark",
      targetStitchId: "missing-stitch",
      targetX: 1,
      targetY: 1,
      occurredAt: ISO_2,
      updatedAt: ISO_2,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_STATE_CONFLICT",
  );
  assert.deepEqual(await listProgressEvents(database, data.readyProject.id), []);
});

test("rejects unsafe writers and stale toggle commands", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);
  const request = {
    id: "event-lock",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark" as const,
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  };

  await assert.rejects(
    appendProgressEvent(database, undefined, request),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_WEB_LOCKS_UNAVAILABLE",
  );
  const unavailable: LockManagerLike = {
    request: async (_name, _options, callback) => callback(null),
  };
  await assert.rejects(
    appendProgressEvent(database, unavailable, request),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_PROGRESS_LOCK_UNAVAILABLE",
  );
  await appendProgressEvent(database, locks, request);
  await assert.rejects(
    appendProgressEvent(database, locks, {
      ...request,
      id: "event-stale",
      occurredAt: ISO_3,
      updatedAt: ISO_3,
    }),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_STATE_CONFLICT",
  );
});

test("rebuilds the progress projection from immutable events after reopen", async () => {
  const name = nextDatabaseName();
  const database = await openDatabase(name);
  const data = records();
  await stage(database, data);
  await complete(database, data);
  await appendProgressEvent(database, locks, {
    id: "event-rebuild",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark",
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  });

  const transaction = database.connection.transaction(
    STORE_NAMES.progressProjections,
    "readwrite",
  );
  transaction.objectStore(STORE_NAMES.progressProjections).clear();
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  database.close();
  openDatabases.pop();

  const reopened = await openAbrisDatabase({
    name,
    deviceId: "device-test-001",
  });
  openDatabases.push(reopened);
  assert.deepEqual(
    await getProgressProjection(reopened, data.readyProject.id),
    [],
  );
  assert.deepEqual(
    await rebuildProgressProjection(reopened, data.readyProject.id),
    [
      {
        projectId: data.readyProject.id,
        stitchId: data.stitch.id,
        state: "marked",
      },
    ],
  );
});

test("fails closed when replay event and idempotency digest diverge", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);
  const request = {
    id: "event-corrupt-digest",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark" as const,
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  };
  await appendProgressEvent(database, locks, request);
  const transaction = database.connection.transaction(
    STORE_NAMES.progressEventIds,
    "readwrite",
  );
  transaction.objectStore(STORE_NAMES.progressEventIds).put({
    id: request.id,
    projectId: request.projectId,
    localSequence: 1,
    payloadSha256: "c".repeat(64),
  });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  await assert.rejects(
    appendProgressEvent(database, locks, request),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_INTEGRITY_CORRUPTION",
  );
});

test("fails closed when rebuild encounters an invalid event discriminant", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);
  const request = {
    id: "event-corrupt-type",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark" as const,
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  };
  const appended = await appendProgressEvent(database, locks, request);
  const transaction = database.connection.transaction(
    STORE_NAMES.progressEvents,
    "readwrite",
  );
  transaction.objectStore(STORE_NAMES.progressEvents).put({
    ...appended.event,
    type: "corrupt",
  });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  await assert.rejects(
    rebuildProgressProjection(database, data.readyProject.id),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_INTEGRITY_CORRUPTION",
  );
});

test("fails closed when rebuild encounters an internally hashed phantom stitch", async () => {
  const database = await openDatabase();
  const data = records();
  await stage(database, data);
  await complete(database, data);
  const request = {
    id: "event-corrupt-target",
    projectId: data.readyProject.id,
    patternVersionId: data.patternVersion.id,
    type: "mark" as const,
    targetStitchId: data.stitch.id,
    targetX: data.stitch.x,
    targetY: data.stitch.y,
    occurredAt: ISO_2,
    updatedAt: ISO_2,
  };
  const appended = await appendProgressEvent(database, locks, request);
  const corruptEvent = {
    ...appended.event,
    targetStitchId: "phantom-stitch",
  };
  const transaction = database.connection.transaction(
    [STORE_NAMES.progressEvents, STORE_NAMES.progressEventIds],
    "readwrite",
  );
  transaction.objectStore(STORE_NAMES.progressEvents).put(corruptEvent);
  transaction.objectStore(STORE_NAMES.progressEventIds).put({
    id: corruptEvent.id,
    projectId: corruptEvent.projectId,
    localSequence: corruptEvent.localSequence,
    payloadSha256: progressEventHash(
      corruptEvent as unknown as Record<string, unknown>,
    ),
  });
  await new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });
  await assert.rejects(
    rebuildProgressProjection(database, data.readyProject.id),
    (error: unknown) =>
      error instanceof PersistenceError &&
      error.code === "PERSISTENCE_INTEGRITY_CORRUPTION",
  );
});
