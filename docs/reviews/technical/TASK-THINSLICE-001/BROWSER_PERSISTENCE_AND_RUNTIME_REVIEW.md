# TASK-THINSLICE-001 Browser Persistence and Runtime Review

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-BROWSER-001 |
| Title | TASK-THINSLICE-001 Browser Persistence and Runtime Review |
| Status | `[TESTED]` on the listed profile; remaining quota, matrix, and production checks `[OPEN]` |
| Owner | AU-AGENT-005 and AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.0.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | ADR-TS001-003; Threat Model; Runtime Request Inventory; commits `f17d0d3b465af88b82c78c7f66abe0cbc0ade66c` and `37e657eb6571c525154e07ed225d6b877358fb99` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | IndexedDB, Web Locks, storage capability, quota, lifecycle, browser, runtime request, CSP, or source change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose and Scope

Record exact-browser persistence failure, contention, lifecycle, and runtime
resource evidence without upgrading it to multi-browser, quota-exhaustion, or
production-deployment proof.

## Persistence Results

On Chromium/Chrome 150.0.0.0, macOS 26.5.2:

- a real IndexedDB duplicate-key transaction aborted with
  `ConstraintError`;
- a real second browser context held the exact project progress-writer Web
  Lock, and the application failed closed to visible `Read-only` instead of
  reporting a save;
- a deliberately held real IndexedDB v1 connection caused a requested v2
  upgrade to emit `blocked`;
- persistent-storage capability denial was surfaced to the user without
  claiming backup or durable retention;
- a project containing 10,000 ordered progress events reopened and rebuilt its
  verified projection 30 times;
- mark/unmark commands completed at least 100 real IndexedDB transactions per
  fixture, with visible commit-driven status;
- ordinary reload/reopen and two-context lifecycle paths remained local.

The benchmark origin is disposable and separate from the deployable SPA. The
failure harness is included only in `dist-benchmark` and must not be deployed.

## Runtime Request Results

The exact benchmark capture covered minimal import, medium import, corrupt
import, progress-history creation, and reload. Its complete Resource Timing
inventory contained only four unique same-origin static assets:

- the benchmark entry;
- the shared project-service chunk;
- the shared importer chunk;
- the import Worker, loaded 62 times for 60 cold imports, one corrupt import,
  and the progress-history seed import.

The interactive application capture contained only its same-origin hashed
script, stylesheet, and rendering Worker. No external origin, request payload,
pattern-derived URL, analytics, beacon, WebSocket, XMLHttpRequest, or
application `fetch` path was observed or exists in the verified client source.

This closes the implementation-runtime portion of TS001-SEC-002 for the listed
profile. Production response headers, Cloudflare route behavior, and a
production network assertion remain correctly gated on an authorized
deployment.

## Remaining Limitations

- Real quota exhaustion was not forced because filling the owner's browser
  profile or disk is unsafe. Deterministic repository tests still cover the
  typed `QuotaExceededError` path.
- Firefox, Safari/WebKit, mobile, and other desktop environments were not run.
- Browser eviction and operating-system power loss were not induced.
- The recorded persistent-storage denial is capability evidence, not a
  guarantee that every browser will deny or grant persistence.
- Production headers and requests remain untested because deployment is not
  authorized.

TS001-PERSIST-006 is materially advanced but not declared fully closed because
real quota/eviction and the broader supported-browser matrix remain open.

## Common Mistakes

- A deliberate transaction abort is not the same scenario as quota exhaustion.
- A blocked upgrade on the disposable origin must not be run against owner
  production data.
- Resource Timing inventory is scoped to browser-initiated resources and does
  not replace production edge logs or header assertions.
- Persistent-storage denial messaging is not backup.

## Review Checklist

- [x] Real browser and exact source recorded.
- [x] Real IndexedDB transaction abort observed.
- [x] Real two-context Web Locks contention observed.
- [x] Visible fail-closed read-only state observed.
- [x] Real blocked upgrade observed.
- [x] 10,000-event reopen/rebuild distribution retained.
- [x] Import, corrupt import, interaction, and reload resource inventory retained.
- [ ] Safe real quota/eviction evidence obtained.
- [ ] Broader supported-browser matrix exercised.
- [ ] Production headers and network assertion completed after authorization.
- [ ] AU-AGENT-003 independent review completed.

## References

- [Raw Evidence Index](../../../assurance/benchmarks/evidence/TASK-THINSLICE-001/README.md)
- [Persistence Implementation Review](PERSISTENCE_IMPLEMENTATION_REVIEW.md)
- [Runtime Request Inventory](../../../assurance/threat-models/TASK-THINSLICE-001_RUNTIME_REQUEST_INVENTORY.md)
- [Threat Model](../../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Source of Truth Registry](../../../SOURCE_OF_TRUTH.md)
