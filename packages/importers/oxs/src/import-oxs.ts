import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";
import {
  CANONICAL_FORMAT_VERSION,
  createImmutableCanonicalSnapshot,
  type CanonicalPatternVersionContext,
  type FullCrossStitch,
  type ImportJob,
  type PaletteItem,
  type Pattern,
  type PatternVersion,
  type SourceFile,
  type SymbolDefinition,
} from "@abris-universe/domain-core";

import type {
  OxsImportAccepted,
  OxsImportIssue,
  OxsImportRejected,
  OxsImportRequest,
  OxsImportResult,
} from "./contracts.ts";
import {
  assertOxsSourcePreflight,
  estimateOxsParsedPeakBytes,
  OXS_LIMITS,
} from "./limits.ts";
import {
  OxsParseFailure,
  parseOxsDocument,
  type ParsedOxsPaletteItem,
} from "./parser.ts";

const IMPORTER_VERSION = "0.1.0";
const ROUTE_1_PRODUCER = "Abris Universe Route-1 Fixture Generator";
const ROUTE_1_PRODUCER_VERSION = "1.0.0";
const textEncoder = new TextEncoder();

function hashBytes(value: Uint8Array): string {
  return bytesToHex(sha256(value));
}

function hashText(value: string): string {
  return hashBytes(textEncoder.encode(value));
}

function deterministicId(
  sourceSha256: string,
  ...stableKeyParts: readonly (string | number)[]
): string {
  return `sha256:${hashText(JSON.stringify([sourceSha256, ...stableKeyParts]))}`;
}

function parseInteger(
  value: string | undefined,
  code: string,
  location: string,
  { positive = false }: { readonly positive?: boolean } = {},
): number {
  if (value === undefined || !/^(?:0|[1-9]\d*)$/u.test(value)) {
    throw new OxsParseFailure(code, "Expected a strict base-10 integer.", location);
  }
  const parsed = Number(value);
  if (
    !Number.isSafeInteger(parsed) ||
    (positive ? parsed <= 0 : parsed < 0)
  ) {
    throw new OxsParseFailure(code, "Integer is outside the supported range.", location);
  }
  return parsed;
}

function parseOptionalPositiveDecimal(
  value: string | undefined,
  location: string,
): number | null {
  if (value === undefined || value === "") return null;
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/u.test(value)) {
    throw new OxsParseFailure(
      "OXS_FABRIC_COUNT_INVALID",
      "Fabric count must be a finite positive decimal.",
      location,
    );
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new OxsParseFailure(
      "OXS_FABRIC_COUNT_INVALID",
      "Fabric count must be a finite positive decimal.",
      location,
    );
  }
  return parsed;
}

function issue(
  code: string,
  severity: "error" | "warning",
  location: string | null,
  details: Readonly<Record<string, string | number | boolean>> = {},
): OxsImportIssue {
  return {
    code,
    severity,
    messageKey: `import.oxs.${code.toLowerCase()}`,
    location,
    details,
  };
}

function sourceFileFrom(
  request: OxsImportRequest,
  sourceSha256: string,
): SourceFile {
  return {
    id: request.sourceFileId,
    originalName: request.originalName,
    mediaType: request.mediaType ?? "application/xml",
    declaredFormat: "oxs",
    detectedFormatVersion: null,
    byteLength: request.bytes.byteLength,
    sha256: sourceSha256,
    bytesRef: request.bytesRef,
    retentionStatus: "retained",
    receivedAt: request.receivedAt,
  };
}

function rejected(
  request: OxsImportRequest,
  sourceFile: SourceFile,
  failure: OxsParseFailure,
): OxsImportRejected {
  const error = issue(
    failure.code,
    "error",
    failure.location,
    failure.details,
  );
  const importJob: ImportJob = {
    id: request.importJobId,
    sourceFileId: sourceFile.id,
    importerId: "oxs",
    importerVersion: IMPORTER_VERSION,
    status: "rejected",
    startedAt: request.startedAt,
    completedAt: request.completedAt,
    reportRef: `report:${request.importJobId}`,
    warningCodes: [],
  };
  return {
    status: "rejected",
    sourceFile,
    importJob,
    canonical: null,
    report: {
      schemaVersion: 1,
      importJobId: request.importJobId,
      status: "rejected",
      errors: [error],
      warnings: [],
      counts: {
        paletteItems: 0,
        symbols: 0,
        fullCrossStitches: 0,
        unsupportedByKind: {},
      },
      sourceSha256: sourceFile.sha256,
    },
    provenance: null,
  };
}

interface MappedPalette {
  readonly items: readonly PaletteItem[];
  readonly symbols: readonly SymbolDefinition[];
  readonly paletteBySourceIndex: ReadonlyMap<number, PaletteItem>;
  readonly symbolIdBySourceIndex: ReadonlyMap<number, string>;
  readonly strandCountBySourceIndex: ReadonlyMap<number, number>;
  readonly warnings: readonly OxsImportIssue[];
}

function mapPalette(
  parsedItems: readonly ParsedOxsPaletteItem[],
  sourceSha256: string,
): MappedPalette {
  const sourceItems = parsedItems.map((item, position) => ({
    source: item,
    sourceIndex: parseInteger(
      item.index,
      "OXS_PALETTE_INDEX_INVALID",
      `chart/palette/palette_item[${position}]/@index`,
    ),
  }));
  sourceItems.sort((left, right) => left.sourceIndex - right.sourceIndex);

  const seenIndices = new Set<number>();
  for (const { sourceIndex } of sourceItems) {
    if (seenIndices.has(sourceIndex)) {
      throw new OxsParseFailure(
        "OXS_PALETTE_INDEX_DUPLICATE",
        "Palette indices must be unique.",
        `chart/palette/palette_item/@index`,
        { sourceIndex },
      );
    }
    seenIndices.add(sourceIndex);
  }

  const items: PaletteItem[] = [];
  const paletteBySourceIndex = new Map<number, PaletteItem>();
  const strandCountBySourceIndex = new Map<number, number>();
  const warnings: OxsImportIssue[] = [];

  for (const { source, sourceIndex } of sourceItems) {
    if (source.color === undefined || !/^[A-Fa-f0-9]{6}$/u.test(source.color)) {
      throw new OxsParseFailure(
        "OXS_PALETTE_COLOR_INVALID",
        "Palette colors must contain six RGB hexadecimal digits.",
        `chart/palette/palette_item[@index=${sourceIndex}]/@color`,
      );
    }
    const paletteItem: PaletteItem = {
      id: deterministicId(sourceSha256, "palette", sourceIndex),
      sourceIndex,
      role: sourceIndex === 0 ? "cloth" : "thread",
      threadBrand: null,
      brandCode:
        source.number === undefined || source.number === "" ? null : source.number,
      displayName:
        source.name === undefined || source.name === "" ? null : source.name,
      displayColor: `#${source.color.toUpperCase()}`,
    };
    items.push(paletteItem);
    paletteBySourceIndex.set(sourceIndex, paletteItem);

    if (source.strands !== undefined && source.strands !== "") {
      if (/^[1-9]\d*$/u.test(source.strands)) {
        const strands = Number(source.strands);
        if (Number.isSafeInteger(strands)) {
          strandCountBySourceIndex.set(sourceIndex, strands);
        } else {
          warnings.push(
            issue(
              "OXS_STRANDS_INVALID_IGNORED",
              "warning",
              `chart/palette/palette_item[@index=${sourceIndex}]/@strands`,
              { sourceIndex },
            ),
          );
        }
      } else {
        warnings.push(
          issue(
            "OXS_STRANDS_INVALID_IGNORED",
            "warning",
            `chart/palette/palette_item[@index=${sourceIndex}]/@strands`,
            { sourceIndex },
          ),
        );
      }
    }
  }

  const clothItems = items.filter((item) => item.role === "cloth");
  if (clothItems.length !== 1) {
    throw new OxsParseFailure(
      "OXS_CLOTH_PALETTE_MISSING",
      "The route-1 palette must contain index zero as cloth.",
    );
  }

  const threadSources = sourceItems.filter(({ sourceIndex }) => sourceIndex !== 0);
  const groups = new Map<string, typeof threadSources>();
  for (const item of threadSources) {
    const sourceCode = item.source.symbol ?? "";
    const group = groups.get(sourceCode) ?? [];
    group.push(item);
    groups.set(sourceCode, group);
  }

  const symbols: SymbolDefinition[] = [];
  const symbolIdBySourceIndex = new Map<number, string>();
  for (const [sourceCode, group] of groups) {
    group.sort((left, right) => left.sourceIndex - right.sourceIndex);
    for (const [position, entry] of group.entries()) {
      const literal = [...sourceCode].length === 1;
      const exact = position === 0 && literal;
      const symbolId = deterministicId(
        sourceSha256,
        "symbol",
        sourceCode,
        ...(exact ? [] : ["palette", entry.sourceIndex]),
      );
      symbols.push({
        id: symbolId,
        sourceCode,
        visual: exact
          ? {
              kind: "text-code-point",
              value: sourceCode,
              fontFamily: "system-ui",
            }
          : {
              kind: "generated",
              generatorVersion: 1,
              ordinal: entry.sourceIndex,
            },
      });
      symbolIdBySourceIndex.set(entry.sourceIndex, symbolId);

      if (!exact) {
        warnings.push(
          issue(
            position > 0
              ? "OXS_SYMBOL_CODE_COLLISION"
              : "OXS_SYMBOL_SUBSTITUTED",
            "warning",
            `chart/palette/palette_item[@index=${entry.sourceIndex}]/@symbol`,
            { sourceIndex: entry.sourceIndex },
          ),
        );
      }
    }
  }

  return {
    items,
    symbols,
    paletteBySourceIndex,
    symbolIdBySourceIndex,
    strandCountBySourceIndex,
    warnings,
  };
}

function canonicalHash(
  pattern: Pattern,
  stitches: readonly FullCrossStitch[],
): string {
  const paletteById = new Map(
    pattern.paletteItems.map((item) => [item.id, item.sourceIndex] as const),
  );
  const symbolById = new Map(
    pattern.symbols.map((symbol) => [
      symbol.id,
      { sourceCode: symbol.sourceCode, visual: symbol.visual },
    ] as const),
  );
  const serializable = {
    canonicalFormatVersion: CANONICAL_FORMAT_VERSION,
    grid: pattern.grid,
    metadata: pattern.metadata,
    paletteItems: [...pattern.paletteItems]
      .sort((left, right) => left.sourceIndex - right.sourceIndex)
      .map(({ sourceIndex, role, threadBrand, brandCode, displayName, displayColor }) => ({
        sourceIndex,
        role,
        threadBrand,
        brandCode,
        displayName,
        displayColor,
      })),
    symbols: [...pattern.symbols]
      .map(({ sourceCode, visual }) => ({ sourceCode, visual }))
      .sort((left, right) => {
        const leftValue = JSON.stringify(left);
        const rightValue = JSON.stringify(right);
        return leftValue < rightValue ? -1 : leftValue > rightValue ? 1 : 0;
      }),
    stitches: [...stitches]
      .sort((left, right) => left.y - right.y || left.x - right.x)
      .map((stitch) => ({
        type: stitch.type,
        x: stitch.x,
        y: stitch.y,
        sourcePaletteIndex: paletteById.get(stitch.paletteItemId),
        symbol: symbolById.get(stitch.symbolId),
        strandCount: stitch.strandCount ?? null,
      })),
  };
  return hashText(JSON.stringify(serializable));
}

/**
 * Imports only the registered route-1 OXS 1.0 producer profile.
 *
 * File-size preflight must run before transferring bytes to a worker. This
 * function repeats that check defensively and never falls back to UI-thread
 * parsing on behalf of a caller.
 */
export function importOxsRoute1(request: OxsImportRequest): OxsImportResult {
  assertOxsSourcePreflight(request.bytes.byteLength);
  const sourceSha256 = hashBytes(request.bytes);
  let sourceFile = sourceFileFrom(request, sourceSha256);

  let text: string;
  try {
    text = new TextDecoder("utf-8", { fatal: true }).decode(request.bytes);
  } catch {
    return rejected(
      request,
      sourceFile,
      new OxsParseFailure(
        "OXS_UTF8_INVALID",
        "The OXS source is not valid UTF-8.",
      ),
    );
  }
  if (textEncoder.encode(text).byteLength > OXS_LIMITS.maxDecodedUtf8Bytes) {
    return rejected(
      request,
      sourceFile,
      new OxsParseFailure(
        "OXS_LIMIT_TEXT_BYTES",
        "Decoded UTF-8 text exceeds the Phase 0 limit.",
      ),
    );
  }

  try {
    const parsed = parseOxsDocument(text);
    const unsupportedCount = Object.values(parsed.unsupportedByKind).reduce(
      (sum, count) => sum + count,
      0,
    );
    if (
      estimateOxsParsedPeakBytes(
        request.bytes.byteLength,
        parsed.paletteItems.length,
        parsed.stitches.length,
        unsupportedCount,
      ) > OXS_LIMITS.maxPreflightPeakBytes
    ) {
      throw new OxsParseFailure(
        "OXS_LIMIT_PREFLIGHT_MEMORY",
        "Parsed OXS structures exceed the Phase 0 memory budget.",
      );
    }
    const properties = parsed.properties;
    if (properties.oxsversion !== "1.0") {
      throw new OxsParseFailure(
        "OXS_VERSION_UNSUPPORTED",
        "Only OXS 1.0 is supported.",
        "chart/properties/@oxsversion",
      );
    }
    sourceFile = { ...sourceFile, detectedFormatVersion: "1.0" };

    if (
      properties.software !== ROUTE_1_PRODUCER ||
      properties.software_version !== ROUTE_1_PRODUCER_VERSION
    ) {
      throw new OxsParseFailure(
        "OXS_COORDINATE_PROFILE_UNSUPPORTED",
        "The OXS producer coordinate profile is not registered.",
        "chart/properties",
      );
    }

    const width = parseInteger(
      properties.chartwidth,
      "OXS_GRID_INVALID",
      "chart/properties/@chartwidth",
      { positive: true },
    );
    const height = parseInteger(
      properties.chartheight,
      "OXS_GRID_INVALID",
      "chart/properties/@chartheight",
      { positive: true },
    );
    if (width > OXS_LIMITS.maxGridAxis || height > OXS_LIMITS.maxGridAxis) {
      throw new OxsParseFailure(
        "OXS_LIMIT_GRID",
        "Grid axis exceeds the Phase 0 limit.",
        "chart/properties",
        { width, height },
      );
    }

    const palette = mapPalette(parsed.paletteItems, sourceSha256);
    const warnings: OxsImportIssue[] = [...palette.warnings];
    const stitches: FullCrossStitch[] = [];
    const occupied = new Set<string>();
    let sourceProgressCount = 0;

    for (const [position, source] of parsed.stitches.entries()) {
      const x = parseInteger(
        source.x,
        "OXS_COORDINATE_INVALID",
        `chart/fullstitches/stitch[${position}]/@x`,
      );
      const y = parseInteger(
        source.y,
        "OXS_COORDINATE_INVALID",
        `chart/fullstitches/stitch[${position}]/@y`,
      );
      const sourcePaletteIndex = parseInteger(
        source.palindex,
        "OXS_PALETTE_REFERENCE_INVALID",
        `chart/fullstitches/stitch[${position}]/@palindex`,
      );
      if (x >= width || y >= height) {
        throw new OxsParseFailure(
          "OXS_COORDINATE_OUT_OF_BOUNDS",
          "Full-cross coordinate is outside the canonical grid.",
          `chart/fullstitches/stitch[${position}]`,
          { x, y },
        );
      }
      const cell = `${x}:${y}`;
      if (occupied.has(cell)) {
        throw new OxsParseFailure(
          "OXS_COORDINATE_DUPLICATE",
          "A canonical cell contains more than one full-cross stitch.",
          `chart/fullstitches/stitch[${position}]`,
          { x, y },
        );
      }
      occupied.add(cell);

      const paletteItem = palette.paletteBySourceIndex.get(sourcePaletteIndex);
      const symbolId = palette.symbolIdBySourceIndex.get(sourcePaletteIndex);
      if (paletteItem === undefined) {
        throw new OxsParseFailure(
          "OXS_PALETTE_REFERENCE_INVALID",
          "Full-cross stitch palette reference does not exist.",
          `chart/fullstitches/stitch[${position}]/@palindex`,
          { sourcePaletteIndex },
        );
      }
      if (paletteItem.role === "cloth") {
        throw new OxsParseFailure(
          "OXS_CLOTH_STITCH_REFERENCE",
          "Full-cross stitch cannot reference cloth.",
          `chart/fullstitches/stitch[${position}]/@palindex`,
        );
      }
      if (symbolId === undefined) {
        throw new OxsParseFailure(
          "OXS_PALETTE_REFERENCE_INVALID",
          "Thread palette reference has no symbol mapping.",
          `chart/fullstitches/stitch[${position}]/@palindex`,
          { sourcePaletteIndex },
        );
      }
      const strandCount = palette.strandCountBySourceIndex.get(sourcePaletteIndex);
      stitches.push({
        id: deterministicId(sourceSha256, "stitch", x, y),
        type: "full-cross",
        x,
        y,
        symbolId,
        paletteItemId: paletteItem.id,
        ...(strandCount === undefined ? {} : { strandCount }),
      });
      if (source.marked !== undefined) sourceProgressCount += 1;
    }

    if (sourceProgressCount > 0) {
      warnings.push(
        issue(
          "OXS_SOURCE_PROGRESS_IGNORED",
          "warning",
          "chart/fullstitches/stitch/@marked",
          { count: sourceProgressCount },
        ),
      );
    }

    const unsupportedIssueCodes: Record<string, string> = {
      partstitches: "OXS_UNSUPPORTED_PART_STITCHES",
      backstitches: "OXS_UNSUPPORTED_BACKSTITCHES",
      objects: "OXS_UNSUPPORTED_OBJECTS",
    };
    for (const [kind, count] of Object.entries(parsed.unsupportedByKind)) {
      warnings.push(
        issue(
          unsupportedIssueCodes[kind] ?? "OXS_UNSUPPORTED_EXTENSION",
          "warning",
          `chart/${kind}`,
          { kind, count },
        ),
      );
    }

    const countX = parseOptionalPositiveDecimal(
      properties.stitchesperinch,
      "chart/properties/@stitchesperinch",
    );
    const countY = parseOptionalPositiveDecimal(
      properties.stitchesperinch_y,
      "chart/properties/@stitchesperinch_y",
    );
    const cloth = palette.paletteBySourceIndex.get(0);
    const pattern: Pattern = {
      id: request.patternId,
      metadata: {
        name:
          properties.charttitle === undefined ||
          properties.charttitle.trim() === ""
            ? null
            : properties.charttitle.trim(),
        width,
        height,
        fabric: {
          type: null,
          countX,
          countY,
          countUnit:
            countX === null && countY === null
              ? null
              : "stitches-per-inch",
          clothPaletteItemId: cloth?.id ?? null,
        },
      },
      grid: {
        width,
        height,
        origin: "top-left",
        coordinateBase: 0,
        xDirection: "right",
        yDirection: "down",
      },
      paletteItems: palette.items,
      symbols: palette.symbols,
      createdAt: request.completedAt,
      provenanceRef: `source:${sourceFile.id}`,
    };
    const contentHash = canonicalHash(pattern, stitches);
    const patternVersion: PatternVersion = {
      id: request.patternVersionId,
      patternId: pattern.id,
      canonicalFormatVersion: CANONICAL_FORMAT_VERSION,
      createdAt: request.completedAt,
      sourceFileId: sourceFile.id,
      importJobId: request.importJobId,
      canonicalContentHash: contentHash,
      tileSetRef: request.tileSetRef,
    };
    const status =
      warnings.length === 0 ? "completed" : "completed_with_warnings";
    const importJob: ImportJob = {
      id: request.importJobId,
      sourceFileId: sourceFile.id,
      importerId: "oxs",
      importerVersion: IMPORTER_VERSION,
      status,
      startedAt: request.startedAt,
      completedAt: request.completedAt,
      reportRef: `report:${request.importJobId}`,
      warningCodes: [...new Set(warnings.map((warning) => warning.code))],
    };
    const context: CanonicalPatternVersionContext =
      createImmutableCanonicalSnapshot({
        sourceFile,
        importJob,
        pattern,
        patternVersion,
        stitches,
      });
    const accepted: OxsImportAccepted = {
      status,
      sourceFile: context.sourceFile,
      importJob: context.importJob,
      canonical: context,
      report: {
        schemaVersion: 1,
        importJobId: request.importJobId,
        status,
        ...(stitches.length === 0
          ? { messageKey: "import.oxs.emptyPattern" }
          : {}),
        errors: [],
        warnings,
        counts: {
          paletteItems: palette.items.length,
          symbols: palette.symbols.length,
          fullCrossStitches: stitches.length,
          unsupportedByKind: parsed.unsupportedByKind,
        },
        sourceSha256,
        canonicalContentHash: contentHash,
      },
      provenance: {
        producer: ROUTE_1_PRODUCER,
        producerVersion: ROUTE_1_PRODUCER_VERSION,
        coordinateProfile: "abris-route-1-1.0.0",
        originalChartTitle: properties.charttitle ?? null,
      },
    };
    return accepted;
  } catch (error) {
    const failure =
      error instanceof OxsParseFailure
        ? error
        : new OxsParseFailure(
            "OXS_CANONICAL_VALIDATION_FAILED",
            "Canonical validation rejected the mapped OXS source.",
          );
    return rejected(request, sourceFile, failure);
  }
}
