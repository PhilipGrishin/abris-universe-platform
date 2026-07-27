# TASK-THINSLICE-001 Production Deployment Record

| Field | Value |
| --- | --- |
| Document ID | AU-DEPLOY-TS001-001 |
| Title | TASK-THINSLICE-001 Production Deployment Record |
| Status | Attempts 1 and 2 failed closed before promotion; attempt 3 passed zero-traffic smoke, promoted, then failed closed on the exact prior cached baseline and rolled back; TD-GATE-003 closed; Technical Alternative Proposal and production/browser evidence open |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.5.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-27 |
| Dependencies | PROD-DEC-013; Technical Design v1.5.8; ADR-TS001-004 v1.3.4; Production Deployment Verification v1.4.1; Production Propagation Technical Alternative Proposal v1.0.0; bounded independent acceptance at `1a683ab`; GitHub `production` environment |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Credential, workflow, source commit, Cloudflare version, route, smoke, rollback, production failure, or deployment authorization change |
| Task ID | TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT |
| Documentation Impact | Material |

## Purpose and Scope

Record the controlled first deployment of the independently accepted Phase 0
thin slice to `https://abris.653915.com`. This record separates authorization,
pipeline readiness, external-state prerequisites, production mutation, smoke,
rollback, and final verification.

The scope is static Worker delivery only. It does not change product behavior,
DNS, local IndexedDB schema, accepted platform or format claims, Phase 1 scope,
or any unresolved acceptance finding.

## Owner Authorization

PROD-DEC-013 records the Project Owner's explicit authorization dated
2026-07-26. Authorization closes the owner-decision gate but does not replace
the factual rollback, credential, source, CI, smoke, or evidence gates.

## Accepted Source Boundary

- Independent acceptance source:
  `1a683abd9a8294de5a36888e997e65aba7b7a167`.
- The post-acceptance commits before this deployment task changed only
  documentation and Collaboration Bridge lifecycle records.
- Any executable remediation for TS001-ACCEPT-F-01 or F-03 through F-09 is
  deferred to `PHASE1-TS001-ACCEPTANCE-REWORK`; it is not included in the
  first production artifact.
- The main-branch deployment commit must be shown executable-equivalent to the
  accepted source except for deployment tooling and generated `version.json`
  provenance.

## Implemented Pipeline

The workflow `.github/workflows/deploy-production.yml`:

1. is manual and uses an authorization job without environment or secret
   access to reject non-main or mismatched-commit dispatches explicitly;
2. allows the deployment job to enter the GitHub `production` environment only
   after authorization passes;
3. requires the operator to supply the exact full main commit;
4. uses read-only repository permissions and SHA-pinned actions;
5. verifies that the application, packages, accepted OXS fixtures, lockfile,
   workspace manifest, and shared TypeScript configuration are unchanged from
   independently accepted executable source
   `1a683abd9a8294de5a36888e997e65aba7b7a167`;
6. keeps both Cloudflare values out of job scope and exposes them only to the
   credential-presence check and the final deployment step;
7. installs from the frozen lockfile;
8. runs typecheck, the full test suite, build verification, dependency audit,
   and the no-deploy rehearsal;
9. queries the Cloudflare Workers Domains API and requires
   `abris.653915.com` to be uniquely assigned to `abris-universe`;
10. reads the current Cloudflare deployment and records its immutable version,
   route ownership, and public-root baseline in a retained preflight artifact
   before any Cloudflare mutation;
11. uploads a new immutable version without normal traffic;
12. deploys the new version at zero percent beside the prior version;
13. retries the complete semantic smoke contract while Cloudflare propagates
   the version override, accepting only the exact commit and headers;
14. promotes the new version to 100 percent;
15. repeats production smoke and automatically rolls back on failure;
16. confirms after rollback that the prior immutable version owns 100 percent
   of traffic and that the recorded GET/HEAD/content/hash baseline is restored;
17. retains sanitized preflight and deployment-evidence artifacts for 90 days,
   including files below the explicit hidden evidence directory.

The production environment exists and accepts deployments only from protected
`main`. Strict `verify`, pull-request flow, conversation resolution, and
force-push/deletion prevention are active on `main`.
No Cloudflare secret value is present in the repository or chat.

Seventeen focused deployment tests cover explicit dispatch rejection, route
ownership validation, registered
Cloudflare output shapes, preflight health and the 100-percent rollback anchor,
upload provenance, success order, failure before mutation, failure before and
after promotion, exact-version rollback confirmation, rollback-baseline
verification, rollback failure reporting, sanitized evidence persistence,
semantic propagation retry, and the HTTP smoke contract.

AU-AGENT-003 first returned `REWORK REQUIRED` at exact source `4097a5c`, then
independently reverified exact remediation source `2c88639`. Findings
TS001-DEPLOY-001 through TS001-DEPLOY-004 are resolved, remote CI run
`30219444159` passed, and the task-scoped Engineering Verification Status is
`VERIFIED`. This allows merge but does not authorize dispatch while either
external blocker remains open.

## Smoke Contract

`scripts/verify-production-deployment.mjs` verifies:

- HTTPS root and application shell;
- exact `version.json` source provenance and clean build;
- hashed JavaScript and CSS assets;
- SPA fallback;
- `HEAD` success and `POST` rejection with `Allow: GET, HEAD`;
- the exact reviewed CSP;
- `X-Content-Type-Options: nosniff`;
- `Referrer-Policy: no-referrer`.

After production promotion, a separate browser session must check the import
entry point, console, resource inventory, and absence of unregistered
script-initiated network requests or pattern-derived egress.

## Current External State

- Public URL: `[TESTED]`; current placeholder returns HTTPS `200`.
- Pre-deployment placeholder body SHA-256:
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`.
- Cloudflare CLI authentication: absent in the Codex environment.
- GitHub `production` environment: `[IMPLEMENTED]`; custom branch policy
  contains `main` only.
- GitHub environment secrets `CLOUDFLARE_API_TOKEN` and
  `CLOUDFLARE_ACCOUNT_ID`: `[IMPLEMENTED]`; both names are configured and no
  value is recorded in the repository or chat.
- Current immutable placeholder Worker version:
  `d1f2b05d-77d0-4d53-9c7a-73d61135979e`, observed at 100 percent before and
  after rollback in workflow run `30247393181`.
- Route ownership: `[TESTED]`; retained run-2 preflight records the exact
  `abris.653915.com` hostname, `abris-universe` service, production
  environment, and `653915.com` zone without credential values.
- Production mutation: candidates
  `f231b299-63d1-43f5-acb0-416ae989ab83` and
  `b855e2e0-7221-456e-aaa6-55e947b0dcf0` were uploaded and placed at zero
  percent only. Candidate `5eca15e6-5ba4-4ab9-9ce7-16a7537e591c` passed
  zero-traffic smoke and was briefly promoted before the workflow observed the
  exact prior cached baseline and rolled back.

## Attempt 1 — Failed Closed and Rolled Back

- **Workflow run:** `30247393181`.
- **Source:** `c26ce9f5b8bc42452875dd2088d4e8b9e3ee7e56`.
- **Prior version:** `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- **Candidate version:** `f231b299-63d1-43f5-acb0-416ae989ab83` at zero
  percent.
- **Failure stage:** pre-promotion semantic smoke.
- **Observed failure:** the first successful HTTP response still contained the
  placeholder and therefore did not carry the reviewed CSP. The verifier
  rejected it.
- **Rollback:** `[TESTED]`; the prior version returned to 100 percent and the
  GET/HEAD/content/body baseline was restored. The public body SHA-256 remains
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`.
- **Evidence limitation:** the action did not retain the generated JSON because
  the path was hidden and `include-hidden-files` was not enabled. Immutable
  workflow logs retain the version, stage, and rollback state.
- **Root cause:** Cloudflare documents that a new version override can take a
  few seconds to become globally available. The verifier retried transport and
  non-success status errors but treated a semantically stale `200` as final.
- **Remediation:** retry the complete semantic contract, explicitly include
  the bounded hidden JSON path in artifact upload, and validate exact
  hostname-to-Worker ownership before mutation.

## Attempt 2 — Retained Evidence, Failed Closed, and Rolled Back

- **Workflow run:** `30248680612`.
- **Source:** protected-main merge
  `bb9a5e56c1627a3da4146c972a72b4c4006f59b3`.
- **Prior version:** `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- **Candidate version:** `b855e2e0-7221-456e-aaa6-55e947b0dcf0` at zero
  percent.
- **TD-GATE-003:** `[TESTED]`, closed. The retained preflight proves exact
  hostname-to-Worker ownership, current immutable version, public baseline,
  and recoverability; the lifecycle proves exact rollback.
- **Failure stage:** pre-promotion semantic smoke.
- **Observed failure:** all six semantic attempts over approximately twelve
  seconds still received the placeholder without the reviewed CSP, consistent
  with the override not yet selecting the candidate at the runner's edge.
- **Promotion:** none.
- **Rollback:** `[TESTED]`; the exact prior version returned to 100 percent and
  the recorded GET/HEAD/content/body baseline was restored.
- **Artifact:** retained for 90 days as
  `production-deployment-bb9a5e56c1627a3da4146c972a72b4c4006f59b3-30248680612`.
- **Next bounded diagnostic:** allow up to 61 complete semantic attempts at
  two-second intervals only while the candidate remains at zero traffic;
  post-promotion production smoke remains at six attempts. Retain only the last
  response status, SHA-256, CSP/cache/server fields, and attempt count. No
  response body, token, account ID, or request header is retained.

## Rollback

The workflow refuses first promotion unless the current deployment exposes one
version at 100 percent traffic. That version becomes the immutable rollback
anchor. Any post-upload, pre-promotion, or post-promotion failure invokes
`wrangler rollback` to the recorded prior version. After rollback, an
authenticated deployment query must show that exact version at 100 percent,
and the public GET status, HEAD status, content type, and body SHA-256 must
match the recorded pre-deployment baseline.

No DNS mutation is permitted. Static rollback does not alter browser-local
IndexedDB.

## Attempt 3 — Zero-Traffic Pass, Promotion, and Exact Rollback

- **Workflow run:** `30250084131`.
- **Source:** protected-main merge
  `67878634a1b18f038dd6e25f7cd3ab4131f00773`.
- **Prior version:** `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- **Candidate version:** `5eca15e6-5ba4-4ab9-9ce7-16a7537e591c`.
- **Pre-promotion result:** `[TESTED]`; semantic attempt 17 selected the
  zero-traffic candidate and passed exact source, root/fallback, asset,
  method, and security-header assertions.
- **Promotion:** performed to 100 percent after the zero-traffic pass.
- **Post-promotion observation:** production smoke exhausted six attempts. The
  final retained runner-edge observation returned the registered prior
  placeholder body hash with `cf-cache-status: HIT` and no CSP. The verifier
  rejected it.
- **Rollback:** `[TESTED]`; the exact prior immutable version returned to 100
  percent and the recorded GET/HEAD/content/body baseline was restored.
- **Artifact:** retained for 90 days as
  `production-deployment-67878634a1b18f038dd6e25f7cd3ab4131f00773-30250084131`,
  GitHub digest
  `sha256:a6ad02c1019cc227db383a312bacc32d4f2966da304d6f087bb48e9177eb8a5d`.
- **Boundary:** the run proves candidate selection and the complete
  zero-traffic contract. It does not prove default-route convergence or
  successful production/browser verification.

## Current Blocker

TD-GATE-003 is closed and no further owner credential action is required.
The one independently allowed retry is exhausted. Attempt 3 proved the
zero-traffic version but not default-route convergence within the six-attempt
post-promotion window. The separately registered
[Production Propagation Technical Alternative Proposal](PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
requires Project Owner disposition before implementation or another
deployment. Do not silently extend post-promotion exposure or weaken the
semantic contract. AU-AGENT-003 records production continuation as `BLOCKED`;
TS001-DEPLOY-005 remains High/Open.

## References

- [Product Decision Log](../../../../product/decisions/05_Decision_Log.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Engineering Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Production Propagation Technical Alternative Proposal](PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
- [CI and Deployment Rehearsal](CI_AND_DEPLOYMENT_REHEARSAL.md)
- [Completion Report](COMPLETION_REPORT.md)
- [Independent Acceptance Report](../../../../product/reviews/TASK-THINSLICE-001_Independent_Acceptance_Report.md)
