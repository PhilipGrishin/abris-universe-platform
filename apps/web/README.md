# Web Client Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-WEB-001 |
| Title | Web Client Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]`; consolidated Engineering Verification Status `REWORK REQUIRED`; renderer capability remediation candidate pending reverification |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.3.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-26 |
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
- Separate static and progress Canvas2D layers. The primary supported path
  renders validated static scenes in an OffscreenCanvas module Worker, while
  progress and hit testing retain the canonical core contracts.
- Bounded glyph bitmap atlas keyed by glyph, font, color, zoom bucket, and
  device-pixel-ratio; a forced engineering-evidence main-thread mode exercises
  the incremental fallback.
- Pointer drag pan, toolbar and keyboard pan/zoom, 6-pixel click-versus-pan
  threshold, and non-interactive overview below the readable symbol threshold.
- Serialized mark/unmark commands with visible `saving`, `saved`, `not saved`,
  and read-only states.
- Accessible Canvas name, one-based selected-stitch status, real DOM controls,
  focus treatment, reduced-motion support, and mobile layout rules.
- Opt-in local engineering timings through
  `?engineering-evidence=1`; bounded records are written to the browser
  console, retained in tab-scoped session storage, exposed through the hidden
  machine-readable `#engineering-evidence-json` output, and never transmitted.
- Static Cloudflare Worker asset boundary with SPA fallback, GET/HEAD-only
  handling, reviewed CSP, `nosniff`, and no-referrer response headers.
- Non-secret build provenance in generated `version.json`, verified
  content-hashed assets, and a Wrangler dry-run bundle that does not deploy.

## Run and Verify

```sh
pnpm --filter @abris-universe/web dev
pnpm --filter @abris-universe/web typecheck
pnpm --filter @abris-universe/web test
pnpm --filter @abris-universe/web build
pnpm --filter @abris-universe/web build:benchmark
pnpm --filter @abris-universe/web preview
pnpm build
pnpm rehearse:deploy
```

The client tests cover viewport zoom invariants, bounded user messages, one-based
coordinates, and progress save/failure transitions. Browser verification is
required for Worker creation, Canvas pixels, IndexedDB reload recovery,
multi-tab stale-write behavior, responsive layout, and accessibility state.

`build:benchmark` writes a separate production-mode harness to
`dist-benchmark`. It embeds only the project-original registered fixtures,
exercises 30 storage-reset cold imports per fixture plus a 10,000-event history
reload scenario, exposes the same-origin app for exact-fixture interaction, and
includes disposable-origin transaction, Web Locks, and blocked-upgrade checks.
The complete benchmark output must never be deployed with the product SPA.

## Limits

This stage does not add a backend, synchronization, accounts, multi-format
import, undo/redo, production deployment, or a 500,000-stitch performance
claim. `pnpm rehearse:deploy` only compiles and inspects a local Worker bundle;
it has no production route or deploy command. OffscreenCanvas capability
changes only the static rendering execution path; the incremental main-thread
fallback preserves symbols and interaction. Controlled browser benchmark and
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
