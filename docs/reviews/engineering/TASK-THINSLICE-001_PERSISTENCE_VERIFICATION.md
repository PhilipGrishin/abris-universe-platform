# Engineering Verification Report — TASK-THINSLICE-001 Persistence

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-ENG-TS001-PERSIST-001 |
| Title | Engineering Verification Report — TASK-THINSLICE-001 IndexedDB Persistence and Recovery |
| Status | `[IMPLEMENTED]`; independent engineering quality-gate result recorded below |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | TASK-THINSLICE-001 v1.1; Technical Design v1.5.0 section 9; ADR-TS001-003 v1.1.1; Threat Model v1.3.0; AU-TECHREV-TS001-PERSIST-001; source commit `776a149078ae72a436c720db3b3f6817c4ed4656` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Reviewed source change; finding remediation; persistence contract or evidence change; supported-browser evidence; client save-state integration |

## Review Identity

- **Task ID and version:** TASK-THINSLICE-001 v1.1;
  AU-CDX-TASK-001-PERSISTENCE.
- **Exact reviewed source:** commit
  `776a149078ae72a436c720db3b3f6817c4ed4656`, parent
  `7c45015482e95feb4b3ebce14a9283dcf03c99d1`, branch
  `codex/task-thinslice-001-persistence`. The local and
  `origin/codex/task-thinslice-001-persistence` refs resolved to the same commit
  before review.
- **Implementation owner:** AU-AGENT-005, with AU-AGENT-001 responsible for
  technical integration.
- **Reviewer:** AU-AGENT-003.
- **Independence statement:** AU-AGENT-003 did not author the reviewed
  implementation and changed only this report.
- **Review scope:** IndexedDB schema version 1; import staging, commit, rejection,
  and interruption recovery; progress append, idempotency, projection, and
  recovery; persistence capability reporting; package dependencies, tests, and
  persistence documentation.
- **Out of scope:** renderer and client implementation; Worker integration;
  product behavior and acceptance; synchronization; backend; deployment;
  production migration; and project `[VERIFIED]` status.
- **Documentation Impact:** Material.

## Inputs and Evidence

The review inspected:

- [Technical Design v1.5.0 section 9](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md);
- [ADR-TS001-003](../../architecture/adr/ADR-TS001-003-indexeddb-progress-event-log.md);
- [TASK-THINSLICE-001 Threat Model](../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md),
  especially TM-007 through TM-009, TM-020, and TM-021;
- `packages/persistence/src/`, `packages/persistence/test/persistence.test.ts`,
  package manifests, and `pnpm-lock.yaml`;
- domain `ProgressEvent` and projection-rebuild validation used by persistence;
- [Persistence Implementation Review](../technical/TASK-THINSLICE-001/PERSISTENCE_IMPLEMENTATION_REVIEW.md);
- `docs/TASKS.md`, `docs/CURRENT_STATUS.md`, `docs/RISKS.md`,
  `docs/TRACEABILITY_MATRIX.md`, `.codex/CURRENT_FOCUS.md`, and
  `docs/HANDOFF_LOG.md`.

Reproduced checks on Node.js 26.0.0 and pnpm 11.9.0:

| Command | Result |
| --- | --- |
| `git rev-parse HEAD` and branch/ref checks | Pass; exact local and remote source identity confirmed |
| `git status --short --branch` before review | Pass; clean reviewed baseline |
| `git diff --check` | Pass |
| `pnpm --filter @abris-universe/persistence typecheck` | Pass |
| `pnpm --filter @abris-universe/persistence test` | Pass; 11 tests, 0 failures |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass; fixture and workspace checks plus 9 domain, 14 importer, and 11 persistence tests |

The focused tests run against `fake-indexeddb` and a simulated lock manager.
They are deterministic repository-API evidence, not real-browser, real
`navigator.locks`, two-context, quota-policy, storage-eviction, tab-close,
power-loss, or client save-state evidence. A live production-dependency advisory
query could not complete because the isolated environment could not resolve the
npm registry; the exact manifest and lockfile entries were inspected, but this
report makes no current advisory-free claim.

## Verification Checks

| Area | Evidence | Result | Limitations |
| --- | --- | --- | --- |
| Engineering quality | Source inspection and reproduced checks | Fail | Mandatory integrity findings remain |
| Coding standards | Strict typecheck and scoped source review | Pass | Type safety does not validate persisted runtime data |
| Architecture compliance | Technical Design section 9 and ADR-TS001-003 comparison | Fail | Final-event hashing and integrity boundaries do not match the approved contract |
| Documentation completeness | Package README, implementation review, task/status/risk/traceability records | Fail | Canonical-hash claims are overstated; this report still requires lifecycle registration by AU-AGENT-002 |
| Testing completeness | 11 focused tests and full workspace suite | Fail | Required negative integrity cases and real-browser evidence are absent |
| Regression coverage | Atomic abort, reopen, cleanup, lock, retry, and rebuild tests | Partial pass | Tests do not exercise the findings below |
| Security compliance | Threat Model TM-007, TM-008, TM-020, and TM-021 | Fail | Event integrity, referential integrity, and bounded-cleanup controls are incomplete |
| CI/CD readiness | Package checks only | Not applicable | CI/CD and deployment are outside this review |
| Release readiness | Reviewed implementation and evidence | Fail | Mandatory findings and browser/client evidence remain |
| Traceability | Task, status, risk, design, ADR, threat model, and implementation review | Partial pass | Current records correctly leave independent verification open but overstate canonical event hashing |

## Findings

| Finding ID | Severity | Evidence | Requirement or Standard | Risk | Required Disposition | Owner | Reverification Condition | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TS001-PERSIST-001 | High | `progress-repository.ts:36-51,120,199-232` computes `payloadSha256` from the pre-transaction command before `localSequence` exists. The final `ProgressEvent` defined by `domain-core/model.ts:143-154` includes `localSequence`. | Technical Design 9.1 and 9.3 require the event-ID record to contain the canonical payload SHA-256 and require sequence allocation, event construction, then hash calculation in the same transaction; ADR-TS001-003 lines 47-50; TM-020. | The stored digest is not the digest of the final canonical event. It cannot prove the integrity of the allocated sequence or detect substitution/corruption of the stored event, while documentation calls it a canonical event hash. | Calculate the digest from the final canonical `ProgressEvent` after sequence allocation, and validate the retrieved event against the ID record during replay. If a command-payload digest was intended instead, AU-AGENT-001 must formally revise the Technical Design and ADR before implementation can be accepted. Add focused sequence, replay, and corrupted-record tests. | AU-AGENT-005; AU-AGENT-001 for any architecture clarification | Source and tests demonstrate that the persisted digest is calculated from and rechecked against the complete final event, including `localSequence`, or an approved design/ADR change explicitly establishes a different contract | Open |
| TS001-PERSIST-002 | High | The append transaction in `progress-repository.ts:132-242` opens no `patternVersions` or `patternTiles` store and checks only that the Project names the requested PatternVersion. It never proves that `targetStitchId` exists in that version. `rebuildProgressState` validates a non-empty target but not membership. | Technical Design invariant 5.3(8): progress references a stable stitch ID and exact PatternVersion; Technical Design 9.3; Pattern/Progress integrity rules. | A caller can persist and rebuild progress for a nonexistent stitch, creating a phantom projection and corrupting user progress semantics. | Enforce referential validation of every new progress target against the exact committed PatternVersion using the architecture-approved repository boundary, and reject invalid targets without partial writes. Add append and rebuild negative tests. | AU-AGENT-005 with AU-AGENT-001 and AU-AGENT-004 contract coordination | Tests prove that nonexistent and cross-version stitch IDs are rejected atomically and that valid targets continue to append and rebuild | Open |
| TS001-PERSIST-003 | Medium | `startImportAttempt` checks Blob size but does not hash `sourceBlob` or compare it with `SourceFile.sha256` (`import-repository.ts:35-87`). The existing staging test uses unrelated placeholder hash metadata and Blob bytes. | Technical Design 5.2, 5.3(9), and 9.1-9.2; Threat Model TM-005 and source-byte provenance requirement. | Retained bytes can diverge from their recorded SHA-256 and provenance, weakening recovery, auditability, deterministic re-import, and source-integrity evidence. | Bind retained Blob bytes to the declared source hash before staging, or document and enforce an equivalent approved caller precondition with an end-to-end test that proves the exact hashed bytes are staged. Add a mismatch rejection test. | AU-AGENT-005 with AU-AGENT-004 integration evidence | Exact-byte/hash binding is executable and a mismatched Blob cannot be committed as the declared SourceFile | Open |
| TS001-PERSIST-004 | Medium | Persistence contracts type accepted and rejected reports as `unknown`, and `commitSuccessfulImport`/`rejectImportAttempt` structured-clone them without shape or bound validation (`contracts.ts:61-63,107-124`; `import-repository.ts:254-277,335-345`). | Technical Design 6 ImportReport contract and 9.2 bounded-report rule; TM-021. | An oversized or malformed diagnostic payload can make the failure-cleanup transaction abort, leaving source bytes retained until a later recovery attempt, and can persist data outside the approved report contract. | Use the approved bounded ImportReport contract at the persistence boundary and reject malformed or over-budget diagnostics before the cleanup transaction. Add over-limit and malformed-report tests that also prove Blob cleanup behavior. | AU-AGENT-005 with AU-AGENT-004 contract input | Runtime validation and tests show only approved bounded reports are stored and cleanup cannot be defeated by report size or shape | Open |
| TS001-PERSIST-005 | Medium | Idempotent replay checks the ID-record digest against the incoming command but does not validate the retrieved event fields against that digest or ID record (`progress-repository.ts:149-171`). Projection rebuild treats every runtime event type other than `mark` as `unmark` (`domain-core/validation.ts:437-473`). | Technical Design 9.3-9.4 requires corruption detection and verification/rebuild from events; ADR-TS001-003; data-integrity verification standard. | Corrupt or migrated persisted records may be silently returned or converted into an incorrect projection instead of producing a typed corruption error. | Runtime-validate stored event shape and discriminants, cross-check event/ID-record identity and digest, and fail closed on malformed recovery input. Add corrupted-event, invalid-type, and mismatched-ID-record tests. | AU-AGENT-005; AU-AGENT-001 owns cross-package validation disposition | Replay and rebuild reject malformed, substituted, or digest-inconsistent records while valid reopen/rebuild tests pass | Open |
| TS001-PERSIST-006 | Medium | All 11 persistence tests use `fake-indexeddb`; lock behavior uses a synchronous in-process test double. The supplied review explicitly defers real two-tab, browser matrix, power-loss, eviction, and client save-state evidence. | ADR-TS001-003 required evidence; Threat Model TM-007, TM-009, and TM-020; AU-AGENT-003 evidence rule. | Browser transaction timing, Blob durability, real Web Locks contention, upgrade blocking, capability policy, and visible saved/not-saved behavior remain unverified. | Preserve this as an open runtime evidence gate. Before persistence or thin-slice completion, run the registered supported-browser and two-context scenarios, including real lock contention, reload/reopen, transaction failure, quota/capability paths, and client commit-driven save-state behavior. | AU-AGENT-006 for browser/client evidence; AU-AGENT-005 for persistence support; AU-AGENT-003 for reverification | Reproducible supported-browser evidence is attached with exact environment, scenarios, and results; `fake-indexeddb` results remain identified separately | Open |

## Risk Assessment

- **Confirmed:** schema creation, transaction-abort behavior exercised by the
  suite, rejected/interrupted Blob deletion under tested inputs, ordered
  progress append under the simulated lock, reopen, and projection rebuild pass
  the available deterministic checks.
- **Confirmed:** `progressEventIds.payloadSha256` is calculated before the
  database allocates `localSequence`; it is therefore not a hash of the final
  canonical `ProgressEvent` required by Technical Design 9.3.
- **Confirmed:** the repository accepts no canonical stitch collection when
  appending progress and does not enforce source Blob/hash or bounded report
  integrity at its public boundary.
- **Derived:** atomic IndexedDB transactions limit partial-write risk but do not
  compensate for internally consistent records whose semantic references or
  digests were never validated.
- **Unknown:** real-browser durability, quota behavior, Web Locks contention,
  upgrade blocking, storage eviction, power-loss recovery, and client-visible
  save-state behavior.
- **Residual:** browser-owned storage can be denied or evicted even after all
  code findings are closed; no Phase 0 backup feature is approved.

## Documentation Review

The implementation review, package README, task, current status, risk, and
traceability records correctly separate `fake-indexeddb` evidence from the
remaining browser/client evidence. However, the package README and
implementation review describe the ID record as holding a canonical payload
hash without disclosing that the current hash omits `localSequence`. That claim
must be corrected with the implementation or explicitly reconciled by an
approved Technical Design/ADR disposition.

This report has Material Documentation Impact. Under the constrained review
instruction, AU-AGENT-003 created only this report. AU-AGENT-002 must register
it in the engineering-review index, traceability matrix, task/status records,
and documentation lifecycle without changing the findings or technical
meaning. No Documentation Exception was supplied.

## Quality Gate Decision

- **Engineering Verification Status:** REWORK REQUIRED
- **Decision rationale:** Reproduced tests and typechecks pass, but the reviewed
  implementation does not hash the final canonical ProgressEvent and leaves
  mandatory referential, provenance, report-boundary, and recovery-integrity
  controls unenforced. Real-browser/client evidence also remains explicitly
  open.
- **Mandatory unresolved findings:** TS001-PERSIST-001 through
  TS001-PERSIST-005. TS001-PERSIST-006 is a mandatory evidence gate before
  persistence/thin-slice completion but does not authorize broader client work
  as part of this review.
- **Completion Report blocked:** Yes. The persistence result cannot pass the
  engineering quality gate while mandatory findings remain unresolved.
- **Required next action:** AU-AGENT-001 must disposition any contract
  clarification; AU-AGENT-005 must remediate the persistence findings and
  provide focused evidence; AU-AGENT-002 must integrate documentation lifecycle
  updates; AU-AGENT-003 must reverify an exact new source.

This task-scoped Engineering Verification Status is not project `[VERIFIED]`,
product acceptance, release approval, or permission to deploy.

## Limitations

- No implementation was changed and no remediation was attempted.
- No real browser, second tab/context, client UI, Worker, power-loss, eviction,
  or production environment was available in this bounded review.
- `fake-indexeddb` does not establish real-browser durability or Web Locks
  behavior.
- The simulated quota test validates typed error translation and transaction
  abort after an injected exception; it is not evidence of an actual browser
  quota-triggered IndexedDB request failure.
- No live dependency-advisory conclusion is made because registry access was
  unavailable.
- CI/CD, deployment, renderer, broader importer behavior, and product
  acceptance were not reviewed.

## References

- [TASK-THINSLICE-001 Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-003](../../architecture/adr/ADR-TS001-003-indexeddb-progress-event-log.md)
- [TASK-THINSLICE-001 Threat Model](../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Persistence Implementation Review](../technical/TASK-THINSLICE-001/PERSISTENCE_IMPLEMENTATION_REVIEW.md)
- [Persistence Package](../../../packages/persistence/README.md)
- [Engineering Verification Report Contract](README.md)
