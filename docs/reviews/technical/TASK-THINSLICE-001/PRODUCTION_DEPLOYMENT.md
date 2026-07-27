# TASK-THINSLICE-001 Production Deployment Record

| Field | Value |
| --- | --- |
| Document ID | AU-DEPLOY-TS001-001 |
| Title | TASK-THINSLICE-001 Production Deployment Record |
| Status | Attempts 1–5 retained as failed-closed history; immutable-preview and hostname-purge continuation `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; attempt 5 failed before production mutation; no further attempt authorized |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 2.0.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-27 |
| Dependencies | PROD-DEC-013; OWNER-DEC-TS001-PRODUCTION-DELIVERY-002; `AU-TAP-TS001-002` v1.3.0; `AU-TAP-TS001-003` v1.1.0; Technical Design v1.5.14; ADR-TS001-004 v1.3.10; Production Deployment Verification v1.8.0; bounded independent acceptance at `1a683ab`; protected-main source `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`; run `30262328350`; artifact `8651402890`; GitHub `production` environment |
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
6. keeps both deployment credentials and the zone variable out of job scope
   and exposes them only to the credential-presence check and final deployment
   step;
7. installs from the frozen lockfile;
8. runs typecheck, the full test suite, build verification, dependency audit,
   and the no-deploy rehearsal;
9. queries the Cloudflare Workers Domains API and requires
   `abris.653915.com` to be uniquely assigned to `abris-universe`;
10. reads the current Cloudflare deployment and records its immutable version,
   route ownership, and public-root baseline in a retained preflight artifact
   before any Cloudflare mutation;
11. uploads a new immutable version and records its exact Workers preview URL;
12. runs the complete semantic contract against that preview before traffic
   mutation;
13. promotes the exact captured version to 100 percent;
14. purges cache only for `abris.653915.com` with a separate least-privilege
   token;
15. requires three consecutive complete production contracts within 25
   observations and 120 seconds;
16. automatically restores the prior version and purges the hostname after
   any promotion-or-later failure;
17. confirms after rollback that the prior immutable version owns 100 percent
   of traffic and that the recorded GET/HEAD/content/hash baseline is restored;
18. retains sanitized preflight and deployment-evidence artifacts for 90 days,
   including files below the explicit hidden evidence directory.

The production environment exists and accepts deployments only from protected
`main`. Strict `verify`, pull-request flow, conversation resolution, and
force-push/deletion prevention are active on `main`.
No Cloudflare secret value is present in the repository or chat.

46 script tests, including 43 deployment-focused tests,
cover explicit dispatch rejection, route
ownership validation, registered
Cloudflare output shapes, preflight health and the 100-percent rollback anchor,
upload provenance, success order, failure before mutation, failure before and
after promotion, exact-version rollback confirmation, rollback-baseline
verification, rollback failure reporting, sanitized evidence persistence,
preview propagation, hostname-purge request scope and failure, three-pass
production stability, rollback cache purge, rollback convergence, and the HTTP
smoke contract.

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
  exact prior cached baseline and rolled back. Candidate
  `2f2367c2-d85b-49e2-b785-a1b9d5c326c5` passed zero-traffic smoke, was
  promoted, then failed its one-shot production contract after an exact
  candidate transition observation and was rolled back.

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

## Current Gate

TD-GATE-003 remains closed. The owner supplied the dedicated cache-purge secret
and zone variable without exposing their values. OWNER-DEC-TS001-PRODUCTION-
DELIVERY-002 and `AU-TAP-TS001-002` provide the required disposition for
TS001-DEPLOY-007. The implementation and exact-source quality gate pass, but
the protected merge and exact-main CI gates completed. Run `30262328350`
consumed the one attempt and failed before production mutation. No further
attempt is authorized.

## Approved Immutable Preview and Purge Continuation

The replacement contract:

1. captures the exact immutable `*.workers.dev` preview URL from version
   upload output;
2. runs the complete contract on that URL before traffic mutation;
3. promotes only the captured version ID;
4. purges cache only for the production hostname;
5. requires three consecutive complete production contracts;
6. retries only the exact registered prior baseline inside 25 observations and
   120 seconds;
7. fails unknown or inconsistent candidate responses immediately;
8. restores the prior version, purges again, and verifies the registered
   baseline on failure.

The separate purge token has only Zone Cache Purge permission for the selected
zone. Each purge operation has a strict 10-second timeout. Production
requests/backoffs and rollback snapshots consume their shared remaining
deadlines; an exact candidate sentinel with a broken contract and an unknown
root state remain separate failure classifications. Local evidence includes
strict typecheck, complete repository tests,
production build verification, dependency audit with no known vulnerabilities,
and Wrangler dry-run rehearsal. The purge credential and zone variable are
removed from Wrangler subprocess environments, and the public preview URL is
suppressed from version-upload logs and not written to retained evidence.
AU-AGENT-003 independently assigned task-scoped Engineering Verification
Status `VERIFIED` at exact source `1054a2f0a7c1385fd8d51661c6be013e90df9df5`
after 46 script tests, strict typecheck, accepted-source review, manual
security review, and two successful CI runs. No finding remains. Protected
merge and live evidence remain open; no automatic repeat is authorized.

## Approved Baseline-Aware Transition

After promotion, the workflow now:

1. polls only while the direct GET/HEAD observation exactly matches the
   registered prior status, HEAD status, content type, and body SHA-256;
2. allows no more than 61 observations or 120 seconds, whichever is reached
   first;
3. runs one complete semantic production contract after the exact candidate
   root sentinel appears;
4. fails immediately on an unknown response, transport failure, or candidate
   contract failure so the existing exact rollback executes;
5. retains only allowlisted transition and failure evidence.

Twenty-seven focused deployment tests pass. AU-AGENT-003 resolved
TS001-DEPLOY-005 at exact source `b4f25cda`. Run `30253457090` then exercised
the contract: after candidate classification, the one complete contract
received the exact prior cached baseline and failed immediately into verified
rollback, as designed.

## Attempt 4 — Alternative A Executed and Rolled Back

- **Workflow run:** `30253457090`.
- **Source:** protected-main merge
  `80d942ec521b9f2830ea2af7730356d39e398ee6`.
- **Prior version:** `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- **Candidate version:** `2f2367c2-d85b-49e2-b785-a1b9d5c326c5`.
- **Pre-promotion result:** `[TESTED]`; semantic attempt 18 passed the complete
  exact-source, root/fallback, asset, method, and security-header contract.
- **Promotion:** performed to 100 percent.
- **Transition result:** direct transition attempt 3 matched the exact
  candidate root sentinel. The immediately following one-shot complete
  contract received the exact prior placeholder hash, missing CSP, and
  `cf-cache-status: HIT`. The approved candidate-contract failure rule rejected
  the response without retry.
- **Rollback:** `[TESTED]`; prior version `d1f2b05d` returned to 100 percent,
  and independent post-run GET/HEAD/hash verification matched the registered
  placeholder baseline.
- **Artifact:** retained for 90 days as
  `production-deployment-80d942ec521b9f2830ea2af7730356d39e398ee6-30253457090`,
  artifact ID `8647947029`, digest
  `sha256:8da88d7c34cde83de1fd0bbe237ab445eb567f13e8cb9e36bf250f208faee379`.
- **Evidence safety:** both JSON files parse; the forbidden-key scan found no
  token, secret, authorization, account, request-header, or response-body key.
- **Browser verification:** not performed because rollback left the placeholder
  live; no successful application production surface existed to verify.
- **Authority:** exhausted. No retry is authorized.

## Attempt 5 — Remote Preview Prerequisite Missing

- **Workflow run:** `30262328350`.
- **Source:** protected-main merge
  `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b` from PR #11.
- **Pre-deployment gates:** authorization, accepted-source identity,
  credential presence, frozen installation, typecheck, all tests, verified
  build, dependency audit, and Wrangler rehearsal passed.
- **Prior version:** `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- **Failure stage:** `upload`.
- **Cause:** Wrangler 4.114.0 returned a version-upload record with a version
  ID but no immutable `preview_url`; the workflow failed closed.
- **Remote state:** Cloudflare Dashboard inspection confirmed that the
  production Worker URL is enabled and the separate Preview URLs switch is
  disabled (`enabled: true`, `previews_enabled: false`); the registered target
  state is `enabled: false`, `previews_enabled: true`.
- **Production mutation:** none. `productionMutationAttempted: false`,
  `promoted: false`, no production cache purge, and no production smoke.
- **Rollback:** not required because traffic and cache were never mutated.
- **Public baseline:** independent GET and HEAD returned `200`; the body
  SHA-256 remained
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`.
- **Artifact:** ID `8651402890`, digest
  `sha256:1071767b084f3c729de52d05101832b40acbae81295a59f03dcc160e5e4835ce`,
  retained until 2026-10-25. Individual preflight and deployment-evidence
  SHA-256 values are registered in the engineering verification report.
- **Authority:** exhausted. No repeat is authorized.
- **Independent quality gate:** `FAIL`; production continuation
  `REWORK REQUIRED`; TS001-DEPLOY-012 (High) and TS001-DEPLOY-013 (Medium)
  remain open.
- **Provenance limitation:** upload returned a version ID, but the failure path
  discarded it from sanitized evidence. A likely immutable zero-traffic
  version remains without recoverable retained identity.
- **Next disposition:** `AU-TAP-TS001-003` recommends owner-controlled remote
  state `enabled: false`, `previews_enabled: true`, a fail-closed read-only
  preflight, and sanitized upload/version-ID retention before any new version
  upload. Owner approval, implementation, exact-source AU-AGENT-003 review,
  required CI, protected merge, and explicit new attempt authority are
  required.

## References

- [Product Decision Log](../../../../product/decisions/05_Decision_Log.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Engineering Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Production Propagation Technical Alternative Proposal](PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
- [Immutable Preview and Hostname Purge Technical Alternative](PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
- [Remote Preview Enablement Technical Alternative](PRODUCTION_PREVIEW_ENABLEMENT_TECHNICAL_ALTERNATIVE.md)
- [CI and Deployment Rehearsal](CI_AND_DEPLOYMENT_REHEARSAL.md)
- [Completion Report](COMPLETION_REPORT.md)
- [Independent Acceptance Report](../../../../product/reviews/TASK-THINSLICE-001_Independent_Acceptance_Report.md)
