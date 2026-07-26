/**
 * Lifecycle wrapper for the dedicated importer Worker.
 */
import type { OxsImportRequest } from "@abris-universe/oxs-importer";

import type {
  ImportWorkerRequest,
  ImportWorkerResponse,
} from "./worker-contracts.ts";

export class ImportWorkerError extends Error {
  readonly code: "IMPORT_WORKER_UNAVAILABLE" | "IMPORT_WORKER_FAILURE";

  constructor(code: "IMPORT_WORKER_UNAVAILABLE" | "IMPORT_WORKER_FAILURE") {
    super("The isolated import worker could not complete the import.");
    this.name = "ImportWorkerError";
    this.code = code;
  }
}

export async function runOxsImportWorker(
  bytes: ArrayBuffer,
  importRequest: Omit<OxsImportRequest, "bytes">,
  signal?: AbortSignal,
): Promise<Extract<ImportWorkerResponse, { readonly ok: true }>> {
  if (typeof Worker === "undefined") {
    throw new ImportWorkerError("IMPORT_WORKER_UNAVAILABLE");
  }
  const worker = new Worker(new URL("./import.worker.ts", import.meta.url), {
    type: "module",
    name: "abris-oxs-import",
  });
  const requestId = crypto.randomUUID();

  return new Promise((resolve, reject) => {
    const finish = () => {
      worker.terminate();
      signal?.removeEventListener("abort", abort);
    };
    const abort = () => {
      finish();
      reject(new DOMException("Import cancelled.", "AbortError"));
    };
    signal?.addEventListener("abort", abort, { once: true });
    if (signal?.aborted === true) {
      abort();
      return;
    }
    worker.onerror = () => {
      finish();
      reject(new ImportWorkerError("IMPORT_WORKER_FAILURE"));
    };
    worker.onmessage = (event: MessageEvent<ImportWorkerResponse>) => {
      if (event.data.requestId !== requestId) return;
      finish();
      if (!event.data.ok) {
        reject(new ImportWorkerError(event.data.code));
        return;
      }
      resolve(event.data);
    };
    worker.postMessage(
      {
        requestId,
        bytes,
        importRequest,
      } satisfies ImportWorkerRequest,
      [bytes],
    );
  });
}
