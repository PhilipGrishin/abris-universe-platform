# ADR-TS001-002 — Tiled Canvas2D Rendering

| Field | Value |
| --- | --- |
| Document ID | ADR-TS001-002 |
| Title | Tiled Canvas2D Rendering Behind a Stable Renderer Interface |
| Status | `[PROPOSED]`; independent architecture disposition `ACCEPTED_WITH_GATES` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Independent Architecture Review | `AU-EX-20260725-005`; `ACCEPTED_WITH_GATES` |
| Security Review | `AU-REVIEW-ENG-TS001-SEC-001`; `VERIFIED WITH FINDINGS` for design scope |
| Version | 1.1.1 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Benchmark failure; 500k prototype result; browser capability change; renderer contract or accessibility change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Context

The Phase 0 viewer must render symbols, zoom and pan smoothly, and prove tiled
rendering from the first slice without adding WebGL complexity before evidence
requires it.

## Problem

A per-stitch DOM tree or whole-pattern redraw on each frame does not provide a
credible path to large patterns. Directly coupling React components to drawing
logic would also prevent independent rendering tests and future renderer
replacement.

## Decision

Use 32×32-cell storage tiles and Canvas2D behind a `PatternRenderer` interface.
The client requests only visible tiles plus one-tile prefetch. Static pattern
content and dynamic progress overlay are independently invalidated. Glyphs are
cached in an atlas by zoom bucket and device-pixel-ratio.

Use OffscreenCanvas in a worker when supported and an incremental main-thread
Canvas2D fallback otherwise. Keep WebGL outside Phase 0 while preserving the
renderer interface as the replacement seam.

No stitch is a DOM node. Accessibility is supplied through real DOM controls
and an accessible representation of the current chart and selected stitch.
Readable mode, glyph/background contrast, non-color-only progress states,
one-based user-facing coordinates, and tap-versus-pan discrimination are
binding functional renderer/client contracts in the Technical Design.

## Alternatives

1. SVG or DOM per stitch. Rejected for scale and interaction cost.
2. One monolithic Canvas redraw. Rejected because it violates the task's tiled
   rendering constraint.
3. WebGL immediately. Deferred because Phase 0 evidence does not yet justify
   its complexity.
4. OffscreenCanvas only. Rejected because supported-browser fallback is needed.

## Consequences

- Viewport work is bounded by visible tiles.
- Progress toggles do not rebuild the immutable pattern layer.
- Renderer behavior can be golden-tested independently from React.
- A future WebGL implementation can preserve the client/provider contract.
- Initial tile size is a measured tuning parameter, not a domain invariant.

## Risks

- Canvas text metrics may differ by browser.
- Main-thread fallback may miss performance budgets on low-end devices.
- Canvas accessibility requires deliberate companion DOM behavior.

## Migration

Tile storage declares tile size and encoding version. A later tile-size or
encoding change rebuilds tiles from immutable canonical Pattern data without
changing domain identity or progress.

## Rollback

Canvas renderer changes can roll back behind the stable interface. Stored
Pattern and Progress records remain unchanged. A renderer release must not
require destructive local-data migration.

## Affected Modules and Contracts

- `packages/renderer`
- `packages/persistence` tile provider
- `apps/web` viewport and accessibility adapter
- benchmark and rendering-golden suites

## Verification and Evidence

Required evidence includes visible-tile query tests, hit-test tests, rendering
goldens, main-thread and OffscreenCanvas capability paths, frame/latency
measurements on both required fixtures, and accessibility review.

## Traceability

- TASK-THINSLICE-001 FR-03 through FR-05, sections 19, 24, 26, 27
- Product architecture proposal ADR-002
- TRACE-DESIGN-TS001

## Review History

- 2026-07-25: Initial proposal by AU-AGENT-004. Approval pending.
- 2026-07-25: Claude Cowork independent architecture review
  `AU-EX-20260725-005` dispositioned this ADR `ACCEPTED_WITH_GATES`; R-5 and
  N-7 are integrated in version 1.1.0. Benchmark evidence and AU-AGENT-003
  security review were open at that review stage.
- 2026-07-25: AU-AGENT-003 report `AU-REVIEW-ENG-TS001-SEC-001` records
  `VERIFIED WITH FINDINGS` for the design-only security scope and closes the
  security-review component of TD-GATE-004. Benchmark and implementation
  evidence remain open.
