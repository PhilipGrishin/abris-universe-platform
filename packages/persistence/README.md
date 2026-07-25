# Persistence Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-PERSIST-001 |
| Title | Persistence Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]`; browser integration and independent verification pending |
| Owner | AU-AGENT-005 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-003 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Persistence implementation; storage schema or migration change; durability or compatibility finding |

## Purpose and Scope

Provide the typed IndexedDB repository boundary for retained SourceFile data,
immutable PatternVersion records, Projects, append-only ProgressEvents,
projections, transactions, and schema upgrades.

## Implemented Boundary

- Native IndexedDB schema version 1 with the ten stores registered by the
  Technical Design.
- Stable installation `deviceId` and schema/capability metadata.
- Short atomic import staging with opaque source Blob retention.
- One atomic accepted-import commit across reports, canonical records, tiles,
  and Project readiness.
- Rejected/interrupted import cleanup that deletes source bytes but preserves
  bounded provenance and diagnostics.
- Append-only, per-project sequenced ProgressEvents with stable event IDs,
  canonical idempotency hashes, same-transaction projections, and Project
  timestamps.
- Mandatory exclusive Web Lock for progress writes; no unsafe fallback.
- Projection rebuild, reopen recovery, strict-durability request where
  supported, persistence-capability recording, and typed unavailable, blocked,
  quota, conflict, and corruption errors.

## Verification

Run:

```sh
pnpm --filter @abris-universe/persistence typecheck
pnpm --filter @abris-universe/persistence test
```

The focused suite uses `fake-indexeddb` only as a test dependency. It covers
schema/reopen compatibility, atomic commit and rollback, failed/interrupted
cleanup, canonical tile integrity, quota and blocked-upgrade paths, persistence
denial, progress idempotency/conflict, lock capability, stale toggles, reload,
and projection rebuild.

## Limits

This package does not implement UI save-state behavior, Web Worker import
integration, canonical tile construction, rendering, synchronization, backup,
or browser-specific runtime acceptance. Initial schema version 1 has no
historical production migration.

## Lifecycle and Additions

Additions must preserve atomicity, data recovery, Pattern/Progress separation,
idempotency, rollback compatibility, explicit migration evidence,
Documentation Impact, and AU-AGENT-003 verification. Never reset or delete a
production database as an upgrade strategy.

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Persistence ADR](../../docs/architecture/adr/ADR-TS001-003-indexeddb-progress-event-log.md)
- [Threat Model](../../docs/assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Implementation Review](../../docs/reviews/technical/TASK-THINSLICE-001/PERSISTENCE_IMPLEMENTATION_REVIEW.md)
