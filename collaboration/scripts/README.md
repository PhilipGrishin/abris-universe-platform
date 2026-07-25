# Collaboration Script Guide

| Field | Value |
| --- | --- |
| Document ID | AU-COLLAB-SCRIPT-INDEX-001 |
| Title | Collaboration Script Guide |
| Status | `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-21 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `collaboration/README.md`, `collaboration/schemas/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Script behavior; schema; security control; runtime requirement; bridge topology change |

## Purpose

Document the local, dependency-free Node.js bridge tooling. Run commands from
the repository root. Write-capable commands are dry-run unless `--apply` is
present.

## Local Configuration

Copy `collaboration/config.example.json` to
`.collaboration-bridge.local.json`, set the external bridge path, and never
commit the local file.

## Scope

The scripts use Node.js standard-library APIs and local Git commands. They
prepare immutable text snapshots, synchronize the configured bridge, validate
returns, import to ignored staging, archive reviewed exchanges, and report
active and archived lifecycle status. They do not integrate canonical content
or perform Git writes.

## Commands

```bash
node collaboration/scripts/prepare-claude-package.mjs \
  --request collaboration/manifests/<exchange-id>/request.json

node collaboration/scripts/prepare-claude-package.mjs \
  --request collaboration/manifests/<exchange-id>/request.json --apply

node collaboration/scripts/sync-claude-bridge.mjs --initialize
node collaboration/scripts/sync-claude-bridge.mjs --initialize --apply
node collaboration/scripts/sync-claude-bridge.mjs \
  --exchange-id <exchange-id> --apply

node collaboration/scripts/validate-claude-output.mjs \
  --exchange-id <exchange-id>

node collaboration/scripts/import-claude-output.mjs \
  --exchange-id <exchange-id>
node collaboration/scripts/import-claude-output.mjs \
  --exchange-id <exchange-id> --apply

node collaboration/scripts/archive-exchange.mjs \
  --exchange-id <exchange-id> --review-reference <record>
node collaboration/scripts/archive-exchange.mjs \
  --exchange-id <exchange-id> --review-reference <record> --apply

node collaboration/scripts/report-exchange-status.mjs \
  --exchange-id <exchange-id>
```

## Guarantees

The scripts do not commit, push, merge, open PRs, or write canonical product or
engineering documents. Import targets only the Git-ignored Codex staging area.
Canonical integration remains a separate reviewed Git operation.

## Verification

```bash
node --test collaboration/scripts/bridge-core.test.mjs
```

The suite includes negative checks for traversal, hidden outputs, symbolic
links, secret-like material, machine paths, unexpected extensions, ambiguous
acceptance, unregistered output, checksum mismatch, mismatched archive records,
and inconsistent canonical outcome provenance.

`report-exchange-status.mjs` distinguishes `REGISTERED`, `PREPARED`, `EXPORTED`,
`RETURNED`, and `ARCHIVED`. For archived exchanges it revalidates the archived
task and return, archive record, canonical outcome, canonical report checksum,
and return-manifest checksum. A source branch that has advanced is reported as
`HISTORICAL_ARCHIVED` rather than as a failed active exchange.

## Owner, Lifecycle, and Adding Commands

AU-CODEX-PRIMARY owns behavior and security controls; AU-AGENT-001 approves
technical changes; AU-AGENT-002 maintains this navigation. Add a command only
when it has a bounded exchange responsibility, remains dry-run by default for
writes, documents rollback or non-overwrite behavior, and has focused tests.

## Related Sources

- `docs/SOURCE_OF_TRUTH.md`
- `collaboration/README.md`
- `collaboration/schemas/README.md`
