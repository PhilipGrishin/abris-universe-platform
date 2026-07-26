# TASK-THINSLICE-001 Production Deployment Record

| Field | Value |
| --- | --- |
| Document ID | AU-DEPLOY-TS001-001 |
| Title | TASK-THINSLICE-001 Production Deployment Record |
| Status | Owner authorization `[APPROVED]`; pipeline remediation `[IMPLEMENTED]`, locally `[TESTED]`; AU-AGENT-003 reverification, credentials, and TD-GATE-003 remain blocking |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.1.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | PROD-DEC-013; Technical Design v1.5.3; ADR-TS001-004 v1.2.0; bounded independent acceptance at `1a683ab`; GitHub `production` environment |
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
9. reads the current Cloudflare deployment and records its immutable version
   and the public-root body hash in a retained preflight artifact before any
   Cloudflare mutation;
10. uploads a new immutable version without normal traffic;
11. deploys the new version at zero percent beside the prior version;
12. smokes the new version through a production-domain version override;
13. promotes the new version to 100 percent;
14. repeats production smoke and automatically rolls back on failure;
15. confirms after rollback that the prior immutable version owns 100 percent
   of traffic and that the recorded GET/HEAD/content/hash baseline is restored;
16. retains sanitized preflight and deployment-evidence artifacts for 90 days.

The production environment exists and accepts deployments only from protected
`main`. Strict `verify`, pull-request flow, conversation resolution, and
force-push/deletion prevention are active on `main`.
No Cloudflare secret value is present in the repository or chat.

Fourteen focused deployment tests cover explicit dispatch rejection, registered
Cloudflare output shapes, preflight health and the 100-percent rollback anchor,
upload provenance, success order, failure before mutation, failure before and
after promotion, exact-version rollback confirmation, rollback-baseline
verification, rollback failure reporting, sanitized evidence persistence, and
the HTTP smoke contract.

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
  `CLOUDFLARE_ACCOUNT_ID`: `[OPEN]`; neither name is currently configured.
- Current immutable placeholder Worker version and route ownership:
  `[OPEN]` until authenticated Cloudflare access is available.
- Production mutation: not started.

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

## Current Blocker

The Project Owner must configure the following GitHub `production` environment
secrets without sending their values through chat or committing them:

- `CLOUDFLARE_API_TOKEN`, scoped to the owner account and Worker script
  deployment only, with no DNS-edit permission;
- `CLOUDFLARE_ACCOUNT_ID`.

After the two secret names exist, Codex can merge the reviewed deployment
package to `main`, dispatch the exact main commit, capture TD-GATE-003, and
complete production and browser verification.

## References

- [Product Decision Log](../../../../product/decisions/05_Decision_Log.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [CI and Deployment Rehearsal](CI_AND_DEPLOYMENT_REHEARSAL.md)
- [Completion Report](COMPLETION_REPORT.md)
- [Independent Acceptance Report](../../../../product/reviews/TASK-THINSLICE-001_Independent_Acceptance_Report.md)
