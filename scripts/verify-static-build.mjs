#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { extname, join, resolve } from "node:path";

const repositoryRoot = resolve(import.meta.dirname, "..");
const distRoot = resolve(repositoryRoot, "apps/web/dist");
const indexPath = resolve(distRoot, "index.html");
const versionPath = resolve(distRoot, "version.json");

for (const requiredPath of [indexPath, versionPath]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Static build is missing ${requiredPath}`);
  }
}

const version = JSON.parse(readFileSync(versionPath, "utf8"));
const expectedCommit = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();

if (
  version.schemaVersion !== 1 ||
  version.application !== "abris-universe" ||
  typeof version.version !== "string" ||
  version.sourceCommit !== expectedCommit ||
  typeof version.sourceDirty !== "boolean" ||
  typeof version.builtAt !== "string" ||
  Number.isNaN(Date.parse(version.builtAt))
) {
  throw new Error("Static build version.json is incomplete or stale.");
}

if (
  process.env.CI === "true" &&
  process.env.ALLOW_DIRTY_BUILD !== "1" &&
  version.sourceDirty
) {
  throw new Error("CI build provenance reports a dirty source tree.");
}

const indexHtml = readFileSync(indexPath, "utf8");
if (/<script(?![^>]*\bsrc=)[^>]*>/iu.test(indexHtml) || /<style(?:\s|>)/iu.test(indexHtml)) {
  throw new Error("Static index contains inline script or style content.");
}

const allFiles = [];
const visit = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) visit(path);
    else allFiles.push(path);
  }
};
visit(distRoot);

const assetNames = allFiles.map((path) => path.slice(distRoot.length + 1));
if (!assetNames.some((name) => /^assets\/.+-[0-9A-Za-z_-]{8,}\.js$/u.test(name))) {
  throw new Error("Static build does not contain a content-hashed JavaScript asset.");
}
if (!assetNames.some((name) => /^assets\/.+-[0-9A-Za-z_-]{8,}\.css$/u.test(name))) {
  throw new Error("Static build does not contain a content-hashed CSS asset.");
}

const forbiddenBuildText = [
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_ACCOUNT_ID",
  "github_pat_",
  "-----BEGIN PRIVATE KEY-----",
];
for (const filePath of allFiles) {
  if (![".html", ".js", ".css", ".json", ".map"].includes(extname(filePath))) continue;
  const content = readFileSync(filePath, "utf8");
  for (const marker of forbiddenBuildText) {
    if (content.includes(marker)) {
      throw new Error(`Static build contains forbidden marker ${marker}.`);
    }
  }
}

const clientSourceRoot = resolve(repositoryRoot, "apps/web/src");
const sourceFiles = [];
const visitSource = (directory) => {
  for (const entry of readdirSync(directory)) {
    const path = join(directory, entry);
    if (statSync(path).isDirectory()) visitSource(path);
    else if (/\.(?:ts|tsx)$/u.test(path)) sourceFiles.push(path);
  }
};
visitSource(clientSourceRoot);

const prohibitedNetworkApis = [
  /\bfetch\s*\(/u,
  /\bXMLHttpRequest\b/u,
  /\bWebSocket\b/u,
  /\bEventSource\b/u,
  /\bsendBeacon\b/u,
];
for (const filePath of sourceFiles) {
  const content = readFileSync(filePath, "utf8");
  if (prohibitedNetworkApis.some((pattern) => pattern.test(content))) {
    throw new Error(
      `Client runtime request inventory is stale: network API detected in ${filePath}.`,
    );
  }
}

process.stdout.write(
  `Static build verification passed: ${allFiles.length} files, commit ${expectedCommit}, no inline executable content, secret markers, or client network APIs.\n`,
);
