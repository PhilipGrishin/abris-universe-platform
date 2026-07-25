# TASK-THINSLICE-001 Persistence Implementation Review

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-PERSIST-001 |
| Title | TASK-THINSLICE-001 IndexedDB Persistence Implementation Review |
| Status | `[IMPLEMENTED]`, `[TESTED]`; independent engineering verification `REWORK REQUIRED` at `776a149` |
| Owner | AU-AGENT-005 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 at the consolidated implementation gate |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | Technical Design v1.5.0; ADR-TS001-003; domain-core and OXS importer implementation reviews |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | IndexedDB schema, transaction, durability, retention, progress, recovery, lock, capability, browser-support, dependency, or AU-AGENT-003 finding change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record the schema-v1 browser-local persistence implementation and its focused
evidence without claiming browser integration, UI save behavior, migration from
a deployed schema, product acceptance, or project `[VERIFIED]`.

## Scope

The reviewed implementation is `@abris-universe/persistence` version 0.1.0. It
uses native IndexedDB behind typed repository functions and implements the
storage, import-lifecycle, progress-journal, recovery, and capability contracts
from Technical Design section 9.

## Implemented Contracts

- Database `abris-universe`, schema version 1, with the exact ten registered
  stores and compound keys for tiles, events, and projections.
- Stable stored `deviceId`, schema metadata, per-project next-sequence metadata,
  and persistent-storage capability records.
- A short atomic staging transaction retains the opaque SourceFile Blob with
  importing ImportJob and Project records after a caller-provided format limit
  passes.
- One accepted-import transaction validates the canonical aggregate and stores
  the ImportReport, Pattern, immutable PatternVersion, complete tile set,
  terminal ImportJob, and ready Project.
- A failed accepted-import commit aborts without partial PatternVersion or tile
  state and leaves the staged attempt recoverable.
- Rejected and startup-interrupted attempts delete their source Blob and
  `bytesRef` while retaining bounded SourceFile provenance, ImportJob
  diagnostics, and failed Project state.
- Progress writes require an exclusive
  `au:project:<projectId>:progress-writer` Web Lock.
- Event-ID lookup precedes mutation. Identical canonical payload replay is a
  no-op; different payload reuse is a typed idempotency corruption error.
- Projection read, expected toggle validation, sequence allocation, immutable
  event append, ID record, projection update, and Project timestamp update
  share one strict-durability transaction where the browser supports it.
- Projection rebuild derives state only from ordered immutable events.
- Unavailable IndexedDB, blocked upgrade, quota, invalid schema, missing
  records, stale state, missing locks, and competing writers are explicit typed
  failures.
- Persistent-storage support and denial are recorded without claiming that
  persistence is backup.

## Evidence

| Check | Result |
| --- | --- |
| `pnpm typecheck` | `[TESTED]`; strict TypeScript 7.0.2 passes for domain, importer, and persistence packages |
| Persistence focused suite | `[TESTED]`; 11 passed, 0 failed |
| Full workspace suite | `[TESTED]`; fixture, workspace-boundary, domain, importer, and persistence suites pass |
| Schema/reopen | `[TESTED]`; exact stores and stable `deviceId` survive close/reopen |
| Atomic import | `[TESTED]`; success persists all records; a constraint failure aborts every attempted canonical write; divergent tile data is rejected |
| Failure retention | `[TESTED]`; rejected/interrupted paths delete opaque bytes and retain diagnostics/provenance |
| Progress | `[TESTED]`; ordered sequences, duplicate no-op, conflicting-ID detection, stale-toggle rejection, and lock failures pass |
| Recovery | `[TESTED]`; projection rebuild after close/reopen reproduces event-derived state |
| Capability/error paths | `[TESTED]`; blocked upgrade, simulated quota exhaustion, persistence denial, and unsupported persistence request are surfaced |

`fake-indexeddb` provides deterministic API-level test isolation. These tests do
not replace the later supported-browser matrix, multi-tab runtime test,
power-loss test, storage-eviction behavior, or client-visible save-state
evidence.

## Dependency Review

- `@noble/hashes` 2.2.0: exact MIT runtime dependency used for portable
  SHA-256 idempotency payload hashes; already present in the importer.
- `fake-indexeddb` 6.2.5: exact Apache-2.0 test-only dependency used only by the
  Node test suite.

Both versions are integrity-locked by `pnpm-lock.yaml`. No storage wrapper or
production IndexedDB dependency was added.

## Findings and Limitations

- Browser-owned persistence may still be denied or evicted; this implementation
  reports capability but does not provide backup, which is outside Phase 0.
- Strict durability support varies by browser and is exposed as a database
  capability; relaxed-durability residual risk remains.
- The current evidence uses one simulated lock manager. Real two-tab
  contention and client read-only behavior remain client-integration tests.
- No deployed schema predates version 1. Reopen compatibility is tested, while
  the first real migration and prior-release rollback require separate
  release-specific evidence.
- The importer Worker and tile-construction integration are not part of this
  package.
- AU-AGENT-003 issued `REWORK REQUIRED` at exact commit `776a149`. Mandatory
  findings TS001-PERSIST-001 through TS001-PERSIST-005 require final-event
  hashing, stitch referential integrity, Blob/hash binding, bounded runtime
  ImportReport validation, and fail-closed replay/rebuild integrity.
- TS001-PERSIST-006 preserves real-browser, two-tab, power-loss, eviction, and
  client save-state evidence as a later mandatory gate.

## Documentation Result

Package, task, status, risk, traceability, changelog, and handoff records now
identify the implemented persistence boundary and the remaining browser/client
evidence. No Documentation Exception is required.

## Next Step

Remediate TS001-PERSIST-001 through TS001-PERSIST-005 and submit the exact new
source for AU-AGENT-003 reverification. Do not close TS001-PERSIST-006 from
fake IndexedDB evidence.

## References

- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Persistence ADR](../../../architecture/adr/ADR-TS001-003-indexeddb-progress-event-log.md)
- [Threat Model](../../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Domain Core Review](DOMAIN_CORE_IMPLEMENTATION_REVIEW.md)
- [OXS Importer Review](OXS_IMPORTER_IMPLEMENTATION_REVIEW.md)
- [Persistence Package](../../../../packages/persistence/README.md)
- [Independent Persistence Verification](../../engineering/TASK-THINSLICE-001_PERSISTENCE_VERIFICATION.md)
