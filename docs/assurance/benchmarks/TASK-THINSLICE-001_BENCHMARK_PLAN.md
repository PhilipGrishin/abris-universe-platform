# TASK-THINSLICE-001 Benchmark Plan

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-TS001-001 |
| Title | TASK-THINSLICE-001 Phase 0 Benchmark Plan |
| Status | `[PROPOSED]`; architecture disposition `ACCEPTED_WITH_GATES`; no benchmark result exists |
| Owner | AU-AGENT-004 for import/rendering and AU-AGENT-006 for client interaction |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.1.1 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Fixture, target browser/device, renderer, importer, storage, budget, method, or implementation change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Define reproducible Phase 0 measurements and provisional engineering budgets.
This plan makes no performance claim; results require later implementation
evidence.

## Scope

Measure OXS import, initial viewer readiness, zoom/pan, mark-to-paint,
autosave commit latency, long tasks, and memory on the required small and medium
project-original fixtures. The separate 500,000-stitch Prototype 9.1 remains a
future scale gate and is not replaced by the medium test.

## Datasets

| Dataset | Required content | Purpose |
| --- | --- | --- |
| `minimal-full-cross` | Project-original non-square OXS, four distinct corner pairs, asymmetric interior stitch, at least 8 symbols/colors, no unsupported content | Coordinate correctness and minimum-flow timing |
| `medium-full-cross` | Deterministically generated project-original OXS, 100,000 full-cross stitches, at least 32 symbols/colors, sparse and dense tiles | Early rendering and memory signal |
| `corrupt-truncated` | Project-original truncated OXS | Failure timing and UI containment |
| `progress-history-10k` | Project-original Project with 10,000 valid ordered progress events | Reload, projection rebuild, and recovery timing |

Every dataset must record generator/source, SHA-256, byte size, grid, counts,
expected canonical hash, and rights statement.

## Environments

### Reference desktop profile

The gate reference class is fixed before results:

- at least 4 logical CPU cores available to the browser;
- at least 8 GiB system memory;
- current stable Chromium on a supported desktop OS;
- 1365×768 viewport at device-pixel-ratio 1;
- AC power / performance mode and no CPU throttling;
- production build with no unrelated extension or background workload.

For every run, record:

- hardware model, CPU, memory, OS and power mode;
- browser name and exact version;
- viewport and device-pixel-ratio;
- whether OffscreenCanvas path is active;
- cold/warm cache state;
- build source commit and production build mode.

The first accepted run names one machine within this fixed class as the
repeatable reference device. Changing the class requires review. CI results are
regression signals, not substitutes for the controlled device profile.

### Constrained profile

Run Chromium with 4× CPU slowdown and a constrained viewport against the
production build. Record browser/tool version and throttling configuration.
This is a repeatable proxy, not a claim about every budget device.

### Browser coverage

Functional checks cover the supported browser matrix established during
implementation. Performance gate numbers are compared only within the same
recorded browser/profile.

## Metrics

| Metric | Start | End | Report |
| --- | --- | --- | --- |
| Import latency | user confirms file | canonical commit and report available | median, p95, max |
| Viewer time-to-interactive | Project open starts | first visible symbols painted and controls respond | median, p95 |
| Pan/zoom frame time | scripted viewport gesture starts | each animation frame | p50, p95, worst, dropped-frame ratio |
| Mark latency | pointer/keyboard activation | changed overlay painted | median, p95, max |
| Autosave latency | progress command created | IndexedDB transaction completes | median, p95, max |
| Long task count | scenario start | scenario end | count and longest duration |
| Peak memory | before scenario baseline | scenario completion | peak and retained delta |
| Reload with history | navigation start with a 10,000-event Project | projection verified and viewer interactive | median, p95, max |

Gate latency scenarios use at least 100 measured iterations after warm-up.
Cold import and reload scenarios use at least 30 independent runs and report a
confidence interval in addition to median/p95/max. Import cold runs reload the
page and clear only task-owned test storage between iterations.

## Provisional Budgets

These are design targets subject to the first controlled baseline. A proposed
change requires evidence and architecture review.

| Metric | Minimal fixture | Medium fixture | Constrained profile |
| --- | ---: | ---: | ---: |
| Import p95 | <= 750 ms | <= 3,000 ms | <= 6,000 ms medium |
| Viewer TTI p95 | <= 750 ms | <= 2,000 ms | <= 4,000 ms medium |
| Pan/zoom frame p95 | <= 18.2 ms | <= 18.2 ms | <= 33.3 ms |
| Dropped-frame ratio | < 5% | < 5% | < 10% |
| Mark-to-paint p95 | <= 50 ms | <= 50 ms | <= 100 ms |
| Autosave commit p95 | <= 100 ms | <= 150 ms | <= 300 ms |
| Main-thread long tasks >50 ms | 0 during steady pan/zoom | 0 during steady pan/zoom | <= 1 per scripted gesture |
| Retained memory delta after open | <= 40 MiB | <= 160 MiB | Record only |
| Import-worker peak memory | <= 96 MiB | <= 256 MiB | <= 384 MiB provisional hard preflight budget |
| 10,000-event reload p95 | <= 1,000 ms | <= 1,000 ms | <= 2,000 ms |

Meeting these budgets does not prove the 500,000-stitch requirement. Missing a
budget blocks completion unless AU-AGENT-003 accepts a documented finding and
the authorized owner accepts any resulting scope or product impact.

## Method

1. Use a production build with source maps controlled consistently.
2. Verify fixture hashes and expected counts before each run.
3. Disable unrelated extensions and background work.
4. Warm the renderer once for interaction measurements.
5. Script identical pan/zoom paths and toggle coordinates.
6. Use browser performance APIs for marks/measures and frame sampling.
7. Capture raw machine-readable results plus a summarized report.
8. Repeat after reload for persistence and cold-start paths.
9. Compare only like-for-like environment records.
10. Record failures and outliers; do not delete inconvenient samples.

## Required Result Record

The later benchmark report must include:

- source commit and build identity;
- fixture hashes and sizes;
- environment;
- method and iteration count;
- raw result artifact location;
- summary statistics and variance;
- budget disposition;
- profiler evidence for failures;
- limitations and known noise;
- reviewer and Quality Gate Decision.

## Risks and Limitations

- Browser automation timing can be noisy.
- JavaScript heap metrics do not include every graphics allocation.
- CPU throttling is a proxy, not physical low-end hardware.
- Font loading can distort cold viewer measurements and must be reported.
- A medium fixture is only an early signal for Prototype 9.1.

## Review Checklist

- [ ] Fixtures are project-original and checksum-registered.
- [ ] Hardware, browser, build, and capability path are recorded.
- [ ] Raw samples are retained.
- [ ] Cold and warm states are not mixed.
- [ ] UI responsiveness and persistence are measured independently.
- [ ] Import-worker and 10,000-event reload budgets are measured.
- [ ] No target is changed after observing a failure without review.
- [ ] AU-AGENT-003 independently reviews evidence.

## References

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Benchmark Index](README.md)
- [Technical Review](../../reviews/technical/TASK-THINSLICE-001/TECHNICAL_REVIEW.md)
- [Independent Pre-Implementation Architecture Review](../../../product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md)
- [Independent Design Revision Confirmation](../../../product/reviews/TASK-THINSLICE-001_Design_Revision_Confirmation.md)
