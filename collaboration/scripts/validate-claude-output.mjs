#!/usr/bin/env node

import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  assertSourceIsCurrent,
  assertUniqueExchangeId,
  canonicalManifestPath,
  fail,
  formatError,
  loadBridgeConfig,
  parseCommonArgs,
  readJson,
  repoRoot,
  validateClaudeReturn,
  validateTaskManifest,
} from "./lib/bridge-core.mjs";

try {
  const args = parseCommonArgs(process.argv.slice(2));
  if (!args.exchangeId) fail("Usage: validate-claude-output.mjs --exchange-id <id>", "INVALID_ARGUMENT");
  if (args.apply) fail("Validation is read-only and does not accept --apply.", "INVALID_ARGUMENT");
  const repo = repoRoot();
  const config = loadBridgeConfig(repo);
  const manifestPath = canonicalManifestPath(repo, args.exchangeId);
  if (!existsSync(manifestPath)) fail(`Unknown canonical exchange: ${args.exchangeId}`, "UNKNOWN_EXCHANGE");
  assertUniqueExchangeId(repo, args.exchangeId, manifestPath);
  const taskManifest = validateTaskManifest(readJson(manifestPath));
  assertSourceIsCurrent(repo, taskManifest);
  const outputRoot = join(config.externalBridgeRoot, "claude", "outbox", args.exchangeId);
  if (!existsSync(outputRoot)) fail(`Claude output does not exist for ${args.exchangeId}.`, "MISSING_CLAUDE_OUTPUT");
  const result = validateClaudeReturn({ outputRoot, taskManifest, limits: config });
  process.stdout.write(`${JSON.stringify({
    status: "VALID",
    exchange_id: args.exchangeId,
    result_status: result.returnManifest.result_status,
    decision: result.returnManifest.decision,
    output_file_count: result.outputFileCount,
    total_bytes: result.totalBytes,
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
