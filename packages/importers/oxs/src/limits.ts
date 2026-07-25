import { OxsImportBoundaryError } from "./contracts.ts";

const MEBIBYTE = 1024 * 1024;

export interface OxsParserLimits {
  readonly maxXmlDepth: number;
  readonly maxElements: number;
  readonly maxAttributesPerElement: number;
  readonly maxAttributeBytes: number;
  readonly maxMetadataBytes: number;
  readonly maxRetainedExtensionBytes: number;
  readonly maxGridAxis: number;
  readonly maxPaletteEntries: number;
  readonly maxFullCrossStitches: number;
  readonly maxUnsupportedObjects: number;
}

export const OXS_LIMITS = Object.freeze({
  maxSourceBytes: 64 * MEBIBYTE,
  maxDecodedUtf8Bytes: 64 * MEBIBYTE,
  maxPreflightPeakBytes: 384 * MEBIBYTE,
  maxXmlDepth: 16,
  maxElements: 1_000_000,
  maxAttributesPerElement: 32,
  maxAttributeBytes: 8 * 1024,
  maxMetadataBytes: 64 * 1024,
  maxRetainedExtensionBytes: 256 * 1024,
  maxGridAxis: 10_000,
  maxPaletteEntries: 4_096,
  maxFullCrossStitches: 500_000,
  maxUnsupportedObjects: 500_000,
} satisfies OxsParserLimits & {
  readonly maxSourceBytes: number;
  readonly maxDecodedUtf8Bytes: number;
  readonly maxPreflightPeakBytes: number;
});

/**
 * Conservative before-parse estimate: source bytes, a two-byte decoded-text
 * upper bound, one source-sized parser reserve, and 64 MiB for canonical/tile
 * staging. Parsed-structure limits provide the second allocation gate.
 */
export function estimateOxsPreflightPeakBytes(sourceBytes: number): number {
  return sourceBytes * 4 + 64 * MEBIBYTE;
}

export function estimateOxsParsedPeakBytes(
  sourceBytes: number,
  paletteEntries: number,
  fullCrossStitches: number,
  unsupportedObjects: number,
): number {
  return (
    estimateOxsPreflightPeakBytes(sourceBytes) +
    paletteEntries * 1024 +
    fullCrossStitches * 160 +
    unsupportedObjects * 64
  );
}

export function assertOxsSourcePreflight(sourceBytes: number): void {
  if (!Number.isSafeInteger(sourceBytes) || sourceBytes < 0) {
    throw new TypeError("Source byte length must be a non-negative safe integer.");
  }
  if (sourceBytes > OXS_LIMITS.maxSourceBytes) {
    throw new OxsImportBoundaryError(
      "OXS_LIMIT_FILE_BYTES",
      "OXS source exceeds the Phase 0 byte limit.",
    );
  }
  if (
    estimateOxsPreflightPeakBytes(sourceBytes) >
    OXS_LIMITS.maxPreflightPeakBytes
  ) {
    throw new OxsImportBoundaryError(
      "OXS_LIMIT_PREFLIGHT_MEMORY",
      "OXS source exceeds the Phase 0 preflight memory budget.",
    );
  }
}
