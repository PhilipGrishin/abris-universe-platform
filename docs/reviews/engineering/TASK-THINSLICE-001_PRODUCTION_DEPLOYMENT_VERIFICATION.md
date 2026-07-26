# Engineering Verification Report — TASK-THINSLICE-001 Production Deployment

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-ENG-TS001-DEPLOY-001 |
| Title | Engineering Verification Report — TASK-THINSLICE-001 Production Deployment Readiness |
| Status | `[IMPLEMENTED]`, `[TESTED]`; not project `[VERIFIED]` |
| Owner | AU-AGENT-003 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.0.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | PROD-DEC-013; Technical Design v1.5.3; ADR-TS001-004 v1.2.0; accepted executable source `1a683abd9a8294de5a36888e997e65aba7b7a167`; production deployment record |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Reviewed-source change; finding remediation; deployment, credential, rollback, smoke, evidence, branch, or environment-control change |

## Review Identity

- **Task ID:** TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT.
- **Exact reviewed source:** commit
  `4097a5cac0bbddfe11bf73718979ea41eeb26113` on
  `codex/task-thinslice-001-client-integration`.
- **Accepted executable source:** commit
  `1a683abd9a8294de5a36888e997e65aba7b7a167`.
- **Implementation owner:** AU-CODEX-PRIMARY with AU-AGENT-001 technical
  approval.
- **Reviewer:** AU-AGENT-003.
- **Independence:** AU-AGENT-003 did not author or modify the reviewed workflow
  or deployment scripts. This report and its index link are its only outputs.
- **Scope:** production workflow permissions and gates, source identity,
  immutable upload, zero-traffic smoke, promotion, rollback, evidence safety,
  smoke assertions, tests, and observed GitHub controls.
- **Out of scope:** Cloudflare account state, unavailable secret values,
  production mutation, live rollback, browser acceptance, DNS, and product
  acceptance.
- **Documentation Impact:** Material.

## Evidence

- `.github/workflows/deploy-production.yml`
- `scripts/deploy-production.mjs`
- `scripts/verify-production-deployment.mjs`
- `scripts/verify-production-deployment.test.mjs`
- production deployment record, Technical Design section 12, and
  ADR-TS001-004
- local exact-source checks: accepted-source ancestry and scoped diff, syntax
  checks, typecheck, 67 tests, build verification, production dependency audit,
  and Wrangler no-deploy rehearsal
- remote CI run
  [30218926302](https://github.com/PhilipGrishin/abris-universe-platform/actions/runs/30218926302):
  successful `verify` job at the exact reviewed commit
- GitHub API observation: `main` has strict required `verify`, enforced
  protection, pull-request review rules, stale-review dismissal, conversation
  resolution, and force-push/deletion disabled; the `production` environment
  has a `main`-only branch policy

The accepted source is an ancestor of the reviewed source. The reviewed
application, packages, registered OXS fixtures, lockfile, workspace manifest,
and shared TypeScript configuration have an empty diff from the accepted
executable source.

## Verification Checks

| Area | Result | Limitation |
| --- | --- | --- |
| Source identity | Pass for the exact reviewed source | Reusable-workflow hardening is recorded below |
| Static smoke contract | Pass | Three focused tests cover success, non-HTTPS rejection, and wrong-commit rejection only |
| Security headers | Pass in code and local test scope | Production responses remain unobserved |
| Immutable upload and zero-traffic smoke | Correctly represented | No authenticated execution or orchestration test |
| Promotion and rollback | Fail readiness gate | Mutating state machine and rollback path lack test evidence |
| Secret boundary | Fail readiness gate | Cloudflare credentials are exposed at job scope |
| Branch/environment governance | Pass for observed controls | Environment secrets are absent; TD-GATE-003 remains open |
| Production readiness | Fail | Mandatory findings and external blockers remain |

## Findings

| Finding ID | Severity | Evidence and Risk | Required Disposition | Owner | Reverification Condition | Status |
| --- | --- | --- | --- | --- | --- | --- |
| TS001-DEPLOY-001 | High | Workflow lines 26–32 place `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in job-level `env`, making them available to setup, dependency installation, tests, build, audit, and rehearsal. This violates least privilege and unnecessarily exposes a production credential to code that does not deploy. | Remove both secrets from job scope. Expose them only to the minimum credential preflight and deployment step; retain secret-name-only documentation and sanitized evidence. | AU-CODEX-PRIMARY / AU-AGENT-001 | Exact-source workflow review confirms no install, test, build, audit, rehearsal, or unrelated action receives either credential. | Open |
| TS001-DEPLOY-002 | High | The three new tests exercise only `inspectProductionDeployment`. No automated test drives `deploy-production.mjs` through preflight, Cloudflare output parsing, upload, 0% deployment, promotion, failure injection, automatic rollback, rollback failure, or evidence writing. A successful HTTP-verifier test is not evidence that the production-mutating state machine is safe. | Make the orchestrator testable through injected command/network/file boundaries and add deterministic tests for the successful sequence and failures before and after promotion, including rollback and evidence preservation. No live production mutation is required. | AU-AGENT-001 | Focused tests prove command order, fail-closed behavior, rollback invocation, rollback failure reporting, and evidence output; full local and remote gates pass. | Open |
| TS001-DEPLOY-003 | Medium | After rollback the script verifies only the public-root body hash. It does not confirm that the recorded prior version is active at 100% or re-run the registered rollback baseline, while Technical Design section 12.4 requires smoke checks after rollback. | Confirm the active prior version and its traffic allocation after rollback, then verify the recorded rollback baseline and retain that result. Preserve both the original deployment error and any rollback error. | AU-AGENT-001 | Failure-path test evidence and the resulting evidence schema demonstrate exact-version restoration and post-rollback validation. | Open |
| TS001-DEPLOY-004 | Medium | The job-level branch/commit `if` skips the only job when the ref or supplied SHA is wrong. This prevents mutation but can produce a skipped workflow rather than an explicit failed authorization record. | Replace the job-level skip with an always-entered, fail-closed authorization check before environment access and mutation. | AU-CODEX-PRIMARY | A test or controlled workflow run shows wrong branch/SHA fails explicitly and cannot reach the environment or deployment command. | Open |

## Quality Gate Decision

- **Engineering Verification Status:** REWORK REQUIRED
- **Rationale:** exact-source CI and local gates pass, source identity is
  preserved for the reviewed application scope, and GitHub branch/environment
  controls are present. Two High findings nevertheless leave the production
  credential boundary and mutating deployment/rollback state machine without
  acceptable assurance.
- **Mandatory unresolved findings:** TS001-DEPLOY-001 through
  TS001-DEPLOY-004.
- **Merge allowed:** No. Project governance permits automatic merge only when
  no mandatory finding remains.
- **Main-branch dispatch allowed:** No.
- **Required next action:** AU-CODEX-PRIMARY and AU-AGENT-001 remediate the
  findings on a scoped branch, run local and remote gates, and return the exact
  remediation commit to AU-AGENT-003 for reverification.

This task-scoped status is not project `[VERIFIED]` and does not change the
bounded Claude Cowork acceptance of executable source `1a683abd`.

## Residual External Blockers

- GitHub `production` environment secrets are absent.
- TD-GATE-003 has not captured an authenticated immutable placeholder version,
  route ownership, and recoverable artifact.
- No Cloudflare production mutation, production response assertion, browser
  network capture, or live rollback evidence exists.

These external blockers remain blocking even after repository findings are
resolved.

## References

- [Production Deployment Record](../technical/TASK-THINSLICE-001/PRODUCTION_DEPLOYMENT.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Cloudflare Version Overrides](https://developers.cloudflare.com/workers/versions-and-deployments/version-overrides/)
- [Cloudflare Rollbacks](https://developers.cloudflare.com/workers/versions-and-deployments/rollbacks/)
