# TASK-THINSLICE-001 Immutable Preview and Hostname Purge Technical Alternative

| Field | Value |
| --- | --- |
| Document ID | AU-TAP-TS001-002 |
| Title | Immutable Preview and Hostname Cache Purge Technical Alternative |
| Status | `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; exact-source engineering `VERIFIED`; attempt 6 failed production stability and rolled back; authority exhausted |
| Owner | AU-AGENT-001 |
| Technical Approver | Project Owner |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.3.3 |
| Created | 2026-07-27 |
| Last Updated | 2026-07-27 |
| Dependencies | PROD-DEC-013; TS001-DEPLOY-007; `AU-TAP-TS001-001`; Production Deployment Record v2.3.0; Production Deployment Verification v2.1.0; exact reviewed source `1054a2f0a7c1385fd8d51661c6be013e90df9df5`; exact remote-preflight remediation source `497991c7eb5d9c558becafa2f4d2461e639be1ec`; protected-main source `53389089fecf571705c27d620e11243f9a31f99d`; production run `30266185702`; `AU-TAP-TS001-003` v1.4.0 |
| Supersedes | The continuation mechanism in `AU-TAP-TS001-001`; its historical evidence and rollback result remain authoritative |
| Superseded By | None |
| Review Triggers | Cloudflare preview behavior change; cache API change; deployment-state-machine change; token-scope change; production or rollback failure |
| Task ID | TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT |
| Documentation Impact | Material |

## Purpose

Define the Project Owner-approved replacement for the unstable custom-domain
zero-traffic version-override path. The goal is to verify the exact immutable
candidate away from the production hostname, promote only that version, purge
the production hostname cache, and require stable production evidence before
completion.

This proposal does not change product behavior, accepted application code,
DNS, the production hostname, security headers, or the immutable rollback
anchor.

## Confirmed Problem

Run `30253457090` proved that the custom-domain version override and the default
route can observe different cached states in immediate succession. The
candidate passed the complete contract through the override, was promoted, and
then the same runner received the exact prior cached baseline during the
one-shot contract. Automatic rollback succeeded. AU-AGENT-003 therefore
registered High finding TS001-DEPLOY-007 and blocked reuse of that transition
mechanism.

## Approved Alternative A

The deployment contract is:

1. upload one immutable Worker version and capture Wrangler's exact
   `preview_url` and version ID;
2. run the complete semantic, provenance, asset, method, and security-header
   contract against that `*.workers.dev` preview URL before production
   traffic mutation, with at most 61 semantic observations and a strict
   120-second total timeout;
3. promote the captured version ID directly to 100 percent;
4. call Cloudflare's zone cache purge API with
   `{"hosts":["abris.653915.com"]}` under a strict 10-second operation timeout;
5. run the complete production contract until it passes three consecutive
   times, with at most 25 observations and a strict 120-second ceiling;
6. treat the exact registered prior baseline as a known transient that resets
   the consecutive-pass quorum;
7. fail immediately on an unknown response or an internally inconsistent
   candidate contract;
8. on any promotion-or-later failure, restore the recorded prior immutable
   version, purge the hostname again, confirm 100-percent prior-version
   ownership, and verify restoration of the registered public baseline.

## Security and Authority Boundary

- `CLOUDFLARE_API_TOKEN` remains the Worker deployment credential.
- `CLOUDFLARE_CACHE_PURGE_TOKEN` is a separate credential with only Zone Cache
  Purge permission for the `653915.com` zone.
- `CLOUDFLARE_ZONE_ID` is a non-secret GitHub environment variable.
- Both tokens are exposed only to the GitHub steps that require them and are
  never written to evidence.
- Evidence records only sanitized hostname, scope, HTTP status, success state,
  version IDs, source provenance, bounded response observations, and lifecycle
  state.
- Preview URLs are public capability URLs. They are not advertised or written
  to retained deployment evidence; the exact version ID and sanitized smoke
  result remain traceable. The preview contains only the already independently
  accepted static Phase 0 application. It contains no credentials, user
  patterns, account data, or server-side state.
- The change grants no DNS, broad cache, account-management, or product
  authority.

## Stability Contract

A production pass is complete only when the full contract validates:

- HTTPS root and HEAD;
- exact application shell;
- exact clean source commit in `version.json`;
- SPA fallback;
- `POST /` rejection and `Allow`;
- hashed JavaScript and CSS;
- exact CSP, `X-Content-Type-Options`, and `Referrer-Policy`.

Three consecutive complete passes are required. An exact prior-baseline
observation resets the quorum and remains retryable only inside the same
25-observation and 120-second bounds. A response that is neither the exact
prior baseline nor a complete candidate contract triggers immediate rollback.
Requests and retry backoffs are abort-aware; production full-contract
verification performs no inner request retry. Unknown root content is
classified separately from an exact candidate sentinel with a broken contract.

## Failure and Rollback

Upload or preview failure occurs before production mutation and therefore does
not invoke rollback. Promotion is marked mutation-attempted before the
Cloudflare command runs, so even a partially failed promotion enters rollback.
Cache-purge timeout/failure and production stability failure also enter
rollback.

Rollback must:

1. restore the recorded prior version;
2. purge the production hostname cache;
3. confirm that the prior version owns 100 percent of traffic;
4. accept only the registered prior public baseline while allowing the exact
   reviewed candidate as a bounded transient;
5. fail closed if neither registered state is observed.

## Alternatives Considered

### Reuse the custom-domain version override

Rejected by the observed run and TS001-DEPLOY-007. It does not provide a stable
separation between preview and production cache state.

### Cloudflare Pages

Not selected because it creates another hosting product and source of
deployment state while the approved target is the existing Worker.

### Direct local deployment

Rejected because it bypasses protected-main provenance, GitHub environment
secrets, CI evidence, and the registered rollback workflow.

### Broad purge or purge-everything

Rejected because the target can be expressed as a single hostname and does not
justify broader cache mutation.

## Risks

- The public preview URL can expose the accepted static UI to anyone who
  obtains the unadvertised URL.
- Hostname purge is asynchronous across Cloudflare's network; the consecutive
  stability quorum reduces but cannot prove simultaneous global convergence.
- A separate purge credential adds one secret lifecycle obligation.
- Rollback cache convergence can briefly expose the candidate after the prior
  version is restored.

These risks are bounded by the static no-user-data preview, least-privilege
token, exact state classification, strict time/attempt ceilings, and automatic
rollback.

## Owner Decision

On 2026-07-27 the Project Owner approved **Alternative A — Workers + immutable
preview + purge**, supplied the dedicated cache-purge secret and zone variable
through the protected GitHub `production` environment, and authorized
implementation, independent AU-AGENT-003 verification, and one controlled
production attempt after the registered gates pass.

## Verification Gates

Production mutation remains blocked until:

1. focused state-machine, evidence, preview, stability, and purge tests pass;
2. build, typecheck, complete test suite, dependency audit, and deployment
   rehearsal pass;
3. AU-AGENT-003 independently reviews the exact implementation source;
4. protected pull-request checks pass and the exact reviewed change merges to
   `main`;
5. the workflow is dispatched with the exact protected-main commit.

## Local Implementation Evidence

The first three gates pass:

- strict workspace typecheck;
- 46 script tests, including 43 deployment-focused tests;
- 68 package tests;
- verified production build;
- production dependency audit with no known vulnerabilities;
- exact Wrangler config and bundle dry-run;
- Markdown-link, workflow-YAML, whitespace, and secret-value checks.

The purge token and zone variable are removed from every Wrangler subprocess
environment. Version-upload process output is suppressed, and the public
preview URL is removed from retained lifecycle and smoke evidence. Production
mutation has not occurred. AU-AGENT-003 independently reviewed exact source
`1054a2f0a7c1385fd8d51661c6be013e90df9df5`, resolved one High and three
Medium preliminary findings, recorded no remaining finding, and assigned
task-scoped Engineering Verification Status `VERIFIED`. Both exact-source CI
runs pass. Protected merge and the one controlled attempt then completed as
recorded below. This status is not project `[VERIFIED]` or proof of live
provider behavior.

Protected merge `ebdde8ec` preserved the reviewed implementation. Run
`30262328350` then failed at stage `upload` because the remote Worker had
Preview URLs disabled and Wrangler therefore emitted no `preview_url`.
Production traffic and cache were not mutated, the prior version remained at
100 percent, and the registered public baseline remained intact. The one
authorized attempt is exhausted. `AU-TAP-TS001-003` proposes an explicit
remote prerequisite, read-only exact-state preflight, and sanitized
upload/version-ID retention. AU-AGENT-003 assigned production continuation
`REWORK REQUIRED` with TS001-DEPLOY-012/013. The Project Owner subsequently
approved `AU-TAP-TS001-003` and one separate attempt after its exact-source
review, protected merge, and exact-main CI gates. Exact-source review passed at
`497991c` and resolved TS001-DEPLOY-012/013; protected merge and exact-main CI
were the remaining gates. The exhausted
OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 authority grants no repeat by itself.

PR #13, protected merge `53389089`, and exact-main CI completed. Run
`30266185702` passed immutable preview, exact promotion, and hostname purge.
The third production stability contract then received `/version.json` `404`
while the candidate root remained active. Exact rollback and rollback purge
restored the prior version/baseline. AU-AGENT-003 assigned production
`REWORK REQUIRED`, TS001-DEPLOY-014/015, and task-scoped rollback `VERIFIED`.
No repeat is authorized.

## References

- [Source of Truth Registry](../../../SOURCE_OF_TRUTH.md)
- [Production Deployment Record](PRODUCTION_DEPLOYMENT.md)
- [Prior Propagation Alternative](PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Production Deployment Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Remote Preview Enablement Technical Alternative](PRODUCTION_PREVIEW_ENABLEMENT_TECHNICAL_ALTERNATIVE.md)
