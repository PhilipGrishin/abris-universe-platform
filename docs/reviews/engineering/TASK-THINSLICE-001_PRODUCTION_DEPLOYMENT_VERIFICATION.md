# Engineering Verification Report — TASK-THINSLICE-001 Production Deployment

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-ENG-TS001-DEPLOY-001 |
| Title | Engineering Verification Report — TASK-THINSLICE-001 Production Deployment Readiness |
| Status | Deployment-transition remediation task-scoped `VERIFIED` at `e22e4c7`; protected integration and live production result pending; not project `[VERIFIED]` |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 2.2.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-27 |
| Dependencies | PROD-DEC-013; OWNER-DEC-TS001-PRODUCTION-DELIVERY-002; OWNER-DEC-TS001-PRODUCTION-PREVIEW-003; OWNER-DEC-TS001-DEPLOYMENT-LAB-004; Technical Design v1.5.17; ADR-TS001-004 v1.3.13; Production Deployment Record v2.4.0; production run `30266185702`; retained artifact `8652895888`; first transition-remediation review `2eaae2ad122d920516bbc7bbd5d599f724822de1`; exact remediation source `e22e4c7602ccaa3716c1607a928b66583accab80` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Reviewed-source change; finding remediation; deployment, credential, rollback, smoke, evidence, branch, or environment-control change |

## Review Identity

- **Task ID:** TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT.
- **Exact reviewed source:** commit
  `4097a5cac0bbddfe11bf73718979ea41eeb26113` on
  `codex/task-thinslice-001-client-integration`.
- **Exact reverified source:** commit
  `2c886390091fd8b05b18130c1555dcaf0a778d7a` on
  `codex/task-thinslice-001-client-integration`.
- **Exact propagation-remediation source:** commit
  `854ba305bdacfb6ff600f657e84bf4e61295bd1b` on
  `codex/task-thinslice-001-production-smoke-retry`.
- **Exact observability-remediation source:** commit
  `a503500c724ea618b80796fcca470d260d76b621` on
  `codex/task-thinslice-001-production-smoke-observability`.
- **Exact owner-approved transition source:** commit
  `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7` on
  `codex/task-thinslice-001-baseline-aware-transition`.
- **Exact protected-main deployment source:** merge commit
  `80d942ec521b9f2830ea2af7730356d39e398ee6` from PR #9.
- **Superseded immutable-preview candidate:** commit
  `c6616a69ea9ef89c3c7d8e4e719bb49f3fd5ff38`; AU-AGENT-003 withheld a final
  gate and required four security remediations.
- **Exact immutable-preview/purge reverified source:** commit
  `1054a2f0a7c1385fd8d51661c6be013e90df9df5` on
  `codex/task-thinslice-001-immutable-preview-purge`, PR #11.
- **Exact protected-main immutable-preview source:** merge commit
  `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b` from PR #11; the executable
  deployment diff from exact reviewed source `1054a2f0` is empty.
- **Exact remote-preview remediation source:** commit
  `497991c7eb5d9c558becafa2f4d2461e639be1ec` on
  `codex/task-thinslice-001-preview-preflight`.
- **Superseded observability source:** commit
  `73811129110cfa991689028441d45a4eccead613` set 61 attempts as the global
  default and was superseded before merge because that also extended
  post-promotion smoke at 100 percent traffic.
- **Accepted executable source:** commit
  `1a683abd9a8294de5a36888e997e65aba7b7a167`.
- **Implementation owner:** AU-CODEX-PRIMARY with AU-AGENT-001 technical
  approval.
- **Reviewer:** AU-AGENT-003.
- **Independence:** AU-AGENT-003 did not author or modify the reviewed workflow
  or deployment scripts. This report and its index link are its only outputs.
- **Scope:** production workflow permissions and gates, source identity,
  immutable upload and exact Workers preview, exact-version promotion,
  hostname-only purge, production stability quorum, rollback and rollback
  purge, evidence safety, prior/candidate/unknown classification, shared
  deadlines, smoke assertions, tests, and observed GitHub controls.
- **Out of scope:** unavailable secret values and live provider configuration,
  browser acceptance, DNS mutation, product acceptance, and any production
  attempt beyond the one explicitly authorized by the Project Owner.
- **Documentation Impact:** Material.

## Evidence

- `.github/workflows/deploy-production.yml`
- `scripts/deploy-production.mjs`
- `scripts/verify-production-deployment.mjs`
- `scripts/verify-production-deployment.test.mjs`
- `scripts/production-deployment-evidence.mjs`
- `scripts/production-deployment-evidence.test.mjs`
- production deployment record, Technical Design section 12, and
  ADR-TS001-004
- local exact-source checks: accepted-source ancestry and scoped diff, syntax
  checks, typecheck, 67 tests, build verification, production dependency audit,
  and Wrangler no-deploy rehearsal
- remote CI run
  [30218926302](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30218926302):
  successful `verify` job at the exact reviewed commit
- focused reverification: syntax checks and 14 deployment authorization,
  Cloudflare-output, preflight, evidence, lifecycle, rollback, and HTTP smoke
  tests passed at the exact reverified source
- remote CI run
  [30219444159](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30219444159):
  successful `verify` job at the exact reverified source
- failed-closed production attempt
  [30247393181](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30247393181):
  prior version `d1f2b05d-77d0-4d53-9c7a-73d61135979e`, zero-traffic candidate
  `f231b299-63d1-43f5-acb0-416ae989ab83`, failure at pre-promotion semantic
  smoke, exact prior-version rollback, and restored public baseline
- focused propagation-remediation verification: syntax checks and all 17
  deployment authorization, state, Cloudflare-response, evidence, semantic
  retry, rollback, and HTTP smoke tests passed
- remote CI runs
  [30248031399](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30248031399)
  and
  [30248087514](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30248087514):
  successful `verify` jobs at exact remediation source `854ba305`
- corrected failed-closed production attempt
  [30248680612](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30248680612):
  retained exact domain/preflight/lifecycle evidence, closed TD-GATE-003, kept
  candidate `b855e2e0-7221-456e-aaa6-55e947b0dcf0` at zero traffic through six
  stale semantic attempts, and restored the exact prior version and baseline
- retained run-2 artifact
  `production-deployment-bb9a5e56c1627a3da4146c972a72b4c4006f59b3-30248680612`,
  digest `sha256:6abec25f1b432cce932e03fff7e08d01c5428eb018801b091883d6b50c659a6e`;
  parsed JSON contains no token, secret, authorization, account, request-header,
  HTML, or raw-body key
- focused observability-remediation verification: syntax checks and all 19
  deployment tests passed
- remote CI run
  [30249435527](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30249435527):
  successful `verify` job at superseded observability source `73811129`
- final-source remote CI runs
  [30249687717](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30249687717)
  and
  [30249690631](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30249690631):
  successful `verify` jobs at exact correction `a503500`
- final allowed production retry
  [30250084131](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30250084131)
  at exact protected-main source
  `67878634a1b18f038dd6e25f7cd3ab4131f00773`: pre-promotion candidate smoke
  passed on semantic attempt 17, promotion occurred, six post-promotion
  attempts were exhausted, and automatic rollback restored the exact prior
  version and public baseline
- retained run-3 artifact
  `production-deployment-67878634a1b18f038dd6e25f7cd3ab4131f00773-30250084131`,
  digest `sha256:a6ad02c1019cc227db383a312bacc32d4f2966da304d6f087bb48e9177eb8a5d`;
  its parsed JSON contains no token, secret, authorization, account,
  request-header, HTML, or raw-body key
- owner-approved
  [Production Propagation Technical Alternative](../technical/TASK-THINSLICE-001/PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
  v1.1.0 and OWNER-DEC-TS001-PRODUCTION-TRANSITION-001
- exact Alternative A implementation source
  `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`
- independent focused rerun: all 27 deployment authorization, state,
  evidence, rollback, semantic-smoke, transition-classification, timeout,
  transport-failure, and candidate-failure tests passed
- independent full-suite rerun: 95 tests passed; fixture and workspace
  boundaries also passed
- provided exact-source local evidence: strict typecheck, clean static build,
  production dependency audit with no known vulnerabilities, Wrangler
  no-deploy rehearsal, and `git show --check` passed
- exact-source remote CI run
  [30252463472](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30252463472):
  successful `verify` job at
  `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`, including patch hygiene,
  typecheck, tests, verified static build, production dependency audit, and
  no-deploy Cloudflare rehearsal
- protected-main merge
  `80d942ec521b9f2830ea2af7730356d39e398ee6` through PR #9; reviewed workflow
  and deployment-script paths have an empty diff from exact source
  `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`
- single owner-authorized post-merge production run
  [30253457090](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30253457090)
  at exact protected-main source
  `80d942ec521b9f2830ea2af7730356d39e398ee6`; authorization, accepted-source
  diff, frozen install, typecheck, all tests, verified build, audit, and
  rehearsal passed before the deployment step failed closed
- retained attempt-4 artifact
  `production-deployment-80d942ec521b9f2830ea2af7730356d39e398ee6-30253457090`,
  artifact ID `8647947029`, digest
  `sha256:8da88d7c34cde83de1fd0bbe237ab445eb567f13e8cb9e36bf250f208faee379`,
  expiring 2026-10-25
- downloaded evidence SHA-256:
  `production-preflight-evidence.json`
  `6e03f97401d6c140c47c7dd407bc4b67abeec16476d261026f800e75048ef04c`;
  `production-deployment-evidence.json`
  `300688b91dfb86c2baba22ac52e9814a6d4619c4d274ecea547742e27c53d9ab`
- independent evidence validation: both JSON files parse; forbidden-key,
  bearer-value, and private-key-marker scans return zero; an independent
  public GET/HEAD check after the run returns `200`/`200`, `text/html`,
  `server: cloudflare`, and exact restored body SHA-256
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`
- GitHub API observation: `main` has strict required `verify`, enforced
  protection, pull-request review rules, stale-review dismissal, conversation
  resolution, and force-push/deletion disabled; the `production` environment
  has a `main`-only branch policy
- owner-approved
  [Immutable Preview and Hostname Purge Technical Alternative](../technical/TASK-THINSLICE-001/PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
  v1.1.0 and OWNER-DEC-TS001-PRODUCTION-DELIVERY-002
- superseded candidate `c6616a69ea9ef89c3c7d8e4e719bb49f3fd5ff38`
  received no final gate; AU-AGENT-003 identified one High and three Medium
  mandatory findings
- final exact source
  `1054a2f0a7c1385fd8d51661c6be013e90df9df5`
- independent exact-source `git show --check`, all 46 script tests, strict
  workspace typecheck, accepted-source scoped diff, and manual
  deployment/security contract review passed
- both exact-source CI runs
  [30261460673](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30261460673)
  and
  [30261463795](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30261463795)
  completed successfully
- exact-source controls include a 10-second abortable purge, abort-aware
  request and semantic backoff, one-request production observations, shared
  rollback deadline, exact prior/candidate/unknown classification, suppressed
  Wrangler upload output, and removal of the preview capability URL from live
  state and retained evidence
- protected merge `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`
  through PR #11 and successful exact-main CI run
  [30262250573](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30262250573);
  the reviewed executable paths have an empty diff from exact source
  `1054a2f0`
- single owner-authorized production run
  [30262328350](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30262328350)
  at exact protected-main source `ebdde8ec`; authorization, accepted-source
  identity, credential presence, frozen installation, typecheck, all tests,
  verified build, dependency audit, and Wrangler rehearsal passed
- run `30262328350` failed closed at stage `upload`: Wrangler returned a
  successfully created immutable version ID but no preview URL; no preview
  smoke, promotion, production cache purge, production smoke, traffic
  mutation, or rollback occurred
- retained attempt-5 artifact
  `production-deployment-ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b-30262328350`,
  artifact ID `8651402890`, digest
  `sha256:1071767b084f3c729de52d05101832b40acbae81295a59f03dcc160e5e4835ce`,
  expiring 2026-10-25
- downloaded attempt-5 evidence SHA-256:
  `production-preflight-evidence.json`
  `996584880a87e3e7a5222bcdad1d17bc67552a69461678d6dc3275e6322cb9bb`;
  `production-deployment-evidence.json`
  `f352fc10acd425dfdc0888b95f67b63cdcdf3e8bdcb662fdd734cb9e8e3eacc5`
- independent evidence validation: both JSON files parse and contain no token,
  authorization, preview capability URL, raw headers, raw body, or private-key
  material; post-run public GET and HEAD remain `200`/`200`, `text/html`,
  `server: cloudflare`, and retain the exact preflight body SHA-256
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`
- Cloudflare Dashboard observation after the run: Production Worker URL was
  enabled and Preview URLs were disabled; Cloudflare documentation and
  Wrangler 4.114.0 behavior establish this as a non-versioned remote
  prerequisite that `versions upload` does not apply

The accepted source is an ancestor of the reviewed source. The reviewed
application, packages, registered OXS fixtures, lockfile, workspace manifest,
and shared TypeScript configuration have an empty diff from the accepted
executable source.

## Verification Checks

| Area | Result | Limitation |
| --- | --- | --- |
| Source identity | Pass for exact source `1054a2f0` | Accepted application boundary is unchanged; only the exact reviewed Wrangler deployment config is excepted and separately guarded |
| Static smoke contract | Pass for implementation and fail-closed tests | Live immutable preview and production execution remain for the controlled attempt |
| Security headers | Pass in the complete preview/production contract | Live preview and production header evidence remain open |
| Immutable upload and preview smoke | Pass | Exact preview URL validation, 61-observation/120-second bounds, and capability-URL non-retention are tested; live provider behavior remains open |
| Promotion, purge, and rollback | Pass for the exact state machine | Ten-second purge deadline, promotion-or-later rollback, rollback purge, active prior version, and shared-deadline baseline restoration are tested; live execution remains open |
| Secret and capability boundary | Pass for repository/workflow scope | Values were unavailable to the reviewer; live Cloudflare token scope/configuration was not inspected |
| Branch/environment governance | Pass for reviewed source and protected merge | PR #11 exact head `1054a2f0` passed both required CI runs; protected merge `ebdde8ec` and exact-main CI `30262250573` completed without executable drift |
| Production workflow readiness | Historical exact-source gate passed; live attempt failed on external prerequisite | Attempt authority is exhausted; TS001-DEPLOY-012/013 require remediation and new exact-source review before any new attempt |

## Findings

| Finding ID | Severity | Evidence and Risk | Required Disposition | Owner | Reverification Condition | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TS001-DEPLOY-001 | High | Workflow lines 26–32 at the original source placed `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in job-level `env`, making them available to setup, dependency installation, tests, build, audit, and rehearsal. This violated least privilege. | Remove both secrets from job scope. Expose them only to the minimum credential preflight and deployment step; retain secret-name-only documentation and sanitized evidence. | AU-CODEX-PRIMARY / AU-AGENT-001 | Exact-source workflow review confirms no install, test, build, audit, rehearsal, or unrelated action receives either credential. | Resolved at `2c886390091fd8b05b18130c1555dcaf0a778d7a` |
| TS001-DEPLOY-002 | High | At the original source, the three new tests exercised only `inspectProductionDeployment`; the production-mutating state machine had no automated success, failure, rollback, or evidence tests. | Make the orchestrator testable through injected command/network/file boundaries and add deterministic tests for the successful sequence and failures before and after promotion, including rollback and evidence preservation. | AU-AGENT-001 | Focused tests prove command order, fail-closed behavior, rollback invocation, rollback failure reporting, and evidence output; full local and remote gates pass. | Resolved at `2c886390091fd8b05b18130c1555dcaf0a778d7a` |
| TS001-DEPLOY-003 | Medium | At the original source, rollback verified only the public-root body hash, not the recorded prior version at 100% and the complete registered public baseline. | Confirm the active prior version and its traffic allocation after rollback, then verify the recorded rollback baseline and retain that result. Preserve both the original deployment error and any rollback error. | AU-AGENT-001 | Failure-path test evidence and the resulting evidence schema demonstrate exact-version restoration and post-rollback validation. | Resolved at `2c886390091fd8b05b18130c1555dcaf0a778d7a` |
| TS001-DEPLOY-004 | Medium | At the original source, the job-level branch/commit `if` skipped the only job rather than producing an explicit failed authorization record. | Replace the job-level skip with an always-entered, fail-closed authorization check before environment access and mutation. | AU-CODEX-PRIMARY | Tests show wrong branch/SHA fails explicitly before the production environment job can run. | Resolved at `2c886390091fd8b05b18130c1555dcaf0a778d7a` |
| TS001-DEPLOY-005 | High | Run `30250084131` used the one further attempt authorized by the v1.3.0 gate. Candidate smoke passed at zero traffic on attempt 17 and promotion occurred, but post-promotion smoke exhausted all six attempts and the workflow rolled back. Production could not complete under the prior transition contract. | Do not run another deployment under the prior contract. Obtain an explicit Project Owner disposition on AU-TAP-TS001-001 or another separately reviewed alternative. If approved, implement the bounded state machine with deterministic tests and return its exact source to AU-AGENT-003 before deployment. | Project Owner for alternative authority; AU-AGENT-001 for technical meaning; AU-CODEX-PRIMARY for implementation | Approved alternative, exact implementation, focused tests, required CI, independent AU-AGENT-003 reverification, and a new explicitly authorized deployment attempt | Resolved at `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`; merge and the single live attempt remain separate gates |
| TS001-DEPLOY-006 | Medium | The initial AU-TAP-TS001-001 draft incorrectly attributed the final retained observation's exact prior hash, absent CSP, and `cf-cache-status: HIT` properties to every post-promotion attempt. Retained evidence proves six attempts were exhausted and records those properties only for the final observation; attempts 1–5 are not individually retained. | Replace the overgeneralized claim with the evidence-supported statement: six attempts were exhausted, and the final retained observation matched the exact prior hash with no CSP and cache HIT. Apply the same epistemic limit to related proposed documentation. | AU-AGENT-001 for claim meaning; AU-AGENT-002 for consistency | Documentation diff contains no per-attempt claim beyond retained evidence and preserves the actual final observation plus attempt count | Resolved in the reviewed documentation-only worktree diff; final-source preservation remains required |
| TS001-DEPLOY-007 | High | The single attempt authorized by OWNER-DEC-TS001-PRODUCTION-TRANSITION-001 exhausted its authority without completing production. After complete zero-traffic verification and promotion, transition attempt 3 observed the exact candidate sentinel, but the immediately following one-shot full contract received the exact prior placeholder hash with missing CSP and `cf-cache-status: HIT`. Alternative A correctly failed closed and restored the exact prior version/baseline; the evidence proves safe behavior but not stable default-route candidate delivery. | Do not retry, extend the window, weaken candidate verification, or change routing/deployment behavior under current authority. Register the incident evidence and require a separately reviewed technical alternative or explicit stop decision with Project Owner disposition before any new production mutation. | AU-AGENT-001 for technical analysis; AU-CODEX-PRIMARY for governance/evidence; Project Owner for any new alternative or attempt | Approved next disposition; if it authorizes implementation or another attempt, exact design/source review, deterministic tests, required CI, protected merge, and explicit attempt authority | Resolved by OWNER-DEC-TS001-PRODUCTION-DELIVERY-002, AU-TAP-TS001-002, and exact-source AU-AGENT-003 `VERIFIED` gate at `1054a2f0`; live attempt remains separate evidence |
| TS001-DEPLOY-008 | High | Superseded source `c6616a6` had no timeout or abort on production and rollback hostname purge. A hung request after promotion could leave the candidate at 100 percent until job termination and prevent the promised rollback path. | Bound every purge operation and prove that timeout enters the existing promotion-or-later rollback path. | AU-CODEX-PRIMARY / AU-AGENT-001 | Abortable strict timeout, deterministic hung-purge test, state-machine rollback coverage, exact-source re-review | Resolved at `1054a2f0a7c1385fd8d51661c6be013e90df9df5` |
| TS001-DEPLOY-009 | Medium | Superseded source `c6616a6` did not abort request or semantic backoff immediately and gave rollback snapshots a new fixed timeout rather than the shared remaining deadline. The strict 120-second contract could be exceeded. | Make requests and both retry layers abort-aware, remove inner production request retry, and pass the remaining rollback deadline into each snapshot. | AU-CODEX-PRIMARY / AU-AGENT-001 | Mid-request, request-backoff, semantic-backoff, transport, timeout, and late-snapshot tests; exact-source re-review | Resolved at `1054a2f0a7c1385fd8d51661c6be013e90df9df5` |
| TS001-DEPLOY-010 | Medium | Superseded source `c6616a6` labelled every non-prior root observation `candidate-contract`, including content that did not match the exact preview sentinel. | Classify exact prior, exact candidate sentinel, and unknown content separately; fail unknown content immediately. | AU-CODEX-PRIMARY / AU-AGENT-001 | Deterministic exact classification tests and exact-source re-review | Resolved at `1054a2f0a7c1385fd8d51661c6be013e90df9df5` |
| TS001-DEPLOY-011 | Medium | Suppressing retained JSON alone did not prevent the public preview capability URL from appearing in Wrangler output, live error state, or request errors. | Suppress upload output, remove preview origin from live state and retained evidence, and use URL-free request errors. | AU-CODEX-PRIMARY / AU-AGENT-001 | State/evidence non-disclosure tests, manual error-path review, exact-source re-review | Resolved at `1054a2f0a7c1385fd8d51661c6be013e90df9df5` |
| TS001-DEPLOY-012 | High | Run `30262328350` proved that repository `preview_urls: true` did not establish the remote Worker preview capability. Wrangler 4.114.0 `versions upload` does not apply the non-versioned subdomain setting, so the run created a version but received no preview URL. | Treat exact remote state `enabled: false`, `previews_enabled: true` as an external prerequisite. Add a read-only fail-closed preflight before upload. Any provider-state mutation requires explicit Project Owner authority and a separately reviewed idempotent action that preserves `enabled: false`; ordinary `wrangler deploy` is prohibited for this correction. | Project Owner for provider-state authority; AU-CODEX-PRIMARY / AU-AGENT-001 for implementation | Owner approval; exact-state preflight; disabled/malformed/unauthorized-state tests; complete gates; exact-source AU-AGENT-003 review | Resolved at `497991c7eb5d9c558becafa2f4d2461e639be1ec` |
| TS001-DEPLOY-013 | Medium | The upload succeeded far enough to return an immutable version ID, but preview validation failed and sanitized evidence retained neither the ID nor an upload-occurrence flag. A likely zero-traffic version therefore lacks retained provenance. | Preserve `uploadOccurred: true` and the sanitized immutable version ID whenever upload succeeded, including missing-preview failure. Continue excluding preview capability URLs and sensitive values. | AU-CODEX-PRIMARY / AU-AGENT-001 | Deterministic missing/invalid-preview tests prove version-ID retention, zero production/cache mutation, and secret/capability non-disclosure; exact-source AU-AGENT-003 review | Resolved at `497991c7eb5d9c558becafa2f4d2461e639be1ec` |
| TS001-DEPLOY-014 | High | Run `30266185702` promoted the exact preview-verified candidate and purged the hostname, but production stability attempt 3 received `404` for `/version.json` while the candidate root remained active with the exact candidate hash and required headers. Provenance and static-asset availability were not stable. | Prepare a separately reviewed Technical Alternative Proposal or incident-backed revision with explicit acceptance criteria, deterministic tests, rollback preservation, and exact-source independent review. Do not weaken the consecutive full-contract gate or repeat under current authority. | AU-AGENT-001 / AU-CODEX-PRIMARY; Project Owner for any future attempt | Approved alternative; exact implementation evidence; deterministic endpoint-instability tests; AU-AGENT-003 exact-source review; CI; protected merge; exact-main CI; separate owner attempt authority | Technical remediation task-scoped `VERIFIED` at `e22e4c7`; live production closure pending |
| TS001-DEPLOY-015 | Medium | Deployment evidence records the final root observation, stability attempt/classification, and generic `404`, but not the failed check/path or bounded summaries of attempts 1 and 2. Artifact-only audit therefore depends on workflow logs and source inference to identify `/version.json` and derive the first two full passes. | Retain safe bounded per-attempt/check evidence such as check identifier, status, and attempt result. Exclude capability URLs, raw headers/bodies, response bodies, tokens, account IDs, authorization, and secrets. | AU-AGENT-001 / AU-CODEX-PRIMARY; AU-AGENT-002 for traceability | Evidence-schema implementation; populated bounded failure test; disclosure-boundary tests; exact-source AU-AGENT-003 review | Resolved at `e22e4c7602ccaa3716c1607a928b66583accab80` |
| TS001-DEPLOY-016 | High | First remediation source `2eaae2a` retried any non-candidate Worker identity as a bounded transition, including an unregistered third version. | Permit only exact candidate, exact authenticated prior version, or tightly correlated null legacy evidence. Fail any other non-null version immediately. | AU-AGENT-001 / AU-CODEX-PRIMARY | Deterministic third-version and null-correlation tests; rollback regression; exact-source AU-AGENT-003 review | Resolved at `e22e4c7602ccaa3716c1607a928b66583accab80` |
| TS001-DEPLOY-017 | Medium | First remediation source `2eaae2a` validated the managed affinity rule but did not reject a later same-phase rule that overwrote the same header. | Prove effective ordered ruleset semantics; reject later enabled set/remove writers while allowing disabled, unrelated, and valid earlier rules. | AU-AGENT-001 / AU-CODEX-PRIMARY | Ordered-ruleset tests and exact-source AU-AGENT-003 review | Resolved at `e22e4c7602ccaa3716c1607a928b66583accab80` |

## Finding Disposition and Reverification

- **TS001-DEPLOY-001:** the workflow now provides both Cloudflare values only
  to the credential preflight and deployment steps. Setup, installation,
  typecheck, tests, build, audit, rehearsal, and artifact upload receive no
  Cloudflare credential.
- **TS001-DEPLOY-002:** the mutating lifecycle is isolated behind injected
  operations. Tests cover successful ordering, failure before mutation,
  candidate-smoke failure, post-promotion failure, automatic rollback,
  rollback verification failure, supported Cloudflare output shapes,
  preflight, upload provenance, and failure-safe JSON evidence.
- **TS001-DEPLOY-003:** rollback now queries Cloudflare state, requires the
  recorded prior version at 100% traffic, compares GET/HEAD status, body hash,
  and content type with the recorded public baseline, and retains original and
  rollback failure stages. Tests preserve both error causes.
- **TS001-DEPLOY-004:** a separate `authorize` job validates `main` and the
  exact full commit before the `deploy` job can request the production
  environment. Non-main and mismatched-commit cases fail explicitly in tests.
- **TS001-DEPLOY-005:** OWNER-DEC-TS001-PRODUCTION-TRANSITION-001 approves
  Alternative A. Exact source `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`
  implements the bounded classifier, deterministic state and timeout tests,
  fail-closed rollback integration, and sanitized evidence. Exact-source CI
  run `30252463472` passes.
- **TS001-DEPLOY-006:** AU-TAP-TS001-001 and every related proposed/current
  status record now state only that production smoke exhausted six attempts
  and that the final retained observation matched the exact prior baseline
  hash with no CSP and `cf-cache-status: HIT`. No reviewed record attributes
  those final-observation properties to attempts 1–5.
- **TS001-DEPLOY-007:** OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 approves the
  separate immutable-preview and hostname-purge continuation, its exact-source
  review, protected merge, and one controlled attempt. AU-TAP-TS001-002 records
  the new bounds without rewriting the failed-closed historical evidence.
- **TS001-DEPLOY-008:** each production and rollback purge is abortable and
  limited to 10 seconds; timeout enters the existing rollback state machine.
- **TS001-DEPLOY-009:** request and semantic backoffs are abort-aware,
  production stability performs no inner request retry, and rollback snapshots
  receive only the shared remaining deadline.
- **TS001-DEPLOY-010:** stability classifies exact prior baseline, exact
  candidate sentinel with a failed contract, and unknown content separately.
- **TS001-DEPLOY-011:** Wrangler upload output is suppressed; preview origins
  are absent from deployment state, request errors, and retained evidence.

Findings TS001-DEPLOY-001 through TS001-DEPLOY-011 are resolved without
changing product behavior or the accepted executable application scope.
Findings TS001-DEPLOY-012 and TS001-DEPLOY-013 are resolved at exact source
`497991c7eb5d9c558becafa2f4d2461e639be1ec`. Protected merge and exact-main CI
remain mandatory before the single authorized production attempt.

## Propagation Remediation Reverification

| Control | Exact-source evidence | Result |
| --- | --- | --- |
| Complete semantic retry | `inspectProductionDeployment` reruns root, exact `version.json` provenance, SPA fallback, methods, headers, and assets after any semantic failure; the stale-`200` test passes on semantic attempt 2 | Pass |
| Domain ownership before mutation | The Workers Domains API query filters and then requires exactly one `abris.653915.com` to `abris-universe` assignment before deployment-list inspection, immutable upload, or traffic mutation | Pass |
| Sanitization | The bearer token and account ID are used only for the authenticated query and are never copied into evidence; retained domain evidence is limited to domain ID, hostname, service, environment, and zone name; attempt-1 logs mask both secret values | Pass |
| Hidden evidence retention | The SHA-pinned artifact action explicitly enables `include-hidden-files` while retaining only `.production-deployment/*.json` | Pass |
| Failure and rollback | Attempt 1 proved zero candidate traffic, no promotion, exact prior-version rollback at 100 percent, and public-baseline restoration; remediation does not weaken the existing failure state machine | Pass |
| Tests and CI | 17 focused tests and two exact-source remote CI runs pass | Pass |
| Documentation accuracy | Technical Design, ADR, deployment record, risks, tasks, traceability, completion boundary, and current state distinguish attempt-1 evidence, implemented remediation, remaining TD-GATE-003 evidence, and absent corrected production/browser results | Pass |

No new `Critical`, `High`, `Medium`, `Low`, or `Recommendation` finding was
identified in the bounded remediation.

## Extended Observability Reverification

| Control | Exact-source evidence | Result |
| --- | --- | --- |
| Bounded retry | Zero-traffic pre-promotion smoke explicitly receives 61 complete semantic attempts with 60 two-second intervals; ordinary and post-promotion production smoke retain the six-attempt default | Pass |
| Final observation | A failed root semantic check retains only status, body SHA-256, CSP, `cf-cache-status`, server, final attempt, and exhausted-attempt count | Pass |
| Prohibited data | The observation object has no HTML body, token, account ID, Authorization value, request header, or generic environment field; the test asserts absence of `body` and a valid SHA-256 | Pass |
| Evidence plumbing | The deployment failure record copies only the bounded observation and numeric attempt fields from the final semantic cause; existing sanitized JSON writer and hidden-artifact retention remain unchanged | Pass |
| Failure and rollback | The change does not alter the zero-traffic, promotion, exception, or rollback state machine; exhaustion still fails pre-promotion and invokes exact rollback | Pass |
| Source identity | Accepted application, package, fixture, lockfile, workspace, and shared TypeScript paths have an empty diff from `1a683abd` | Pass |
| Tests and CI | 19 focused deployment tests pass, including an explicit 61-versus-6 boundary assertion; final-source CI runs `30249687717` and `30249690631` pass | Pass |
| Documentation | Run 2, TD-GATE-003 closure, the final bounded attempt, sanitization, and the mandatory Technical Alternative Proposal after another stale result are explicit | Pass |

Superseded source `73811129` was rejected before merge because its global
61-attempt default also applied after promotion. Exact correction `a503500`
restores the six-attempt production default and applies 61 attempts explicitly
only while the candidate remains at zero traffic. No finding remains in the
final bounded remediation.

## Repository Remediation Quality Gate Decision — Historical

- **Engineering Verification Status:** VERIFIED
- **Rationale:** all prior findings remain resolved, and exact remediation
  `854ba305` adds bounded semantic propagation retry, fail-closed exact-domain
  ownership proof before mutation, sanitized hidden evidence, and regression
  tests. Exact observability remediation `a503500` extends only zero-traffic
  pre-promotion smoke to approximately two minutes, preserves six attempts
  after promotion, and retains a strict final-observation allowlist without
  changing accepted application source or weakening rollback.
- **Mandatory unresolved findings:** None.
- **Merge allowed:** Yes, subject to the registered conflict-free,
  and branch-protection workflow; both final-source required CI runs pass.
  Superseded source `73811129` is not mergeable.
- **Protected deployment retry authorized at that gate:** Yes, one further
  attempt only after
  exact observability remediation `a503500` is
  merged to protected `main` and the dispatch input equals that exact main
  commit. The candidate must remain at zero traffic until the complete smoke
  contract passes. Another exhausted semantic window requires a Technical
  Alternative Proposal rather than another silent retry or weakened gate.
- **Required next action:** merge the independently reverified remediation,
  dispatch the exact protected main commit, retain the preflight/deployment
  JSON, and independently assess the resulting production and browser
  evidence.

This task-scoped status is not project `[VERIFIED]` and does not change the
bounded Claude Cowork acceptance of executable source `1a683abd`.

That `VERIFIED` decision remains valid for exact deployment-tooling source
`a503500`. Its single retry authorization was exhausted by run `30250084131`;
it did not guarantee that Cloudflare's default custom-domain route would
converge within the approved post-promotion window.

## Attempt 3 Evidence Gate Decision — Historical

- **Engineering Verification Status:** BLOCKED
- **Evidence validity:** The run identity, artifact digest, route ownership,
  accepted source, candidate identity, successful zero-traffic semantic
  attempt 17, promotion state, exhausted post-promotion attempt count, final
  retained prior-baseline observation, rollback version, and restored baseline
  are supported.
- **One allowed retry:** Exhausted by run `30250084131`.
- **Mandatory unresolved finding at that gate:** TS001-DEPLOY-005.
- **Documentation-only branch:** VERIFIED for the bounded evidence-wording
  correction and cross-document consistency in the reviewed worktree diff.
  This is an unbracketed, task-scoped engineering disposition; it is not
  project `[VERIFIED]`, owner approval of AU-TAP-TS001-001, or production
  authorization. The correction must remain unchanged in the final committed
  source.
- **Further deployment allowed under that gate:** No.
- **Blocker:** Project Owner disposition on AU-TAP-TS001-001, followed by any
  approved implementation, deterministic state/timeout tests, required CI, and
  exact-source AU-AGENT-003 review.
- **Disposition:** Superseded for future-deployment authority by
  OWNER-DEC-TS001-PRODUCTION-TRANSITION-001 and the exact-source Alternative A
  gate below. The historical failed-closed evidence and rollback result remain
  unchanged.

That historical `BLOCKED` status was scoped to production-deployment
continuation. It did not revoke the repository-remediation `VERIFIED`
decision, bounded independent product acceptance, or TD-GATE-003 closure.

## Alternative A Exact-Source Reverification

| Control | Exact-source evidence | Result |
| --- | --- | --- |
| Owner authority | OWNER-DEC-TS001-PRODUCTION-TRANSITION-001 approves AU-TAP-TS001-001 Alternative A, implementation, independent review, and one subsequent controlled attempt after gates | Pass |
| Exact prior baseline | `matchesPriorBaseline` requires exact GET status, HEAD status, body SHA-256, and content type from the registered preflight snapshot; only that state may wait | Pass |
| Exact candidate and full contract | The candidate sentinel requires the zero-traffic root status/hash from smoke evidence whose observed commit equals the exact source; its first observation triggers one complete provenance, root/fallback, method, header, and asset contract with no semantic retry | Pass |
| Observation ceiling | Production uses the fixed default of 61 direct observations; tests assert the 61-attempt constant and exercise exhaustion behavior | Pass |
| Time ceiling | Production uses the fixed strict 120,000 ms transition ceiling; every probe receives only the remaining interval through `AbortSignal.timeout`, and bounded-delay timeout behavior is tested | Pass |
| Unknown and transport states | Any response outside the exact prior and candidate classifications, redirect/transport failure, or probe failure throws immediately without another transition observation | Pass |
| Candidate failure | A candidate sentinel followed by any complete-contract failure throws immediately; the candidate path explicitly uses one semantic attempt | Pass |
| Rollback integration | Every transition exception enters the existing production-smoke failure path, restores the recorded immutable prior version at 100 percent, and verifies the registered public baseline; state tests cover post-promotion failure and rollback-verification failure | Pass |
| Evidence allowlist | Failure evidence copies only registered numeric/classification fields and allowlisted observation metadata; tests prove response bodies, request headers, tokens, authorization values, and account values are excluded | Pass |
| Accepted executable boundary | Application, package, fixture, lockfile, workspace, and shared TypeScript paths have an empty diff from accepted source `1a683abd9a8294de5a36888e997e65aba7b7a167` | Pass |
| Tests | Independent rerun: 27 focused deployment tests and the complete 95-test suite passed; supplied strict typecheck, clean static build, audit, Wrangler rehearsal, and patch-hygiene evidence passed | Pass |
| Remote CI | GitHub Actions run `30252463472` completed its exact-source `verify` job successfully at `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7` | Pass |
| Documentation and traceability | Owner decision, TAP v1.1.0, Technical Design v1.5.9, ADR v1.3.5, deployment/rehearsal records, risks, tasks, current status, and traceability preserve the approved bounds and remaining live-evidence gates | Pass |

No new `Critical`, `High`, `Medium`, `Low`, or `Recommendation` finding was
identified in the exact-source Alternative A implementation.

## Alternative A Quality Gate Decision

- **Engineering Verification Status:** VERIFIED
- **Exact source:** `b4f25cdaaf5da1e37e416bf7d2bc7f148b5dd7e7`.
- **TS001-DEPLOY-005:** Resolved.
- **Mandatory unresolved findings:** None.
- **Merge allowed:** Yes, through the registered protected, conflict-free
  workflow, provided the merge preserves the reviewed implementation and
  documentation diff and all mandatory checks pass. A content-changing merge
  requires another exact-source review.
- **Production attempt allowed:** Yes, exactly one controlled attempt after
  protected merge. The dispatch must select the resulting exact protected
  `main` source and must not be repeated without a new explicit authority and
  evidence review.
- **Required evidence:** Retain preflight, transition, production-smoke, and
  rollback evidence as applicable, then return the live production and browser
  result to AU-AGENT-003.

This task-scoped `VERIFIED` status approves the owner-authorized deployment
tooling for merge and one bounded attempt. It is not product `[VERIFIED]`,
successful production verification, browser acceptance, or release
authorization.

## Immutable Preview and Hostname Purge Exact-Source Reverification

| Control | Exact-source evidence | Result |
| --- | --- | --- |
| Owner authority | OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 approves AU-TAP-TS001-002, implementation, independent review, protected merge, and one controlled production attempt | Pass |
| Exact reviewed source | `1054a2f0a7c1385fd8d51661c6be013e90df9df5`; `git show --check` passed | Pass |
| Preview identity and bounds | Wrangler's exact version ID and immutable preview are captured; the full preview contract is limited to 61 semantic observations and 120 seconds | Pass |
| Production mutation boundary | Only the exact previewed version can be promoted; mutation is marked before promotion and every promotion-or-later failure enters rollback | Pass |
| Purge scope and timeout | The purge body contains only `abris.653915.com`; every production and rollback purge has a strict abortable 10-second timeout | Pass |
| Stability classification and quorum | Exact prior, exact candidate sentinel, and unknown content are distinct; production requires three consecutive complete contracts within 25 observations and 120 seconds | Pass |
| Abort and deadline behavior | Requests and both retry layers are abort-aware; production observations have no inner retry; rollback snapshots share the remaining deadline | Pass |
| Rollback path | Tests cover exact prior-version restoration, rollback purge, active-version confirmation, bounded baseline restoration, and rollback failure | Pass |
| Evidence and capability boundary | Wrangler upload output is suppressed; preview origin, tokens, zone ID, request headers, raw bodies, and authorization values are absent from retained lifecycle evidence | Pass |
| Accepted executable boundary | Accepted application, package, fixture, lockfile, workspace, and shared TypeScript paths remain unchanged; the reviewed Wrangler configuration is separately exact-guarded | Pass |
| Tests | Independent rerun passed all 46 script tests; strict workspace typecheck passed | Pass |
| Remote CI | Runs `30261460673` and `30261463795` completed successfully at the exact reviewed source | Pass |
| Documentation and traceability | The approved alternative, design, ADR, deployment record, rehearsal, risks, tasks, open question, traceability, status, and review record preserve the exact bounds and remaining live-evidence gates | Pass |

No `Critical`, `High`, `Medium`, `Low`, or `Recommendation` finding remains
for exact source `1054a2f0a7c1385fd8d51661c6be013e90df9df5`.
Findings TS001-DEPLOY-008 through TS001-DEPLOY-011 are resolved at that source.

## Immutable Preview and Hostname Purge Quality Gate Decision

- **Quality Gate Decision:** PASS.
- **Engineering Verification Status:** VERIFIED.
- **Exact source:** `1054a2f0a7c1385fd8d51661c6be013e90df9df5`.
- **Mandatory unresolved findings:** None.
- **Pull request may leave draft:** Yes, only if its executable implementation
  remains identical to the exact reviewed source.
- **Protected merge allowed:** Yes, only with required checks passing and no
  content-changing conflict resolution. A changed implementation requires a
  new exact-source review.
- **Production attempt allowed:** Yes, exactly one controlled attempt after
  protected merge, dispatched against the exact resulting protected `main`
  source. No automatic repeat is authorized.
- **Required live evidence:** Retain immutable-preview, purge, production
  stability, and rollback evidence as applicable, then independently assess
  the resulting production and browser state.

This task-scoped, unbracketed `VERIFIED` status is an engineering disposition.
It is not project `[VERIFIED]`, product acceptance, successful production
verification, or permission for more than the one owner-authorized attempt.

## Attempt 5 Evidence Assessment

| Control | Retained evidence | Result |
| --- | --- | --- |
| Exact source and authority | Protected-main source `ebdde8ec`; owner authorization and accepted-source gates passed | Pass |
| Prerequisite checks | Credential presence, frozen installation, typecheck, all tests, verified build, dependency audit, and rehearsal passed | Pass |
| Upload result | Wrangler returned a version ID but no preview URL; workflow failed closed at `upload` | Fail — TS001-DEPLOY-012 |
| Production integrity | `productionMutationAttempted: false`; no promotion, production purge, production smoke, or traffic change | Pass |
| Rollback | Not attempted and not required because production was not mutated | Pass |
| Public baseline | Independent GET/HEAD and exact body SHA-256 match retained preflight evidence | Pass |
| Evidence safety | Artifact and logs exclude secrets and the preview capability URL | Pass |
| Upload provenance | Successfully created version ID was discarded after preview validation failed | Fail — TS001-DEPLOY-013 |

No `Critical` finding and no production-integrity, cache-integrity, rollback, or
secret-compromise finding was identified. A likely orphan immutable version
remains at zero traffic, but its exact ID is unavailable from retained
sanitized evidence.

## Attempt 5 Quality Gate Decision

- **Quality Gate Decision:** FAIL — production continuation blocked.
- **Engineering Verification Status:** REWORK REQUIRED.
- **Exact live source:** `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`.
- **Mandatory unresolved findings:** TS001-DEPLOY-012 (High) and
  TS001-DEPLOY-013 (Medium).
- **Prior attempt authority:** exhausted by run `30262328350`; no repeat is
  authorized under OWNER-DEC-TS001-PRODUCTION-DELIVERY-002.
- **New conditional authority:** OWNER-DEC-TS001-PRODUCTION-PREVIEW-003
  authorizes one separate attempt only after remediation, exact-source
  AU-AGENT-003 review, protected merge, and exact-main CI. It is not yet
  exercisable at this report revision.
- **Provider state:** the Project Owner authorized exact state
  `enabled: false`, `previews_enabled: true`; Dashboard application and reload
  confirmation are registered. This does not resolve findings without
  exact-source implementation review.
- **Required remediation:** register the run and findings; obtain explicit
  owner authority for the exact remote state and another attempt; implement
  read-only exact-state preflight and sanitized version-ID preservation; add
  deterministic prerequisite, idempotency, no-mutation, provenance, and
  disclosure-boundary tests; pass complete local and CI gates; obtain
  AU-AGENT-003 exact-source review; merge through protection; then obtain or
  exercise only the exact new attempt authority.

The historical exact-source `VERIFIED` disposition for implementation
`1054a2f0` remains valid for that reviewed code. It does not override this
later live-evidence `REWORK REQUIRED` decision.

## Remote Preview Prerequisite Exact-Source Reverification

| Control | Exact-source evidence | Result |
| --- | --- | --- |
| Owner authority | OWNER-DEC-TS001-PRODUCTION-PREVIEW-003 approves exact provider state, remediation, independent review, protected merge, exact-main CI, and one later attempt without repeat | Pass |
| Exact source | `497991c7eb5d9c558becafa2f4d2461e639be1ec`; direct child of protected main `d298021`; `git show --check` passed | Pass |
| Provider state | Authenticated Dashboard action and full reload recorded `enabled: false`, `previews_enabled: true`; custom domain, DNS, traffic allocation, and cache unchanged | Pass with declared manual-evidence boundary |
| Read-only preflight | Authenticated Worker-subdomain GET uses redirect rejection and a ten-second abort; exact booleans are required before upload | Pass |
| Fail-closed order | False, missing, malformed, unauthorized, or non-exact state fails at `remote-preview-preflight` with no upload, smoke, promotion, purge, production mutation, or rollback | Pass |
| Upload provenance | Missing, malformed, and non-Cloudflare preview values normalize to `previewUrl: null`; lifecycle retains `uploadOccurred: true` and sanitized version ID before generic failure | Pass |
| Capability and secret boundary | Valid preview URL remains transient; malformed raw input, preview capability URL, tokens, account ID, authorization, raw headers, and raw bodies are absent from lifecycle/evidence | Pass |
| Evidence contract | Deployment evidence schema v3 adds normalized remote state, upload occurrence, and sanitized candidate version; preflight evidence remains schema v2 | Pass |
| Existing controls | Immutable preview, exact promotion, hostname-only purge, stability quorum, bounded deadlines, rollback, rollback purge, and no-repeat controls are unchanged | Pass |
| Tests and verification | 20 focused tests, 49 complete script tests, 68 package tests, strict typecheck, fixtures, workspace boundary, accepted-source diff, 103 changed-document links, and patch hygiene passed independently | Pass |

Superseded candidates `152effa` and `c64799b` receive no final gate.

## Remote Preview Prerequisite Quality Gate Decision

- **Quality Gate Decision:** PASS.
- **Engineering Verification Status:** VERIFIED.
- **Exact source:** `497991c7eb5d9c558becafa2f4d2461e639be1ec`.
- **TS001-DEPLOY-012:** Resolved.
- **TS001-DEPLOY-013:** Resolved.
- **Mandatory unresolved findings:** None.
- **Branch/PR:** May be pushed and merged through protection only if executable
  head remains exact, required CI passes, and conflict resolution changes no
  content.
- **Production attempt:** Exactly one controlled attempt may proceed only after
  protected merge and successful exact-main CI against that merge commit.
  Failure exhausts the authority; no automatic or manual repeat is authorized.

This task-scoped, unbracketed `VERIFIED` status is an engineering disposition.
It is not project `[VERIFIED]`, product acceptance, live production success, or
release approval.

## Attempt 6 Live-Evidence Review

| Control | Evidence | Result |
| --- | --- | --- |
| Exact source and gates | PR #13; protected-main merge `53389089fecf571705c27d620e11243f9a31f99d`; merge tree byte-identical to reviewed head; exact-main CI `30266042191` passed on its same-SHA failed-job rerun | Pass |
| Workflow prerequisites | Run `30266185702`; authorization, accepted-source identity, credential presence, frozen install, typecheck, tests, build, audit, and rehearsal passed | Pass |
| Remote state | Authenticated read-only preflight returned `enabled: false`, `previewsEnabled: true` | Pass |
| Immutable preview | Candidate `4e32ad7b-5518-4cca-af10-bca94334b92e` passed the complete contract at exact source `53389089` | Pass |
| Promotion and purge | Candidate promoted to 100 percent; hostname-only purge returned `200` and success | Pass |
| Production stability | Attempt 3 kept the exact candidate root/HEAD/hash/CSP but `GET /version.json` returned `404`; attempts 1 and 2 are only `[DERIVED]` to have passed because individual summaries are not retained | Fail — TS001-DEPLOY-014/015 |
| Rollback | Prior version `d1f2b05d-77d0-4d53-9c7a-73d61135979e` restored at 100 percent; rollback purge succeeded; retained and independent GET/HEAD/hash checks restored the exact baseline | Pass; rollback sub-result task-scoped `VERIFIED` |
| Evidence retention | Artifact `8652895888`, digest `sha256:ca292e72a7a071b1577d21b004224ac35339fffe1bf741d3af21ef0b731faa6c`, retained until 2026-10-25; registered JSON checksums independently matched | Pass with TS001-DEPLOY-015 |
| Disclosure boundary | No token, secret, authorization, account ID, preview URL, raw request headers, response body, or Workers preview hostname in retained JSON | Pass |

The immediate failure mechanism has high confidence: `/version.json` returned
`404` during production stability after the candidate root remained healthy.
The underlying Cloudflare mechanism has only low-to-medium confidence. Routing,
propagation, or cache inconsistency is plausible but not distinguished by this
single run.

## Attempt 6 Quality Gate Decision

- **Quality Gate Decision:** FAIL.
- **Engineering Verification Status:** REWORK REQUIRED.
- **Exact live source:** `53389089fecf571705c27d620e11243f9a31f99d`.
- **Mandatory unresolved findings:** TS001-DEPLOY-014 (High) and
  TS001-DEPLOY-015 (Medium).
- **Rollback sub-result:** VERIFIED within this task scope.
- **Candidate production result:** failed; candidate is not active.
- **Current production:** prior registered baseline restored and independently
  rechecked.
- **Authority:** exhausted. No automatic or manual repeat is authorized.
- **Next gate:** register the run/findings; prepare a separately reviewed
  Technical Alternative Proposal and evidence-schema remediation; obtain
  exact-source AU-AGENT-003 review before any new owner authorization.

This task-scoped status is not project `[VERIFIED]`, product acceptance,
successful production deployment, or release approval.

## Deployment-Transition Remediation Review

### First Exact-Source Review

- **Exact source:** `2eaae2ad122d920516bbc7bbd5d599f724822de1`.
- **Quality Gate Decision:** FAIL.
- **Engineering Verification Status:** REWORK REQUIRED.
- **Findings:** TS001-DEPLOY-016 (High), TS001-DEPLOY-017 (Medium), and the
  populated serializer-evidence condition of TS001-DEPLOY-015.
- **Disposition:** Unknown third Worker identities were not immediately
  rejected; a later same-phase rule could overwrite the affinity header; and
  populated nested evidence allowlisting/bounds lacked direct testing. Merge
  and production were not allowed at this source.

### Exact Remediation Reverification

- **Exact source:** `e22e4c7602ccaa3716c1607a928b66583accab80`.
- **Quality Gate Decision:** PASS.
- **Engineering Verification Status:** VERIFIED, task-scoped only.
- **Mandatory unresolved findings:** None.
- **TS001-DEPLOY-016:** resolved. The exact authenticated prior version is
  passed into stability verification; any non-null identity outside the exact
  candidate/prior pair fails attempt 1 as `unrecognized`. Null identity is
  bounded only with null source provenance on a transition-sensitive
  provenance or asset path.
- **TS001-DEPLOY-017:** resolved. Exactly one managed rule is required; later
  enabled same-header set/remove rules are rejected case-insensitively.
  Disabled collisions, unrelated later headers, and earlier writers followed
  by the final managed rule are covered.
- **TS001-DEPLOY-015:** resolved for technical integration. Serializer tests
  supply 30 attempts and 30 checks, prove 25/24 bounds, retain the failed
  check and allowed identifiers, and reject nested bodies, authorization,
  headers, cookies, tokens, and preview capability data.
- **TS001-DEPLOY-014:** technical remediation is fit for protected
  integration. Live production closure remains separate.
- **Rollback preservation:** production state machine, rollback, second purge,
  active prior-version confirmation, and exact registered baseline
  verification are unchanged and regression-tested.
- **Evidence:** 49 focused tests; 60 script tests; 70 package tests; complete
  typecheck; production build/static verification; Wrangler rehearsal;
  dependency audit with no known High-threshold vulnerability; clean patch
  and worktree.
- **Limitations:** no production mutation, no multi-region convergence proof,
  and no product acceptance are assigned by this review.
- **Merge disposition:** executable remediation may proceed to documentation
  integration, exact-head preservation review, branch CI, and protected merge.
- **Deployment disposition:** this engineering review does not itself
  authorize production execution.

## Residual External Blockers

- TD-GATE-003 is closed by retained run `30248680612`.
- Remote Worker subdomain state passed attempt 6 as `enabled: false`,
  `previews_enabled: true`; later drift remains fail-closed.
- The exact immutable version created by attempt 5 cannot be reconstructed
  from retained sanitized evidence and likely remains orphaned at zero traffic.
- Findings TS001-DEPLOY-012 and TS001-DEPLOY-013 are resolved at exact source
  `497991c`; PR #13, protected merge, and exact-main CI completed.
- TS001-DEPLOY-015/016/017 are resolved at `e22e4c7`.
  TS001-DEPLOY-014 technical remediation is task-scoped `VERIFIED`; live
  production completion remains open until protected integration, exact-main
  gates, and a controlled production result pass.
- Immutable preview, exact promotion, hostname purge, rollback purge, and exact
  baseline restoration are proven. Stable production delivery is not.
- Production security headers, runtime request inventory, browser network
  capture, console, import entry point, and live post-promotion assertions
  remain open.
- A single workflow runner cannot prove simultaneous global edge convergence.

These items remain mandatory evidence. Attempt authority is exhausted; no
repeat is authorized.

## References

- [Production Deployment Record](../technical/TASK-THINSLICE-001/PRODUCTION_DEPLOYMENT.md)
- [Immutable Preview and Hostname Purge Technical Alternative](../technical/TASK-THINSLICE-001/PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
- [Remote Preview Enablement Technical Alternative](../technical/TASK-THINSLICE-001/PRODUCTION_PREVIEW_ENABLEMENT_TECHNICAL_ALTERNATIVE.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Cloudflare Workers Domains API](https://developers.cloudflare.com/api/resources/workers/subresources/domains/methods/list/)
- [Cloudflare Version Overrides](https://developers.cloudflare.com/workers/versions-and-deployments/version-overrides/)
- [Cloudflare Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
- [Cloudflare Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Cloudflare Worker Subdomain API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/subdomain/)
