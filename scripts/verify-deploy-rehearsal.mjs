#!/usr/bin/env node

import { deepStrictEqual } from "node:assert";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const rehearsalRoot = resolve(repositoryRoot, ".deploy-dry-run");
const wranglerConfigPath = resolve(
  repositoryRoot,
  "apps/web/wrangler.jsonc",
);
if (!existsSync(rehearsalRoot)) {
  throw new Error("Wrangler dry-run output is missing.");
}

const wranglerConfig = JSON.parse(
  readFileSync(wranglerConfigPath, "utf8"),
);
try {
  deepStrictEqual(wranglerConfig, {
    $schema: "../../node_modules/wrangler/config-schema.json",
    name: "abris-universe",
    main: "./worker/index.ts",
    compatibility_date: "2026-07-26",
    workers_dev: false,
    preview_urls: true,
    version_metadata: {
      binding: "CF_VERSION_METADATA",
    },
    assets: {
      directory: "./dist",
      binding: "ASSETS",
      not_found_handling: "single-page-application",
      run_worker_first: true,
    },
  });
} catch {
  throw new Error(
    "Wrangler production delivery config differs from the exact reviewed static-asset and immutable-preview contract.",
  );
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
  "CLOUDFLARE_CACHE_PURGE_TOKEN",
  "CLOUDFLARE_RULES_TOKEN",
  "CLOUDFLARE_ZONE_ID",
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
