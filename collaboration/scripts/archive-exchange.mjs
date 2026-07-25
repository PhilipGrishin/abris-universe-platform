#!/usr/bin/env node

import { existsSync, mkdirSync, renameSync } from "node:fs";
import { join } from "node:path";
import {
  canonicalManifestPath,
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
  if (!args.exchangeId || !args.reviewReference) {
    fail("Usage: archive-exchange.mjs --exchange-id <id> --review-reference <reference> [--apply]", "INVALID_ARGUMENT");
  }
  const repo = repoRoot();
  const config = loadBridgeConfig(repo);
  const taskManifest = validateTaskManifest(readJson(canonicalManifestPath(repo, args.exchangeId)));
  const inbox = join(config.externalBridgeRoot, "claude", "inbox", args.exchangeId);
  const outbox = join(config.externalBridgeRoot, "claude", "outbox", args.exchangeId);
  if (!existsSync(inbox) || !existsSync(outbox)) fail("Both external inbox and outbox must exist before archival.", "INCOMPLETE_EXCHANGE");
  const validation = validateClaudeReturn({ outputRoot: outbox, taskManifest, limits: config });
  const archiveRoot = join(config.externalBridgeRoot, "claude", "archive", args.exchangeId);
  if (existsSync(archiveRoot)) fail(`Archive already exists for ${args.exchangeId}.`, "DESTINATION_EXISTS");
  if (args.apply) {
    mkdirSync(archiveRoot, { recursive: false });
    renameSync(inbox, join(archiveRoot, "inbox"));
    renameSync(outbox, join(archiveRoot, "outbox"));
    writeJson(join(archiveRoot, "archive-record.json"), {
      schema_version: "1.0.0",
      exchange_id: args.exchangeId,
      archived_at: nowIso(),
      archived_by: "AU-CODEX-PRIMARY",
      review_reference: args.reviewReference,
      result_status: validation.returnManifest.result_status,
      decision: validation.returnManifest.decision,
    });
  }
  process.stdout.write(`${JSON.stringify({
    mode: args.apply ? "apply" : "dry-run",
    exchange_id: args.exchangeId,
    review_reference: args.reviewReference,
    operation: "archive validated external inbox and outbox",
  }, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
