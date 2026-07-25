import {
  STORE_NAMES,
  type MetadataRecord,
  type PersistenceCapability,
  type StorageManagerLike,
} from "./contracts.ts";
import {
  requestResult,
  runReadonly,
  runReadwrite,
  type AbrisDatabase,
} from "./database.ts";

/**
 * Requests browser persistence after the first successful import.
 *
 * Denial is returned explicitly and does not claim backup or durability that
 * the browser did not grant.
 */
export async function requestPersistentStorage(
  database: AbrisDatabase,
  storage: StorageManagerLike | undefined,
  checkedAt: string,
): Promise<PersistenceCapability> {
  const supported =
    storage?.persisted !== undefined && storage.persist !== undefined;
  const alreadyPersistent = supported ? await storage.persisted!() : false;
  const granted =
    alreadyPersistent || (supported ? await storage.persist!() : false);
  const capability: PersistenceCapability = {
    supported,
    alreadyPersistent,
    granted,
    checkedAt,
  };
  await runReadwrite(
    database,
    [STORE_NAMES.metadata],
    async (transaction) => {
      transaction.objectStore(STORE_NAMES.metadata).put({
        key: "persistentStorage",
        value: capability,
      } satisfies MetadataRecord);
    },
  );
  return capability;
}

export async function getPersistenceCapability(
  database: AbrisDatabase,
): Promise<PersistenceCapability | undefined> {
  return runReadonly(
    database,
    [STORE_NAMES.metadata],
    async (transaction) => {
      const record = (await requestResult(
        transaction.objectStore(STORE_NAMES.metadata).get("persistentStorage"),
      )) as MetadataRecord | undefined;
      return record?.value as PersistenceCapability | undefined;
    },
  );
}
