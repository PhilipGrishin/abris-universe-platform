#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  assertSourceIsCurrent,
  assertUniqueExchangeId,
  canonicalManifestPath,
  copyDirectorySafe,
  fail,
  formatError,
  loadBridgeConfig,
  nowIso,
  parseCommonArgs,
  readJson,
  repoRoot,
  validateClaudeReturn,
  validateTaskManifest,
  writeJson,
} from "./lib/bridge-core.mjs";

try {
  const args = parseCommonArgs(process.argv.slice(2));
  if (!args.exchangeId) fail("Usage: import-claude-output.mjs --exchange-id <id> [--apply]", "INVALID_ARGUMENT");
  const repo = repoRoot();
  const config = loadBridgeConfig(repo);
  const manifestPath = canonicalManifestPath(repo, args.exchangeId);
  assertUniqueExchangeId(repo, args.exchangeId, manifestPath);
  const taskManifest = validateTaskManifest(readJson(manifestPath));
  assertSourceIsCurrent(repo, taskManifest);
  const source = join(config.externalBridgeRoot, "claude", "outbox", args.exchangeId);
  if (!existsSync(source)) fail(`Claude output does not exist for ${args.exchangeId}.`, "MISSING_CLAUDE_OUTPUT");
  const validation = validateClaudeReturn({ outputRoot: source, taskManifest, limits: config });
  const destination = join(repo, "collaboration", "codex", "inbox", args.exchangeId);
  if (existsSync(destination)) fail(`Staging destination already exists: ${destination}`, "DESTINATION_EXISTS");
  if (args.apply) {
    copyDirectorySafe(source, destination);
    writeJson(join(destination, "codex-validation.json"), {
      schema_version: "1.0.0",
      exchange_id: args.exchangeId,
      validated_at: nowIso(),
      validated_by: "AU-CODEX-PRIMARY",
      validation_status: "VALID",
      result_status: validation.returnManifest.result_status,
      decision: validation.returnManifest.decision,
      integration_status: "STAGED_NOT_INTEGRATED",
    });
  }
  process.stdout.write(`${JSON.stringify({
    mode: args.apply ? "apply" : "dry-run",
    exchange_id: args.exchangeId,
    validation_status: "VALID",
    destination: `collaboration/codex/inbox/${args.exchangeId}`,
    integration_status: "STAGED_NOT_INTEGRATED",
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
