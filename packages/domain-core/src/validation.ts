import {
  CANONICAL_FORMAT_VERSION,
  type CanonicalPatternVersionContext,
  type FullCrossStitch,
  type ImportJob,
  type PaletteItem,
  type Pattern,
  type PatternVersion,
  type ProgressEvent,
  type ProgressState,
  type Project,
  type SourceFile,
  type SymbolDefinition,
} from "./model.ts";

export type DomainValidationCode =
  | "INVALID_ID"
  | "INVALID_TIMESTAMP"
  | "INVALID_HASH"
  | "INVALID_SOURCE_FILE"
  | "INVALID_IMPORT_JOB"
  | "INVALID_GRID"
  | "INVALID_PATTERN"
  | "INVALID_PATTERN_VERSION"
  | "INVALID_PALETTE"
  | "INVALID_SYMBOL"
  | "INVALID_STITCH"
  | "DUPLICATE_ID"
  | "DUPLICATE_SOURCE_INDEX"
  | "DUPLICATE_STITCH_CELL"
  | "BROKEN_REFERENCE"
  | "CLOTH_STITCH_REFERENCE"
  | "PROGRESS_CONTEXT_MISMATCH"
  | "PROGRESS_SEQUENCE_INVALID";

export class DomainValidationError extends Error {
  readonly code: DomainValidationCode;
  readonly path: string;

  constructor(code: DomainValidationCode, path: string, message: string) {
    super(message);
    this.name = "DomainValidationError";
    this.code = code;
    this.path = path;
  }
}

const SHA256_HEX = /^[a-f0-9]{64}$/u;
const RGB_HEX = /^#[A-F0-9]{6}$/u;

function fail(
  code: DomainValidationCode,
  path: string,
  message: string,
): never {
  throw new DomainValidationError(code, path, message);
}

function requireNonEmpty(value: string, path: string): void {
  if (value.trim().length === 0) {
    fail("INVALID_ID", path, "Value must be a non-empty string.");
  }
}

function requireTimestamp(value: string, path: string): void {
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/u.test(value) ||
    Number.isNaN(Date.parse(value))
  ) {
    fail("INVALID_TIMESTAMP", path, "Timestamp must be ISO-8601 UTC.");
  }
}

function requireHash(value: string, path: string): void {
  if (!SHA256_HEX.test(value)) {
    fail("INVALID_HASH", path, "Hash must be lowercase SHA-256 hexadecimal.");
  }
}

function requirePositiveInteger(value: number, path: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    fail("INVALID_GRID", path, "Value must be a positive safe integer.");
  }
}

function requireUniqueIds(
  values: readonly { readonly id: string }[],
  path: string,
): void {
  const ids = new Set<string>();
  for (const [index, value] of values.entries()) {
    requireNonEmpty(value.id, `${path}[${index}].id`);
    if (ids.has(value.id)) {
      fail("DUPLICATE_ID", `${path}[${index}].id`, `Duplicate ID ${value.id}.`);
    }
    ids.add(value.id);
  }
}

function validateSourceFile(sourceFile: SourceFile): void {
  requireNonEmpty(sourceFile.id, "sourceFile.id");
  requireNonEmpty(sourceFile.originalName, "sourceFile.originalName");
  requireNonEmpty(sourceFile.mediaType, "sourceFile.mediaType");
  if (
    sourceFile.declaredFormat !== "oxs" ||
    ![null, "1.0"].includes(sourceFile.detectedFormatVersion)
  ) {
    fail("INVALID_SOURCE_FILE", "sourceFile", "Unsupported source format.");
  }
  if (!Number.isSafeInteger(sourceFile.byteLength) || sourceFile.byteLength < 0) {
    fail(
      "INVALID_SOURCE_FILE",
      "sourceFile.byteLength",
      "Byte length must be a non-negative safe integer.",
    );
  }
  requireHash(sourceFile.sha256, "sourceFile.sha256");
  requireTimestamp(sourceFile.receivedAt, "sourceFile.receivedAt");
  if (
    sourceFile.retentionStatus === "retained" &&
    sourceFile.bytesRef === null
  ) {
    fail(
      "INVALID_SOURCE_FILE",
      "sourceFile.bytesRef",
      "Retained source bytes require an addressable reference.",
    );
  }
}

function validateImportJob(importJob: ImportJob): void {
  requireNonEmpty(importJob.id, "importJob.id");
  requireNonEmpty(importJob.sourceFileId, "importJob.sourceFileId");
  requireNonEmpty(importJob.importerVersion, "importJob.importerVersion");
  requireTimestamp(importJob.startedAt, "importJob.startedAt");
  if (importJob.completedAt !== null) {
    requireTimestamp(importJob.completedAt, "importJob.completedAt");
  }
  if (
    ["completed", "completed_with_warnings", "rejected"].includes(
      importJob.status,
    ) &&
    importJob.completedAt === null
  ) {
    fail(
      "INVALID_IMPORT_JOB",
      "importJob.completedAt",
      "Terminal import jobs require a completion timestamp.",
    );
  }
}

function validatePaletteItem(item: PaletteItem, path: string): void {
  if (!Number.isSafeInteger(item.sourceIndex) || item.sourceIndex < 0) {
    fail(
      "INVALID_PALETTE",
      `${path}.sourceIndex`,
      "Source index must be a non-negative safe integer.",
    );
  }
  if (!RGB_HEX.test(item.displayColor)) {
    fail(
      "INVALID_PALETTE",
      `${path}.displayColor`,
      "Display color must be normalized #RRGGBB.",
    );
  }
}

function validateSymbol(symbol: SymbolDefinition, path: string): void {
  if (symbol.sourceCode.length === 0) {
    fail("INVALID_SYMBOL", `${path}.sourceCode`, "Source code is required.");
  }
  if (symbol.visual.kind === "text-code-point") {
    if (
      [...symbol.visual.value].length !== 1 ||
      symbol.visual.fontFamily.trim().length === 0
    ) {
      fail(
        "INVALID_SYMBOL",
        `${path}.visual`,
        "Text visuals require one Unicode code point and a font family.",
      );
    }
    return;
  }
  if (
    symbol.visual.generatorVersion !== 1 ||
    !Number.isSafeInteger(symbol.visual.ordinal) ||
    symbol.visual.ordinal < 0
  ) {
    fail(
      "INVALID_SYMBOL",
      `${path}.visual`,
      "Generated visuals require version 1 and a non-negative ordinal.",
    );
  }
}

function validatePattern(pattern: Pattern): void {
  requireNonEmpty(pattern.id, "pattern.id");
  requireNonEmpty(pattern.provenanceRef, "pattern.provenanceRef");
  requireTimestamp(pattern.createdAt, "pattern.createdAt");
  requirePositiveInteger(pattern.grid.width, "pattern.grid.width");
  requirePositiveInteger(pattern.grid.height, "pattern.grid.height");
  if (
    pattern.grid.origin !== "top-left" ||
    pattern.grid.coordinateBase !== 0 ||
    pattern.grid.xDirection !== "right" ||
    pattern.grid.yDirection !== "down"
  ) {
    fail(
      "INVALID_GRID",
      "pattern.grid",
      "Canonical grid convention does not match format 1.0.0.",
    );
  }
  if (
    pattern.metadata.width !== pattern.grid.width ||
    pattern.metadata.height !== pattern.grid.height
  ) {
    fail(
      "INVALID_PATTERN",
      "pattern.metadata",
      "Metadata dimensions must be derived aliases of the grid.",
    );
  }

  requireUniqueIds(pattern.paletteItems, "pattern.paletteItems");
  requireUniqueIds(pattern.symbols, "pattern.symbols");
  const sourceIndices = new Set<number>();
  for (const [index, item] of pattern.paletteItems.entries()) {
    validatePaletteItem(item, `pattern.paletteItems[${index}]`);
    if (sourceIndices.has(item.sourceIndex)) {
      fail(
        "DUPLICATE_SOURCE_INDEX",
        `pattern.paletteItems[${index}].sourceIndex`,
        `Duplicate source index ${item.sourceIndex}.`,
      );
    }
    sourceIndices.add(item.sourceIndex);
  }
  for (const [index, symbol] of pattern.symbols.entries()) {
    validateSymbol(symbol, `pattern.symbols[${index}]`);
  }

  const clothId = pattern.metadata.fabric.clothPaletteItemId;
  if (
    clothId !== null &&
    !pattern.paletteItems.some(
      (item) => item.id === clothId && item.role === "cloth",
    )
  ) {
    fail(
      "BROKEN_REFERENCE",
      "pattern.metadata.fabric.clothPaletteItemId",
      "Cloth reference must resolve to a cloth PaletteItem.",
    );
  }
}

function validatePatternVersion(
  patternVersion: PatternVersion,
  pattern: Pattern,
): void {
  requireNonEmpty(patternVersion.id, "patternVersion.id");
  requireTimestamp(patternVersion.createdAt, "patternVersion.createdAt");
  requireNonEmpty(patternVersion.tileSetRef, "patternVersion.tileSetRef");
  requireHash(
    patternVersion.canonicalContentHash,
    "patternVersion.canonicalContentHash",
  );
  if (
    patternVersion.canonicalFormatVersion !== CANONICAL_FORMAT_VERSION ||
    patternVersion.patternId !== pattern.id
  ) {
    fail(
      "INVALID_PATTERN_VERSION",
      "patternVersion",
      "Pattern version must use format 1.0.0 and reference its Pattern.",
    );
  }
}

function validateStitches(
  stitches: readonly FullCrossStitch[],
  pattern: Pattern,
): void {
  requireUniqueIds(stitches, "stitches");
  const symbols = new Set(pattern.symbols.map((symbol) => symbol.id));
  const palette = new Map(
    pattern.paletteItems.map((item) => [item.id, item] as const),
  );
  const occupiedCells = new Set<string>();

  for (const [index, stitch] of stitches.entries()) {
    const path = `stitches[${index}]`;
    if (
      stitch.type !== "full-cross" ||
      !Number.isSafeInteger(stitch.x) ||
      !Number.isSafeInteger(stitch.y) ||
      stitch.x < 0 ||
      stitch.y < 0 ||
      stitch.x >= pattern.grid.width ||
      stitch.y >= pattern.grid.height
    ) {
      fail("INVALID_STITCH", path, "Stitch is outside the canonical grid.");
    }
    if (
      stitch.strandCount !== undefined &&
      (!Number.isSafeInteger(stitch.strandCount) || stitch.strandCount <= 0)
    ) {
      fail(
        "INVALID_STITCH",
        `${path}.strandCount`,
        "Strand count must be a positive safe integer.",
      );
    }
    if (!symbols.has(stitch.symbolId)) {
      fail(
        "BROKEN_REFERENCE",
        `${path}.symbolId`,
        "Stitch symbol reference does not exist.",
      );
    }
    const paletteItem = palette.get(stitch.paletteItemId);
    if (paletteItem === undefined) {
      fail(
        "BROKEN_REFERENCE",
        `${path}.paletteItemId`,
        "Stitch palette reference does not exist.",
      );
    }
    if (paletteItem.role === "cloth") {
      fail(
        "CLOTH_STITCH_REFERENCE",
        `${path}.paletteItemId`,
        "A stitch cannot reference the cloth palette item.",
      );
    }
    const cell = `${stitch.x}:${stitch.y}`;
    if (occupiedCells.has(cell)) {
      fail(
        "DUPLICATE_STITCH_CELL",
        path,
        `Canonical cell ${cell} contains more than one full-cross stitch.`,
      );
    }
    occupiedCells.add(cell);
  }
}

/**
 * Validates the canonical entities and all cross-record invariants that can be
 * checked without importer or persistence behavior.
 */
export function validateCanonicalPatternVersion(
  context: CanonicalPatternVersionContext,
): void {
  validateSourceFile(context.sourceFile);
  validateImportJob(context.importJob);
  validatePattern(context.pattern);
  validatePatternVersion(context.patternVersion, context.pattern);

  if (
    context.importJob.sourceFileId !== context.sourceFile.id ||
    context.patternVersion.sourceFileId !== context.sourceFile.id ||
    context.patternVersion.importJobId !== context.importJob.id
  ) {
    fail(
      "BROKEN_REFERENCE",
      "context",
      "SourceFile, ImportJob, and PatternVersion references do not agree.",
    );
  }
  validateStitches(context.stitches, context.pattern);
}

function deepFreeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) {
      deepFreeze(child);
    }
    Object.freeze(value);
  }
  return value;
}

/**
 * Validates and freezes a detached canonical snapshot.
 *
 * The returned snapshot prevents mutation after the import boundary commits
 * it. Persistence remains responsible for atomic commit semantics.
 */
export function createImmutableCanonicalSnapshot(
  context: CanonicalPatternVersionContext,
): CanonicalPatternVersionContext {
  const snapshot = structuredClone(context);
  validateCanonicalPatternVersion(snapshot);
  return deepFreeze(snapshot);
}

/**
 * Validates the discriminated Project lifecycle without coupling Project to
 * Pattern content.
 */
export function validateProject(project: Project): void {
  requireNonEmpty(project.id, "project.id");
  requireNonEmpty(project.importJobId, "project.importJobId");
  requireTimestamp(project.createdAt, "project.createdAt");
  requireTimestamp(project.updatedAt, "project.updatedAt");
  if (project.status === "ready") {
    requireNonEmpty(project.patternVersionId, "project.patternVersionId");
  } else if (project.patternVersionId !== null) {
    fail(
      "INVALID_PATTERN",
      "project.patternVersionId",
      "Importing or failed Projects cannot reference a PatternVersion.",
    );
  }
}

/**
 * Rebuilds progress solely from ordered immutable events.
 */
export function rebuildProgressState(
  events: readonly ProgressEvent[],
  projectId: string,
  patternVersionId: string,
): ProgressState {
  requireNonEmpty(projectId, "projectId");
  requireNonEmpty(patternVersionId, "patternVersionId");
  const state = new Map<string, "marked" | "unmarked">();
  const eventIds = new Set<string>();
  let previousSequence = 0;

  for (const [index, event] of events.entries()) {
    const path = `events[${index}]`;
    requireNonEmpty(event.id, `${path}.id`);
    requireNonEmpty(event.targetStitchId, `${path}.targetStitchId`);
    requireNonEmpty(event.deviceId, `${path}.deviceId`);
    requireTimestamp(event.occurredAt, `${path}.occurredAt`);
    if (
      event.schemaVersion !== 1 ||
      event.source !== "user" ||
      event.projectId !== projectId ||
      event.patternVersionId !== patternVersionId
    ) {
      fail(
        "PROGRESS_CONTEXT_MISMATCH",
        path,
        "Progress event does not belong to the requested project version.",
      );
    }
    if (
      !Number.isSafeInteger(event.localSequence) ||
      event.localSequence <= previousSequence
    ) {
      fail(
        "PROGRESS_SEQUENCE_INVALID",
        `${path}.localSequence`,
        "Progress events must have strictly increasing positive sequences.",
      );
    }
    if (eventIds.has(event.id)) {
      fail("DUPLICATE_ID", `${path}.id`, `Duplicate event ID ${event.id}.`);
    }
    eventIds.add(event.id);
    previousSequence = event.localSequence;
    state.set(
      event.targetStitchId,
      event.type === "mark" ? "marked" : "unmarked",
    );
  }
  return state;
}
