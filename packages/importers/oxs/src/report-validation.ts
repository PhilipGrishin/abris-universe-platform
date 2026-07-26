import type { OxsImportReport } from "./contracts.ts";

export const MAX_OXS_IMPORT_REPORT_BYTES = 256 * 1024;
export const MAX_OXS_IMPORT_ISSUES = 128;
export const MAX_OXS_IMPORT_DETAIL_ENTRIES = 16;
export const MAX_OXS_IMPORT_DETAIL_STRING_LENGTH = 512;

export class OxsImportReportValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OxsImportReportValidationError";
  }
}

function fail(message: string): never {
  throw new OxsImportReportValidationError(message);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function requireBoundedString(
  value: unknown,
  label: string,
  maximum: number,
): asserts value is string {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length > maximum
  ) {
    fail(`${label} must be a non-empty bounded string.`);
  }
}

function validateIssue(value: unknown, expectedSeverity: "error" | "warning"): void {
  if (!isRecord(value)) {
    fail("ImportReport issue must be an object.");
  }
  requireBoundedString(value.code, "Issue code", 128);
  if (!/^[A-Z0-9_]+$/u.test(value.code)) {
    fail("Issue code must use the registered uppercase identifier syntax.");
  }
  if (value.severity !== expectedSeverity) {
    fail("Issue severity does not match its report collection.");
  }
  requireBoundedString(value.messageKey, "Issue messageKey", 256);
  if (
    value.location !== null &&
    (typeof value.location !== "string" || value.location.length > 256)
  ) {
    fail("Issue location exceeds its bound.");
  }
  if (!isRecord(value.details)) {
    fail("Issue details must be a bounded object.");
  }
  const details = Object.entries(value.details);
  if (details.length > MAX_OXS_IMPORT_DETAIL_ENTRIES) {
    fail("Issue details contain too many entries.");
  }
  for (const [key, detail] of details) {
    requireBoundedString(key, "Issue detail key", 128);
    if (
      !["string", "number", "boolean"].includes(typeof detail) ||
      (typeof detail === "string" &&
        detail.length > MAX_OXS_IMPORT_DETAIL_STRING_LENGTH) ||
      (typeof detail === "number" && !Number.isFinite(detail))
    ) {
      fail("Issue detail value is outside the approved bounded scalar shape.");
    }
  }
}

function requireCount(value: unknown, label: string): asserts value is number {
  if (!Number.isSafeInteger(value) || (value as number) < 0) {
    fail(`${label} must be a non-negative safe integer.`);
  }
}

/**
 * Runtime-validates the approved Phase 0 ImportReport shape and allocation
 * bound before it reaches IndexedDB.
 */
export function validateOxsImportReport(
  value: unknown,
): asserts value is OxsImportReport {
  let serialized: string;
  try {
    serialized = JSON.stringify(value);
  } catch {
    fail("ImportReport must be JSON serializable.");
  }
  if (
    serialized === undefined ||
    new TextEncoder().encode(serialized).byteLength >
      MAX_OXS_IMPORT_REPORT_BYTES
  ) {
    fail("ImportReport exceeds the approved byte bound.");
  }
  if (!isRecord(value) || value.schemaVersion !== 1) {
    fail("ImportReport schemaVersion must be 1.");
  }
  requireBoundedString(value.importJobId, "ImportReport importJobId", 256);
  if (
    !["completed", "completed_with_warnings", "rejected"].includes(
      String(value.status),
    )
  ) {
    fail("ImportReport status is invalid.");
  }
  if (
    value.messageKey !== undefined &&
    (typeof value.messageKey !== "string" ||
      value.messageKey.length === 0 ||
      value.messageKey.length > 256)
  ) {
    fail("ImportReport messageKey is invalid.");
  }
  if (
    !Array.isArray(value.errors) ||
    !Array.isArray(value.warnings) ||
    value.errors.length + value.warnings.length > MAX_OXS_IMPORT_ISSUES
  ) {
    fail("ImportReport issue collections exceed their bound.");
  }
  for (const issue of value.errors) {
    validateIssue(issue, "error");
  }
  for (const issue of value.warnings) {
    validateIssue(issue, "warning");
  }
  if (!isRecord(value.counts)) {
    fail("ImportReport counts are invalid.");
  }
  requireCount(value.counts.paletteItems, "Palette count");
  requireCount(value.counts.symbols, "Symbol count");
  requireCount(value.counts.fullCrossStitches, "Full-cross count");
  if (!isRecord(value.counts.unsupportedByKind)) {
    fail("Unsupported counts are invalid.");
  }
  if (Object.keys(value.counts.unsupportedByKind).length > 128) {
    fail("Unsupported counts contain too many categories.");
  }
  for (const [kind, count] of Object.entries(
    value.counts.unsupportedByKind,
  )) {
    requireBoundedString(kind, "Unsupported category", 128);
    requireCount(count, `Unsupported ${kind} count`);
  }
  if (
    typeof value.sourceSha256 !== "string" ||
    !/^[a-f0-9]{64}$/u.test(value.sourceSha256) ||
    (value.canonicalContentHash !== undefined &&
      (typeof value.canonicalContentHash !== "string" ||
        !/^[a-f0-9]{64}$/u.test(value.canonicalContentHash)))
  ) {
    fail("ImportReport hashes must be lowercase SHA-256 hexadecimal.");
  }
}
