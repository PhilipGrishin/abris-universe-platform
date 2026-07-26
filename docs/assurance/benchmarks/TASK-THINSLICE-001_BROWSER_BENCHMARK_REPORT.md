# TASK-THINSLICE-001 Browser Benchmark Report

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-TS001-002 |
| Title | TASK-THINSLICE-001 Browser Benchmark Report |
| Status | `[TESTED]`; measured profile passes listed budgets; registered reference and constrained profiles remain `[OPEN]` |
| Owner | AU-AGENT-004 and AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.2.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | Benchmark Plan v1.2.1; implementation commits `a8f764b28b774b783127abc63441bd9515a8768b`, `37e657eb6571c525154e07ed225d6b877358fb99`, and `d69b5c564cf17a042d2bf36ef1a864031e802676`; registered route-1 fixtures |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Fixture, browser, hardware, viewport, renderer, importer, persistence, budget, method, or source change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record reproducible browser measurements for the Phase 0 route-1 importer,
viewer, renderer, progress persistence, and 10,000-event reload. This report
does not silently promote the measured environment to the registered reference
or constrained profile.

## Scope and Environment

The measured device was a MacBook Pro `Mac15,3`, Apple M3 with eight CPU cores
and 8 GB memory, running macOS 26.5.2 on AC power. The browser reported
Chromium/Chrome 150.0.0.0, `MacIntel`, 1280×720 viewport, and DPR 2. The browser
reported eight logical cores, 8 GiB device memory, OffscreenCanvas, module
Worker, Web Locks, and IndexedDB support.

The registered reference viewport is 1365×768 at DPR 1, and the registered
constrained profile requires 4× CPU slowdown. Those two profiles were not
available through the controlled browser surface and remain open. Results
below are valid only for the recorded measured profile.

## Method

- Production-mode, clean-source builds were used.
- Cold imports delete only the benchmark origin's task-owned IndexedDB and
  local storage before every iteration.
- Minimal and 100,000-stitch medium OXS fixtures each ran for 30 cold imports.
- A project-original 10,000-event history was created through the real
  `ProjectService` and reloaded 30 times.
- A scripted 120-frame pan measured actual animation-frame intervals.
- Mark-to-paint and IndexedDB autosave used at least 100 samples per fixture.
- The corrupt fixture ran once through the real import Worker and returned the
  registered bounded error.
- Raw values are retained without outlier deletion.

## Results

| Metric | Minimal | Medium | Measured-profile disposition |
| --- | ---: | ---: | --- |
| Cold import p95 | 26.4 ms | 1,758.1 ms | Passes 750 / 3,000 ms budgets |
| Cold import maximum | 58.6 ms | 1,798.4 ms | Recorded, no samples removed |
| Viewer TTI p95 | 31.8 ms | 80.3 ms | Passes 750 / 2,000 ms budgets |
| Scripted pan frame p95 | 9.0 ms | 10.1 ms | Passes 18.2 ms budget |
| Frame intervals over 18.2 ms | 0 / 120 | 0 / 120 | 0% measured dropped-frame proxy |
| Mark-to-paint p95 | 1.1 ms | 0.4 ms | Passes 50 ms budget |
| Autosave commit p95 | 7.1 ms | 7.5 ms | Passes 100 / 150 ms budgets |
| 10,000-event reload p95 | 740.6 ms | Same seeded project | Passes 1,000 ms budget |
| Corrupt import | 10.9 ms, `OXS_XML_MALFORMED` | N/A | Rejected and contained |

The medium Worker render-work p95 during the scripted gesture was 2.0 ms
after bounded tile-raster caching. The pre-remediation browser run recorded
about 40 ms p95 Worker work and triggered the optimization; the failed result
was not discarded or represented as a pass.

The raw medium interaction artifact also contains 31 `long-task` entries:
one at 50 ms and 30 above 50 ms, with a maximum of 93 ms. The original capture
did not label which scenario phase produced each entry. They therefore cannot
be attributed to or excluded from the steady pan/zoom window, and this report
does not assign a pass or failure to the long-task budget.

Exact clean source `d69b5c5` added a targeted rerun that clears local
engineering evidence immediately before the scripted medium-pattern gesture.
That isolated 120-frame capture retained 120 ordered frame intervals, 85
Worker renderer samples, and zero long-task entries. Frame p95 was 8.5 ms,
maximum was 10.2 ms, and no frame exceeded the 18.2 ms budget. Worker renderer
p95 was 2.3 ms and maximum was 6.1 ms. This targeted result dispositions the
steady-gesture long-task scenario only. The historical combined-session
artifact and its 31 unattributed long tasks remain retained and unchanged.

The recorded main-thread heap signal rose from 50,468,280 bytes after the
scripted interaction to a 189,160,737-byte observed peak after the combined
interaction and 30 reload sequence. The 138,692,457-byte delta is about
132.3 MiB and is below the provisional 160 MiB medium retained-delta budget,
but it is not a forced-GC retained-heap measurement and excludes Worker,
Canvas, and GPU allocations.

The importer also enforces a deterministic preflight peak estimate for the
registered 100,000-stitch medium fixture: 100,374,296 bytes, about 95.7 MiB,
against the 256 MiB medium import budget. This is a conservative admission
bound enforced before parsing, not browser-reported import-Worker heap
telemetry. It must not be represented as measured Worker peak memory unless
AU-AGENT-003 explicitly accepts the estimator as sufficient evidence or an
approved limitation is registered.

## Budget Disposition

The listed latency and frame budgets pass on the measured profile. Full
TS001-IMPL-002 closure is not claimed because:

- the exact reference viewport/DPR profile was not run;
- the 4× constrained profile was not run;
- import-Worker peak memory was not available from the browser measurement;
- heap evidence is an observational upper signal, not a forced-GC retained
  allocation result.

These are evidence limitations, not assumed passes. AU-AGENT-003 reverified the
evidence at exact source `6da2f9e`, accepted the measured values within their
declared profile, and kept TS001-IMPL-002 mandatory. Exact source `d69b5c5`
subsequently isolates and dispositions the steady-gesture long-task scenario.
The missing profiles and Worker-memory evidence or approved limitation remain
subject to narrow AU-AGENT-003 reverification.

## Common Mistakes

- Do not compare the DPR 2 measured profile directly with a later DPR 1 run
  without recording the profile change.
- Do not treat Worker render work as the same metric as animation-frame
  interval.
- Do not treat JavaScript heap as total Canvas, Worker, or GPU memory.
- Do not infer the constrained-profile result from the unthrottled result.

## Review Checklist

- [x] Exact source and dirty state recorded.
- [x] Hardware, OS, power, browser, viewport, DPR, and capability path recorded.
- [x] Minimal and medium cold import samples retained.
- [x] At least 100 interaction samples retained per fixture.
- [x] 120 actual animation-frame intervals retained per fixture.
- [x] 10,000-event history and 30 reload samples retained.
- [x] Corrupt import result retained.
- [ ] Registered reference viewport and DPR run.
- [ ] Registered constrained profile run.
- [ ] Import-Worker peak memory measured.
- [x] Long-task evidence isolated and dispositioned for the scripted gesture.
- [x] AU-AGENT-003 independent review completed; finding remains partially resolved.

## References

- [Benchmark Plan](TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Raw Evidence Index](evidence/TASK-THINSLICE-001/README.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
