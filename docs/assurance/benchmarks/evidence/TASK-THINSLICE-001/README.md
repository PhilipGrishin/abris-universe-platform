# TASK-THINSLICE-001 Browser Evidence

| Field | Value |
| --- | --- |
| Document ID | AU-BENCH-EVIDENCE-TS001-001 |
| Title | TASK-THINSLICE-001 Browser Evidence |
| Status | `[IMPLEMENTED]`; source-qualified gate-candidate and historical non-gate evidence |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.4.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | `../../TASK-THINSLICE-001_CLIENT_BROWSER_SIGNAL.md`, `../../TASK-THINSLICE-001_BROWSER_BENCHMARK_REPORT.md`, implementation commits named by each artifact |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Evidence artifact, source commit, fixture, browser, or method change |

## Purpose and Scope

Index raw machine-readable and visual browser artifacts. These artifacts
support AU-AGENT-003 review and do not independently establish product
acceptance or assign `[VERIFIED]`.

## Artifacts

- `client-browser-signal-fc50d66.json`: bounded raw measurement records,
  environment facts, fixture identities, and functional dispositions.
- `medium-pattern-fc50d66.png`: 100,000-stitch production-build viewer after
  successful local import and progress interaction.
- `browser-benchmark-37e657e.json`: 30 minimal and medium cold imports,
  corrupt-import containment, 30 10,000-event reloads, and normalized complete
  resource inventory.
- `medium-interaction-a8f764b.json`: raw ordered medium frame, Worker,
  mark, save, TTI, long-task, heap, capability, and resource samples.
- `minimal-interaction-a8f764b.json`: raw ordered minimal frame, Worker,
  mark, save, TTI, heap, capability, and resource samples.
- `browser-failure-f17d0d3.json`: real transaction abort, Web Locks hold, and
  blocked-upgrade results.
- `accessibility-1c2bd5d.json`: pinned axe-core result after remediation.
- `grayscale-1c2bd5d.jpg`: 1280×720 grayscale/reduced-motion visual evidence.
- `medium-gesture-d69b5c5.json`: isolated 120-frame medium-pattern gesture
  capture after clearing engineering evidence immediately before the scenario.
- `accessibility-d69b5c5.json`: exact-source axe-core rerun, manual contrast
  calculations, and rendered focus-order inspection after contrast
  remediation.
- `reference-browser-benchmark-4009944.json`: registered 1365×768 DPR 1
  reference cold-import, corrupt-import, and 10,000-event reload samples.
- `reference-medium-gesture-4009944.json`: isolated registered-reference
  120-frame medium gesture.
- `reference-interaction-4009944.json`: registered-reference medium import,
  viewer, mark-to-paint, autosave, heap-signal, and combined-session samples.
- `constrained-4x-browser-benchmark-4009944.json`: owner-confirmed 4× CPU
  constrained cold-import, corrupt-import, and 10,000-event reload samples.
- `constrained-4x-medium-gesture-4009944.json`: isolated owner-confirmed 4× CPU
  constrained 120-frame medium gesture.
- `constrained-4x-interaction-4009944.json`: constrained medium import, viewer,
  mark-to-paint, autosave, heap-signal, and combined-session samples.
- `performance-profile-manifest-4009944.json`: profile identities, owner
  confirmation, target continuity, artifact hashes, and limitations.
- `reference-tti-memory-d36a827.json`: 100 reference minimal and 100 reference
  medium Viewer TTI reload samples plus baseline/current/peak heap signals and
  signed retained deltas.
- `constrained-4x-tti-memory-d36a827.json`: 100 owner-confirmed 4× constrained
  medium Viewer TTI reload samples plus the corresponding heap signals.
- `performance-tti-memory-manifest-d36a827.json`: schema-v2 instrumentation
  method, exact-source binding, owner confirmation, target continuity,
  artifact hashes, and limitations for the supplemental TTI/memory evidence.

SHA-256:

- `browser-benchmark-37e657e.json`:
  `1b7bcdb120e7004479eb96dec090c63b1132c654f945e4c035a5c845c2000b19`
- `medium-interaction-a8f764b.json`:
  `83251381a6196ea7f7c43d6c7bb6376fcf4060b2b018418923b09125e9a758e2`
- `minimal-interaction-a8f764b.json`:
  `1d96a0365288586fd2f9f950943ea0651c8d034c5dfee9f39f1f5c8325cf1815`
- `browser-failure-f17d0d3.json`:
  `71c92ed0c29481fc6469e67554978663281198a2bc48fbea12d80670b8c36c37`
- `accessibility-1c2bd5d.json`:
  `5428c66ec13d85fc38a488f2247620baeeebbfc8b51ca7c960561a6ec41558a5`
- `grayscale-1c2bd5d.jpg`:
  `8566a4b798727d1b687c7fbf64addb2974fbc4b8637809bc315cff4bad203999`
- `medium-gesture-d69b5c5.json`:
  `eb7f60bcc9895033bfcb36e1b08d1c09d4747d27c0278b1fe9685e942fa708be`
- `accessibility-d69b5c5.json`:
  `0dd1827829b37dd4c354a4ed6f85bea3163202dd1743c22165f6e00248eff57d`
- `reference-browser-benchmark-4009944.json`:
  `a02b66823b7c4586a01c9ddc8c8989c96dd962849f5f257835a431451275d1c4`
- `reference-medium-gesture-4009944.json`:
  `23ef1182d6e4bab6e77575a48119e2bc4d1e7355cc8bb3fd7ff6d35908186aaa`
- `reference-interaction-4009944.json`:
  `25bf4f0ad610227ebb71f31edadb5ff3b3335f8ac14d59d3245da6cc2c8fb7f4`
- `constrained-4x-browser-benchmark-4009944.json`:
  `754da8713dcb77f8b2f18a307b5717da1675ea612a8555746260d96fd094ba42`
- `constrained-4x-medium-gesture-4009944.json`:
  `2f2172d0a991d1d95b1be368ab7511101076a6d4e62456154953fbacc6b0694b`
- `constrained-4x-interaction-4009944.json`:
  `1200d26e52cd9fa9b80139c7c8e54b6b7bbcb5d78c6808f22ecb2ca88336f30b`
- `performance-profile-manifest-4009944.json`:
  `306e46e618ac5b7a4e974fd6365b672a501998f424e622811b1e24fe36a26083`
- `reference-tti-memory-d36a827.json`:
  `c1725f9ef599f82fa31adb5c374d7d5d6688c99771a6fb5942bee9b49bf67c0d`
- `constrained-4x-tti-memory-d36a827.json`:
  `a74c5461d00095978f6edf18c280d87b0abf740626bd71d6901288452a756d2b`
- `performance-tti-memory-manifest-d36a827.json`:
  `9f926bbca881718aae7227b01ed05df1aa2a873061948d73baba81663eae832e`

## Owner and Lifecycle

AU-AGENT-006 owns measurement meaning. AU-AGENT-002 maintains paths,
navigation, and lifecycle. AU-AGENT-003 reviews sufficiency and limitations.
Artifacts are append-only by source commit; do not overwrite historical
evidence when implementation or method changes.

## Adding Evidence

Use a source-commit-qualified filename. Record fixture hash, environment,
method, sample count, raw values, limitations, and parent result document.
Never replace missing samples with inferred values.

## Related Sources

- [Client Browser Signal](../../TASK-THINSLICE-001_CLIENT_BROWSER_SIGNAL.md)
- [Browser Benchmark Report](../../TASK-THINSLICE-001_BROWSER_BENCHMARK_REPORT.md)
- [Client Accessibility Matrix](../../../capability-matrices/TASK-THINSLICE-001_CLIENT_ACCESSIBILITY_MATRIX.md)
- [Browser Persistence and Runtime Review](../../../../reviews/technical/TASK-THINSLICE-001/BROWSER_PERSISTENCE_AND_RUNTIME_REVIEW.md)
- [Benchmark Plan](../../TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Source of Truth Registry](../../../../SOURCE_OF_TRUTH.md)
