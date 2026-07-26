# Persistence Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-PERSIST-001 |
| Title | Persistence Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]`; browser integration accepted within the declared Chrome/macOS Phase 0 profile; broader durability/platform evidence remains open |
| Owner | AU-AGENT-005 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.3.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-26 |
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
- Pre-staging SHA-256 verification binds retained Blob bytes to SourceFile
  provenance.
- One atomic accepted-import commit across reports, canonical records, tiles,
  and Project readiness.
- Rejected/interrupted import cleanup that deletes source bytes but preserves
  bounded provenance and diagnostics.
- Append-only, per-project sequenced ProgressEvents with stable event IDs,
  final-event idempotency hashes including `localSequence`, exact-version
  stitch-reference validation, same-transaction projections, and Project
  timestamps.
- Mandatory exclusive Web Lock for progress writes; no unsafe fallback.
- Projection rebuild, reopen recovery, strict-durability request where
  supported, persistence-capability recording, and typed unavailable, blocked,
  quota, conflict, and corruption errors.
- Read-only Pattern lookup and caller-bounded tile-range reads for the renderer
  provider without loading the complete PatternVersion on every frame.
- Browser-integrated source verification uses asynchronous Web Crypto SHA-256
  before canonical commit.

## Verification

Run:

```sh
pnpm --filter @abris-universe/persistence typecheck
pnpm --filter @abris-universe/persistence test
```

The focused suite uses `fake-indexeddb` only as a test dependency. It covers
schema/reopen compatibility, atomic commit and rollback, bounded tile-range
reads, failed/interrupted
cleanup, canonical tile integrity, quota and blocked-upgrade paths, persistence
denial, bounded/malformed ImportReport cleanup, progress
idempotency/conflict/corruption, phantom-stitch rejection, lock capability,
stale toggles, reload, and fail-closed projection rebuild.

## Limits

This package does not implement UI save-state behavior, Web Worker import,
canonical tile construction, rendering, synchronization, or backup. Browser
runtime evidence is owned by the client integration stage and currently covers
commit-driven save/reload, close-tab/new-tab recovery, real Web Locks
contention, transaction abort, and blocked upgrade on the declared profile.
Safe real quota exhaustion, eviction, operating-system power loss, other
browsers, synchronization, and backup remain outside the verified boundary.
Initial schema version 1 has no historical production migration.

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
