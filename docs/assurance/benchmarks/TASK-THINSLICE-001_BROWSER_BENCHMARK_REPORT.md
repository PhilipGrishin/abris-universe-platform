# TASK-THINSLICE-001 Browser Benchmark Report

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-TS001-002 |
| Title | TASK-THINSLICE-001 Browser Benchmark Report |
| Status | `[TESTED]`; registered profile performance evidence independently accepted within documented boundaries |
| Owner | AU-AGENT-004 and AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.8.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | Benchmark Plan v1.2.3; AU-BENCH-TS001-LIM-001; implementation commits `a8f764b28b774b783127abc63441bd9515a8768b`, `37e657eb6571c525154e07ed225d6b877358fb99`, `d69b5c564cf17a042d2bf36ef1a864031e802676`, exact evidence sources `40099443d156bcc2497e57e06528772be57e601b` and `d36a8272b808f862ad6aa5d4a774a71b337432f4`, evidence packages `043023999558f7d76f95b8552fe0e8b1923133f0` and `15ea8f9304d787aff604598f69e2e8551f5761cb`, and Engineering Verification Report v1.4.0; registered route-1 fixtures |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Fixture, browser, hardware, viewport, renderer, importer, persistence, budget, method, or source change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record reproducible browser measurements for the Phase 0 route-1 importer,
viewer, renderer, progress persistence, and 10,000-event reload. Profile
results remain separate and are compared only with their registered budgets.

## Scope and Environment

The measured device was a MacBook Pro `Mac15,3`, Apple M3 with eight CPU cores
and 8 GB memory, running macOS 26.5.2 on AC power. The browser reported
Chromium/Chrome 150.0.0.0, `MacIntel`, 1280×720 viewport, and DPR 2. The browser
reported eight logical cores, 8 GiB device memory, OffscreenCanvas, module
Worker, Web Locks, and IndexedDB support.

Later exact-source evidence uses the same hardware and browser with an explicit
1365×768 viewport override at DPR 1. The reference profile used no CPU
throttling. The constrained profile used Chrome DevTools 4× CPU slowdown,
confirmed by the Project Owner before capture, on one preserved inspected tab
across the gesture and cold-import/reload navigation. The browser evidence API
does not expose the active multiplier, so the owner confirmation and target
continuity are retained in the profile manifest. DevTools throttling remains a
host-relative proxy, not a claim about a specific mobile architecture.

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
- Reference and constrained interaction captures retained at least 100
  mark-to-paint and autosave samples.
- Reference and constrained isolated gestures clear task-owned evidence
  immediately before their 120-frame scenario.
- For each 30-run cold-import and reload distribution, the report retains
  median, p95, maximum, arithmetic mean, and a two-sided 95% Student-t
  confidence interval for the mean (`n = 30`, `df = 29`, `t = 2.045`).
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

### Registered Reference Profile

| Metric | Result | Reference budget | Disposition |
| --- | ---: | ---: | --- |
| Minimal cold import p95, 30 runs | 124.3 ms | <= 750 ms | Pass |
| Medium cold import p95, 30 runs | 1,751.6 ms | <= 3,000 ms | Pass |
| Minimal Viewer TTI p95, 100 reloads | 20.8 ms | <= 750 ms | Pass candidate |
| Medium Viewer TTI p95, 100 reloads | 119.7 ms | <= 2,000 ms | Pass candidate |
| Medium scripted-pan frame p95, 120 frames | 9.1 ms | <= 18.2 ms | Pass |
| Frames over 18.2 ms | 0 / 120, 0% | < 5% | Pass |
| Steady-gesture long tasks | 0 | 0 | Pass |
| Medium mark-to-paint p95, 115 samples | 7.9 ms | <= 50 ms | Pass |
| Medium autosave p95, 141 samples | 18.4 ms | <= 150 ms | Pass |
| Minimal retained main-thread heap delta | -45,690,440 bytes | <= 40 MiB | Recorded; signed/no forced GC |
| Medium retained main-thread heap delta | -2,704,563 bytes | <= 160 MiB | Recorded; signed/no forced GC |
| 10,000-event reload p95, 30 runs | 542.1 ms | <= 1,000 ms | Pass |
| Corrupt import | 14.7 ms, `OXS_XML_MALFORMED` | Rejected and contained | Pass |

Reference Worker renderer work during the isolated gesture retained 98 samples:
p95 1.7 ms and maximum 2.8 ms. The combined reference interaction capture
contains four long tasks outside the isolated gesture. They are retained, not
deleted, and are not represented as steady-gesture events.

### Registered 4× Constrained Profile

| Metric | Result | Constrained budget | Disposition |
| --- | ---: | ---: | --- |
| Medium cold import p95, 30 runs | 2,648.6 ms | <= 6,000 ms | Pass |
| Medium Viewer TTI p95, 100 reloads | 130.5 ms | <= 4,000 ms | Pass candidate |
| Medium scripted-pan frame p95, 120 frames | 24.1 ms | <= 33.3 ms | Pass |
| Frames over 18.2 ms | 7 / 120, 5.83% | < 10% | Pass |
| Steady-gesture long tasks | 0 | <= 1 | Pass |
| Medium mark-to-paint p95, 111 samples | 9.3 ms | <= 100 ms | Pass |
| Medium autosave p95, 111 samples | 34.0 ms | <= 300 ms | Pass |
| Medium retained main-thread heap delta | 48,271,971 bytes | Record only | Recorded; signed/no forced GC |
| 10,000-event reload p95, 30 runs | 1,866.6 ms | <= 2,000 ms | Pass |
| Corrupt import | 29.8 ms, `OXS_XML_MALFORMED` | Rejected and contained | Pass |

The constrained isolated gesture retained one completed Worker-render sample
at 2.3 ms because viewport updates cancelled stale intermediate Worker
responses; the 120 main-thread frame intervals remain the registered gesture
metric. The combined constrained interaction capture contains four long tasks
outside the isolated gesture. The constrained cold import remained within its
profile budget; the raw Worker timings are retained without claiming that
DevTools applies an identical multiplier to every Worker execution context.

### Registered Distribution Statistics

| Profile and scenario | Median | p95 | Maximum | Mean and 95% CI |
| --- | ---: | ---: | ---: | ---: |
| Reference minimal cold import | 31.4 ms | 124.3 ms | 135.4 ms | 41.1 ms [30.9, 51.3] |
| Reference medium cold import | 1,618.4 ms | 1,751.6 ms | 1,803.5 ms | 1,621.9 ms [1,599.1, 1,644.6] |
| Reference 10,000-event reload | 390.4 ms | 542.1 ms | 606.7 ms | 406.5 ms [387.9, 425.1] |
| Constrained minimal cold import | 29.7 ms | 71.8 ms | 85.1 ms | 35.5 ms [30.2, 40.8] |
| Constrained medium cold import | 2,367.3 ms | 2,648.6 ms | 2,741.2 ms | 2,402.8 ms [2,353.8, 2,451.9] |
| Constrained 10,000-event reload | 1,679.7 ms | 1,866.6 ms | 1,911.8 ms | 1,700.4 ms [1,675.5, 1,725.3] |

Confidence intervals are descriptive uncertainty for the observed host-relative
distributions. Budget disposition continues to use the registered p95 metric.

### Supplemental Viewer TTI and Heap Evidence

Exact clean source `d36a827` adds schema-v2 opt-in evidence fields for
baseline, current, peak, signed retained heap delta, and heap sample count. It
does not change product behavior or production network activity.

The reference profile retains 100 minimal and 100 medium warm local-Project
reloads. Minimal Viewer TTI median/p95/maximum are 12.05/20.8/311.0 ms.
Medium values are 74.95/119.7/361.7 ms. Both p95 values are below their
registered 750 ms and 2,000 ms budgets.

The owner-confirmed 4× constrained profile retains 100 medium reloads with
Viewer TTI median/p95/maximum of 101.65/130.5/151.0 ms, below the 4,000 ms
budget. The same retained Chrome tab and source were used; only the evidence
run identifier changed after owner confirmation.

Reference minimal and medium signed main-thread retained deltas are
-45,690,440 and -2,704,563 bytes. The constrained medium delta is 48,271,971
bytes, about 46.0 MiB. Baseline, current, peak, sample count, and signed delta
are retained in the raw artifacts. Negative values are not clamped: they expose
garbage-collection/process noise instead of manufacturing a zero. Chromium
`usedJSHeapSize` excludes Worker, Canvas, and GPU allocation, and no forced
garbage collection was available. These are registered main-thread heap
signals, not import-Worker peak-memory evidence.

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
an observed Worker-memory artifact is produced.

### Owner-Approved Phase 0 Import-Worker Memory Limitation

The Project Owner approved
[AU-BENCH-TS001-LIM-001](TASK-THINSLICE-001_IMPORT_WORKER_MEMORY_LIMITATION.md)
on 2026-07-26. For Phase 0 only, the missing observed import-Worker
peak-memory result is accepted as an explicit evidence limitation under two
mandatory conditions:

1. The 384 MiB deterministic preflight estimator remains enforced in code and
   covered by unit tests as the operative control.
2. Actual import-Worker memory measurement is mandatory in Prototype 9.1
   before any 500,000-stitch scale claim.

The focused importer test asserts the exact 402,653,184-byte ceiling, an
over-budget maximum-structure case, and the registered 100,000-stitch medium
case below the ceiling. The source and parsed-structure enforcement points use
that same limit. This disposition does not transform estimated bytes into
measured bytes and remains pending AU-AGENT-003 exact-source confirmation for
finding closure.

## Budget Disposition

The listed measured-profile budgets pass. For the registered reference and
constrained profiles, every method-conforming captured import, Viewer TTI,
gesture, mark-to-paint, autosave, reload, and corrupt-input condition passes.
Baseline/current/peak main-thread heap signals and signed retained deltas are
recorded. AU-AGENT-003 independently accepted the Viewer TTI and registered
main-thread retained-memory remainders for the declared Chromium method.
Import-Worker peak memory remains unavailable; the heap evidence is a Chromium
main-thread process signal rather than Worker telemetry or a forced-GC
retained-allocation result. The Project Owner-approved Phase 0 limitation now
supplies the authorized alternative required by TS001-IMPL-002. Independent
finding closure remains with AU-AGENT-003.

These are evidence limitations, not assumed passes. AU-AGENT-003 narrowly
reverified exact source `4009944` with successful CI run `30197035083` and
accepted the isolated steady-gesture long-task disposition for the earlier
measured profile. It also confirmed the estimator as valid enforced
admission-control evidence, but not as observed Worker peak memory.
AU-AGENT-003 then independently reverified evidence package `04302399` and
accepted the owner-confirmed 4× configuration provenance and all
method-conforming captured metrics. It kept both complete profile remainders
open for Viewer TTI and retained-memory evidence. AU-AGENT-003 then reverified
exact package `15ea8f93`, resolved those two profile remainders, and retained
the observational boundaries above. The owner has now approved the documented
Phase 0 limitation; AU-AGENT-003 exact-source confirmation is the remaining
finding-lifecycle step.

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
- [x] At least 100 mark-to-paint and autosave samples retained where reported.
- [x] At least 100 Viewer TTI samples retained for reference minimal,
      reference medium, and constrained medium.
- [x] 120 actual animation-frame intervals retained per fixture.
- [x] 10,000-event history and 30 reload samples retained.
- [x] Corrupt import result retained.
- [x] Registered reference viewport and DPR run.
- [x] Registered constrained profile run.
- [x] Registered main-thread heap baseline, current, peak, sample count, and
      signed retained delta recorded.
- [ ] Import-Worker peak memory measured; not required for Phase 0 under the
      approved limitation and mandatory for Prototype 9.1 before a scale claim.
- [x] Project Owner-approved Phase 0 Worker-memory limitation recorded with
      the enforced 384 MiB control and Prototype 9.1 condition.
- [x] Long-task evidence isolated and dispositioned for the scripted gesture.
- [x] AU-AGENT-003 independently reverified the registered profile evidence;
      profile configuration and captured metric subsets passed.
- [x] AU-AGENT-003 independently reverified the supplemental TTI/heap
      remediation candidate; Viewer TTI/main-thread memory are resolved and
      Worker peak remains a separately approved limitation.

## References

- [Benchmark Plan](TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Import-Worker Memory Evidence Limitation](TASK-THINSLICE-001_IMPORT_WORKER_MEMORY_LIMITATION.md)
- [Raw Evidence Index](evidence/TASK-THINSLICE-001/README.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
