# Collaboration Schema Registry

| Field | Value |
| --- | --- |
| Document ID | AU-COLLAB-SCHEMA-INDEX-001 |
| Title | Collaboration Schema Registry |
| Status | `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-21 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `collaboration/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Manifest field; status vocabulary; authority; validation; compatibility change |

## Purpose

Register the machine-readable contracts for tasks sent to Claude and results
returned to Codex.

## Scope

The schemas define exchange metadata, authority boundaries, task and result
types, source identity, file registration, checksums, and independent acceptance
decisions. They do not define product or technical meaning.

## Registered Schemas

- [`claude-task-manifest.schema.json`](claude-task-manifest.schema.json) — exact
  source, scope, authority, expected output, and integrity contract.
- [`claude-return-manifest.schema.json`](claude-return-manifest.schema.json) —
  reviewed sources, findings, decision, registered outputs, and integrity
  contract.

## Owner and Lifecycle

AU-CODEX-PRIMARY owns contract behavior; AU-AGENT-001 approves technical
compatibility; AU-AGENT-002 maintains navigation and lifecycle. Schemas use
semantic versions. A breaking field or status change requires a new version,
migration guidance, traceability update, and explicit compatibility review.

## Adding Schemas

Add a schema only for a distinct governed exchange artifact. Define required
fields, unknown-field behavior, statuses, size and path expectations, version,
owner, consumers, compatibility, validation tests, and Source of Truth entry.
Never create an overlapping task or return contract.

## Related Sources

- [`docs/SOURCE_OF_TRUTH.md`](../../docs/SOURCE_OF_TRUTH.md)
- [`collaboration/README.md`](../README.md)
- [`collaboration/scripts/README.md`](../scripts/README.md)
