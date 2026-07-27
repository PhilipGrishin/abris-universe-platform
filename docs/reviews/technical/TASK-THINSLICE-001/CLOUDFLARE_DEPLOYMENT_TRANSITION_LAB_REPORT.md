# TASK-THINSLICE-001 Cloudflare Deployment Transition Lab Report

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-CF-LAB-001 |
| Title | TASK-THINSLICE-001 Cloudflare Deployment Transition Lab Report |
| Status | Isolated remediation `[IMPLEMENTED]`, `[TESTED]`; production integration and production result `[OPEN]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-27 |
| Last Updated | 2026-07-27 |
| Dependencies | Production run `30266185702`; artifact `8652895888`; `AU-TAP-TS001-002`; `AU-TAP-TS001-003`; code sources `bcdd369a0c719b5dbfe374a9f04f09f6bfb3513c` and `d741abd90008b57122cd2c8ba08d0e5f6d50de6b`; Cloudflare Workers Versions and Deployments documentation |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Cloudflare routing or deployment semantics change; verifier contract change; production affinity-rule change; production attempt; AU-AGENT-003 finding disposition |
| Documentation Impact | Material |

## Purpose

Record the isolated investigation of the post-promotion static endpoint
instability observed in production run `30266185702`, the confirmed failure
mechanism, the remediation implemented on a non-production branch, and the
evidence required before a later controlled production attempt.

## Scope

The investigation used a temporary Worker and temporary custom hostname in the
owner's existing Cloudflare account and zone. It did not mutate the production
Worker, production hostname, production traffic allocation, production cache,
GitHub protected branch, or production secrets.

This report does not assign engineering `VERIFIED`, close
TS001-DEPLOY-014/015, authorize a production attempt, or replace the
AU-AGENT-003 Production Deployment Verification report.

## Definitions

- **Candidate:** The exact immutable Worker version selected for promotion.
- **Prior baseline:** The exact Worker version and public root hash registered
  before mutation.
- **Version affinity:** A stable
  `Cloudflare-Workers-Version-Key` derived from the client IP for the exact
  production hostname.
- **Bounded transition:** A temporary observation that is provably composed
  only of the prior baseline, the expected candidate, or missing identity from
  the legacy prior Worker while Cloudflare deployment state converges.
- **Strict candidate contract:** One complete request sequence in which the
  shell, Worker-owned runtime provenance, static build provenance, hashed
  JavaScript and CSS assets, method boundary, security headers, source commit,
  and exact Worker version all match.
- **Stability quorum:** Three consecutive strict candidate contracts inside
  the configured time and attempt bounds.

## Confirmed Findings

1. The candidate build was complete. Its immutable preview served the shell,
   `/version.json`, JavaScript, CSS, security headers, method boundary, and
   exact source provenance successfully.
2. A deliberately different baseline and candidate reproduced cross-request
   version skew after a 100-percent deployment switch. Sequential requests
   from the same client temporarily received responses from two Worker version
   IDs.
3. The same temporary skew occurred with a stable direct
   `Cloudflare-Workers-Version-Key`. Affinity preserved request selection
   inside a converged deployment, but did not eliminate the short interval in
   which different requests observed different globally propagated deployment
   state.
4. A 50/50 deployment with the exact hostname Transform Rule completed twenty
   consecutive user-contract iterations without changing the selected Worker
   version or returning a missing asset.
5. A production-like baseline-to-candidate switch required 72,979 milliseconds
   and fifteen stability attempts to reach the required quorum. Attempts 1–12
   matched the exact prior baseline; attempts 13–15 were consecutive strict
   candidate contracts.
6. Rollback restored the exact baseline Worker version and exact registered
   root SHA-256 on rollback verification attempt 2.
7. The temporary Worker, hostname, Transform Rule, ruleset, API token, and
   local token file were removed after the rehearsal. Public resolution of the
   test hostname returned NXDOMAIN. The production Worker and hostname were
   not changed.

## Root Cause

The immediate failure mechanism is a Cloudflare Worker deployment-state
transition across separate requests. During the transition, a shell response
can come from one Worker version while a later static or provenance request
reaches another version. If the versions contain different asset sets, the
second request can return `404`.

This is consistent with Cloudflare's documented warning that separate requests
in versioned deployments may route to different versions and that
content-hashed assets can fail under cross-version skew. The isolated lab adds
project-specific evidence that a short global propagation interval can remain
observable immediately after a 100-percent switch.

The former verifier treated a third-pass `/version.json` `404` as an immediate
candidate defect. It did not retain enough per-request Worker identity to
distinguish a defective candidate from a bounded old/new transition.

## Contributing Engineering Defects

- Runtime provenance depended on the static `/version.json` asset, which can be
  unavailable when requests cross Worker versions.
- Responses did not expose the executing immutable Worker version.
- No exact-host version-affinity rule was required by production preflight.
- Failure evidence did not retain sanitized per-check version identities and
  per-attempt outcomes.
- Static asset verification accepted status `200` without asserting JavaScript
  or CSS content type and without rejecting an SPA-shell fallback.
- The stability verifier could label an exhausted version transition as the
  prior baseline rather than a transition timeout.
- One abort-path test raced its timer before the first request and could fail
  nondeterministically.
- Initial test-token scope omitted the permission required to attach a custom
  Worker hostname; the test failed closed before that permission was added.
- Wrangler deletion attempted a secondary KV enumeration after deleting the
  test Worker. Cleanup therefore required independent Worker, domain, DNS,
  ruleset, and token checks rather than trusting the command exit status.

## Implemented Architecture

### Runtime Identity

The Worker receives Cloudflare version metadata through
`CF_VERSION_METADATA`. It owns `/__deployment` and returns the immutable
Worker version plus the build source commit without consulting static assets.
Every Worker response also includes `X-Abris-Worker-Version` and
`X-Abris-Source-Commit`.

`/version.json` remains a build/static contract. It is no longer the sole
runtime identity source.

### Exact-Host Affinity

The production preflight requires one enabled Transform Rule for the exact
hostname `abris.653915.com`:

```text
Cloudflare-Workers-Version-Key = to_string(ip.src)
```

The rule is rejected if disabled, broadened to another hostname, changed to a
different expression, or absent. The rule token is separate from the Worker
deployment and cache-purge tokens and is not passed to Wrangler.

### Bounded Baseline-Aware Transition

After exact preview verification, exact-version promotion, and hostname-only
purge, the verifier records each check's status, path, Worker version, and
source commit. It permits only these bounded retry states:

- the exact registered prior baseline;
- a candidate shell with responses split between the expected candidate,
  legacy prior Worker, or a temporary `404` on a required transition-sensitive
  path.

The quorum resets after every non-candidate observation. Success still
requires three consecutive complete candidate contracts. An unrecognized
root, wrong source commit, candidate-internal contract defect, invalid asset
type, SPA fallback, unexpected Worker identity after convergence, timeout, or
attempt exhaustion fails closed and preserves automatic rollback.

### Evidence

Deployment evidence schema version 4 retains bounded and sanitized:

- each stability attempt and its classification;
- each checked method, path, status, Worker version, and source commit;
- exact candidate version and source commit;
- rollback attempt and exact baseline observation.

It does not retain capability URLs, credentials, authorization headers,
response bodies, user data, or unrestricted provider responses.

## Test Evidence

| Check | Result |
| --- | --- |
| Immutable candidate preview | Complete strict contract passed |
| 50/50 affinity rehearsal | 20/20 version-coherent user contracts |
| Baseline convergence before promotion | Exact Worker version and exact root hash passed |
| Candidate promotion rehearsal | Candidate deployed at 100 percent |
| Hostname-only purge | Passed |
| Post-promotion stability | 12 prior-baseline observations followed by 3/3 strict candidate contracts in 72,979 ms |
| Rollback | Exact prior version and exact root hash restored on check 2 |
| Focused deployment tests | 33/33 passed |
| Worker tests | 11/11 passed |
| TypeScript typecheck | Passed |
| External cleanup | Worker absent; domain absent; DNS NXDOMAIN; rule/ruleset absent; token revoked |

## Engineering Principles

- Prove the candidate independently before traffic mutation.
- Identify the Worker that actually answered each request.
- Treat known provider transition as bounded evidence, not success.
- Require strict eventual convergence; never accept mixed-version state as a
  completed deployment.
- Fail closed on unknown behavior.
- Keep rollback immutable, automatic, exact, and independently observable.
- Separate deployment, purge, and Transform Rule credentials.

## Constraints

- Evidence covers one Cloudflare account, one zone, and one isolated custom
  hostname from the current operator location.
- The rehearsal did not include independent multi-region probes.
- The production Transform Rule and permanent GitHub secret are intentionally
  not installed by this test-only task.
- This branch has not received AU-AGENT-003 review, CI, protected merge, or
  exact-main CI by Project Owner instruction for the isolated preparation
  stage.
- The historical AU-AGENT-003 findings remain open until independently
  reviewed exact-source remediation and later production evidence satisfy
  their registered gates.

## Common Mistakes

- Assuming a 100-percent deployment switch is instantly consistent for every
  subsequent request.
- Treating version affinity as a replacement for a convergence window.
- Using a static asset as the only runtime provenance source.
- Accepting an asset response solely because its status is `200`.
- Retrying unrecognized or candidate-internal failures as if they were a
  provider transition.
- Logging full headers, response bodies, provider payloads, or preview URLs.
- Treating a successful rollback as a successful deployment.

## Review Checklist

- [x] Production was not mutated.
- [x] Candidate immutable preview passed before traffic mutation.
- [x] Exact Worker identity was checked on every required request.
- [x] Static asset media types and non-SPA bodies were checked.
- [x] Affinity behavior was tested under a split deployment.
- [x] Full promotion convergence was tested with a strict three-pass quorum.
- [x] Exact rollback version and root hash were restored.
- [x] Test resources and temporary credentials were removed.
- [x] Tests and typecheck passed.
- [ ] Permanent production Transform Rule credential is registered in the
  GitHub `production` environment.
- [ ] Exact production Transform Rule is applied and read-only preflight passes.
- [ ] AU-AGENT-003 independently reviews the exact production candidate.
- [ ] Protected merge and exact-main CI pass.
- [ ] Project Owner authorizes the next production attempt.

## Production Readiness Sequence

1. Register a permanent least-privilege `CLOUDFLARE_RULES_TOKEN` in the GitHub
   `production` environment.
2. Apply and read back the exact-host affinity rule.
3. Obtain independent AU-AGENT-003 review of the exact candidate and finding
   dispositions.
4. Merge through the protected branch and pass exact-main CI.
5. Obtain one explicit attempt authorization.
6. Dispatch the exact-main production workflow once.
7. Accept success only after immutable preview, exact promotion, purge, three
   consecutive strict candidate contracts, retained evidence, and post-deploy
   browser verification pass.

## References

- [Source of Truth Registry](../../../SOURCE_OF_TRUTH.md)
- [Production Deployment Record](PRODUCTION_DEPLOYMENT.md)
- [CI and Deployment Rehearsal](CI_AND_DEPLOYMENT_REHEARSAL.md)
- [AU-AGENT-003 Production Deployment Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Cloudflare version affinity](https://developers.cloudflare.com/workers/versions-and-deployments/gradual-deployments/version-affinity/)
- [Cloudflare version metadata binding](https://developers.cloudflare.com/workers/runtime-apis/bindings/version-metadata/)
- [Cloudflare custom domains](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/)
- [Cloudflare request-header Transform Rules API](https://developers.cloudflare.com/rules/transform/request-header-modification/create-api/)
