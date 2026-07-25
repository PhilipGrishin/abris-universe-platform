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

function canonicalPayloadHash(
  request: ProgressAppendRequest,
  deviceId: string,
): string {
  const canonicalPayload = JSON.stringify({
    schemaVersion: 1,
    id: request.id,
    projectId: request.projectId,
    patternVersionId: request.patternVersionId,
    type: request.type,
    targetStitchId: request.targetStitchId,
    occurredAt: request.occurredAt,
    deviceId,
    source: "user",
  });
  return bytesToHex(sha256(new TextEncoder().encode(canonicalPayload)));
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
  const payloadSha256 = canonicalPayloadHash(request, database.deviceId);
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
        ],
        async (transaction) => {
          const projectStore = transaction.objectStore(STORE_NAMES.projects);
          const eventStore = transaction.objectStore(STORE_NAMES.progressEvents);
          const idStore = transaction.objectStore(STORE_NAMES.progressEventIds);
          const projectionStore = transaction.objectStore(
            STORE_NAMES.progressProjections,
          );
          const metadataStore = transaction.objectStore(STORE_NAMES.metadata);
          const existing = (await requestResult(
            idStore.get(request.id),
          )) as ProgressEventIdRecord | undefined;
          if (existing !== undefined) {
            if (
              existing.payloadSha256 !== payloadSha256 ||
              existing.projectId !== request.projectId
            ) {
              throw new PersistenceError(
                "PERSISTENCE_IDEMPOTENCY_CONFLICT",
                `Progress event ID ${request.id} was reused with different content.`,
              );
            }
            const event = (await requestResult(
              eventStore.get([existing.projectId, existing.localSequence]),
            )) as ProgressEvent | undefined;
            if (event === undefined) {
              throw new PersistenceError(
                "PERSISTENCE_SCHEMA_INVALID",
                `Idempotency record ${request.id} has no matching event.`,
              );
            }
            return { event, idempotentReplay: true };
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
      STORE_NAMES.progressProjections,
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
      const events = (await requestResult(
        transaction
          .objectStore(STORE_NAMES.progressEvents)
          .getAll(progressRange(projectId)),
      )) as ProgressEvent[];
      const state = rebuildProgressState(
        events,
        project.id,
        project.patternVersionId,
      );
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
