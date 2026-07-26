/**
 * Benchmark-build-only browser failure harness. It exercises actual browser
 * transaction, Web Locks, and upgrade behavior on the disposable benchmark
 * origin and is never included in the deployable SPA.
 */
import {
  ABRIS_DATABASE_NAME,
  ABRIS_DATABASE_VERSION,
  STORE_NAMES,
} from "@abris-universe/persistence";

interface BrowserFailureResult {
  readonly schemaVersion: 1;
  readonly capturedAt: string;
  readonly sourceCommit: string;
  readonly sourceDirty: boolean;
  readonly transactionAbort: {
    readonly observed: boolean;
    readonly errorName: string | null;
  };
  readonly webLock: {
    readonly name: string;
    readonly held: boolean;
  };
  readonly blockedUpgrade: {
    readonly requestedVersion: number;
    readonly observed: boolean;
  };
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Failure-harness element ${selector} is missing.`);
  }
  return element;
}

const status = requireElement<HTMLElement>("#failure-status");
const output = requireElement<HTMLOutputElement>("#failure-result");
const upgradeButton = requireElement<HTMLButtonElement>("#test-upgrade");
const activeProjectId = localStorage.getItem("abris-universe:active-project");
if (activeProjectId === null) {
  throw new Error("The benchmark project must exist before browser checks.");
}

const result: BrowserFailureResult = {
  schemaVersion: 1,
  capturedAt: new Date().toISOString(),
  sourceCommit: import.meta.env.AU_SOURCE_COMMIT,
  sourceDirty: import.meta.env.AU_SOURCE_DIRTY === "true",
  transactionAbort: {
    observed: false,
    errorName: null,
  },
  webLock: {
    name: `au:project:${activeProjectId}:progress-writer`,
    held: false,
  },
  blockedUpgrade: {
    requestedVersion: ABRIS_DATABASE_VERSION + 1,
    observed: false,
  },
};

function publish(): void {
  output.textContent = JSON.stringify(result);
}

async function observeTransactionAbort(): Promise<void> {
  const connection = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(ABRIS_DATABASE_NAME, ABRIS_DATABASE_VERSION);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Database open failed."));
  });
  const key = `engineering-duplicate:${crypto.randomUUID()}`;
  const transaction = connection.transaction(
    [STORE_NAMES.metadata],
    "readwrite",
  );
  const store = transaction.objectStore(STORE_NAMES.metadata);
  store.add({ key, value: "first" });
  store.add({ key, value: "duplicate" });
  await new Promise<void>((resolve) => {
    transaction.onabort = () => {
      Object.assign(result.transactionAbort, {
        observed: true,
        errorName: transaction.error?.name ?? "ConstraintError",
      });
      resolve();
    };
    transaction.oncomplete = () => resolve();
  });
  connection.close();
}

async function holdProjectLock(): Promise<void> {
  await navigator.locks.request(
    result.webLock.name,
    { mode: "exclusive" },
    async (lock) => {
      Object.assign(result.webLock, { held: lock !== null });
      status.textContent = lock === null
        ? "Project writer lock was unavailable."
        : "Project writer lock is held for the two-context test.";
      publish();
      await new Promise<void>(() => undefined);
    },
  );
}

upgradeButton.addEventListener("click", () => {
  const holdRequest = indexedDB.open(
    ABRIS_DATABASE_NAME,
    ABRIS_DATABASE_VERSION,
  );
  holdRequest.onerror = () => {
    status.textContent = "Could not create the deliberate upgrade blocker.";
    publish();
  };
  holdRequest.onsuccess = () => {
    const heldConnection = holdRequest.result;
    heldConnection.onversionchange = () => {
      // Deliberately remain open until the real `blocked` event is observed.
    };
    const request = indexedDB.open(
      ABRIS_DATABASE_NAME,
      result.blockedUpgrade.requestedVersion,
    );
    request.onblocked = () => {
      Object.assign(result.blockedUpgrade, { observed: true });
      status.textContent = "Blocked IndexedDB upgrade observed.";
      publish();
      heldConnection.close();
    };
    request.onerror = () => {
      heldConnection.close();
      status.textContent = `Upgrade failed with ${request.error?.name ?? "unknown error"}.`;
      publish();
    };
    request.onsuccess = () => {
      request.result.close();
      if (!result.blockedUpgrade.observed) {
        status.textContent = "Upgrade was not blocked.";
        publish();
      }
    };
  };
});

void observeTransactionAbort()
  .then(() => {
    publish();
    return holdProjectLock();
  })
  .catch((error: unknown) => {
    status.textContent =
      error instanceof Error ? error.message : "Browser failure check failed.";
    publish();
  });
