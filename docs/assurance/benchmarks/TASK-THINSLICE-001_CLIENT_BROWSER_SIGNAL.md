# TASK-THINSLICE-001 Client Browser Signal

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-TS001-CLIENT-001 |
| Title | TASK-THINSLICE-001 Client Browser Signal |
| Status | `[IMPLEMENTED]`, `[TESTED]`; non-gate engineering signal |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.0.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | TASK-THINSLICE-001 Benchmark Plan; implementation commit `fc50d664b97f51118f5dd88f7d9eb0a28fa771a4`; route-1 fixture manifest |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Client, importer Worker, renderer, persistence, fixture, browser profile, benchmark method, or result change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record the first production-build browser integration signal for the approved
minimal and 100,000-stitch route-1 fixtures. This record proves that the
measurement path works; it is not the controlled multi-run performance result
required by the Benchmark Plan and assigns no performance acceptance.

## Scope and Source

- Exact implementation commit:
  `fc50d664b97f51118f5dd88f7d9eb0a28fa771a4`.
- Vite 8.1.5 production build served by local `vite preview`.
- URL flag `?engineering-evidence=1`; records stayed in the local browser
  console and no analytics or remote transport was used.
- Codex in-app browser at 1280×720 CSS pixels and approximately 2 device
  pixels per CSS pixel, inferred from the 1154×444.398 Canvas CSS box and
  2312×892 backing bitmap.
- Exact Chromium version, hardware, power state, background workload, and
  memory profile were unavailable and are therefore `[OPEN]`.
- Renderer path: incremental main-thread Canvas2D. Import parsing and tile
  construction used the dedicated module Worker.

## Datasets

| Fixture | SHA-256 | Bytes | Grid | Stitches |
| --- | --- | ---: | --- | ---: |
| `minimal-full-cross.oxs` | `912fc540e3d92e789c6c5bf94ccf89079773bc578a3b6db594b05708290e818d` | 2,063 | 7×5 | 5 |
| `medium-full-cross.oxs` | `1211319f5cb392b2c0b9c401d6898e6c18564d90c218035d274d96bcdc2aa167` | 4,308,166 | 512×256 | 100,000 |

Both fixtures are project-original and registered by the route-1 fixture
provenance record.

## Results

| Metric | Minimal | Medium | Disposition |
| --- | ---: | ---: | --- |
| Import latency, one run | 186.6 ms | 1,814.7 ms | Below provisional single-run target; not p95 |
| Viewer TTI, one warm-browser run | 73.1 ms | 27.8 ms | Diagnostic only; cold/warm samples not separated sufficiently |
| Mark-to-paint, one run | 3.7 ms | 1.8 ms | Below provisional single-run target; not p95 |
| Autosave commit, one run | 14.6 ms | 15.5 ms | Below provisional single-run target; not p95 |
| Medium pan renderer work | Not run | 20 samples: median 4.6 ms, p95 5.4 ms, max 7.2 ms | Renderer work duration, not full frame interval or dropped-frame ratio |

The medium initial viewport loaded 6 of 128 non-empty tiles and drew 6,144
visible/prefetch stitches rather than querying all 100,000 stitches for each
frame.

## Functional Browser Evidence

- Dedicated Worker import completed for minimal and medium fixtures.
- Corrupt truncated OXS produced a bounded user-facing alert and no browser
  console error.
- Separate static and progress Canvas elements rendered one visible tile for
  the minimal fixture.
- Pointer mark, reload, pointer unmark, keyboard mark, and automatic save were
  observed with one-based accessible stitch status.
- Overview at 54% exposed “Zoom in to read symbols and mark stitches” and
  ignored keyboard toggle.
- A stale second-tab toggle failed closed as `Not saved`; reload rebuilt the
  current projection and allowed the next valid command.
- A 390×844 viewport retained semantic controls and no document horizontal
  overflow.

The visual artifact is indexed under
[`evidence/TASK-THINSLICE-001/`](evidence/TASK-THINSLICE-001/).

## Limitations

- One import/TTI/mark/save sample per fixture is not a distribution.
- The 20 pan samples measure renderer work, not requestAnimationFrame interval,
  dropped frames, long tasks, or input latency.
- No 4× CPU throttling, memory measurement, 30 cold runs, 100 warm
  interactions, confidence interval, screen-reader session, browser matrix, or
  10,000-event history fixture was performed.
- Exact browser and hardware versions were not exposed by the test surface.
- The run does not prove 500,000-stitch support or satisfy Prototype 9.1.

## Quality Gate

AU-AGENT-003 review is pending. This report must not be cited as a controlled
benchmark pass or project `[VERIFIED]`.

Subsequent client hardening commit
`3a737484e0084e26d9576b4ef1d43b384adf873a` added an idempotent Canvas
backing-store resize regression. These numerical samples were not repeated and
remain attributable only to the exact source commit recorded above.

## References

- [Benchmark Plan](TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Raw Signal](evidence/TASK-THINSLICE-001/client-browser-signal-fc50d66.json)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Client Implementation Review](../../reviews/technical/TASK-THINSLICE-001/CLIENT_INTEGRATION_IMPLEMENTATION_REVIEW.md)
- [Benchmark Index](README.md)
