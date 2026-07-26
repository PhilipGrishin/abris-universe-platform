# TASK-THINSLICE-001 Import-Worker Memory Evidence Limitation

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-TS001-LIM-001 |
| Title | TASK-THINSLICE-001 Import-Worker Memory Evidence Limitation |
| Status | `[APPROVED]`; Phase 0 evidence limitation independently confirmed |
| Owner | AU-AGENT-004 |
| Technical Approver | Project Owner |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.1.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | Project Owner directive dated 2026-07-26; Benchmark Plan v1.2.4; Browser Benchmark Report v1.8.1; Engineering Verification Report v1.5.0; exact source `c64d3ec8ab390269121c651d8c78695d9b4946f5`; GitHub Actions run `30213355972`; `packages/importers/oxs/src/limits.ts`; focused importer tests |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Preflight estimator, importer allocation model, Worker lifecycle, browser measurement method, Prototype 9.1 plan/evidence, or scale-claim change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record the Project Owner-approved Phase 0 limitation for missing observed
import-Worker peak-memory telemetry without representing the deterministic
admission estimator as a measurement.

## Scope

This decision applies only to the Phase 0 TASK-THINSLICE-001 completion
evidence. It does not approve a 500,000-stitch performance or memory claim,
replace Prototype 9.1, change an importer limit, or establish total browser,
Canvas, GPU, or system-memory behavior.

## Approved Disposition

On 2026-07-26, the Project Owner approved the documented evidence limitation
for import-Worker peak memory under both mandatory conditions:

1. The 384 MiB deterministic preflight estimator remains enforced in code and
   covered by unit tests as the operative Phase 0 memory control.
2. Actual memory measurement is mandatory in future Prototype 9.1
   (500,000 stitches) evidence before any scale claim.

This owner decision satisfies the approved-limitation alternative in
TS001-IMPL-002. AU-AGENT-003 independently confirmed exact source `c64d3ec8`
and resolved TS001-IMPL-002 for bounded Phase 0 in Engineering Verification
Report v1.5.0. This record does not self-assign an Engineering Verification
Status or project `[VERIFIED]`.

## Operative Control

- `OXS_LIMITS.maxPreflightPeakBytes` is exactly 384 MiB
  (402,653,184 bytes).
- File-size preflight runs before bytes are transferred to the import Worker.
- The importer repeats source preflight defensively and compares the
  conservative parsed-structure estimate with the same 384 MiB ceiling before
  canonical mapping.
- Exceeding the parsed estimate returns the bounded
  `OXS_LIMIT_PREFLIGHT_MEMORY` rejection.
- Focused unit tests assert the exact 384 MiB constant, an over-budget maximum
  structure case, and the registered 100,000-stitch medium case below the
  ceiling.

The registered medium fixture estimate is 100,374,296 bytes (about 95.7 MiB).
This remains admission-control evidence, not observed Worker allocation.

## Evidence Boundary

The registered Chromium `usedJSHeapSize` artifacts observe the main-thread
process signal and exclude dedicated Worker, Canvas, GPU, browser-process, and
total-system allocation. No existing artifact measures the transient
import-Worker peak. Phase 0 therefore carries an explicit evidence limitation,
not an inferred memory pass.

## Prototype 9.1 Gate

Before any 500,000-stitch scale claim, Prototype 9.1 must:

- use an actual memory-measurement method that includes the import Worker;
- record source, browser/runtime, device, fixture, method, raw observations,
  peak result, uncertainty, and measurement limitations;
- retain the 384 MiB admission-control result separately from observed memory;
- receive AU-AGENT-003 independent review;
- block the scale claim if actual Worker memory is absent or exceeds the
  applicable approved budget without a new owner disposition.

This gate is mandatory and cannot be satisfied by extrapolating the
100,000-stitch estimator or main-thread heap signal.

## Common Mistakes

- Do not label the 95.7 MiB medium estimate as measured memory.
- Do not treat this Phase 0 limitation as evidence for 500,000 stitches.
- Do not remove or raise the 384 MiB ceiling without architecture review,
  tests, documentation updates, and the required approval.
- Do not infer Worker, Canvas, GPU, browser-process, or total-system memory from
  `usedJSHeapSize`.

## Review Checklist

- [x] Project Owner approval and both conditions are recorded.
- [x] Exact operative limit and enforcement points are identified.
- [x] Focused unit-test obligations are explicit.
- [x] Existing observed-memory boundaries are preserved.
- [x] Prototype 9.1 actual measurement is a mandatory pre-scale-claim gate.
- [x] AU-AGENT-003 exact-source disposition is recorded.
- [ ] Prototype 9.1 actual Worker-memory evidence exists.

## References

- [Benchmark Plan](TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Browser Benchmark Report](TASK-THINSLICE-001_BROWSER_BENCHMARK_REPORT.md)
- [Engineering Verification Report](../../reviews/engineering/TASK-THINSLICE-001_IMPLEMENTATION_VERIFICATION.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Chrome memory measurement guidance](https://web.dev/articles/monitor-total-page-memory-usage)
