import type {
  CanonicalPatternVersionContext,
  ImportJob,
  SourceFile,
} from "@abris-universe/domain-core";

export type OxsImportStatus =
  | "completed"
  | "completed_with_warnings"
  | "rejected";

export type OxsIssueSeverity = "error" | "warning";

export interface OxsImportIssue {
  readonly code: string;
  readonly severity: OxsIssueSeverity;
  readonly messageKey: string;
  readonly location: string | null;
  readonly details: Readonly<Record<string, string | number | boolean>>;
}

export interface OxsImportReport {
  readonly schemaVersion: 1;
  readonly importJobId: string;
  readonly status: OxsImportStatus;
  readonly messageKey?: string;
  readonly errors: readonly OxsImportIssue[];
  readonly warnings: readonly OxsImportIssue[];
  readonly counts: {
    readonly paletteItems: number;
    readonly symbols: number;
    readonly fullCrossStitches: number;
    readonly unsupportedByKind: Readonly<Record<string, number>>;
  };
  readonly sourceSha256: string;
  readonly canonicalContentHash?: string;
}

export interface OxsImportRequest {
  readonly bytes: Uint8Array;
  readonly originalName: string;
  readonly mediaType?: string;
  readonly bytesRef: string;
  readonly sourceFileId: string;
  readonly importJobId: string;
  readonly patternId: string;
  readonly patternVersionId: string;
  readonly tileSetRef: string;
  readonly receivedAt: string;
  readonly startedAt: string;
  readonly completedAt: string;
}

export interface OxsImportProvenance {
  readonly producer: string;
  readonly producerVersion: string;
  readonly coordinateProfile: "abris-route-1-1.0.0";
  readonly originalChartTitle: string | null;
}

export interface OxsImportAccepted {
  readonly status: "completed" | "completed_with_warnings";
  readonly sourceFile: SourceFile;
  readonly importJob: ImportJob;
  readonly canonical: CanonicalPatternVersionContext;
  readonly report: OxsImportReport;
  readonly provenance: OxsImportProvenance;
}

export interface OxsImportRejected {
  readonly status: "rejected";
  readonly sourceFile: SourceFile;
  readonly importJob: ImportJob;
  readonly canonical: null;
  readonly report: OxsImportReport;
  readonly provenance: null;
}

export type OxsImportResult = OxsImportAccepted | OxsImportRejected;

/**
 * Raised before an ImportJob can safely start, so no ImportReport exists yet.
 */
export class OxsImportBoundaryError extends Error {
  readonly code: "OXS_LIMIT_FILE_BYTES" | "OXS_LIMIT_PREFLIGHT_MEMORY";

  constructor(
    code: "OXS_LIMIT_FILE_BYTES" | "OXS_LIMIT_PREFLIGHT_MEMORY",
    message: string,
  ) {
    super(message);
    this.name = "OxsImportBoundaryError";
    this.code = code;
  }
}
