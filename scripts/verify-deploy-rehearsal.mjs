#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const rehearsalRoot = resolve(repositoryRoot, ".deploy-dry-run");
if (!existsSync(rehearsalRoot)) {
  throw new Error("Wrangler dry-run output is missing.");
}

const outputFiles = [];
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) visit(path);
    else outputFiles.push(path);
  }
};
visit(rehearsalRoot);

if (!outputFiles.some((path) => extname(path) === ".js")) {
  throw new Error("Wrangler dry-run did not emit a Worker JavaScript bundle.");
}

const totalBytes = outputFiles.reduce((sum, path) => sum + statSync(path).size, 0);
if (totalBytes > 5 * 1024 * 1024) {
  throw new Error(`Wrangler dry-run output exceeds the 5 MiB rehearsal bound: ${totalBytes}.`);
}

const forbiddenMarkers = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "github_pat_",
  "-----BEGIN PRIVATE KEY-----",
];
for (const filePath of outputFiles) {
  if (![".js", ".json", ".map", ".txt"].includes(extname(filePath))) continue;
  const content = readFileSync(filePath, "utf8");
  for (const marker of forbiddenMarkers) {
    if (content.includes(marker)) {
      throw new Error(`Deployment rehearsal contains forbidden marker ${marker}.`);
    }
  }
}

process.stdout.write(
  `Deployment rehearsal verification passed: ${outputFiles.length} files, ${totalBytes} bytes, no secret markers.\n`,
);
