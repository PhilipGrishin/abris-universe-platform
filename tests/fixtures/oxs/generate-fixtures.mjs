#!/usr/bin/env node

import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const fixtureRoot = dirname(fileURLToPath(import.meta.url));
const generatedRoot = join(fixtureRoot, "generated");
const expectedRoot = join(fixtureRoot, "expected");
const sourceChartRoot = join(fixtureRoot, "source-charts");

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function xmlEscape(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("\"", "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function attributes(values) {
  return Object.entries(values)
    .map(([name, value]) => `${name}="${xmlEscape(value)}"`)
    .join(" ");
}

function paletteItem(item) {
  return `    <palette_item ${attributes({
    index: item.index,
    number: item.number,
    name: item.name,
    color: item.color,
    printcolor: item.color,
    blendcolor: "nil",
    comments: "",
    strands: item.strands ?? 2,
    symbol: item.symbol,
    dashpattern: "",
    misc1: "",
  })}/>`;
}

function renderOxs({
  title,
  width,
  height,
  palette,
  stitches,
  partStitches = [],
  backStitches = [],
  objects = [],
  doctype = false,
  duplicatePaletteItem = null,
}) {
  const lines = ['<?xml version="1.0" encoding="UTF-8"?>'];
  if (doctype) {
    lines.push('<!DOCTYPE chart [<!ENTITY fixture "forbidden">]>');
  }
  lines.push(
    "<chart>",
    `  <format ${attributes({
      comments01: "Project-original Abris Universe route-1 test fixture",
      comments12:
        "properties, fullstitches, and backstitches are present even when empty",
      comments13: "element and attribute names are lowercase",
    })}/>`,
    `  <properties ${attributes({
      oxsversion: "1.0",
      software: "Abris Universe Route-1 Fixture Generator",
      software_version: "1.0.0",
      chartheight: height,
      chartwidth: width,
      charttitle: title,
      author: "Abris Universe Engineering",
      copyright: "Abris Universe project fixture",
      instructions: "Test data only",
      stitchesperinch: "14",
      stitchesperinch_y: "14",
      palettecount: Math.max(0, palette.length - 1),
    })}/>`,
    "  <palette>",
    ...palette.map(paletteItem),
  );
  if (duplicatePaletteItem) {
    lines.push(paletteItem(duplicatePaletteItem));
  }
  lines.push(
    "  </palette>",
    "  <fullstitches>",
    ...stitches.map(
      (stitch) =>
        `    <stitch ${attributes({
          x: stitch.x,
          y: stitch.y,
          palindex: stitch.palindex,
          ...(stitch.marked ? { marked: "true" } : {}),
        })}/>`
    ),
    "  </fullstitches>",
    "  <partstitches>",
    ...partStitches.map(
      (stitch) =>
        `    <partstitch ${attributes({
          x: stitch.x,
          y: stitch.y,
          palindex1: stitch.palindex1,
          palindex2: stitch.palindex2,
          direction: stitch.direction,
        })}/>`
    ),
    "  </partstitches>",
    "  <backstitches>",
    ...backStitches.map(
      (stitch) =>
        `    <backstitch ${attributes({
          x1: stitch.x1,
          y1: stitch.y1,
          x2: stitch.x2,
          y2: stitch.y2,
          palindex: stitch.palindex,
          objecttype: "backstitch",
          sequence: 0,
        })}/>`
    ),
    "  </backstitches>",
    "  <ornaments_inc_knots_and_beads>",
    ...objects.map(
      (object) =>
        `    <object ${attributes({
          x1: object.x1,
          y1: object.y1,
          palindex: object.palindex,
          objecttype: object.objecttype,
        })}/>`
    ),
    "  </ornaments_inc_knots_and_beads>",
    "  <commentboxes/>",
    "</chart>",
    "",
  );
  return lines.join("\n");
}

function json(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function basicPalette(count) {
  const palette = [
    {
      index: 0,
      number: "cloth",
      name: "Cloth",
      color: "FFFFFF",
      symbol: "0",
    },
  ];
  const symbols = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
  for (let index = 1; index <= count; index += 1) {
    const color = (
      ((index * 67) % 224 + 16) * 65536 +
      ((index * 101) % 224 + 16) * 256 +
      ((index * 149) % 224 + 16)
    )
      .toString(16)
      .padStart(6, "0")
      .toUpperCase();
    palette.push({
      index,
      number: `AU-${String(index).padStart(2, "0")}`,
      name: `Fixture Color ${index}`,
      color,
      symbol: symbols[index - 1],
    });
  }
  return palette;
}

function normalizedStitchDigest(stitches) {
  const normalized = stitches
    .map(({ x, y, palindex }) => `${x},${y},${palindex}`)
    .join("\n");
  return sha256(normalized);
}

function buildMediumStitches() {
  const width = 512;
  const height = 256;
  const stitches = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < 320; x += 1) {
      stitches.push({ x, y, palindex: ((x * 3 + y * 5) % 32) + 1 });
    }
  }
  const sparseCandidates = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 320; x < width; x += 1) {
      const rank = ((x * 73856093) ^ (y * 19349663)) >>> 0;
      sparseCandidates.push({ x, y, rank });
    }
  }
  sparseCandidates.sort(
    (left, right) =>
      left.rank - right.rank || left.y - right.y || left.x - right.x
  );
  for (const { x, y } of sparseCandidates.slice(0, 18080)) {
    stitches.push({ x, y, palindex: ((x * 3 + y * 5) % 32) + 1 });
  }
  stitches.sort((left, right) => left.y - right.y || left.x - right.x);
  return stitches;
}

export function buildFixtureArtifacts() {
  const files = new Map();
  const minimalPalette = [
    { index: 0, number: "cloth", name: "Cloth", color: "FFFFFF", symbol: "0" },
    { index: 1, number: "AU-A", name: "Corner A", color: "D7263D", symbol: "A" },
    { index: 2, number: "AU-B", name: "Corner B", color: "1B998B", symbol: "B" },
    { index: 3, number: "AU-C", name: "Corner C", color: "2E294E", symbol: "C" },
    { index: 4, number: "AU-D", name: "Corner D", color: "F46036", symbol: "D" },
    { index: 5, number: "AU-E", name: "Interior E", color: "E2C044", symbol: "E" },
  ];
  const minimalStitches = [
    { x: 0, y: 0, palindex: 1 },
    { x: 6, y: 0, palindex: 2 },
    { x: 2, y: 3, palindex: 5 },
    { x: 0, y: 4, palindex: 3 },
    { x: 6, y: 4, palindex: 4 },
  ];
  const mediumStitches = buildMediumStitches();
  const oneColorPalette = basicPalette(1);

  const fixtureDefinitions = [
    {
      name: "minimal-full-cross.oxs",
      content: renderOxs({
        title: "Route-1 Coordinate Boundary",
        width: 7,
        height: 5,
        palette: minimalPalette,
        stitches: minimalStitches,
      }),
      expectation: {
        expectedDisposition: "completed",
        canonical: {
          grid: {
            width: 7,
            height: 5,
            origin: "top-left",
            coordinateBase: 0,
            xDirection: "right",
            yDirection: "down",
            axisOrder: "x,y",
          },
          paletteItems: minimalPalette.length,
          fullCrossStitches: minimalStitches,
          stitchSequenceSha256: normalizedStitchDigest(minimalStitches),
        },
        importReport: {
          status: "completed",
          errors: [],
          warnings: [],
          counts: {
            paletteItems: 6,
            fullCrossStitches: 5,
            unsupportedPartStitches: 0,
            unsupportedBackstitches: 0,
            unsupportedObjects: 0,
          },
        },
      },
    },
    {
      name: "medium-full-cross.oxs",
      content: renderOxs({
        title: "Route-1 Medium Deterministic Pattern",
        width: 512,
        height: 256,
        palette: basicPalette(32),
        stitches: mediumStitches,
      }),
      expectation: {
        expectedDisposition: "completed",
        canonical: {
          grid: {
            width: 512,
            height: 256,
            origin: "top-left",
            coordinateBase: 0,
            xDirection: "right",
            yDirection: "down",
            axisOrder: "x,y",
          },
          paletteItems: 33,
          fullCrossStitchCount: 100000,
          stitchSequenceSha256: normalizedStitchDigest(mediumStitches),
          coverage: {
            denseRegion: "x=0..319, y=0..255",
            deterministicSparseRegion: "18,080 cells across x=320..511",
          },
        },
        importReport: {
          status: "completed",
          errors: [],
          warnings: [],
          counts: {
            paletteItems: 33,
            fullCrossStitches: 100000,
            unsupportedPartStitches: 0,
            unsupportedBackstitches: 0,
            unsupportedObjects: 0,
          },
        },
      },
    },
    {
      name: "unsupported-content.oxs",
      content: renderOxs({
        title: "Route-1 Unsupported Content",
        width: 4,
        height: 3,
        palette: basicPalette(3),
        stitches: [{ x: 1, y: 1, palindex: 1 }],
        partStitches: [
          { x: 2, y: 0, palindex1: 1, palindex2: 2, direction: 1 },
        ],
        backStitches: [
          { x1: 0, y1: 0, x2: 3, y2: 2, palindex: 2 },
        ],
        objects: [{ x1: 3, y1: 1, palindex: 3, objecttype: "knot" }],
      }),
      expectation: {
        expectedDisposition: "completed_with_warnings",
        canonical: {
          grid: { width: 4, height: 3 },
          paletteItems: 4,
          fullCrossStitches: [{ x: 1, y: 1, palindex: 1 }],
          stitchSequenceSha256: normalizedStitchDigest([
            { x: 1, y: 1, palindex: 1 },
          ]),
        },
        importReport: {
          status: "completed_with_warnings",
          errors: [],
          warnings: [
            "OXS_UNSUPPORTED_PART_STITCHES",
            "OXS_UNSUPPORTED_BACKSTITCHES",
            "OXS_UNSUPPORTED_OBJECTS",
          ],
          counts: {
            paletteItems: 4,
            fullCrossStitches: 1,
            unsupportedPartStitches: 1,
            unsupportedBackstitches: 1,
            unsupportedObjects: 1,
          },
        },
      },
    },
    {
      name: "empty-full-cross.oxs",
      content: renderOxs({
        title: "Route-1 Empty Pattern",
        width: 3,
        height: 2,
        palette: [{ index: 0, number: "cloth", name: "Cloth", color: "FFFFFF", symbol: "0" }],
        stitches: [],
      }),
      expectation: {
        expectedDisposition: "completed",
        canonical: {
          grid: { width: 3, height: 2 },
          paletteItems: 1,
          fullCrossStitches: [],
          stitchSequenceSha256: normalizedStitchDigest([]),
        },
        importReport: {
          status: "completed",
          messageKey: "import.oxs.emptyPattern",
          errors: [],
          warnings: [],
          counts: {
            paletteItems: 1,
            fullCrossStitches: 0,
            unsupportedPartStitches: 0,
            unsupportedBackstitches: 0,
            unsupportedObjects: 0,
          },
        },
      },
    },
    {
      name: "security-doctype.oxs",
      content: renderOxs({
        title: "Route-1 Forbidden DTD",
        width: 2,
        height: 2,
        palette: oneColorPalette,
        stitches: [{ x: 0, y: 0, palindex: 1 }],
        doctype: true,
      }),
      expectation: {
        expectedDisposition: "rejected",
        canonical: null,
        importReport: {
          status: "rejected",
          errors: ["OXS_DTD_FORBIDDEN"],
          warnings: [],
        },
      },
    },
    {
      name: "invalid-palette-reference.oxs",
      content: renderOxs({
        title: "Route-1 Invalid Palette Reference",
        width: 2,
        height: 2,
        palette: oneColorPalette,
        stitches: [{ x: 1, y: 1, palindex: 99 }],
      }),
      expectation: {
        expectedDisposition: "rejected",
        canonical: null,
        importReport: {
          status: "rejected",
          errors: ["OXS_PALETTE_REFERENCE_INVALID"],
          warnings: [],
        },
      },
    },
    {
      name: "duplicate-palette-index.oxs",
      content: renderOxs({
        title: "Route-1 Duplicate Palette Index",
        width: 2,
        height: 2,
        palette: oneColorPalette,
        stitches: [{ x: 0, y: 0, palindex: 1 }],
        duplicatePaletteItem: {
          index: 1,
          number: "AU-DUP",
          name: "Duplicate",
          color: "000000",
          symbol: "Z",
        },
      }),
      expectation: {
        expectedDisposition: "rejected",
        canonical: null,
        importReport: {
          status: "rejected",
          errors: ["OXS_PALETTE_INDEX_DUPLICATE"],
          warnings: [],
        },
      },
    },
    {
      name: "out-of-bounds-coordinate.oxs",
      content: renderOxs({
        title: "Route-1 Out-of-Bounds Coordinate",
        width: 3,
        height: 2,
        palette: oneColorPalette,
        stitches: [{ x: 3, y: 0, palindex: 1 }],
      }),
      expectation: {
        expectedDisposition: "rejected",
        canonical: null,
        importReport: {
          status: "rejected",
          errors: ["OXS_COORDINATE_OUT_OF_BOUNDS"],
          warnings: [],
        },
      },
    },
    {
      name: "oversized-declared-grid.oxs",
      content: renderOxs({
        title: "Route-1 Oversized Grid",
        width: 10001,
        height: 2,
        palette: oneColorPalette,
        stitches: [],
      }),
      expectation: {
        expectedDisposition: "rejected",
        canonical: null,
        importReport: {
          status: "rejected",
          errors: ["OXS_LIMIT_GRID"],
          warnings: [],
        },
      },
    },
  ];

  for (const fixture of fixtureDefinitions) {
    files.set(join("generated", fixture.name), fixture.content);
    files.set(
      join("expected", fixture.name.replace(/\.oxs$/, ".expected.json")),
      json({
        schemaVersion: 1,
        fixture: fixture.name,
        ...fixture.expectation,
      })
    );
  }

  const corruptBase = renderOxs({
    title: "Route-1 Corrupt Truncated",
    width: 2,
    height: 2,
    palette: oneColorPalette,
    stitches: [{ x: 0, y: 0, palindex: 1 }],
  });
  files.set(
    join("generated", "corrupt-truncated.oxs"),
    corruptBase.slice(0, corruptBase.lastIndexOf("</fullstitches>") + 8)
  );
  files.set(
    join("expected", "corrupt-truncated.expected.json"),
    json({
      schemaVersion: 1,
      fixture: "corrupt-truncated.oxs",
      expectedDisposition: "rejected",
      canonical: null,
      importReport: {
        status: "rejected",
        errors: ["OXS_XML_MALFORMED"],
        warnings: [],
      },
    })
  );

  files.set(
    join("source-charts", "minimal-full-cross.txt"),
    [
      "A.....B",
      ".......",
      ".......",
      "..E....",
      "C.....D",
      "",
      "Origin: top-left",
      "Coordinate base: zero",
      "X direction: right",
      "Y direction: down",
      "Axis order: x,y",
      "",
    ].join("\n")
  );
  files.set(
    join("source-charts", "fixture-designs.md"),
    [
      "# Route-1 Fixture Source Designs",
      "",
      "| Field | Value |",
      "| --- | --- |",
      "| Document ID | AU-TEST-OXS-SOURCE-DESIGNS-001 |",
      "| Title | Route-1 Fixture Source Designs |",
      "| Status | `[IMPLEMENTED]`, `[TESTED]` |",
      "| Owner | AU-AGENT-004 |",
      "| Technical Approver | AU-AGENT-001 |",
      "| Version | 1.0.0 |",
      "| Created | 2026-07-25 |",
      "| Last Updated | 2026-07-25 |",
      "| Dependencies | `../README.md`, `../manifest.json` |",
      "| Supersedes | None |",
      "| Superseded By | None |",
      "| Review Triggers | Fixture design, generator, format, gate, or expected-result change |",
      "",
      "## Purpose and Scope",
      "",
      "Describe the human-reviewable source design for every generated route-1 fixture without duplicating generated XML or expected-result records.",
      "",
      "## Designs",
      "",
      "- `minimal-full-cross.oxs`: exact 7×5 ASCII chart in `minimal-full-cross.txt`.",
      "- `medium-full-cross.oxs`: 512×256; dense x=0..319 and deterministic sparse x=320..511; exactly 100,000 stitches.",
      "- `unsupported-content.oxs`: one full cross plus one part stitch, one backstitch, and one knot.",
      "- `empty-full-cross.oxs`: valid 3×2 chart with no stitches.",
      "- Rejection fixtures each isolate the named malformed, DTD, reference, duplicate, coordinate, or grid-limit condition.",
      "",
      "## Lifecycle and Additions",
      "",
      "Change a design only through the deterministic generator, regenerate manifest checksums and expectations, rerun fixture verification, and update the technical review record.",
      "",
      "## Related Sources",
      "",
      "- [Fixture Registry](../README.md)",
      "- [Fixture Manifest](../manifest.json)",
      "- [Compatibility Matrix](../COMPATIBILITY_MATRIX.md)",
      "",
    ].join("\n")
  );

  const manifestEntries = [...files.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([path, content]) => ({
      path,
      bytes: Buffer.byteLength(content),
      sha256: sha256(content),
    }));
  files.set(
    "manifest.json",
    json({
      schemaVersion: 1,
      generator: "generate-fixtures.mjs",
      generatorVersion: "1.0.0",
      sourceFormat: "OXS 1.0",
      fixtureCount: fixtureDefinitions.length + 1,
      files: manifestEntries,
    })
  );

  return files;
}

function listManagedFiles(root, prefix) {
  if (!existsSync(root)) return [];
  const results = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const absolute = join(root, entry.name);
    const relativePath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      results.push(...listManagedFiles(absolute, relativePath));
    } else {
      results.push(relativePath);
    }
  }
  return results;
}

export function writeOrCheckArtifacts({ check }) {
  const files = buildFixtureArtifacts();
  const managedRoots = [
    [generatedRoot, "generated"],
    [expectedRoot, "expected"],
    [sourceChartRoot, "source-charts"],
  ];
  const expectedPaths = new Set([...files.keys()]);
  const actualPaths = [
    ...managedRoots.flatMap(([root, prefix]) => listManagedFiles(root, prefix)),
    ...(existsSync(join(fixtureRoot, "manifest.json")) ? ["manifest.json"] : []),
  ];
  const failures = [];

  for (const [path, content] of files) {
    const absolute = join(fixtureRoot, path);
    if (check) {
      if (!existsSync(absolute)) {
        failures.push(`missing ${path}`);
      } else if (readFileSync(absolute, "utf8") !== content) {
        failures.push(`drifted ${path}`);
      }
      continue;
    }
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, content, "utf8");
  }

  if (check) {
    for (const path of actualPaths) {
      if (!expectedPaths.has(path)) failures.push(`unexpected ${path}`);
    }
    if (failures.length > 0) {
      throw new Error(`Fixture generation check failed:\n${failures.join("\n")}`);
    }
  }
}

const invokedPath = process.argv[1]
  ? fileURLToPath(new URL(`file://${process.argv[1]}`))
  : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const check = process.argv.includes("--check");
  writeOrCheckArtifacts({ check });
  process.stdout.write(
    check
      ? "Route-1 fixture artifacts are deterministic and current.\n"
      : "Route-1 fixture artifacts generated.\n"
  );
}
