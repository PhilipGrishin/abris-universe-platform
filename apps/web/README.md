# Web Client Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-WEB-001 |
| Title | Web Client Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]`; underlying implementation Engineering Verification Status `VERIFIED WITH FINDINGS`; Completion Report v1.0.0 quality gate `REWORK REQUIRED` |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.4.0 |
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
- Bounded Worker tile-raster reuse for warm viewport movement, with an
  eight-entry and 128 MiB ceiling plus an absolute 2,048-device-pixel tile edge.
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
  Adding `&evidence-auto-pan=1` runs a 120-frame local scripted pan and records
  actual animation-frame intervals for dropped-frame analysis. The harness
  clears earlier import/initial-paint observations immediately before the
  scripted gesture so retained long-task records are attributable to that
  scenario.
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

The client tests cover viewport zoom invariants, bounded user messages,
one-based coordinates, and progress save/failure transitions. Registered
Chrome/macOS evidence covers Worker creation, Canvas pixels, IndexedDB reload
and close-tab/new-tab recovery, multi-tab stale-write behavior, the strict
click-versus-pan boundary, unreadable overview behavior, responsive layout,
and bounded accessibility state. Broader browsers, mobile/touch, safe real
quota exhaustion, eviction, and operating-system power loss remain unverified.

`build:benchmark` writes a separate production-mode harness to
`dist-benchmark`. It embeds only the project-original registered fixtures,
exercises 30 storage-reset cold imports per fixture plus a 10,000-event history
reload scenario, one corrupt-import containment path, a complete resource-entry
inventory, the same-origin app for exact-fixture interaction, and
disposable-origin transaction, Web Locks, and blocked-upgrade checks.
The complete benchmark output must never be deployed with the product SPA.
Its separate `accessibility.html` entry renders the real application with
grayscale and reduced-motion evidence modes and runs pinned axe-core against
the resulting browser document; axe-core is not imported by the product entry.

## Limits

This stage does not add a backend, synchronization, accounts, multi-format
import, undo/redo, production deployment, or a 500,000-stitch performance
claim. `pnpm rehearse:deploy` only compiles and inspects a local Worker bundle;
it has no production route or deploy command. OffscreenCanvas capability
changes only the static rendering execution path; the incremental main-thread
fallback preserves symbols and interaction. The registered Chrome 150/macOS
26.5.2 evidence does not establish cross-browser, mobile, touch, production,
or project `[VERIFIED]` status.

## Lifecycle and Additions

AU-AGENT-006 adds client code only after its upstream contracts and task gates
permit implementation. Every addition must preserve UI/business separation,
declare Documentation Impact, add proportionate tests, and route engineering
evidence to AU-AGENT-003.

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../docs/SOURCE_OF_TRUTH.md)
- [Client Lead Definition](../../.codex/agents/definitions/au-agent-006-mobile-web-client-lead.md)
