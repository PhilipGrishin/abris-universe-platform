# TASK-THINSLICE-001 Renderer Engineering Verification

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-ENG-TS001-RENDER-001 |
| Title | TASK-THINSLICE-001 Renderer Engineering Verification |
| Status | `[IMPLEMENTED]`; initial Engineering Verification Status `REWORK REQUIRED` |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.3.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | Exact initial source `cb34a48e082caf1c4f4244d8c22dcc4291caaf63`; exact first remediation `bdaf3ed35d33560b180f385c114bc9f9d2cf606a`; TASK-THINSLICE-001 v1.1; Technical Design v1.5.1 section 8; ADR-TS001-002 v1.1.2; task benchmark plan and threat model |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Renderer remediation commit; browser/client evidence; renderer contract, tile integrity, progress state, viewport, performance, accessibility, or security change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Independent Review Scope

AU-AGENT-003 independently reviewed exact commit
`cb34a48e082caf1c4f4244d8c22dcc4291caaf63` on
`codex/task-thinslice-001-renderer`. The reviewer made no file changes and did
not assign project `[VERIFIED]`.

## Checks Performed

- Local and remote branch matched the exact commit and the worktree was clean.
- `git diff --check` passed.
- Renderer strict typecheck passed.
- Renderer suite passed 9 of 9 tests.
- Full workspace passed 10 domain, 15 importer, 17 persistence, and 9 renderer
  tests.
- The medium Node signal used 100,000 stitches, 128 total tiles, 12 requested
  tiles, `performanceAcceptance: false`, and approximately 4.56 ms
  Canvas-contract simulation.
- An additional exact-boundary viewport probe returned tile range `1..4` on
  both axes where visible tile 2 plus one-tile prefetch requires `1..3`.

## Findings

| ID | Severity | Finding | Required Disposition |
| --- | --- | --- | --- |
| TS001-RENDER-001 | High | `saving` and `not-saved` use identical cross-and-outline geometry and differ only by color. `not-saved` always draws a marked cross, so a failed mark cannot restore the last committed unmarked state. This violates Technical Design section 8.4 grayscale/non-color distinction and last-committed-state semantics. | Represent committed, pending, and error state sufficiently to render failed mark and failed unmark correctly. Make `saving` and `not-saved` geometrically distinguishable without hue and add operation-level grayscale/state-transition tests. |
| TS001-RENDER-002 | High | Progress rendering ignores the frame budget after static completion, scans every visible stitch synchronously, and discards `changedStitchIds` in favor of a full overlay redraw. This violates incremental main-thread rendering and affected-overlay invalidation. | Budget progress work incrementally and use changed stitch/tile information or another bounded invalidation mechanism. Test thousands of marked stitches with a controlled clock. |
| TS001-RENDER-003 | High | The provider boundary accepts summary and tile data without runtime integrity validation. Wrong-version, out-of-range, duplicate, mis-keyed, out-of-grid, broken-reference, or over-returned tiles can be cached and rendered. | Fail closed before caching or drawing persisted data. Add corrupt-provider tests for identity, range, coordinates, duplicates, references, and bounded response size. |
| TS001-RENDER-004 | Medium | Exact tile-boundary viewport math treats the first excluded cell as visible and adds an extra tile beyond the prescribed prefetch margin. | Correct the inclusive last-cell calculation and test exact boundaries, fractional viewports, edge clamping, and fully outside grids. |

## Passed Areas

- Deterministic tile construction for valid tested inputs.
- AbortSignal propagation and stale-result rejection.
- Static/progress logical layer separation.
- Readable threshold and overview hit-test disabling.
- Inverse-transform hit testing for tested valid tiles.
- Black/white contrast calculation.
- Honest Node-signal evidence classification.
- No external production dependency was added.

## Later Evidence Gates

Real Canvas rendering and goldens, glyph atlas by DPR/zoom bucket,
OffscreenCanvas Worker transport and fallback, browser scheduling/font/
resize/DPR/zoom evidence, client gesture serialization, accessible DOM and
keyboard behavior, grayscale/reduced-motion checks, controlled benchmarks, and
the later 500,000-stitch prototype remain mandatory later gates rather than
repository-core findings in this review.

## Risk Assessment

The mandatory findings can cause incorrect save-state presentation, color-only
status ambiguity, unbounded main-thread work, and rendering or denial-of-service
failures from corrupt persisted/provider records. The initial documentation
overstates one-tile prefetch, incremental progress rendering, and non-color-only
state distinction.

## Quality Gate Decision

The repository-level renderer-core gate does not pass at `cb34a48`. Findings
TS001-RENDER-001 through TS001-RENDER-004 require remediation and exact-source
reverification before client integration.

**Engineering Verification Status:** `REWORK REQUIRED`

## Registered Remediation Candidate

AU-CODEX-PRIMARY and AU-AGENT-004 prepared the following remediation without
altering the initial review disposition:

- TS001-RENDER-001: progress state now distinguishes committed value, pending
  value, and failed-save state; failed mark/unmark returns to committed
  geometry, while pending and error states use one versus two outlines and
  remain distinguishable without hue.
- TS001-RENDER-002: full overlay reconstruction and changed-cell updates now
  run incrementally under the frame budget; changed IDs are bounded to visible
  stitches, and each changed cell is cleared/redrawn without static content
  redraw.
- TS001-RENDER-003: summaries and returned tiles now fail closed for invalid
  bounds, identities, versions, ranges, duplicates, tile keys, ordering,
  coordinates, references, and response capacity before cache admission.
- TS001-RENDER-004: the last visible cell is calculated inclusively; exact
  boundaries, fractional coverage, edge clamping, and fully outside viewports
  are covered.

The remediation passes strict workspace typecheck, 10 domain tests, 15 importer
tests, 17 persistence tests, and 12 renderer tests. This is a remediation
candidate only. Finding disposition and Engineering Verification Status remain
owned by AU-AGENT-003 pending exact-source reverification.

## First Remediation Reverification

AU-AGENT-003 reverified exact commit
`bdaf3ed35d33560b180f385c114bc9f9d2cf606a` and confirmed local and remote
identity, a clean worktree, diff hygiene, strict typecheck, all 54 tests, and
the non-acceptance medium signal.

| Finding | Disposition |
| --- | --- |
| TS001-RENDER-001 | Resolved |
| TS001-RENDER-002 | Resolved |
| TS001-RENDER-003 | Partially Resolved |
| TS001-RENDER-004 | Resolved |

TS001-RENDER-003 remained High because symbol `sourceCode` and `visual` were not
fully runtime-validated before drawing and the tile/request limit had no
absolute ceiling. The quality gate remained `REWORK REQUIRED`; no separate new
finding was registered.

## Second Remediation Candidate

- `PatternSummary` now declares a bounded `stitchCount`.
- Every renderer-consumed symbol field is validated, including bounded IDs and
  source codes, the `text-code-point` and `generated` discriminants, one-code-
  point text values, font family, generator version, and ordinal.
- Palette colors and rendering-relevant string lengths fail closed before
  summary acceptance.
- A request spanning more than 500,000 tile coordinates is rejected before
  provider invocation.
- Tile count and stitch count are independently capped at 500,000 and at the
  declared summary count during response validation; empty returned tiles are
  rejected.
- Malformed-symbol, pre-provider absolute-request, and absolute-response
  regression tests are added.

The candidate passes 14 renderer tests. Exact-source AU-AGENT-003
reverification remains required before changing the Engineering Verification
Status.

## Second Remediation Reverification

AU-AGENT-003 reverified exact commit
`f3e2fdc59c15068faa383bae9e1de7a3226b5056`. Findings 001, 002, and 004
remained resolved. Finding 003 remained partially resolved only because
`PatternSummary.patternVersionId` was not checked against the registered 8,192
code-unit string limit. The reviewer independently confirmed request rejection
before provider invocation, empty-tile rejection, declared-count rejection, and
pre-draw malformed/unknown visual rejection. Engineering Verification Status
remained `REWORK REQUIRED`.

The reviewer also recorded defensive copy/freeze of validated provider data as
a hardening recommendation, not a mandatory repository-core finding, because
mutation requires an internal violation of readonly contracts.

## Final Narrow Remediation Candidate

- `patternVersionId` is now length-checked before trimming and summary
  acceptance.
- A dedicated oversized version-identity test proves rejection before any
  provider use.
- Empty-tile rejection is now part of the committed corrupt-provider regression
  matrix.

The candidate passes 15 renderer tests. Exact-source AU-AGENT-003
reverification remains required before the quality-gate status can change.
