# Renderer Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-RENDER-001 |
| Title | Renderer Workspace |
| Status | Renderer core `[IMPLEMENTED]`, `[TESTED]`; repository-level Engineering Verification Status `VERIFIED`; browser capability remediation candidate `[IMPLEMENTED]`, `[TESTED]` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.3.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-26 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-002 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Renderer implementation; public renderer contract change; benchmark or accessibility result |

## Purpose and Scope

Provide the platform-independent Phase 0 renderer core for tile construction,
visible-set calculation, deterministic Canvas2D-contract drawing, progress
overlay invalidation, and canonical-cell hit testing.

## Implemented Boundary

- Builds deterministic 32×32 tiles sorted by local cell index and omits empty
  tiles.
- Requests only the visible viewport plus one-tile prefetch through
  `PatternTileProvider` and discards aborted or stale results.
- Separates static-pattern and progress-overlay draw paths.
- Budgets both full progress reconstruction and changed-cell redraws
  incrementally without invalidating static stitch content.
- Uses readable and overview modes at the 16 CSS-pixel threshold.
- Selects black or white symbol treatment with a calculated minimum 4.5:1
  contrast ratio.
- Converts screen points to canonical zero-based cells for tile-local hit
  testing and disables hit testing in overview mode.
- Provides an explicit OffscreenCanvas/Worker capability decision and an
  incremental main-thread frame-budget fallback.
- Exposes a validated static scene and a progress-only render path so the
  browser adapter can render the static layer in a Worker without moving
  hit-testing or progress semantics out of the core.
- Accepts a platform-owned glyph atlas contract and falls back to direct text
  drawing only when the platform atlas cannot draw.
- Uses no DOM node per stitch and does not mutate Pattern, PatternVersion,
  Project, or Progress.
- Rejects invalid summaries and corrupt, duplicate, mis-keyed, out-of-range,
  broken-reference, unsorted, or over-returned provider tiles before caching.
- Requires declared stitch count, validates symbol visuals before drawing, and
  enforces the Phase 0 absolute 500,000 tile-request/stitch-response ceilings.

## Evidence

- `pnpm --filter @abris-universe/renderer typecheck`
- `pnpm --filter @abris-universe/renderer test`
- `pnpm --filter @abris-universe/renderer measure:medium`
- `docs/reviews/technical/TASK-THINSLICE-001/RENDERER_IMPLEMENTATION_REVIEW.md`

The medium-fixture command is a Node renderer-core regression signal. It is not
a browser frame-time result or performance acceptance.

## Explicit Non-Claims

This package does not implement the browser Canvas adapter, Worker lifecycle,
React/client gesture arbitration, companion accessible DOM, rendering golden
screenshots, or browser performance matrix. The web package supplies the
OffscreenCanvas Worker and glyph bitmap atlas implementations. Controlled
evidence remains separate. This package makes no exact symbol-fidelity claim
outside the registered route-1 literal-symbol profile.

## Lifecycle and Additions

Changes must preserve the approved tiling and readonly provider contracts,
separation from UI and domain mutation, deterministic behavior, accessibility
integration seams, bounded work, Documentation Impact, and independent
engineering review. Public contract, tile encoding, readability threshold,
progress-state rendering, or execution-path changes require Technical Design
and ADR review.

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Tiled Rendering ADR](../../docs/architecture/adr/ADR-TS001-002-tiled-canvas-rendering.md)
- [Benchmark Plan](../../docs/assurance/benchmarks/TASK-THINSLICE-001_BENCHMARK_PLAN.md)
