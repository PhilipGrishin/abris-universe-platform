# Web Client Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-WEB-001 |
| Title | Web Client Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]`; independent engineering verification pending |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Client implementation; workspace boundary change; platform change; public contract change |

## Purpose and Scope

Provide the approved Phase 0 local-first web flow: import one registered OXS
route-1 file, open the Project, render visible tiles and readable symbols,
zoom/pan, toggle one full-cross stitch, autosave, and recover after reload.

## Implemented Boundary

- React/Vite SPA with no backend or analytics endpoint.
- Dedicated module Worker for OXS parsing, canonical mapping, hashing, and tile
  construction; there is no UI-thread parser fallback.
- Exact public importer, renderer, and persistence package contracts.
- Native IndexedDB import lifecycle, retained original Blob, ready Project,
  bounded visible-tile reads, and projection rebuild on reload.
- Separate static and progress Canvas2D layers with incremental frame budgets.
- Pointer drag pan, toolbar and keyboard pan/zoom, 6-pixel click-versus-pan
  threshold, and non-interactive overview below the readable symbol threshold.
- Serialized mark/unmark commands with visible `saving`, `saved`, `not saved`,
  and read-only states.
- Accessible Canvas name, one-based selected-stitch status, real DOM controls,
  focus treatment, reduced-motion support, and mobile layout rules.
- Opt-in local engineering timings through
  `?engineering-evidence=1`; records are written only to the browser console
  and are never transmitted.

## Run and Verify

```sh
pnpm --filter @abris-universe/web dev
pnpm --filter @abris-universe/web typecheck
pnpm --filter @abris-universe/web test
pnpm --filter @abris-universe/web build
pnpm --filter @abris-universe/web preview
```

The client tests cover viewport zoom invariants, bounded user messages, one-based
coordinates, and progress save/failure transitions. Browser verification is
required for Worker creation, Canvas pixels, IndexedDB reload recovery,
multi-tab stale-write behavior, responsive layout, and accessibility state.

## Limits

This stage does not add a backend, synchronization, accounts, multi-format
import, undo/redo, production deployment, or a 500,000-stitch performance
claim. The current renderer execution path is incremental main-thread Canvas2D;
the dedicated Worker applies to import. Controlled browser benchmark and
assistive-technology matrices remain independent evidence gates.

## Lifecycle and Additions

AU-AGENT-006 adds client code only after its upstream contracts and task gates
permit implementation. Every addition must preserve UI/business separation,
declare Documentation Impact, add proportionate tests, and route engineering
evidence to AU-AGENT-003.

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../docs/SOURCE_OF_TRUTH.md)
- [Client Lead Definition](../../.codex/agents/definitions/au-agent-006-mobile-web-client-lead.md)
