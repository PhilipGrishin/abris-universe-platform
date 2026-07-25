#!/usr/bin/env node

import { existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import {
  assertSourceIsCurrent,
  canonicalManifestPath,
  copyDirectorySafe,
  fail,
  formatError,
  loadBridgeConfig,
  parseCommonArgs,
  readJson,
  repoRoot,
  validateTaskManifest,
  verifyPackageFiles,
  writeText,
} from "./lib/bridge-core.mjs";

const EXTERNAL_README = `# Abris Universe Claude Collaboration Bridge\n\n` +
  `This directory is a local transport boundary, not a source of truth.\n\n` +
  `- Claude reads immutable packages from \`claude/inbox/<exchange-id>/\`.\n` +
  `- Claude writes registered results only to \`claude/outbox/<exchange-id>/\`.\n` +
  `- Codex validates and imports results; Claude must not use Git.\n` +
  `- Never place secrets, binaries, symbolic links, hidden files, temporary files, or machine-specific paths in an exchange.\n` +
  `- Completed exchanges move to \`claude/archive/\` only through the Codex bridge tooling.\n`;

try {
  const args = parseCommonArgs(process.argv.slice(2));
  const repo = repoRoot();
  const config = loadBridgeConfig(repo);
  const root = config.externalBridgeRoot;
  const operations = [];

  if (args.initialize) {
    operations.push(`initialize ${root}`);
    if (args.apply) {
      if (existsSync(root)) fail(`External bridge root already exists: ${root}`, "DESTINATION_EXISTS");
      mkdirSync(join(root, "claude", "inbox"), { recursive: true });
      mkdirSync(join(root, "claude", "outbox"), { recursive: true });
      mkdirSync(join(root, "claude", "archive"), { recursive: true });
      writeText(join(root, "README.md"), EXTERNAL_README);
    }
  }

  if (args.exchangeId) {
    const manifestPath = canonicalManifestPath(repo, args.exchangeId);
    if (!existsSync(manifestPath)) fail(`Unknown canonical exchange: ${args.exchangeId}`, "UNKNOWN_EXCHANGE");
    const manifest = validateTaskManifest(readJson(manifestPath));
    assertSourceIsCurrent(repo, manifest);
    const packageRoot = join(repo, "collaboration", "runtime", "packages", args.exchangeId);
    if (!existsSync(packageRoot)) fail(`Prepared runtime package is missing: ${args.exchangeId}`, "MISSING_PACKAGE");
    verifyPackageFiles(packageRoot, manifest, config);
    const destination = join(root, "claude", "inbox", args.exchangeId);
    operations.push(`export ${args.exchangeId} to external Claude inbox`);
    if (args.apply) {
      if (!existsSync(root)) fail("External bridge is not initialized.", "MISSING_EXTERNAL_BRIDGE");
      copyDirectorySafe(packageRoot, destination);
    }
  }

  if (!args.initialize && !args.exchangeId) fail("Use --initialize and/or --exchange-id <id>.", "INVALID_ARGUMENT");
  process.stdout.write(`${JSON.stringify({ mode: args.apply ? "apply" : "dry-run", operations }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
