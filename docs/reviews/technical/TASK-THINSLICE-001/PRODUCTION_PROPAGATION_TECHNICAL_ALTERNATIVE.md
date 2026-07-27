# TASK-THINSLICE-001 Production Propagation Technical Alternative Proposal

| Field | Value |
| --- | --- |
| Document ID | AU-TAP-TS001-001 |
| Title | Production Default-Route Propagation Technical Alternative Proposal |
| Status | `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; exact-source AU-AGENT-003 Engineering Verification Status `VERIFIED`; protected merge required before one authorized deployment |
| Owner | AU-AGENT-001 |
| Technical Approver | Project Owner |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.1.1 |
| Created | 2026-07-27 |
| Last Updated | 2026-07-27 |
| Dependencies | PROD-DEC-013; OWNER-DEC-TS001-PRODUCTION-TRANSITION-001; Technical Design v1.5.10; ADR-TS001-004 v1.3.6; Production Deployment Record v1.6.1; Production Deployment Verification v1.5.0; workflow runs `30250084131` and `30252463472` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Owner decision; Cloudflare routing evidence; deployment-state-machine change; production smoke or rollback result |
| Task ID | TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT |
| Documentation Impact | Material |

## Purpose

Request an explicit owner disposition for the only remaining first-deployment
control gap: the custom domain can continue serving the exact registered prior
baseline for longer than the current post-promotion smoke window, even after
the zero-traffic version override has fully verified the candidate.

This proposal does not change product behavior, the independently accepted
application, the Cloudflare account or domain, the security-header contract,
or the rollback anchor.

## Original Requirement and Current Contract

The approved pipeline must:

1. upload an immutable candidate;
2. keep candidate traffic at zero until the complete semantic contract passes
   through the Cloudflare version override;
3. promote the candidate to 100 percent;
4. repeat the complete semantic contract against the default custom-domain
   route;
5. roll back automatically if production smoke fails.

The current post-promotion verifier allows six complete semantic attempts at
two-second intervals. That boundary intentionally limits exposure after
promotion.

## Confirmed Attempt-3 Evidence

Protected workflow run `30250084131` used exact main source
`67878634a1b18f038dd6e25f7cd3ab4131f00773` and uploaded immutable candidate
`5eca15e6-5ba4-4ab9-9ce7-16a7537e591c`.

- The candidate remained at zero traffic while the complete version-override
  smoke ran.
- Semantic attempt 17 selected the candidate and passed exact source
  provenance, root and SPA fallback hashes, JavaScript and CSS assets,
  `GET`/`HEAD`/`POST` behavior, CSP, `nosniff`, and `Referrer-Policy`.
- The candidate was then promoted to 100 percent.
- Post-promotion smoke exhausted six attempts. The final retained observation
  from the runner edge returned the exact registered prior placeholder body SHA-256
  `9fbac1c04aa53f14d910af10e108602e393c99bc25b9f5d6d1d80d7b9f84d09a`,
  no CSP, and `cf-cache-status: HIT`.
- The workflow rejected that stale result and restored prior immutable version
  `d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent.
- The restored public baseline matched the preflight GET/HEAD status, content
  type, and body SHA-256.
- The retained artifact
  `production-deployment-67878634a1b18f038dd6e25f7cd3ab4131f00773-30250084131`
  has GitHub digest
  `sha256:a6ad02c1019cc227db383a312bacc32d4f2966da304d6f087bb48e9177eb8a5d`
  and contains only the registered sanitized evidence fields.

This proves that credentials, route ownership, immutable upload,
zero-traffic selection, candidate application behavior, promotion, and exact
rollback operate. It does not prove that every edge had already switched to
the candidate or that the default route would have converged within a longer
bounded interval.

## Proposed Alternative A — Baseline-Aware Transition Window

After a successful zero-traffic full smoke and promotion, replace the current
generic six-attempt production retry with a bounded classification state
machine:

1. **Exact candidate observed:** require the exact candidate root hash and
   source provenance captured by zero-traffic smoke, then execute the complete
   production semantic contract. Any failure in that complete contract causes
   immediate rollback.
2. **Exact prior baseline observed:** continue polling at two-second intervals
   for no more than 120 seconds after promotion. A prior-baseline observation
   must match the registered preflight root status, HEAD status, content type,
   and body SHA-256. Cache headers are diagnostic only.
3. **Any unrecognized response:** roll back immediately. This includes a
   different body, unexpected redirect, unexpected method result, transport
   failure, or a response that is neither the registered prior baseline nor
   the exact candidate sentinel.
4. **Transition window exhausted:** roll back exactly as today and retain the
   sanitized final observation.

The two-minute value matches the already reviewed zero-traffic propagation
ceiling and is materially longer than the observed approximately 32 seconds
required for the version override. It is a ceiling, not a fixed delay.

## Benefits

- Distinguishes known stale prior content from an actual candidate failure.
- Preserves complete zero-traffic validation before any candidate exposure.
- Preserves immediate rollback for unknown or malformed responses.
- Preserves exact immutable rollback and the current security contract.
- Produces auditable evidence for route convergence without a blind sleep.
- Does not require a second hosting product, DNS change, public preview, or
  application change.

## Drawbacks and Risks

- Candidate traffic may be active for up to two minutes while the workflow
  runner still sees the prior baseline at its edge.
- A custom-domain-only defect that is bypassed by the version override could
  affect users before the runner observes the candidate and performs the full
  production smoke.
- The state machine and its evidence schema add deployment-tooling complexity.
- A single runner edge does not prove simultaneous global convergence.

The accepted application has already passed the complete zero-traffic contract,
which reduces but does not eliminate these risks.

## Impacts

- **UX:** no intended behavior change; a deployment transition may serve the
  prior placeholder or accepted application depending on edge convergence.
- **Data:** none; static delivery and rollback do not mutate IndexedDB.
- **Performance:** at most 61 lightweight sentinel observations over 120
  seconds, followed by one complete production smoke.
- **Security:** no secret-scope or header-policy change. Unknown responses and
  candidate contract failures remain fail-closed. Evidence remains allowlisted
  and excludes bodies, tokens, account IDs, authorization values, and request
  headers.
- **Schedule:** one small workflow/state-machine change, focused regression
  tests, independent AU-AGENT-003 review, protected merge, and one controlled
  deployment attempt.
- **Migration:** none.
- **Reversibility:** fully reversible by reverting the deployment-tooling
  commit; runtime rollback continues to target the recorded immutable prior
  version.

## Alternatives Considered

### B — One-Percent Canary With Version Affinity

Expose a small percentage of real traffic to the candidate and verify it with
version affinity before full promotion.

Rejected for Phase 0 because it intentionally exposes users before the full
custom-domain production contract passes and introduces traffic-splitting and
affinity governance not approved for the first deployment.

### C — Access-Protected Preview Hostname

Enable a version preview URL or separate preview hostname protected by
Cloudflare Access, verify it, then promote.

Not preferred because it adds hostname/access-policy infrastructure, does not
directly verify the production custom-domain route, and conflicts with the
current decision to keep public preview URLs disabled until an access policy is
approved.

### D — Fixed Sleep or Generic Long Post-Promotion Retry

Wait a fixed period or retry every semantic failure for two minutes.

Rejected because it cannot distinguish the exact prior baseline from a real
candidate, routing, or security failure.

### E — Stop Without Deploying

Keep the placeholder and perform no further production mutation.

Safe and fully reversible, but it does not achieve the owner-authorized Phase 0
deployment.

## Recommendation

Approve Alternative A. It is the smallest change supported by the retained
evidence and adds a narrow, testable exception only for the exact registered
prior baseline. Do not authorize another deployment until:

1. the Project Owner explicitly approves this alternative;
2. implementation includes deterministic tests for every state and timeout;
3. AU-AGENT-003 independently reviews the exact source;
4. required CI passes and the change merges through protected `main`.

## Owner Decision

The Project Owner approved **Alternative A — Baseline-Aware Transition Window**
on 2026-07-27 and authorized its implementation, independent AU-AGENT-003
review, and one subsequent controlled production attempt. The attempt remains
gated by protected merge after exact-source AU-AGENT-003 review and required
CI passed at `b4f25cda`. Approval does
not change product acceptance, authorize application changes, or waive the
production/browser verification gates.

## Implementation Candidate

The implementation:

- classifies a direct GET/HEAD observation against the exact registered prior
  status, HEAD status, content type, and body SHA-256;
- waits only for that exact prior classification;
- recognizes the exact candidate root sentinel captured by zero-traffic smoke
  and then runs one complete semantic contract with no semantic retry;
- immediately fails every unknown response, transport failure, or candidate
  contract failure so the existing rollback state machine runs;
- enforces both a 61-observation ceiling and a strict 120-second wall-clock
  ceiling;
- retains only allowlisted status, hash, content type, CSP, cache, server,
  classification, attempt, and window fields;
- has deterministic success, prior-timeout, wall-clock-timeout, unknown-state,
  transport-failure, candidate-failure, rollback, and evidence-sanitization
  tests.

This candidate does not change the accepted executable application paths.

## References

- [Production Deployment Record](PRODUCTION_DEPLOYMENT.md)
- [Production Deployment Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [CI and Deployment Rehearsal](CI_AND_DEPLOYMENT_REHEARSAL.md)
- [Completion Report](COMPLETION_REPORT.md)
