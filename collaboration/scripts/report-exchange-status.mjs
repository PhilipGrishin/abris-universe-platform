#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  assertSourceIsCurrent,
  canonicalManifestPath,
  formatError,
  loadBridgeConfig,
  parseCommonArgs,
  readJson,
  repoRoot,
  validateClaudeReturn,
  validateTaskManifest,
} from "./lib/bridge-core.mjs";

function ids(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path, { withFileTypes: true }).filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort();
}

try {
  const args = parseCommonArgs(process.argv.slice(2));
  const repo = repoRoot();
  const config = loadBridgeConfig(repo);
  const external = config.externalBridgeRoot;
  const result = {
    topology: "B_SYNCHRONIZED_EXTERNAL_BRIDGE",
    external_bridge_initialized: existsSync(external),
    canonical_exchanges: ids(join(repo, "collaboration", "manifests")),
    prepared_runtime_packages: ids(join(repo, "collaboration", "runtime", "packages")),
    external_inbox: ids(join(external, "claude", "inbox")),
    external_outbox: ids(join(external, "claude", "outbox")),
    external_archive: ids(join(external, "claude", "archive")),
  };
  if (args.exchangeId) {
    const path = canonicalManifestPath(repo, args.exchangeId);
    const detail = { exchange_id: args.exchangeId, canonical_manifest: existsSync(path) };
    if (detail.canonical_manifest) {
      const manifest = validateTaskManifest(readJson(path));
      try {
        assertSourceIsCurrent(repo, manifest);
        detail.source_status = "CURRENT";
      } catch (error) {
        detail.source_status = "STALE_OR_UNAVAILABLE";
        detail.source_error = formatError(error);
      }
      const outputRoot = join(external, "claude", "outbox", args.exchangeId);
      detail.external_inbox = existsSync(join(external, "claude", "inbox", args.exchangeId));
      detail.external_outbox = existsSync(outputRoot);
      if (detail.external_outbox) {
        try {
          const validation = validateClaudeReturn({ outputRoot, taskManifest: manifest, limits: config });
          detail.output_validation = "VALID";
          detail.result_status = validation.returnManifest.result_status;
          detail.decision = validation.returnManifest.decision;
        } catch (error) {
          detail.output_validation = "INVALID";
          detail.output_error = formatError(error);
        }
      } else detail.output_validation = "NOT_RETURNED";
    }
    result.exchange = detail;
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
