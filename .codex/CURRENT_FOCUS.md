# Current Focus

## Focus ID: AU-CDX-TASK-001-PERSISTENCE

**Status:** Route-1 evidence, workspace scaffold, canonical domain-core, and
bounded OXS route-1 importer core `[IMPLEMENTED]`, `[TESTED]`; IndexedDB
persistence and recovery are the next internal step

Implement the smallest IndexedDB repositories, atomic import commit, failed
import cleanup, append-only progress transactions, recovery, and capability
errors required by Technical Design v1.5.0. Do not start rendering or client UI.

## Confirmed Inputs

- TASK-THINSLICE-001 v1.1 is the current approved product handoff.
- PROD-DEC-009 selects OXS 1.0 and authorizes project-original route-1
  fixtures.
- PROD-DEC-007 sets the Cloudflare production target at
  `abris.653915.com`.
- PROD-DEC-010 establishes Abris Art as the launch and catalog anchor while
  preserving per-file rights grants.
- PROD-DEC-011 confirms the four owner-granted XSP samples, prohibits their
  transfer through the Bridge, identifies XSD as the Phase 1 second-importer
  priority, and leaves Phase 0 unchanged.
- `AU-EX-20260725-006` independently confirms Technical Design v1.2.1 and the
  R-1 through R-8 and N-1 through N-7/N-9 closures at design level.

## Current Design State

- Technical Design v1.5.0 remains `[PROPOSED]` with independent disposition
  `CONFIRMED_ACCEPTED_WITH_GATES`.
- AU-AGENT-003 Engineering Verification Status remains
  `VERIFIED WITH FINDINGS` for the design-only security review.
- The project-original route-1 fixture set and strict TypeScript pnpm workspace
  scaffold are `[IMPLEMENTED]`, `[TESTED]`.
- Canonical `domain-core` records, validation, immutable snapshot boundary,
  Project lifecycle, and progress projection are `[IMPLEMENTED]`, `[TESTED]`.
- The route-1 importer core, deterministic IDs/hash, ImportReport, unsupported
  handling, source-progress isolation, and parser limits are `[IMPLEMENTED]`,
  `[TESTED]`.
- TD-GATE-001 is closed only for the registered route-1 generator profile:
  top-left origin, x rightward, y downward, zero-based integer coordinates,
  no transposition.
- TD-GATE-004 is closed at design level.
- TD-GATE-002 remains open for exact-symbol claims outside the lawful route-1
  literal-symbol profile.
- TD-GATE-003 and runtime security evidence block production deployment.
- No project `[VERIFIED]`, implementation acceptance, security acceptance,
  release readiness, deployment authorization, or product acceptance exists.

## Assigned Roles

- AU-AGENT-001 owns the consolidated technical result and gate discipline.
- AU-AGENT-004 owns importer compatibility and any importer finding
  remediation.
- AU-AGENT-005 owns IndexedDB repositories, transactions, recovery, and data
  integrity.
- AU-AGENT-006 owns client workspace and integration boundaries without
  implementing product behavior at the scaffolding stage.
- AU-AGENT-003 independently verifies later implementation evidence.
- AU-AGENT-002 maintains documentation, navigation, terminology, and
  traceability without changing technical or product meaning.

## Immediate Boundaries

- Implement only the local IndexedDB contracts required by Technical Design
  v1.5.0.
- Preserve original SourceFile Blob separately from canonical Pattern data.
- Commit accepted canonical results atomically; no partial PatternVersion or
  tile state may survive failure.
- Keep progress append-only and idempotent; save success requires transaction
  commit.
- Treat missing Web Locks as a typed capability failure; do not introduce an
  unsafe multi-tab fallback.
- Do not start renderer, client flow, CI/CD, or deployment.
- Do not claim exact OXS symbol fidelity before TD-GATE-002 closes.
- Do not deploy to production before TD-GATE-003 and runtime security evidence
  close.
- Do not transfer the four PROD-DEC-011 XSP binaries through the Collaboration
  Bridge or commit them without the separate owner-controlled transfer path.
- Do not assign project `[VERIFIED]`.

## Completed Exchange

`AU-EX-20260725-006` reviewed exact commit
`395c5d62975ba0f52e0da69af256ef870bf02770` on immutable branch
`codex/task-thinslice-001-design-revision-source`. Its schema-valid
`REQUIREMENTS_REVIEW / COMPLETED / NO_DECISION` return was meaning-reviewed and
integrated byte-for-byte as
`product/reviews/TASK-THINSLICE-001_Design_Revision_Confirmation.md`.
The disposition is `CONFIRMED_ACCEPTED_WITH_GATES`; the exchange is archived
with checksum provenance and no verified scope.

## Completed Internal Stage

The route-1 fixture set contains minimal, medium, empty, unsupported, corrupt,
and bounded-security cases with deterministic manifests and expected outcomes.
The workspace establishes the approved package boundaries. `domain-core`
implements the approved canonical records and cross-record invariants with
strict typecheck and 9 focused tests. The OXS importer core passes 14 focused
tests, including the 100,000-stitch golden case, exact rejection codes,
determinism, progress isolation, symbol collision fallback, and adversarial
parser limits.

This internal stage requires no Claude return and therefore no new
Collaboration Bridge Exchange ID.

## Next Concrete Step

Implement IndexedDB schema version 1 repositories and focused tests for atomic
accepted import, rejected/interrupted cleanup, event idempotency/corruption,
sequence allocation, projection rebuild, reload, and capability failure. Stop
before renderer implementation.
