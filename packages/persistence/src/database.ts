import {
  ABRIS_DATABASE_NAME,
  ABRIS_DATABASE_VERSION,
  PersistenceError,
  STORE_NAMES,
  type MetadataRecord,
  type StoreName,
} from "./contracts.ts";

export interface OpenDatabaseOptions {
  readonly deviceId: string;
  readonly factory?: IDBFactory;
  readonly name?: string;
}

export interface AbrisDatabase {
  readonly connection: IDBDatabase;
  readonly deviceId: string;
  readonly strictDurabilitySupported: boolean;
  close(): void;
}

function persistenceError(error: unknown, fallback: string): PersistenceError {
  if (error instanceof PersistenceError) {
    return error;
  }
  if (error instanceof DOMException && error.name === "QuotaExceededError") {
    return new PersistenceError(
      "PERSISTENCE_QUOTA_EXCEEDED",
      "IndexedDB quota was exceeded; no save was reported.",
      { cause: error },
    );
  }
  return new PersistenceError("PERSISTENCE_TRANSACTION_FAILED", fallback, {
    cause: error,
  });
}

export function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(
        persistenceError(
          request.error,
          "An IndexedDB request failed before transaction completion.",
        ),
      );
  });
}

function transactionCompletion(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onabort = () =>
      reject(
        persistenceError(
          transaction.error,
          "IndexedDB transaction aborted; its changes were not committed.",
        ),
      );
    transaction.onerror = () => {
      // `abort` is the authoritative terminal signal and retains the error.
    };
  });
}

function createReadwriteTransaction(
  connection: IDBDatabase,
  stores: readonly StoreName[],
): {
  readonly transaction: IDBTransaction;
  readonly strictDurabilitySupported: boolean;
} {
  try {
    return {
      transaction: connection.transaction(stores, "readwrite", {
        durability: "strict",
      }),
      strictDurabilitySupported: true,
    };
  } catch (error) {
    if (!(error instanceof TypeError)) {
      throw error;
    }
    return {
      transaction: connection.transaction(stores, "readwrite"),
      strictDurabilitySupported: false,
    };
  }
}

export async function runReadwrite<T>(
  database: AbrisDatabase,
  stores: readonly StoreName[],
  operation: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  let transaction: IDBTransaction;
  try {
    transaction = createReadwriteTransaction(database.connection, stores).transaction;
  } catch (error) {
    throw persistenceError(error, "IndexedDB transaction could not be created.");
  }
  const completion = transactionCompletion(transaction);
  try {
    const result = await operation(transaction);
    await completion;
    return result;
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // The transaction may already have aborted due to the failed request.
    }
    try {
      await completion;
    } catch {
      // Preserve the original, more specific request or validation error.
    }
    throw persistenceError(error, "IndexedDB write transaction failed.");
  }
}

export async function runReadonly<T>(
  database: AbrisDatabase,
  stores: readonly StoreName[],
  operation: (transaction: IDBTransaction) => Promise<T>,
): Promise<T> {
  let transaction: IDBTransaction;
  try {
    transaction = database.connection.transaction(stores, "readonly");
  } catch (error) {
    throw persistenceError(error, "IndexedDB read transaction could not be created.");
  }
  const completion = transactionCompletion(transaction);
  try {
    const result = await operation(transaction);
    await completion;
    return result;
  } catch (error) {
    throw persistenceError(error, "IndexedDB read transaction failed.");
  }
}

function createSchema(request: IDBOpenDBRequest, oldVersion: number): void {
  const database = request.result;
  if (oldVersion !== 0) {
    throw new PersistenceError(
      "PERSISTENCE_SCHEMA_INVALID",
      `No migration path exists from schema ${oldVersion}.`,
    );
  }

  database.createObjectStore(STORE_NAMES.sourceFiles, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.importJobs, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.patterns, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.patternVersions, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.patternTiles, {
    keyPath: ["patternVersionId", "tileY", "tileX"],
  });
  database.createObjectStore(STORE_NAMES.projects, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.progressEvents, {
    keyPath: ["projectId", "localSequence"],
  });
  database.createObjectStore(STORE_NAMES.progressEventIds, { keyPath: "id" });
  database.createObjectStore(STORE_NAMES.progressProjections, {
    keyPath: ["projectId", "stitchId"],
  });
  database.createObjectStore(STORE_NAMES.metadata, { keyPath: "key" });
}

async function initializeAndValidateMetadata(
  connection: IDBDatabase,
  requestedDeviceId: string,
): Promise<{ readonly deviceId: string; readonly strictDurabilitySupported: boolean }> {
  if (requestedDeviceId.trim().length === 0) {
    throw new PersistenceError(
      "PERSISTENCE_SCHEMA_INVALID",
      "A stable non-empty deviceId is required.",
    );
  }

  let strictDurabilitySupported = true;
  let transaction: IDBTransaction;
  try {
    const created = createReadwriteTransaction(connection, [STORE_NAMES.metadata]);
    transaction = created.transaction;
    strictDurabilitySupported = created.strictDurabilitySupported;
  } catch (error) {
    throw persistenceError(error, "Metadata transaction could not be created.");
  }
  const completion = transactionCompletion(transaction);
  const store = transaction.objectStore(STORE_NAMES.metadata);

  try {
    const schema = (await requestResult(
      store.get("schemaVersion"),
    )) as MetadataRecord | undefined;
    if (schema === undefined) {
      store.add({
        key: "schemaVersion",
        value: ABRIS_DATABASE_VERSION,
      } satisfies MetadataRecord);
    } else if (schema.value !== ABRIS_DATABASE_VERSION) {
      throw new PersistenceError(
        "PERSISTENCE_SCHEMA_INVALID",
        `Metadata schema ${String(schema.value)} does not match database schema ${ABRIS_DATABASE_VERSION}.`,
      );
    }

    const device = (await requestResult(
      store.get("deviceId"),
    )) as MetadataRecord | undefined;
    const deviceId =
      device === undefined ? requestedDeviceId : String(device.value);
    if (device === undefined) {
      store.add({ key: "deviceId", value: deviceId } satisfies MetadataRecord);
    }
    if (deviceId.trim().length === 0) {
      throw new PersistenceError(
        "PERSISTENCE_SCHEMA_INVALID",
        "Stored deviceId is invalid.",
      );
    }
    await completion;
    return { deviceId, strictDurabilitySupported };
  } catch (error) {
    try {
      transaction.abort();
    } catch {
      // The transaction may already be terminal.
    }
    throw persistenceError(error, "Database metadata is invalid.");
  }
}

export async function openAbrisDatabase(
  options: OpenDatabaseOptions,
): Promise<AbrisDatabase> {
  const factory = options.factory ?? globalThis.indexedDB;
  if (factory === undefined) {
    throw new PersistenceError(
      "PERSISTENCE_INDEXEDDB_UNAVAILABLE",
      "IndexedDB is unavailable in this environment.",
    );
  }
  const name = options.name ?? ABRIS_DATABASE_NAME;

  const connection = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = factory.open(name, ABRIS_DATABASE_VERSION);
    let settled = false;

    request.onupgradeneeded = (event) => {
      try {
        createSchema(request, event.oldVersion);
      } catch (error) {
        request.transaction?.abort();
        if (!settled) {
          settled = true;
          reject(error);
        }
      }
    };
    request.onblocked = () => {
      if (!settled) {
        settled = true;
        reject(
          new PersistenceError(
            "PERSISTENCE_UPGRADE_BLOCKED",
            "IndexedDB schema upgrade is blocked by another open client.",
          ),
        );
      }
    };
    request.onerror = () => {
      if (!settled) {
        settled = true;
        reject(
          persistenceError(request.error, "IndexedDB database open failed."),
        );
      }
    };
    request.onsuccess = () => {
      if (settled) {
        request.result.close();
        return;
      }
      settled = true;
      resolve(request.result);
    };
  });

  connection.onversionchange = () => connection.close();
  try {
    const metadata = await initializeAndValidateMetadata(
      connection,
      options.deviceId,
    );
    return {
      connection,
      deviceId: metadata.deviceId,
      strictDurabilitySupported: metadata.strictDurabilitySupported,
      close: () => connection.close(),
    };
  } catch (error) {
    connection.close();
    throw error;
  }
}
