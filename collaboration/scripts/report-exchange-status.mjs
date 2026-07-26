#!/usr/bin/env node

import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import {
  assertSourceIsCurrent,
  canonicalManifestPath,
  fail,
  formatError,
  loadBridgeConfig,
  parseCommonArgs,
  readJson,
  repoRoot,
  sha256File,
  validateArchiveRecord,
  validateClaudeReturn,
  validateExchangeOutcome,
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
      const inboxRoot = join(external, "claude", "inbox", args.exchangeId);
      const outputRoot = join(external, "claude", "outbox", args.exchangeId);
      const archiveRoot = join(external, "claude", "archive", args.exchangeId);
      const runtimeRoot = join(repo, "collaboration", "runtime", "packages", args.exchangeId);
      detail.external_inbox = existsSync(inboxRoot);
      detail.external_outbox = existsSync(outputRoot);
      detail.external_archive = existsSync(archiveRoot);
      detail.lifecycle_status = detail.external_archive
        ? "ARCHIVED"
        : detail.external_outbox
          ? "RETURNED"
          : detail.external_inbox
            ? "EXPORTED"
            : existsSync(runtimeRoot)
              ? "PREPARED"
              : "REGISTERED";
      try {
        assertSourceIsCurrent(repo, manifest);
        detail.source_status = "CURRENT";
      } catch (error) {
        if (detail.external_archive) {
          detail.source_status = "HISTORICAL_ARCHIVED";
          detail.source_note = formatError(error);
        } else {
          detail.source_status = "STALE_OR_UNAVAILABLE";
          detail.source_error = formatError(error);
        }
      }
      if (detail.external_archive) {
        try {
          const archivedManifestPath = join(archiveRoot, "inbox", "task-manifest.json");
          if (!existsSync(archivedManifestPath) || sha256File(archivedManifestPath) !== sha256File(path)) {
            fail("Archived task manifest does not match the canonical manifest.", "ARCHIVE_TASK_MISMATCH");
          }
          const archivedOutbox = join(archiveRoot, "outbox");
          const validation = validateClaudeReturn({ outputRoot: archivedOutbox, taskManifest: manifest, limits: config });
          const archiveRecord = validateArchiveRecord(
            readJson(join(archiveRoot, "archive-record.json")),
            { exchangeId: args.exchangeId, returnManifest: validation.returnManifest },
          );
          detail.output_validation = "VALID_ARCHIVED";
          detail.result_status = validation.returnManifest.result_status;
          detail.decision = validation.returnManifest.decision;
          detail.archive_review_reference = archiveRecord.review_reference;

          const outcomePath = join(repo, "collaboration", "manifests", args.exchangeId, "outcome.json");
          if (existsSync(outcomePath)) {
            const outcome = validateExchangeOutcome(readJson(outcomePath), {
              taskManifest: manifest,
              returnManifest: validation.returnManifest,
              archiveRecord,
            });
            const reportPath = join(repo, outcome.canonical_report);
            const archivedReturnPath = join(archivedOutbox, "return-manifest.json");
            if (!existsSync(reportPath) || sha256File(reportPath) !== outcome.report_sha256) {
              fail("Canonical report is missing or does not match the outcome checksum.", "OUTCOME_REPORT_MISMATCH");
            }
            if (sha256File(archivedReturnPath) !== outcome.return_manifest_sha256) {
              fail("Archived return manifest does not match the outcome checksum.", "OUTCOME_RETURN_MISMATCH");
            }
            detail.integration_status = "INTEGRATED";
            detail.canonical_report = outcome.canonical_report;
          } else {
            detail.integration_status = "NOT_INTEGRATED";
          }
        } catch (error) {
          detail.output_validation = "INVALID_ARCHIVE";
          detail.integration_status = "INVALID";
          detail.output_error = formatError(error);
        }
      } else if (detail.external_outbox) {
        try {
          const validation = validateClaudeReturn({ outputRoot, taskManifest: manifest, limits: config });
          detail.output_validation = "VALID";
          detail.result_status = validation.returnManifest.result_status;
          detail.decision = validation.returnManifest.decision;
          detail.integration_status = "NOT_INTEGRATED";
        } catch (error) {
          detail.output_validation = "INVALID";
          detail.integration_status = "INVALID";
          detail.output_error = formatError(error);
        }
      } else {
        detail.output_validation = "NOT_RETURNED";
        detail.integration_status = "NOT_INTEGRATED";
      }
    }
    result.exchange = detail;
  }
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${formatError(error)}\n`);
  process.exitCode = 1;
}
