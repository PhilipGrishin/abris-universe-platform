#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const packagePath = resolve(repositoryRoot, "apps/web/package.json");
const outputPath = resolve(repositoryRoot, "apps/web/public/version.json");

const sourceCommit = (
  process.env.SOURCE_COMMIT ??
  execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  })
).trim();

if (!/^[0-9a-f]{40}$/u.test(sourceCommit)) {
  throw new Error("SOURCE_COMMIT must be a full lowercase Git commit SHA.");
}

const builtAt = process.env.BUILD_TIMESTAMP ?? new Date().toISOString();
if (Number.isNaN(Date.parse(builtAt))) {
  throw new Error("BUILD_TIMESTAMP must be an ISO-8601 timestamp.");
}

const sourceDirty =
  execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], {
    cwd: repositoryRoot,
    encoding: "utf8",
  }).trim().length > 0;

const packageManifest = JSON.parse(readFileSync(packagePath, "utf8"));
const versionRecord = {
  schemaVersion: 1,
  application: "abris-universe",
  version: packageManifest.version,
  sourceCommit,
  sourceDirty,
  builtAt,
};

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify(versionRecord, null, 2)}\n`, "utf8");
process.stdout.write(
  `Wrote apps/web/public/version.json for ${sourceCommit}${sourceDirty ? " (dirty)" : ""}.\n`,
);
