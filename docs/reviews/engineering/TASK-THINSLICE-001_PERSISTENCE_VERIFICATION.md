# Engineering Verification Report — TASK-THINSLICE-001 Persistence

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-ENG-TS001-PERSIST-001 |
| Title | Engineering Verification Report — TASK-THINSLICE-001 IndexedDB Persistence and Recovery |
| Status | `[IMPLEMENTED]`; independent engineering quality-gate result recorded below |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | TASK-THINSLICE-001 v1.1; Technical Design v1.5.0 section 9; ADR-TS001-003 v1.1.1; Threat Model v1.3.0; AU-TECHREV-TS001-PERSIST-001; initial source `776a149078ae72a436c720db3b3f6817c4ed4656`; remediation source `854073c2fc018ce5a7f09f426f6c0ecda07b5a79` |
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
- **Exact reverified source:** commit
  `854073c2fc018ce5a7f09f426f6c0ecda07b5a79`, parent
  `ddd7c8492a21e03f71799416dfac3766aa8a1b5c`, on the same branch. The local
  and remote branch refs resolved to this commit before reverification.
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

Initial checks reproduced on Node.js 26.0.0 and pnpm 11.9.0:

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

### Reverification Evidence

The following checks were reproduced against exact remediation commit
`854073c2fc018ce5a7f09f426f6c0ecda07b5a79`:

| Command or inspection | Result |
| --- | --- |
| Local/remote branch and commit identity | Pass; both refs resolved to the exact remediation commit |
| `git diff --check 776a149078ae72a436c720db3b3f6817c4ed4656..854073c` | Pass |
| `pnpm --filter @abris-universe/persistence typecheck` | Pass |
| `pnpm --filter @abris-universe/persistence test` | Pass; 17 tests, 0 failures |
| `pnpm typecheck` | Pass |
| `pnpm test` | Pass; fixture and workspace checks plus 10 domain, 15 importer, and 17 persistence tests |
| Final-event digest inspection | Pass; `canonicalEventHash` includes `localSequence` and is called after the final event is constructed |
| Remediation diff review | Pass for TS001-PERSIST-001 through TS001-PERSIST-005; no new mandatory repository-level finding observed |

## Verification Checks

| Area | Evidence | Result | Limitations |
| --- | --- | --- | --- |
| Engineering quality | Remediation source inspection and reproduced checks | Pass for repository scope | Real-browser/client evidence remains separate |
| Coding standards | Strict typecheck and scoped source review | Pass | Persisted runtime validation is now explicit on reviewed paths |
| Architecture compliance | Technical Design section 9 and ADR-TS001-003 comparison | Pass for repository scope | Runtime evidence remains open |
| Documentation completeness | Package README, implementation review, task/status/risk/traceability records | Pass for reviewed source | This reverification revision requires normal AU-AGENT-002 lifecycle integration |
| Testing completeness | 17 focused persistence tests and full workspace suite | Pass for repository scope | Real-browser and client scenarios remain open |
| Regression coverage | Atomic abort, reopen, cleanup, lock, retry, digest, referential-integrity, and rebuild tests | Pass | Browser-specific regressions are not covered here |
| Security compliance | Threat Model TM-007, TM-008, TM-020, and TM-021 | Pass for repository controls | Operational browser evidence remains open |
| CI/CD readiness | Package checks only | Not applicable | CI/CD and deployment are outside this review |
| Release readiness | Reviewed implementation and evidence | Not complete | TS001-PERSIST-006 and non-persistence release gates remain open |
| Traceability | Task, status, risk, design, ADR, threat model, implementation review, and report index | Pass | Project acceptance remains separate |

## Findings

| Finding ID | Severity | Evidence | Requirement or Standard | Risk | Required Disposition | Owner | Reverification Condition | Status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| TS001-PERSIST-001 | High | `progress-repository.ts:36-51,120,199-232` computes `payloadSha256` from the pre-transaction command before `localSequence` exists. The final `ProgressEvent` defined by `domain-core/model.ts:143-154` includes `localSequence`. | Technical Design 9.1 and 9.3 require the event-ID record to contain the canonical payload SHA-256 and require sequence allocation, event construction, then hash calculation in the same transaction; ADR-TS001-003 lines 47-50; TM-020. | The stored digest is not the digest of the final canonical event. It cannot prove the integrity of the allocated sequence or detect substitution/corruption of the stored event, while documentation calls it a canonical event hash. | Calculate the digest from the final canonical `ProgressEvent` after sequence allocation, and validate the retrieved event against the ID record during replay. If a command-payload digest was intended instead, AU-AGENT-001 must formally revise the Technical Design and ADR before implementation can be accepted. Add focused sequence, replay, and corrupted-record tests. | AU-AGENT-005; AU-AGENT-001 for any architecture clarification | Source and tests demonstrate that the persisted digest is calculated from and rechecked against the complete final event, including `localSequence`, or an approved design/ADR change explicitly establishes a different contract | Resolved at `854073c`; disposition and evidence preserved below |
| TS001-PERSIST-002 | High | The append transaction in `progress-repository.ts:132-242` opens no `patternVersions` or `patternTiles` store and checks only that the Project names the requested PatternVersion. It never proves that `targetStitchId` exists in that version. `rebuildProgressState` validates a non-empty target but not membership. | Technical Design invariant 5.3(8): progress references a stable stitch ID and exact PatternVersion; Technical Design 9.3; Pattern/Progress integrity rules. | A caller can persist and rebuild progress for a nonexistent stitch, creating a phantom projection and corrupting user progress semantics. | Enforce referential validation of every new progress target against the exact committed PatternVersion using the architecture-approved repository boundary, and reject invalid targets without partial writes. Add append and rebuild negative tests. | AU-AGENT-005 with AU-AGENT-001 and AU-AGENT-004 contract coordination | Tests prove that nonexistent and cross-version stitch IDs are rejected atomically and that valid targets continue to append and rebuild | Resolved at `854073c`; disposition and evidence preserved below |
| TS001-PERSIST-003 | Medium | `startImportAttempt` checks Blob size but does not hash `sourceBlob` or compare it with `SourceFile.sha256` (`import-repository.ts:35-87`). The existing staging test uses unrelated placeholder hash metadata and Blob bytes. | Technical Design 5.2, 5.3(9), and 9.1-9.2; Threat Model TM-005 and source-byte provenance requirement. | Retained bytes can diverge from their recorded SHA-256 and provenance, weakening recovery, auditability, deterministic re-import, and source-integrity evidence. | Bind retained Blob bytes to the declared source hash before staging, or document and enforce an equivalent approved caller precondition with an end-to-end test that proves the exact hashed bytes are staged. Add a mismatch rejection test. | AU-AGENT-005 with AU-AGENT-004 integration evidence | Exact-byte/hash binding is executable and a mismatched Blob cannot be committed as the declared SourceFile | Resolved at `854073c`; disposition and evidence preserved below |
| TS001-PERSIST-004 | Medium | Persistence contracts type accepted and rejected reports as `unknown`, and `commitSuccessfulImport`/`rejectImportAttempt` structured-clone them without shape or bound validation (`contracts.ts:61-63,107-124`; `import-repository.ts:254-277,335-345`). | Technical Design 6 ImportReport contract and 9.2 bounded-report rule; TM-021. | An oversized or malformed diagnostic payload can make the failure-cleanup transaction abort, leaving source bytes retained until a later recovery attempt, and can persist data outside the approved report contract. | Use the approved bounded ImportReport contract at the persistence boundary and reject malformed or over-budget diagnostics before the cleanup transaction. Add over-limit and malformed-report tests that also prove Blob cleanup behavior. | AU-AGENT-005 with AU-AGENT-004 contract input | Runtime validation and tests show only approved bounded reports are stored and cleanup cannot be defeated by report size or shape | Resolved at `854073c`; disposition and evidence preserved below |
| TS001-PERSIST-005 | Medium | Idempotent replay checks the ID-record digest against the incoming command but does not validate the retrieved event fields against that digest or ID record (`progress-repository.ts:149-171`). Projection rebuild treats every runtime event type other than `mark` as `unmark` (`domain-core/validation.ts:437-473`). | Technical Design 9.3-9.4 requires corruption detection and verification/rebuild from events; ADR-TS001-003; data-integrity verification standard. | Corrupt or migrated persisted records may be silently returned or converted into an incorrect projection instead of producing a typed corruption error. | Runtime-validate stored event shape and discriminants, cross-check event/ID-record identity and digest, and fail closed on malformed recovery input. Add corrupted-event, invalid-type, and mismatched-ID-record tests. | AU-AGENT-005; AU-AGENT-001 owns cross-package validation disposition | Replay and rebuild reject malformed, substituted, or digest-inconsistent records while valid reopen/rebuild tests pass | Resolved at `854073c`; disposition and evidence preserved below |
| TS001-PERSIST-006 | Medium | All 11 persistence tests use `fake-indexeddb`; lock behavior uses a synchronous in-process test double. The supplied review explicitly defers real two-tab, browser matrix, power-loss, eviction, and client save-state evidence. | ADR-TS001-003 required evidence; Threat Model TM-007, TM-009, and TM-020; AU-AGENT-003 evidence rule. | Browser transaction timing, Blob durability, real Web Locks contention, upgrade blocking, capability policy, and visible saved/not-saved behavior remain unverified. | Preserve this as an open runtime evidence gate. Before persistence or thin-slice completion, run the registered supported-browser and two-context scenarios, including real lock contention, reload/reopen, transaction failure, quota/capability paths, and client commit-driven save-state behavior. | AU-AGENT-006 for browser/client evidence; AU-AGENT-005 for persistence support; AU-AGENT-003 for reverification | Reproducible supported-browser evidence is attached with exact environment, scenarios, and results; `fake-indexeddb` results remain identified separately | Open |

## Reverification History

The initial review of
`776a149078ae72a436c720db3b3f6817c4ed4656` required rework because
TS001-PERSIST-001 through TS001-PERSIST-005 were mandatory and unresolved.
AU-AGENT-003 independently reverified their dispositions at exact remediation
commit `854073c2fc018ce5a7f09f426f6c0ecda07b5a79`.

| Finding | Disposition at exact remediation source | Reverification evidence | Result |
| --- | --- | --- | --- |
| TS001-PERSIST-001 | `canonicalEventHash` serializes every final `ProgressEvent` field, including allocated `localSequence`; append calculates it after event construction and replay recalculates it against the stored event and ID record. | `progress-repository.ts:42-56,224-266,322-356`; focused test asserts the ID-record digest equals the final-event digest and rejects a divergent stored digest. | Resolved |
| TS001-PERSIST-002 | Append resolves the exact tile from approved tile metadata and supplied target coordinates, matches ID and coordinates, and still requires the ready Project to reference the exact PatternVersion. Rebuild rejects event targets absent from that version's committed tiles. | `progress-repository.ts:205-309,406-475`; focused nonexistent-target and internally hashed phantom-target tests pass. | Resolved |
| TS001-PERSIST-003 | `startImportAttempt` hashes the exact Blob bytes before opening the staging transaction and rejects a mismatch with a typed integrity-corruption error. | `import-repository.ts:69-103`; focused mismatch test proves no SourceFile is staged. | Resolved |
| TS001-PERSIST-004 | Persistence now consumes typed `OxsImportReport`; shared runtime validation enforces shape, issue/detail counts, scalar bounds, and a 256 KiB serialized limit. Invalid rejected reports trigger an atomic fail-safe cleanup that deletes bytes and records interruption without storing the report. | `report-validation.ts:1-160`, `contracts.ts:63-65,109-126`, `import-repository.ts:105-158,332-436`; importer validation and persistence cleanup tests pass. | Resolved |
| TS001-PERSIST-005 | Stored events and ID records are runtime-validated; replay and rebuild cross-check identity, sequence, final-event digest, discriminant, context, and target membership, failing closed with a typed integrity error. | `domain-core/validation.ts:426-478`; `progress-repository.ts:58-99,224-266,406-505`; invalid discriminant, digest divergence, and phantom-target tests pass. | Resolved |
| TS001-PERSIST-006 | No code disposition was requested or claimed. The repository suite still uses `fake-indexeddb` and a simulated lock manager. | Original finding and current implementation review boundaries. | Open runtime evidence gate |

## Risk Assessment

### Initial Assessment at `776a149`

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

### Reverification Assessment at `854073c`

- **Confirmed:** TS001-PERSIST-001 through TS001-PERSIST-005 are resolved at the
  exact reviewed source, and all focused and workspace checks pass.
- **Confirmed:** the final canonical event digest includes the allocated local
  sequence and is checked during replay and rebuild.
- **Confirmed:** repository-level source provenance, stitch referential
  integrity, bounded report handling, and corrupted-event fail-closed behavior
  now have executable evidence.
- **Residual/open:** TS001-PERSIST-006 remains unchanged. Real browser
  transactions, Web Locks contention, tab lifecycle, quota policy, storage
  persistence/eviction, power-loss behavior, and client-visible save-state have
  not been verified.
- **Residual:** browser-owned storage remains neither backup nor guaranteed
  persistence.

## Documentation Review

### Initial Review

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

### Reverification

The package README, implementation review, engineering-review index, task,
status, traceability, changelog, handoff, and current-focus records now identify
the remediation and preserve TS001-PERSIST-006 as open browser/client evidence.
The canonical-hash claim now matches the implementation. AU-AGENT-002 must
integrate this version 1.1.0 reverification outcome into the normal lifecycle
without changing AU-AGENT-003 meaning.

## Quality Gate Decision

- **Engineering Verification Status:** VERIFIED WITH FINDINGS
- **Decision rationale:** Exact-source inspection, focused checks, and the full
  workspace suite demonstrate closure of TS001-PERSIST-001 through
  TS001-PERSIST-005 without an observed repository-level regression.
  TS001-PERSIST-006 remains an explicitly bounded runtime evidence finding.
- **Mandatory unresolved findings:** None for the repository-level persistence
  implementation. TS001-PERSIST-006 remains mandatory before any
  browser/client, release, or complete thin-slice persistence claim.
- **Repository-level persistence quality gate:** Pass at exact commit
  `854073c2fc018ce5a7f09f426f6c0ecda07b5a79`.
- **Completion Report blocked:** No for the bounded repository-level
  persistence result. Yes for any Completion Report claiming browser/client
  persistence, operational durability, release readiness, or complete
  thin-slice acceptance before TS001-PERSIST-006 is closed.
- **Required next action:** AU-AGENT-002 integrates this reverification result;
  AU-AGENT-005 and AU-AGENT-006 produce the registered browser/client evidence;
  AU-AGENT-003 reverifies TS001-PERSIST-006 at that later gate.

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
