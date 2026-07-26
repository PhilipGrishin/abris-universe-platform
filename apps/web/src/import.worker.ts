/// <reference lib="webworker" />
/**
 * Dedicated import Worker. OXS decoding, XML parsing, canonical mapping,
 * hashing, validation, and tile construction never fall back to the UI thread.
 */
import { importOxsRoute1 } from "@abris-universe/oxs-importer";
import { buildPatternTiles, INITIAL_TILE_SIZE } from "@abris-universe/renderer";

import type {
  ImportWorkerRequest,
  ImportWorkerResponse,
} from "./worker-contracts.ts";

const workerScope = self as DedicatedWorkerGlobalScope;

workerScope.onmessage = (event: MessageEvent<ImportWorkerRequest>) => {
  const { requestId, bytes, importRequest } = event.data;
  try {
    const result = importOxsRoute1({
      ...importRequest,
      bytes: new Uint8Array(bytes),
    });
    const tiles =
      result.canonical === null
        ? []
        : buildPatternTiles(
            result.canonical.patternVersion.id,
            result.canonical.stitches,
            INITIAL_TILE_SIZE,
          );
    workerScope.postMessage({
      requestId,
      ok: true,
      result,
      tiles,
    } satisfies ImportWorkerResponse);
  } catch {
    workerScope.postMessage({
      requestId,
      ok: false,
      code: "IMPORT_WORKER_FAILURE",
    } satisfies ImportWorkerResponse);
  }
};
