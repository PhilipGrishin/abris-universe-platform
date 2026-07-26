/**
 * Bounded user-facing messages. Raw parser, persistence, or imported text is
 * never exposed as application copy.
 */
const ISSUE_MESSAGES: Readonly<Record<string, string>> = Object.freeze({
  OXS_COORDINATE_PROFILE_UNSUPPORTED:
    "This OXS file was created by an unsupported producer profile.",
  OXS_DOCTYPE_FORBIDDEN:
    "This file contains XML features that are not allowed for safety.",
  OXS_EMPTY_FULL_CROSS:
    "This pattern does not contain any supported full-cross stitches.",
  OXS_LIMIT_FILE_BYTES: "This file is larger than the 64 MiB import limit.",
  OXS_LIMIT_GRID: "This pattern grid is larger than the supported limit.",
  OXS_LIMIT_STITCHES: "This pattern contains more than 500,000 stitches.",
  OXS_PALETTE_REFERENCE_INVALID:
    "This pattern contains a stitch with an invalid palette reference.",
  OXS_ROOT_INVALID: "This file is not a supported OXS chart.",
  OXS_VERSION_UNSUPPORTED: "Only OXS version 1.0 is supported.",
  OXS_XML_INVALID: "This OXS file is damaged or incomplete.",
  OXS_XML_MALFORMED: "This OXS file is damaged or incomplete.",
  PERSISTENCE_INDEXEDDB_UNAVAILABLE:
    "Local project storage is unavailable in this browser.",
  PERSISTENCE_PROGRESS_LOCK_UNAVAILABLE:
    "Another tab is editing this project. Progress is read-only here.",
  PERSISTENCE_QUOTA_EXCEEDED:
    "The change was not saved because local storage is full.",
  PERSISTENCE_WEB_LOCKS_UNAVAILABLE:
    "This browser cannot safely save progress. Progress editing is disabled.",
});

export function issueMessage(code: string): string {
  return (
    ISSUE_MESSAGES[code] ??
    "The file could not be imported safely. Check that it is a supported OXS 1.0 file."
  );
}

export function formatCount(value: number): string {
  return new Intl.NumberFormat("en").format(value);
}

export function countedCoordinate(x: number, y: number): string {
  return `row ${y + 1}, column ${x + 1}`;
}
