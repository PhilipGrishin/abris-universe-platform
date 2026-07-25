# Current Focus

## Focus ID: AU-CDX-TASK-001-CLIENT-INTEGRATION

**Status:** Route-1 evidence, workspace scaffold, canonical domain-core,
bounded OXS route-1 importer core, and IndexedDB schema-v1 persistence/recovery
`[IMPLEMENTED]`, `[TESTED]`; repository-level persistence is
`VERIFIED WITH FINDINGS`; renderer core is `[IMPLEMENTED]`, `[TESTED]` with
repository-level Engineering Verification Status `VERIFIED`

Implement the approved accessible Phase 0 web flow, dedicated importer Worker,
browser Canvas adapter, and end-to-end IndexedDB progress behavior. Keep
production deployment outside this stage.

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

- Technical Design v1.5.2 remains `[PROPOSED]` with independent disposition
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
- IndexedDB schema version 1, source staging, atomic import commit,
  failed/interrupted cleanup, metadata, idempotent progress, Web Locks,
  capability failures, reopen, and projection rebuild are `[IMPLEMENTED]`,
  `[TESTED]` at the repository API boundary.
- The remediation candidate adds final-event hashes, exact-version stitch
  validation, Blob/hash binding, bounded report validation/cleanup, and
  fail-closed replay/rebuild integrity with 17 focused persistence tests.
- AU-AGENT-003 resolved TS001-PERSIST-001 through TS001-PERSIST-005 at exact
  commit `854073c`; the repository-level persistence quality gate passes with
  Engineering Verification Status `VERIFIED WITH FINDINGS`.
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
- AU-AGENT-006 owns the approved client flow, browser integration,
  accessibility, interaction, and client evidence.
- AU-AGENT-003 independently verifies later implementation evidence.
- AU-AGENT-002 maintains documentation, navigation, terminology, and
  traceability without changing technical or product meaning.

## Immediate Boundaries

- Implement only the approved Phase 0 web flow from Technical Design sections
  4, 8, 9, 10, and 11: OXS selection/import, project open, zoom/pan, readable
  symbol view, mark/unmark, explicit saving/not-saved state, reload recovery,
  and required accessible controls/status.
- Run untrusted OXS parsing only in a dedicated Worker with no UI-thread
  fallback.
- Integrate existing renderer and persistence public contracts; do not
  duplicate their algorithms or bypass their validation.
- Add browser-level functional evidence for Canvas, IndexedDB, reload,
  two-context locking, interaction, accessibility, and runtime requests where
  the approved harness can verify them.
- Do not claim power-loss, eviction, supported-browser, performance,
  accessibility, or pixel-golden completion without exact evidence.
- Do not implement CI/CD or deploy in this stage.
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

The persistence repository-level result passes independent AU-AGENT-003
reverification at exact commit `854073c`. Findings 001 through 005 are
resolved. TS001-PERSIST-006 remains open for later real browser/client evidence.

This internal stage requires no Claude return and therefore no new
Collaboration Bridge Exchange ID.

## Current Renderer Gate

AU-AGENT-003 reviewed exact commit `cb34a48` and assigned `REWORK REQUIRED`.
High findings TS001-RENDER-001 through 003 and Medium finding
TS001-RENDER-004 are registered. The remediation candidate now has 12 focused
renderer tests plus the full workspace suite, but finding disposition remains
with AU-AGENT-003 until exact-source reverification.

Reverification at exact commit `bdaf3ed` resolved TS001-RENDER-001, 002, and
004 and left High TS001-RENDER-003 partially resolved. The second remediation
candidate adds complete rendering-relevant symbol validation, declared stitch
counts, and absolute request/response ceilings with 14 focused renderer tests.

Reverification at exact commit `f3e2fdc` confirmed those controls and left only
the missing `patternVersionId` length check inside finding 003. The final narrow
candidate adds the pre-acceptance bound, a dedicated oversized-identity test,
and a committed empty-tile regression. Fifteen renderer tests pass.

Final reverification at exact commit `930cad2` resolved
TS001-RENDER-001 through 004. The bounded repository-level renderer-core gate
passes with Engineering Verification Status `VERIFIED`. Browser/client evidence
remains open.

## Next Concrete Step

Inspect the web scaffold and approved UX/client contracts, then implement the
smallest end-to-end browser flow with dedicated Worker import, renderer Canvas
integration, IndexedDB persistence, and focused browser evidence.
