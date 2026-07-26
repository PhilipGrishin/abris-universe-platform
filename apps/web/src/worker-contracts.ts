/**
 * Structured-clone-safe contract between the browser UI and OXS import Worker.
 */
import type {
  OxsImportRequest,
  OxsImportResult,
} from "@abris-universe/oxs-importer";
import type { PatternTile } from "@abris-universe/renderer";

export interface ImportWorkerRequest {
  readonly requestId: string;
  readonly bytes: ArrayBuffer;
  readonly importRequest: Omit<OxsImportRequest, "bytes">;
}

export type ImportWorkerResponse =
  | {
      readonly requestId: string;
      readonly ok: true;
      readonly result: OxsImportResult;
      readonly tiles: readonly PatternTile[];
    }
  | {
      readonly requestId: string;
      readonly ok: false;
      readonly code: "IMPORT_WORKER_FAILURE";
    };
