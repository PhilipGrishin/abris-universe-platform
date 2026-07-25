#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { writeOrCheckArtifacts } from "./generate-fixtures.mjs";

const root = dirname(fileURLToPath(import.meta.url));
const generated = (name) => join(root, "generated", name);

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function countMatches(content, pattern) {
  return [...content.matchAll(pattern)].length;
}

writeOrCheckArtifacts({ check: true });

const minimal = readFileSync(generated("minimal-full-cross.oxs"), "utf8");
assert(/chartwidth="7"/.test(minimal), "minimal fixture width drift");
assert(/chartheight="5"/.test(minimal), "minimal fixture height drift");
for (const [x, y, palindex] of [
  [0, 0, 1],
  [6, 0, 2],
  [0, 4, 3],
  [6, 4, 4],
  [2, 3, 5],
]) {
  assert(
    minimal.includes(`<stitch x="${x}" y="${y}" palindex="${palindex}"/>`),
    `minimal fixture missing ${x},${y},${palindex}`
  );
}

const medium = readFileSync(generated("medium-full-cross.oxs"), "utf8");
assert(
  countMatches(medium, /<stitch\b/g) === 100000,
  "medium fixture must contain exactly 100,000 full-cross stitches"
);
assert(
  countMatches(medium, /<palette_item\b/g) === 33,
  "medium fixture must contain cloth plus 32 palette entries"
);

const doctype = readFileSync(generated("security-doctype.oxs"), "utf8");
assert(doctype.includes("<!DOCTYPE"), "DTD rejection fixture lost its DTD");
for (const fixture of [
  "minimal-full-cross.oxs",
  "medium-full-cross.oxs",
  "unsupported-content.oxs",
  "empty-full-cross.oxs",
  "invalid-palette-reference.oxs",
  "duplicate-palette-index.oxs",
  "out-of-bounds-coordinate.oxs",
  "oversized-declared-grid.oxs",
]) {
  assert(
    !readFileSync(generated(fixture), "utf8").includes("<!DOCTYPE"),
    `${fixture} unexpectedly contains a DTD`
  );
}

const xmllint = spawnSync("xmllint", ["--version"], { encoding: "utf8" });
if (xmllint.status === 0) {
  for (const fixture of [
    "minimal-full-cross.oxs",
    "medium-full-cross.oxs",
    "unsupported-content.oxs",
    "empty-full-cross.oxs",
    "security-doctype.oxs",
    "invalid-palette-reference.oxs",
    "duplicate-palette-index.oxs",
    "out-of-bounds-coordinate.oxs",
    "oversized-declared-grid.oxs",
  ]) {
    const result = spawnSync("xmllint", ["--noout", generated(fixture)], {
      encoding: "utf8",
    });
    assert(result.status === 0, `${fixture} is not well-formed XML`);
  }
  const corrupt = spawnSync(
    "xmllint",
    ["--noout", generated("corrupt-truncated.oxs")],
    { encoding: "utf8" }
  );
  assert(corrupt.status !== 0, "corrupt fixture must fail XML well-formedness");
}

process.stdout.write(
  "Route-1 fixture verification passed: deterministic artifacts, boundary coordinates, counts, DTD isolation, and XML shape.\n"
);
