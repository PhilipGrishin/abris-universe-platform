# ADR-TS001-003 — IndexedDB and Local Progress Event Log

| Field | Value |
| --- | --- |
| Document ID | ADR-TS001-003 |
| Title | IndexedDB Persistence with an Append-Only Local Progress Event Log |
| Status | `[PROPOSED]`; independent architecture disposition `ACCEPTED_WITH_GATES` |
| Owner | AU-AGENT-005 |
| Technical Approver | AU-AGENT-001 |
| Independent Architecture Review | `AU-EX-20260725-005`; `ACCEPTED_WITH_GATES` |
| Security Review | `AU-REVIEW-ENG-TS001-SEC-001`; `VERIFIED WITH FINDINGS` for design scope |
| Version | 1.1.1 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Storage schema change; migration or rollback change; browser compatibility change; sync scope; durability finding |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Context

Phase 0 is a local-only web flow. Original source, immutable PatternVersion,
Project, progress, and enough data for reload recovery must survive browser
restart without a backend.

## Problem

Web Storage is not appropriate for binary source files or large structured
records. Updating Pattern stitches in place would violate Pattern/Progress
separation. Treating an optimistic UI change as saved would silently lose
progress on quota or transaction failure.

## Decision

Use native IndexedDB behind typed repository interfaces. Commit an import
atomically across source, import, pattern, version, tiles, and Project stores.
Represent progress as append-only `ProgressEvent` records with stable event IDs
and maintain a rebuildable projection in the same transaction.

Save success is emitted only after transaction completion. Duplicate delivery
of an identical event ID is a no-op; conflicting reuse is corruption. Request
persistent storage when supported and surface denial, quota, upgrade, and
unavailable-storage states.

Each event records stable `deviceId` and in-transaction `localSequence`.
Exactly one tab holds the project writer lock; a second tab is read-only.
Derivation, sequence allocation, append, projection, and Project update share
one transaction, while the idempotency record stores a canonical payload hash.
Strict IndexedDB durability is requested when supported. Rejected/interrupted
imports delete their Blob while retaining bounded provenance and diagnostics.

No backend, CRDT, synchronization queue, manual backup, or progress export is
implemented in this slice.

## Alternatives

1. `localStorage`. Rejected for synchronous access, size, and data-shape limits.
2. SQLite-WASM. Deferred because IndexedDB satisfies the thin slice with lower
   dependency and migration complexity.
3. Store current progress only. Rejected because it loses idempotent event
   evidence and weakens future recovery.
4. CRDT document. Deferred because there is no Phase 0 network merge.

## Consequences

- Browser transactions define the durability boundary.
- Projections can be rebuilt and tested.
- Pattern records remain immutable while progress changes.
- Later synchronization can consume stable local event IDs without being
  implemented prematurely.
- Browser eviction remains an environmental risk without a product backup
  feature.

## Risks

- Quota and persistence policy vary by browser.
- A future schema upgrade can make code rollback unsafe unless compatibility is
  designed release by release.
- Long transactions can auto-close or block upgrades; all expensive work must
  happen before the commit transaction.

## Migration

Initial database schema version is `1`. Upgrades use explicit IndexedDB
`versionchange` migrations, additive changes where possible, and focused
fixtures. Production reset is prohibited as a migration strategy.

## Rollback

The immediately previous deployed client must read data written by the new
release or the deployment requires a separate approved rollback plan. Code
rollback never deletes IndexedDB. Pattern tiles may be rebuilt; SourceFile,
PatternVersion identity, Project, and ProgressEvent must be preserved.

## Affected Modules and Contracts

- `packages/persistence`
- `packages/domain-core`
- `apps/web` save state
- IndexedDB migration and recovery tests

## Verification and Evidence

Required evidence includes atomic-import failure tests, mark/reload/reopen,
event idempotency, rapid toggles, projection rebuild, quota failure, blocked
upgrade, persistence capability, and prior-client compatibility.

## Traceability

- TASK-THINSLICE-001 FR-05 through FR-07, sections 14 through 18, 21, 27
- Product architecture proposal ADR-003
- TRACE-DESIGN-TS001

## Review History

- 2026-07-25: Initial proposal by AU-AGENT-005 within AU-AGENT-001 system
  architecture. Approval pending.
- 2026-07-25: Claude Cowork independent architecture review
  `AU-EX-20260725-005` dispositioned this ADR `ACCEPTED_WITH_GATES`; R-1,
  R-3, R-4, and N-3 are integrated in version 1.1.0. AU-AGENT-003 security
  review and implementation evidence were open at that review stage.
- 2026-07-25: AU-AGENT-003 report `AU-REVIEW-ENG-TS001-SEC-001` records
  `VERIFIED WITH FINDINGS` for the design-only security scope. TS001-SEC-001
  is resolved; persistence implementation and runtime evidence remain open.
