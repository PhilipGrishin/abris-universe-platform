import type {
  FullCrossStitch,
  ImportJob,
  Pattern,
  PatternVersion,
  ProgressEvent,
  Project,
  SourceFile,
} from "@abris-universe/domain-core";

export const ABRIS_DATABASE_NAME = "abris-universe" as const;
export const ABRIS_DATABASE_VERSION = 1 as const;

export const STORE_NAMES = {
  sourceFiles: "sourceFiles",
  importJobs: "importJobs",
  patterns: "patterns",
  patternVersions: "patternVersions",
  patternTiles: "patternTiles",
  projects: "projects",
  progressEvents: "progressEvents",
  progressEventIds: "progressEventIds",
  progressProjections: "progressProjections",
  metadata: "metadata",
} as const;

export type StoreName = (typeof STORE_NAMES)[keyof typeof STORE_NAMES];

export type PersistenceErrorCode =
  | "PERSISTENCE_INDEXEDDB_UNAVAILABLE"
  | "PERSISTENCE_UPGRADE_BLOCKED"
  | "PERSISTENCE_SCHEMA_INVALID"
  | "PERSISTENCE_QUOTA_EXCEEDED"
  | "PERSISTENCE_TRANSACTION_FAILED"
  | "PERSISTENCE_RECORD_NOT_FOUND"
  | "PERSISTENCE_STATE_CONFLICT"
  | "PERSISTENCE_IDEMPOTENCY_CONFLICT"
  | "PERSISTENCE_WEB_LOCKS_UNAVAILABLE"
  | "PERSISTENCE_PROGRESS_LOCK_UNAVAILABLE";

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode;
  override readonly cause?: unknown;

  constructor(
    code: PersistenceErrorCode,
    message: string,
    options?: { readonly cause?: unknown },
  ) {
    super(message);
    this.name = "PersistenceError";
    this.code = code;
    this.cause = options?.cause;
  }
}

export interface StoredSourceFile extends SourceFile {
  readonly bytes: Blob | null;
}

export interface StoredImportJob extends ImportJob {
  readonly report: unknown | null;
}

export interface PatternTileRecord {
  readonly patternVersionId: string;
  readonly tileY: number;
  readonly tileX: number;
  readonly stitches: readonly FullCrossStitch[];
}

export interface TileSetMetadata {
  readonly patternVersionId: string;
  readonly tileSize: number;
}

export interface ProgressEventIdRecord {
  readonly id: string;
  readonly projectId: string;
  readonly localSequence: number;
  readonly payloadSha256: string;
}

export interface ProgressProjectionRecord {
  readonly projectId: string;
  readonly stitchId: string;
  readonly state: "marked" | "unmarked";
}

export interface MetadataRecord {
  readonly key: string;
  readonly value: unknown;
}

export interface ImportAttemptInput {
  readonly sourceFile: SourceFile;
  readonly sourceBlob: Blob;
  readonly importJob: ImportJob;
  readonly project: Project;
  /**
   * The caller supplies its approved format-specific preflight limit. This
   * avoids creating a second source of truth for importer limits.
   */
  readonly maxSourceBytes: number;
}

export interface ImportCommitInput {
  readonly sourceFile: SourceFile;
  readonly importJob: ImportJob;
  readonly pattern: Pattern;
  readonly patternVersion: PatternVersion;
  readonly stitches: readonly FullCrossStitch[];
  readonly tiles: readonly PatternTileRecord[];
  readonly tileSize: number;
  readonly project: Project;
  readonly report: unknown;
}

export interface ImportRejectionInput {
  readonly sourceFileId: string;
  readonly importJob: ImportJob;
  readonly project: Project;
  readonly report: unknown;
}

export interface ProgressAppendRequest {
  readonly id: string;
  readonly projectId: string;
  readonly patternVersionId: string;
  readonly type: "mark" | "unmark";
  readonly targetStitchId: string;
  readonly occurredAt: string;
  readonly updatedAt: string;
}

export interface ProgressAppendResult {
  readonly event: ProgressEvent;
  readonly idempotentReplay: boolean;
}

export interface LockLike {
  readonly name: string;
}

export interface LockManagerLike {
  request<T>(
    name: string,
    options: { readonly mode: "exclusive"; readonly ifAvailable: true },
    callback: (lock: LockLike | null) => T | PromiseLike<T>,
  ): Promise<T>;
}

export interface StorageManagerLike {
  persisted?(): Promise<boolean>;
  persist?(): Promise<boolean>;
}

export interface PersistenceCapability {
  readonly supported: boolean;
  readonly alreadyPersistent: boolean;
  readonly granted: boolean;
  readonly checkedAt: string;
}
