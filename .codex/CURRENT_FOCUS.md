# Current Focus

## Focus ID: AU-CDX-TASK-001-OXS-IMPORTER

**Status:** Route-1 evidence, workspace scaffold, and canonical domain-core
`[IMPLEMENTED]`, `[TESTED]`; bounded OXS route-1 importer is the next internal
step

Implement the bounded OXS 1.0 route-1 adapter and its golden/security tests
against the registered canonical contracts and fixture evidence. Preserve the
source, coordinate, symbol, progress, and resource-limit boundaries.

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

- Technical Design v1.4.0 remains `[PROPOSED]` with independent disposition
  `CONFIRMED_ACCEPTED_WITH_GATES`.
- AU-AGENT-003 Engineering Verification Status remains
  `VERIFIED WITH FINDINGS` for the design-only security review.
- The project-original route-1 fixture set and strict TypeScript pnpm workspace
  scaffold are `[IMPLEMENTED]`, `[TESTED]`.
- Canonical `domain-core` records, validation, immutable snapshot boundary,
  Project lifecycle, and progress projection are `[IMPLEMENTED]`, `[TESTED]`.
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
- AU-AGENT-004 owns the bounded OXS importer and compatibility evidence.
- AU-AGENT-005 owns persistence contract implementation only after its gates.
- AU-AGENT-006 owns client workspace and integration boundaries without
  implementing product behavior at the scaffolding stage.
- AU-AGENT-003 independently verifies later implementation evidence.
- AU-AGENT-002 maintains documentation, navigation, terminology, and
  traceability without changing technical or product meaning.

## Immediate Boundaries

- Implement only the supported OXS 1.0 full-cross route-1 mapping required by
  Technical Design v1.4.0.
- Do not mix OXS source representation into the canonical domain model.
- Reject unknown coordinate profiles rather than guessing.
- Treat input as untrusted, prohibit DTD/entity processing, and enforce the
  recorded preflight and parsed-structure limits.
- Preserve unsupported-content reporting and never map source `marked` state to
  ProgressEvent.
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
strict typecheck and 9 focused tests.

This internal stage requires no Claude return and therefore no new
Collaboration Bridge Exchange ID.

## Next Concrete Step

Implement the bounded OXS route-1 adapter, deterministic imported identities and
canonical content hash, ImportReport, golden mapping, malformed/unsupported,
resource-limit, and source-progress-ignore tests. Stop before persistence.
