import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { sha256 } from "@noble/hashes/sha2.js";
import { bytesToHex } from "@noble/hashes/utils.js";

import {
  OXS_LIMITS,
  OxsImportBoundaryError,
  assertOxsSourcePreflight,
  estimateOxsParsedPeakBytes,
  importOxsRoute1,
  type OxsImportRequest,
} from "../src/index.ts";
import {
  OxsParseFailure,
  parseOxsDocument,
} from "../src/parser.ts";

const fixtureRoot = join(
  import.meta.dirname,
  "../../../../tests/fixtures/oxs",
);
const generated = (name: string): Uint8Array =>
  readFileSync(join(fixtureRoot, "generated", name));
const expected = (name: string): Record<string, unknown> =>
  JSON.parse(
    readFileSync(join(fixtureRoot, "expected", name), "utf8"),
  ) as Record<string, unknown>;
const timestamp = "2026-07-25T14:00:00.000Z";

function request(
  name: string,
  overrides: Partial<OxsImportRequest> = {},
): OxsImportRequest {
  return {
    bytes: generated(name),
    originalName: name,
    bytesRef: `blob:${name}`,
    sourceFileId: `source:${name}`,
    importJobId: `import:${name}`,
    patternId: `pattern:${name}`,
    patternVersionId: `version:${name}`,
    tileSetRef: `tiles:${name}`,
    receivedAt: timestamp,
    startedAt: timestamp,
    completedAt: timestamp,
    ...overrides,
  };
}

function rejectionCode(name: string): string {
  const result = importOxsRoute1(request(name));
  assert.equal(result.status, "rejected");
  return result.report.errors[0]?.code ?? "";
}

function importTransformedMinimal(
  transform: (source: string) => string,
): ReturnType<typeof importOxsRoute1> {
  const source = new TextDecoder().decode(generated("minimal-full-cross.oxs"));
  return importOxsRoute1(
    request("minimal-full-cross.oxs", {
      bytes: new TextEncoder().encode(transform(source)),
    }),
  );
}

function normalizedStitchDigest(
  result: Exclude<ReturnType<typeof importOxsRoute1>, { status: "rejected" }>,
): string {
  const sourceIndexByPaletteId = new Map(
    result.canonical.pattern.paletteItems.map((item) => [
      item.id,
      item.sourceIndex,
    ]),
  );
  const normalized = result.canonical.stitches
    .map(
      (stitch) =>
        `${stitch.x},${stitch.y},${sourceIndexByPaletteId.get(stitch.paletteItemId)}`,
    )
    .join("\n");
  return bytesToHex(sha256(new TextEncoder().encode(normalized)));
}

test("maps the minimal route-1 fixture to canonical domain records", () => {
  const result = importOxsRoute1(request("minimal-full-cross.oxs"));
  assert.equal(result.status, "completed");
  if (result.status === "rejected") return;

  assert.deepEqual(result.canonical.pattern.grid, {
    width: 7,
    height: 5,
    origin: "top-left",
    coordinateBase: 0,
    xDirection: "right",
    yDirection: "down",
  });
  assert.equal(result.canonical.pattern.metadata.name, "Route-1 Coordinate Boundary");
  assert.equal(result.canonical.pattern.paletteItems.length, 6);
  assert.equal(result.canonical.pattern.symbols.length, 5);
  assert.deepEqual(
    result.canonical.stitches.map(({ x, y }) => [x, y]),
    [
      [0, 0],
      [6, 0],
      [2, 3],
      [0, 4],
      [6, 4],
    ],
  );
  const fixtureExpectation = expected(
    "minimal-full-cross.expected.json",
  ) as {
    canonical: { stitchSequenceSha256: string };
  };
  assert.equal(
    normalizedStitchDigest(result),
    fixtureExpectation.canonical.stitchSequenceSha256,
  );
  assert.equal(
    "marked" in result.canonical.stitches[0]!,
    false,
    "source progress must not enter canonical Pattern data",
  );
});

test("produces deterministic imported IDs and content hash", () => {
  const first = importOxsRoute1(request("minimal-full-cross.oxs"));
  const second = importOxsRoute1(
    request("minimal-full-cross.oxs", {
      patternId: "pattern:second-instance",
      patternVersionId: "version:second-instance",
      importJobId: "import:second-instance",
      receivedAt: "2026-07-25T15:00:00.000Z",
      startedAt: "2026-07-25T15:00:00.000Z",
      completedAt: "2026-07-25T15:00:00.000Z",
    }),
  );
  assert.notEqual(first.status, "rejected");
  assert.notEqual(second.status, "rejected");
  if (first.status === "rejected" || second.status === "rejected") return;

  assert.equal(
    first.canonical.patternVersion.canonicalContentHash,
    second.canonical.patternVersion.canonicalContentHash,
  );
  assert.deepEqual(
    first.canonical.stitches.map(({ id }) => id),
    second.canonical.stitches.map(({ id }) => id),
  );
  assert.notEqual(
    first.canonical.patternVersion.id,
    second.canonical.patternVersion.id,
  );
});

test("maps the 100,000-stitch medium fixture within hard limits", () => {
  const result = importOxsRoute1(request("medium-full-cross.oxs"));
  assert.equal(result.status, "completed");
  if (result.status === "rejected") return;

  assert.equal(result.canonical.stitches.length, 100_000);
  assert.equal(result.canonical.pattern.paletteItems.length, 33);
  assert.equal(result.canonical.pattern.symbols.length, 32);
  const fixtureExpectation = expected(
    "medium-full-cross.expected.json",
  ) as {
    canonical: { stitchSequenceSha256: string };
  };
  assert.equal(
    normalizedStitchDigest(result),
    fixtureExpectation.canonical.stitchSequenceSha256,
  );
});

test("reports unsupported categories without mapping them as full crosses", () => {
  const result = importOxsRoute1(request("unsupported-content.oxs"));
  assert.equal(result.status, "completed_with_warnings");
  if (result.status === "rejected") return;

  assert.equal(result.canonical.stitches.length, 1);
  assert.deepEqual(result.report.counts.unsupportedByKind, {
    partstitches: 1,
    backstitches: 1,
    objects: 1,
  });
  assert.deepEqual(
    result.report.warnings.map(({ code }) => code),
    [
      "OXS_UNSUPPORTED_PART_STITCHES",
      "OXS_UNSUPPORTED_BACKSTITCHES",
      "OXS_UNSUPPORTED_OBJECTS",
    ],
  );
});

test("accepts an empty full-cross section with an explicit empty message", () => {
  const result = importOxsRoute1(request("empty-full-cross.oxs"));
  assert.equal(result.status, "completed");
  if (result.status === "rejected") return;
  assert.equal(result.canonical.stitches.length, 0);
  assert.equal(result.report.messageKey, "import.oxs.emptyPattern");
});

test("matches all registered rejection fixture codes", () => {
  const cases = new Map([
    ["corrupt-truncated.oxs", "OXS_XML_MALFORMED"],
    ["security-doctype.oxs", "OXS_DTD_FORBIDDEN"],
    ["invalid-palette-reference.oxs", "OXS_PALETTE_REFERENCE_INVALID"],
    ["duplicate-palette-index.oxs", "OXS_PALETTE_INDEX_DUPLICATE"],
    ["out-of-bounds-coordinate.oxs", "OXS_COORDINATE_OUT_OF_BOUNDS"],
    ["oversized-declared-grid.oxs", "OXS_LIMIT_GRID"],
  ]);
  for (const [name, code] of cases) {
    assert.equal(rejectionCode(name), code, name);
  }
});

test("rejects unknown coordinate profiles instead of guessing", () => {
  const result = importTransformedMinimal((source) =>
    source.replace(
      'software="Abris Universe Route-1 Fixture Generator"',
      'software="Unknown Producer"',
    ),
  );
  assert.equal(result.status, "rejected");
  assert.equal(
    result.report.errors[0]?.code,
    "OXS_COORDINATE_PROFILE_UNSUPPORTED",
  );
});

test("ignores OXS marked state and emits one bounded warning", () => {
  const result = importTransformedMinimal((source) =>
    source.replace(
      '<stitch x="0" y="0" palindex="1"/>',
      '<stitch x="0" y="0" palindex="1" marked="true"/>',
    ),
  );
  assert.equal(result.status, "completed_with_warnings");
  if (result.status === "rejected") return;
  assert.equal(
    result.report.warnings.find(
      ({ code }) => code === "OXS_SOURCE_PROGRESS_IGNORED",
    )?.details.count,
    1,
  );
  assert.equal(
    result.canonical.stitches.some((stitch) => "marked" in stitch),
    false,
  );
});

test("enforces structure, cloth, and unique-cell invariants", () => {
  const cases: Array<[(source: string) => string, string]> = [
    [
      (source) =>
        source.replace(
          "  <backstitches>\n  </backstitches>\n",
          "",
        ),
      "OXS_REQUIRED_SECTION_INVALID",
    ],
    [
      (source) =>
        source.replace(
          '    <stitch x="6" y="0" palindex="2"/>',
          '    <stitch x="0" y="0" palindex="2"/>',
        ),
      "OXS_COORDINATE_DUPLICATE",
    ],
    [
      (source) =>
        source.replace(
          '<stitch x="0" y="0" palindex="1"/>',
          '<stitch x="0" y="0" palindex="0"/>',
        ),
      "OXS_CLOTH_STITCH_REFERENCE",
    ],
    [
      (source) =>
        source.replace(
          /    <palette_item index="0"[^>]+\/>\n/u,
          "",
        ),
      "OXS_CLOTH_PALETTE_MISSING",
    ],
  ];
  for (const [transform, code] of cases) {
    const result = importTransformedMinimal(transform);
    assert.equal(result.status, "rejected");
    assert.equal(result.report.errors[0]?.code, code);
  }
});

test("disambiguates repeated symbol codes without coupling palette identity", () => {
  const result = importTransformedMinimal((source) =>
    source.replace('strands="2" symbol="B"', 'strands="2" symbol="A"'),
  );
  assert.equal(result.status, "completed_with_warnings");
  if (result.status === "rejected") return;

  const collision = result.report.warnings.find(
    ({ code }) => code === "OXS_SYMBOL_CODE_COLLISION",
  );
  assert.equal(collision?.details.sourceIndex, 2);
  const palette2 = result.canonical.pattern.paletteItems.find(
    ({ sourceIndex }) => sourceIndex === 2,
  );
  const stitch2 = result.canonical.stitches.find(
    ({ x, y }) => x === 6 && y === 0,
  );
  const symbol2 = result.canonical.pattern.symbols.find(
    ({ id }) => id === stitch2?.symbolId,
  );
  assert.equal(stitch2?.paletteItemId, palette2?.id);
  assert.equal(symbol2?.visual.kind, "generated");
});

test("reports unknown extensions and rejects non-XML processing instructions", () => {
  const extensionResult = importTransformedMinimal((source) =>
    source.replace(
      "  <commentboxes/>",
      "  <future_extension><future_item/></future_extension>\n  <commentboxes/>",
    ),
  );
  assert.equal(extensionResult.status, "completed_with_warnings");
  assert.deepEqual(extensionResult.report.counts.unsupportedByKind, {
    "extension:future_extension": 1,
    "extension:future_item": 1,
  });

  const processingInstruction = importTransformedMinimal((source) =>
    source.replace("<chart>", "<?unsafe value?>\n<chart>"),
  );
  assert.equal(processingInstruction.status, "rejected");
  assert.equal(
    processingInstruction.report.errors[0]?.code,
    "OXS_PROCESSING_INSTRUCTION_FORBIDDEN",
  );
});

test("rejects invalid UTF-8 without including source bytes in diagnostics", () => {
  const result = importOxsRoute1(
    request("minimal-full-cross.oxs", {
      bytes: Uint8Array.of(0xc3, 0x28),
    }),
  );
  assert.equal(result.status, "rejected");
  assert.equal(result.report.errors[0]?.code, "OXS_UTF8_INVALID");
  assert.equal(JSON.stringify(result.report).includes("Ã"), false);
});

test("enforces source and parsed-memory preflight boundaries", () => {
  assert.throws(
    () => assertOxsSourcePreflight(OXS_LIMITS.maxSourceBytes + 1),
    (error) =>
      error instanceof OxsImportBoundaryError &&
      error.code === "OXS_LIMIT_FILE_BYTES",
  );
  assert.ok(
    estimateOxsParsedPeakBytes(
      OXS_LIMITS.maxSourceBytes,
      OXS_LIMITS.maxPaletteEntries,
      OXS_LIMITS.maxFullCrossStitches,
      OXS_LIMITS.maxUnsupportedObjects,
    ) > OXS_LIMITS.maxPreflightPeakBytes,
  );
});

test("enforces parser limits with reduced test budgets", () => {
  const baseLimits = {
    ...OXS_LIMITS,
    maxXmlDepth: 2,
    maxElements: 3,
    maxAttributesPerElement: 1,
    maxAttributeBytes: 3,
    maxMetadataBytes: 3,
    maxRetainedExtensionBytes: 1000,
    maxPaletteEntries: 1,
    maxFullCrossStitches: 1,
    maxUnsupportedObjects: 1,
  };
  const cases: Array<[string, string, Partial<typeof baseLimits>]> = [
    [
      "<chart><properties><nested/></properties><fullstitches/><backstitches/></chart>",
      "OXS_LIMIT_XML_DEPTH",
      { maxElements: 20, maxAttributesPerElement: 20 },
    ],
    [
      "<chart><properties/><fullstitches/><backstitches/></chart>",
      "OXS_LIMIT_ELEMENTS",
      { maxXmlDepth: 10, maxAttributesPerElement: 20 },
    ],
    [
      '<chart a="1" b="2"><properties/><fullstitches/><backstitches/></chart>',
      "OXS_LIMIT_ATTRIBUTES",
      { maxXmlDepth: 10, maxElements: 20 },
    ],
    [
      '<chart a="1234"><properties/><fullstitches/><backstitches/></chart>',
      "OXS_LIMIT_ATTRIBUTE_BYTES",
      { maxXmlDepth: 10, maxElements: 20 },
    ],
    [
      '<chart><properties charttitle="1234"/><fullstitches/><backstitches/></chart>',
      "OXS_LIMIT_METADATA_BYTES",
      {
        maxXmlDepth: 10,
        maxElements: 20,
        maxAttributesPerElement: 20,
        maxAttributeBytes: 20,
      },
    ],
    [
      "<chart><properties/><fullstitches/><backstitches/><extension>1234</extension></chart>",
      "OXS_LIMIT_EXTENSION_BYTES",
      {
        maxXmlDepth: 10,
        maxElements: 20,
        maxAttributesPerElement: 20,
        maxMetadataBytes: 20,
        maxRetainedExtensionBytes: 3,
      },
    ],
    [
      '<chart><properties/><palette><palette_item/><palette_item/></palette><fullstitches/><backstitches/></chart>',
      "OXS_LIMIT_PALETTE",
      { maxXmlDepth: 10, maxElements: 20, maxAttributesPerElement: 20 },
    ],
    [
      '<chart><properties/><fullstitches><stitch/><stitch/></fullstitches><backstitches/></chart>',
      "OXS_LIMIT_STITCHES",
      { maxXmlDepth: 10, maxElements: 20, maxAttributesPerElement: 20 },
    ],
    [
      '<chart><properties/><fullstitches/><partstitches><partstitch/><partstitch/></partstitches><backstitches/></chart>',
      "OXS_LIMIT_UNSUPPORTED",
      { maxXmlDepth: 10, maxElements: 20, maxAttributesPerElement: 20 },
    ],
  ];

  for (const [xml, expectedCode, override] of cases) {
    assert.throws(
      () => parseOxsDocument(xml, { ...baseLimits, ...override }),
      (error) =>
        error instanceof OxsParseFailure && error.code === expectedCode,
      expectedCode,
    );
  }
});
