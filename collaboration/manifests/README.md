# Exchange Manifest Registry

| Field | Value |
| --- | --- |
| Document ID | AU-COLLAB-MANIFEST-INDEX-001 |
| Title | Exchange Manifest Registry |
| Status | `[IMPLEMENTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-21 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `collaboration/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Exchange registration; manifest contract change; lifecycle outcome; duplicate ID |

## Purpose

Store durable task request, final task manifest, provenance, and outcome records
for intended project exchanges. Runtime snapshots and Claude outbox payloads are
not committed here.

## Scope

This index covers committed exchange requests, exact-source task manifests, and
future reviewed outcome records. It excludes transient payload copies and does
not approve returned meaning.

## Registered Exchanges

- [`AU-EX-20260721-001`](AU-EX-20260721-001/README.md) — independent review of
  platform repository initialization and product/engineering governance
  integration; completed, validated, integrated, and archived with decision
  `VERIFIED` within the registered scope.

## Rules

- One directory per immutable Exchange ID.
- Never reuse or silently rewrite an Exchange ID.
- `request.json` records owner-approved preparation inputs.
- `task-manifest.json` records exact source commit, included files, and SHA-256
  integrity after package preparation.
- A final outcome record is added only after validation, authorized review,
  integration, and archive.
- Duplicate IDs, stale source, or checksum drift block import.

## Owner and Lifecycle

AU-CODEX-PRIMARY registers exchange identity and provenance. AU-AGENT-002
maintains navigation, metadata, traceability, and lifecycle without changing
task or returned meaning. Add an exchange only through the documented prepare
workflow. Retain superseded and completed records; never silently delete them.

## Related Sources

- `collaboration/README.md`
- `collaboration/schemas/claude-task-manifest.schema.json`
- `collaboration/schemas/claude-return-manifest.schema.json`
- `docs/TRACEABILITY_MATRIX.md`
- `docs/SOURCE_OF_TRUTH.md`
