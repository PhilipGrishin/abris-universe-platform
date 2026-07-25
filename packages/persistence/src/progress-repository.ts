import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  rebuildProgressState,
  type ProgressEvent,
  type Project,
} from "@abris-universe/domain-core";
import {
  PersistenceError,
  STORE_NAMES,
  type LockManagerLike,
  type MetadataRecord,
  type ProgressAppendRequest,
  type ProgressAppendResult,
  type ProgressEventIdRecord,
  type ProgressProjectionRecord,
  type PatternTileRecord,
  type TileSetMetadata,
} from "./contracts.ts";
import {
  requestResult,
  runReadonly,
  runReadwrite,
  type AbrisDatabase,
} from "./database.ts";

function progressRange(projectId: string): IDBKeyRange {
  return IDBKeyRange.bound(
    [projectId, 0],
    [projectId, Number.MAX_SAFE_INTEGER],
  );
}

function projectionRange(projectId: string): IDBKeyRange {
  return IDBKeyRange.bound([projectId, ""], [projectId, "\uffff"]);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function canonicalEventHash(event: ProgressEvent): string {
  const canonicalPayload = JSON.stringify({
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
  });
  return bytesToHex(sha256(new TextEncoder().encode(canonicalPayload)));
}

function integrityFailure(message: string, cause?: unknown): never {
  throw new PersistenceError("PERSISTENCE_INTEGRITY_CORRUPTION", message, {
    cause,
  });
}

function validateStoredEvent(
  value: unknown,
  projectId: string,
  patternVersionId: string,
): ProgressEvent {
  if (!isRecord(value)) {
    return integrityFailure("Stored progress event is not an object.");
  }
  const event = value as unknown as ProgressEvent;
  try {
    rebuildProgressState([event], projectId, patternVersionId);
  } catch (error) {
    return integrityFailure("Stored progress event is malformed.", error);
  }
  return event;
}

function validateIdRecord(
  value: unknown,
  expectedId: string,
): ProgressEventIdRecord {
  if (
    !isRecord(value) ||
    value.id !== expectedId ||
    typeof value.projectId !== "string" ||
    value.projectId.length === 0 ||
    typeof value.localSequence !== "number" ||
    !Number.isSafeInteger(value.localSequence) ||
    value.localSequence <= 0 ||
    typeof value.payloadSha256 !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.payloadSha256)
  ) {
    return integrityFailure("Stored progress idempotency record is malformed.");
  }
  return value as unknown as ProgressEventIdRecord;
}

function validateTileSetMetadata(
  value: unknown,
  patternVersionId: string,
): TileSetMetadata {
  if (
    !isRecord(value) ||
    value.patternVersionId !== patternVersionId ||
    typeof value.tileSize !== "number" ||
    !Number.isSafeInteger(value.tileSize) ||
    value.tileSize <= 0
  ) {
    return integrityFailure("Stored tile-set metadata is malformed.");
  }
  return value as unknown as TileSetMetadata;
}

function assertProgressRequest(request: ProgressAppendRequest): void {
  const requiredIds = [
    request.id,
    request.projectId,
    request.patternVersionId,
    request.targetStitchId,
  ];
  if (requiredIds.some((value) => value.trim().length === 0)) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Progress identifiers must be non-empty.",
    );
  }
  if (
    !Number.isSafeInteger(request.targetX) ||
    request.targetX < 0 ||
    !Number.isSafeInteger(request.targetY) ||
    request.targetY < 0
  ) {
    throw new PersistenceError(
      "PERSISTENCE_STATE_CONFLICT",
      "Progress target coordinates must be non-negative safe integers.",
    );
  }
  for (const timestamp of [request.occurredAt, request.updatedAt]) {
    if (
      !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(
        timestamp,
      ) ||
      Number.isNaN(Date.parse(timestamp))
    ) {
      throw new PersistenceError(
        "PERSISTENCE_STATE_CONFLICT",
        "Progress timestamps must be ISO-8601 UTC.",
      );
    }
  }
}

async function deleteProjectionRange(
  store: IDBObjectStore,
  projectId: string,
): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    const request = store.openCursor(projectionRange(projectId));
    request.onerror = () =>
      reject(
        new PersistenceError(
          "PERSISTENCE_TRANSACTION_FAILED",
          "Progress projection cursor failed.",
          { cause: request.error },
        ),
      );
    request.onsuccess = () => {
      const cursor = request.result;
      if (cursor === null) {
        resolve();
        return;
      }
      cursor.delete();
      cursor.continue();
    };
  });
}

export async function appendProgressEvent(
  database: AbrisDatabase,
  locks: LockManagerLike | undefined,
  request: ProgressAppendRequest,
): Promise<ProgressAppendResult> {
  assertProgressRequest(request);
  if (locks === undefined) {
    throw new PersistenceError(
      "PERSISTENCE_WEB_LOCKS_UNAVAILABLE",
      "Web Locks are required for safe progress writes.",
    );
  }
  return locks.request(
    `au:project:${request.projectId}:progress-writer`,
    { mode: "exclusive", ifAvailable: true },
    async (lock) => {
      if (lock === null) {
        throw new PersistenceError(
          "PERSISTENCE_PROGRESS_LOCK_UNAVAILABLE",
          "Another tab owns the project progress writer lock.",
        );
      }

      return runReadwrite(
        database,
        [
          STORE_NAMES.projects,
          STORE_NAMES.progressEvents,
          STORE_NAMES.progressEventIds,
          STORE_NAMES.progressProjections,
          STORE_NAMES.metadata,
          STORE_NAMES.patternTiles,
        ],
        async (transaction) => {
          const projectStore = transaction.objectStore(STORE_NAMES.projects);
          const eventStore = transaction.objectStore(STORE_NAMES.progressEvents);
          const idStore = transaction.objectStore(STORE_NAMES.progressEventIds);
          const projectionStore = transaction.objectStore(
            STORE_NAMES.progressProjections,
          );
          const metadataStore = transaction.objectStore(STORE_NAMES.metadata);
          const tileStore = transaction.objectStore(STORE_NAMES.patternTiles);
          const existingValue = await requestResult(
            idStore.get(request.id),
          );
          if (existingValue !== undefined) {
            const existing = validateIdRecord(existingValue, request.id);
            const eventValue = await requestResult(
              eventStore.get([existing.projectId, existing.localSequence]),
            );
            if (eventValue === undefined) {
              return integrityFailure(
                `Idempotency record ${request.id} has no matching event.`,
              );
            }
            const event = validateStoredEvent(
              eventValue,
              request.projectId,
              request.patternVersionId,
            );
            if (
              existing.projectId !== event.projectId ||
              existing.localSequence !== event.localSequence ||
              existing.payloadSha256 !== canonicalEventHash(event)
            ) {
              return integrityFailure(
                `Progress event ${request.id} does not match its idempotency record.`,
              );
            }
            if (
              event.id !== request.id ||
              event.projectId !== request.projectId ||
              event.patternVersionId !== request.patternVersionId ||
              event.type !== request.type ||
              event.targetStitchId !== request.targetStitchId ||
              event.occurredAt !== request.occurredAt ||
              event.deviceId !== database.deviceId ||
              event.source !== "user"
            ) {
              throw new PersistenceError(
                "PERSISTENCE_IDEMPOTENCY_CONFLICT",
                `Progress event ID ${request.id} was reused with different content.`,
              );
            }
            return { event, idempotentReplay: true };
          }
          const tileMetadataRecord = (await requestResult(
            metadataStore.get(`tileSet:${request.patternVersionId}`),
          )) as MetadataRecord | undefined;
          const tileMetadata = validateTileSetMetadata(
            tileMetadataRecord?.value,
            request.patternVersionId,
          );
          const targetTile = (await requestResult(
            tileStore.get([
              request.patternVersionId,
              Math.floor(request.targetY / tileMetadata.tileSize),
              Math.floor(request.targetX / tileMetadata.tileSize),
            ]),
          )) as PatternTileRecord | undefined;
          if (
            targetTile === undefined ||
            !targetTile.stitches.some(
              (stitch) =>
                stitch.id === request.targetStitchId &&
                stitch.x === request.targetX &&
                stitch.y === request.targetY,
            )
          ) {
            throw new PersistenceError(
              "PERSISTENCE_STATE_CONFLICT",
              "Progress target does not exist in the requested PatternVersion.",
            );
          }

          const project = (await requestResult(
            projectStore.get(request.projectId),
          )) as Project | undefined;
          if (
            project === undefined ||
            project.status !== "ready" ||
            project.patternVersionId !== request.patternVersionId
          ) {
            throw new PersistenceError(
              "PERSISTENCE_STATE_CONFLICT",
              "Progress target is not a ready Project at the requested PatternVersion.",
            );
          }
          const projection = (await requestResult(
            projectionStore.get([request.projectId, request.targetStitchId]),
          )) as ProgressProjectionRecord | undefined;
          const expectedType =
            projection?.state === "marked" ? "unmark" : "mark";
          if (request.type !== expectedType) {
            throw new PersistenceError(
              "PERSISTENCE_STATE_CONFLICT",
              `Progress command is stale; expected ${expectedType}.`,
            );
          }

          const sequenceKey = `project:${request.projectId}:nextLocalSequence`;
          const sequenceRecord = (await requestResult(
            metadataStore.get(sequenceKey),
          )) as MetadataRecord | undefined;
          const localSequence = sequenceRecord?.value ?? 1;
          if (
            typeof localSequence !== "number" ||
            !Number.isSafeInteger(localSequence) ||
            localSequence <= 0
          ) {
            throw new PersistenceError(
              "PERSISTENCE_SCHEMA_INVALID",
              "Stored progress sequence is invalid.",
            );
          }
          const event: ProgressEvent = {
            schemaVersion: 1,
            id: request.id,
            projectId: request.projectId,
            patternVersionId: request.patternVersionId,
            localSequence,
            type: request.type,
            targetStitchId: request.targetStitchId,
            occurredAt: request.occurredAt,
            deviceId: database.deviceId,
            source: "user",
          };
          const payloadSha256 = canonicalEventHash(event);
          eventStore.add(event);
          idStore.add({
            id: request.id,
            projectId: request.projectId,
            localSequence,
            payloadSha256,
          } satisfies ProgressEventIdRecord);
          projectionStore.put({
            projectId: request.projectId,
            stitchId: request.targetStitchId,
            state: request.type === "mark" ? "marked" : "unmarked",
          } satisfies ProgressProjectionRecord);
          metadataStore.put({
            key: sequenceKey,
            value: localSequence + 1,
          } satisfies MetadataRecord);
          projectStore.put({ ...project, updatedAt: request.updatedAt });
          return { event, idempotentReplay: false };
        },
      );
    },
  );
}

export async function listProgressEvents(
  database: AbrisDatabase,
  projectId: string,
): Promise<ProgressEvent[]> {
  return runReadonly(
    database,
    [STORE_NAMES.progressEvents],
    async (transaction) =>
      (await requestResult(
        transaction
          .objectStore(STORE_NAMES.progressEvents)
          .getAll(progressRange(projectId)),
      )) as ProgressEvent[],
  );
}

export async function getProgressProjection(
  database: AbrisDatabase,
  projectId: string,
): Promise<ProgressProjectionRecord[]> {
  return runReadonly(
    database,
    [STORE_NAMES.progressProjections],
    async (transaction) =>
      (await requestResult(
        transaction
          .objectStore(STORE_NAMES.progressProjections)
          .getAll(projectionRange(projectId)),
      )) as ProgressProjectionRecord[],
  );
}

export async function rebuildProgressProjection(
  database: AbrisDatabase,
  projectId: string,
): Promise<ProgressProjectionRecord[]> {
  return runReadwrite(
    database,
    [
      STORE_NAMES.projects,
      STORE_NAMES.progressEvents,
      STORE_NAMES.progressEventIds,
      STORE_NAMES.progressProjections,
      STORE_NAMES.patternTiles,
    ],
    async (transaction) => {
      const project = (await requestResult(
        transaction.objectStore(STORE_NAMES.projects).get(projectId),
      )) as Project | undefined;
      if (project === undefined || project.status !== "ready") {
        throw new PersistenceError(
          "PERSISTENCE_STATE_CONFLICT",
          "Only a ready Project can rebuild progress.",
        );
      }
      const eventValues = await requestResult(
        transaction
          .objectStore(STORE_NAMES.progressEvents)
          .getAll(progressRange(projectId)),
      );
      const tiles = (await requestResult(
        transaction.objectStore(STORE_NAMES.patternTiles).getAll(
          IDBKeyRange.bound(
            [project.patternVersionId, 0, 0],
            [
              project.patternVersionId,
              Number.MAX_SAFE_INTEGER,
              Number.MAX_SAFE_INTEGER,
            ],
          ),
        ),
      )) as PatternTileRecord[];
      const stitchIds = new Set(
        tiles.flatMap((tile) => tile.stitches.map((stitch) => stitch.id)),
      );
      const idStore = transaction.objectStore(STORE_NAMES.progressEventIds);
      const events: ProgressEvent[] = [];
      for (const eventValue of eventValues) {
        const event = validateStoredEvent(
          eventValue,
          project.id,
          project.patternVersionId,
        );
        const idRecordValue = await requestResult(idStore.get(event.id));
        if (idRecordValue === undefined) {
          return integrityFailure(
            `Progress event ${event.id} has no idempotency record.`,
          );
        }
        const idRecord = validateIdRecord(idRecordValue, event.id);
        if (
          idRecord.projectId !== event.projectId ||
          idRecord.localSequence !== event.localSequence ||
          idRecord.payloadSha256 !== canonicalEventHash(event) ||
          !stitchIds.has(event.targetStitchId)
        ) {
          return integrityFailure(
            `Progress event ${event.id} failed rebuild integrity checks.`,
          );
        }
        events.push(event);
      }
      let state;
      try {
        state = rebuildProgressState(
          events,
          project.id,
          project.patternVersionId,
        );
      } catch (error) {
        return integrityFailure(
          "Progress event log cannot be rebuilt safely.",
          error,
        );
      }
      const projectionStore = transaction.objectStore(
        STORE_NAMES.progressProjections,
      );
      await deleteProjectionRange(projectionStore, projectId);
      const records: ProgressProjectionRecord[] = [];
      for (const [stitchId, progressState] of state) {
        const record: ProgressProjectionRecord = {
          projectId,
          stitchId,
          state: progressState,
        };
        projectionStore.add(record);
        records.push(record);
      }
      return records;
    },
  );
}
