/**
 * Canonical model contracts for TASK-THINSLICE-001.
 *
 * The model is independent of OXS and contains no importer, persistence,
 * renderer, browser, or presentation concerns.
 */

export const CANONICAL_FORMAT_VERSION = "1.0.0" as const;
export const STORAGE_SCHEMA_VERSION = 1 as const;

export type CanonicalFormatVersion = typeof CANONICAL_FORMAT_VERSION;
export type StitchType = "full-cross";

export interface SourceFile {
  readonly id: string;
  readonly originalName: string;
  readonly mediaType: string;
  readonly declaredFormat: "oxs";
  readonly detectedFormatVersion: "1.0" | null;
  readonly byteLength: number;
  readonly sha256: string;
  readonly bytesRef: string | null;
  readonly retentionStatus: "retained" | "deleted-after-failure";
  readonly receivedAt: string;
}

export interface Pattern {
  readonly id: string;
  readonly metadata: PatternMetadata;
  readonly grid: Grid;
  readonly paletteItems: readonly PaletteItem[];
  readonly symbols: readonly SymbolDefinition[];
  readonly createdAt: string;
  readonly provenanceRef: string;
}

export interface PatternMetadata {
  readonly name: string | null;
  readonly width: number;
  readonly height: number;
  readonly fabric: {
    readonly type: string | null;
    readonly countX: number | null;
    readonly countY: number | null;
    readonly countUnit: "stitches-per-inch" | null;
    readonly clothPaletteItemId: string | null;
  };
}

export interface PatternVersion {
  readonly id: string;
  readonly patternId: string;
  readonly canonicalFormatVersion: CanonicalFormatVersion;
  readonly createdAt: string;
  readonly sourceFileId: string;
  readonly importJobId: string;
  readonly canonicalContentHash: string;
  readonly tileSetRef: string;
}

export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly origin: "top-left";
  readonly coordinateBase: 0;
  readonly xDirection: "right";
  readonly yDirection: "down";
}

export interface SymbolDefinition {
  readonly id: string;
  readonly sourceCode: string;
  readonly visual: SymbolVisual;
}

export type SymbolVisual =
  | {
      readonly kind: "text-code-point";
      readonly value: string;
      readonly fontFamily: string;
    }
  | {
      readonly kind: "generated";
      readonly generatorVersion: 1;
      readonly ordinal: number;
    };

export interface PaletteItem {
  readonly id: string;
  readonly sourceIndex: number;
  readonly role: "cloth" | "thread";
  readonly threadBrand: string | null;
  readonly brandCode: string | null;
  readonly displayName: string | null;
  readonly displayColor: `#${string}`;
}

export interface FullCrossStitch {
  readonly id: string;
  readonly type: "full-cross";
  readonly x: number;
  readonly y: number;
  readonly symbolId: string;
  readonly paletteItemId: string;
  readonly strandCount?: number;
}

export type Project =
  | {
      readonly id: string;
      readonly patternVersionId: null;
      readonly importJobId: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly status: "importing" | "import_failed";
    }
  | {
      readonly id: string;
      readonly patternVersionId: string;
      readonly importJobId: string;
      readonly createdAt: string;
      readonly updatedAt: string;
      readonly status: "ready";
    };

export interface ImportJob {
  readonly id: string;
  readonly sourceFileId: string;
  readonly importerId: "oxs";
  readonly importerVersion: string;
  readonly status:
    | "importing"
    | "completed"
    | "completed_with_warnings"
    | "rejected"
    | "interrupted";
  readonly startedAt: string;
  readonly completedAt: string | null;
  readonly reportRef: string | null;
  readonly warningCodes: readonly string[];
}

export interface ProgressEvent {
  readonly schemaVersion: 1;
  readonly id: string;
  readonly projectId: string;
  readonly patternVersionId: string;
  readonly localSequence: number;
  readonly type: "mark" | "unmark";
  readonly targetStitchId: string;
  readonly occurredAt: string;
  readonly deviceId: string;
  readonly source: "user";
}

export type ProgressState = ReadonlyMap<string, "marked" | "unmarked">;

/**
 * A validation boundary for one immutable canonical version.
 *
 * This aggregate is an in-memory validation input, not an additional persisted
 * domain entity.
 */
export interface CanonicalPatternVersionContext {
  readonly sourceFile: SourceFile;
  readonly importJob: ImportJob;
  readonly pattern: Pattern;
  readonly patternVersion: PatternVersion;
  readonly stitches: readonly FullCrossStitch[];
}
