# Renderer Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-RENDER-001 |
| Title | Renderer Workspace |
| Status | Renderer core `[IMPLEMENTED]`, `[TESTED]`; browser integration and performance acceptance `[OPEN]` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
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
- Uses readable and overview modes at the 16 CSS-pixel threshold.
- Selects black or white symbol treatment with a calculated minimum 4.5:1
  contrast ratio.
- Converts screen points to canonical zero-based cells for tile-local hit
  testing and disables hit testing in overview mode.
- Provides an explicit OffscreenCanvas/Worker capability decision and an
  incremental main-thread frame-budget fallback.
- Uses no DOM node per stitch and does not mutate Pattern, PatternVersion,
  Project, or Progress.

## Evidence

- `pnpm --filter @abris-universe/renderer typecheck`
- `pnpm --filter @abris-universe/renderer test`
- `pnpm --filter @abris-universe/renderer measure:medium`
- `docs/reviews/technical/TASK-THINSLICE-001/RENDERER_IMPLEMENTATION_REVIEW.md`

The medium-fixture command is a Node renderer-core regression signal. It is not
a browser frame-time result or performance acceptance.

## Explicit Non-Claims

This package does not implement the browser Canvas adapter, glyph bitmap atlas,
OffscreenCanvas Worker transport, React/client gesture arbitration, companion
accessible DOM, rendering golden screenshots, or browser performance matrix.
Those items remain mandatory later integration evidence. It makes no exact
symbol-fidelity claim outside the registered route-1 literal-symbol profile.

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
