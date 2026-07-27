# TASK-THINSLICE-001 Remote Preview Enablement Technical Alternative

| Field | Value |
| --- | --- |
| Document ID | AU-TAP-TS001-003 |
| Title | Remote Preview Enablement and Fail-Closed Preflight Technical Alternative |
| Status | `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; exact-source engineering `VERIFIED`; provider state established; protected merge and exact-main CI `[OPEN]`; one controlled attempt authorized only after those gates |
| Owner | AU-AGENT-001 |
| Technical Approver | Project Owner |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.3.0 |
| Created | 2026-07-27 |
| Last Updated | 2026-07-27 |
| Dependencies | OWNER-DEC-TS001-PRODUCTION-DELIVERY-002; OWNER-DEC-TS001-PRODUCTION-PREVIEW-003; `AU-TAP-TS001-002`; protected-main source `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`; production run `30262328350`; retained artifact `8651402890` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Owner disposition; Cloudflare Preview URLs configuration change; Wrangler output-contract change; preflight implementation; production retry |
| Task ID | TASK-THINSLICE-001-PRODUCTION-DEPLOYMENT |
| Documentation Impact | Material |

## Purpose

Define the smallest safe correction after the owner-authorized immutable-preview
attempt failed before production mutation because the remote Worker did not have
Preview URLs enabled.

This proposal does not change product behavior, accepted application code, DNS,
the production hostname, the purge scope, security headers, or the rollback
anchor.

## Confirmed Evidence

Protected-main run `30262328350` used exact source
`ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`. Authorization, accepted-source
identity, credential presence, frozen installation, typecheck, tests, build,
dependency audit, and Wrangler rehearsal passed.

The deployment stage then:

- retained the exact prior version at 100 percent;
- retained the healthy public baseline;
- uploaded a Worker version;
- received a Wrangler `version-upload` record with a version ID but no
  `preview_url`;
- discarded that successfully created version ID from the sanitized lifecycle
  evidence when preview validation failed, leaving the likely zero-traffic
  immutable version without retained provenance;
- failed at stage `upload` before preview smoke, promotion, cache purge, or any
  production traffic mutation.

The lifecycle records `productionMutationAttempted: false`, `promoted: false`,
and no rollback attempt because no production mutation occurred. An independent
post-run GET and HEAD returned `200`, and the body retained the registered prior
baseline SHA-256.

Cloudflare documents that Preview URLs default to disabled when `workers_dev`
is disabled. The Cloudflare Dashboard shows the production Worker URL enabled
and the separate Preview URLs switch disabled. The required remote subdomain
state is therefore not established: the registered repository contract
requires `enabled: false` and `previews_enabled: true`. Wrangler 4.114.0 emits
`preview_url` only when the uploaded version reports preview support and the
remote Worker subdomain state has previews enabled.

AU-AGENT-003 registered:

- **TS001-DEPLOY-012 — High:** repository configuration was treated as if it
  established the non-versioned remote preview setting, but `versions upload`
  does not apply that setting;
- **TS001-DEPLOY-013 — Medium:** the sanitized failure evidence lost the
  successfully uploaded immutable version ID when no preview URL was returned.

The resulting Quality Gate Decision is **FAIL** and the Engineering
Verification Status is **REWORK REQUIRED** for production continuation.

## Recommended Alternative A

Use an explicit remote prerequisite plus fail-closed read-only preflight:

1. under explicit Project Owner authority, set the remote Worker subdomain
   controls for `abris-universe` to `enabled: false` and
   `previews_enabled: true`; in the Dashboard this means Production Worker URL
   off and Preview URLs on;
2. the production workflow queries the Worker subdomain endpoint before
   version upload;
3. preflight fails closed unless the exact state is `enabled: false` and
   `previews_enabled: true`;
4. evidence records booleans only and never the account credential;
5. a false, missing, malformed, or unauthorized response fails before version
   upload and before production mutation;
6. when upload occurred, sanitized lifecycle evidence retains
   `uploadOccurred: true` and the immutable version ID even if preview URL
   discovery or validation fails; it never retains the preview capability URL;
7. the existing immutable preview, exact promotion, hostname-only purge,
   three-pass stability, and rollback contract remains unchanged;
8. implementation receives focused tests for disabled-preview preflight,
   exact-state acceptance, safe/idempotent provider enablement when separately
   authorized, no production/cache mutation on prerequisite or upload failure,
   preserved version-ID evidence, and secret/capability log boundaries;
9. complete repository verification,
   exact-source AU-AGENT-003 review, required CI, and protected merge;
10. another production attempt occurs only under a new explicit Project Owner
   authorization and cannot repeat automatically.

The provider-state change may be performed manually by the Project Owner, or
through a separately reviewed idempotent control-plane action that preserves
`enabled: false`. An ordinary `wrangler deploy` must not be used to apply the
setting because it bypasses the reviewed preview-first state machine.

The existing credential is sufficient for the registered script workflow.
Whether it can mutate the Worker subdomain setting is not assumed. No new
token, DNS permission, broad cache permission, or repository secret is
proposed by this alternative.

## Alternatives Considered

### Alternative B — Let the workflow enable Preview URLs

Not recommended as part of the production workflow. A deployment job would
gain a new persistent configuration mutation and would need to distinguish the
prior subdomain state, restoration policy, and partial-failure behavior. If the
Project Owner prefers automation, it must be a separately reviewed,
idempotent control-plane action that establishes only `enabled: false` and
`previews_enabled: true` before the production workflow is dispatched.

### Alternative C — Run `wrangler deploy` to apply `preview_urls: true`

Rejected. `wrangler deploy` would deploy the candidate through a path outside
the reviewed immutable-preview, exact-promotion, purge, stability, and rollback
state machine.

### Alternative D — Return to custom-domain version overrides

Rejected by retained attempts 1–4 and TS001-DEPLOY-007. It does not restore the
required separation between candidate preview verification and production
cache convergence.

### Alternative E — Derive a preview URL without verifying remote state

Rejected. Constructing a URL from a version ID and account subdomain would
assume availability and could turn a remote configuration defect into an
ambiguous smoke failure.

## Risks

- Enabling Preview URLs makes version-specific URLs public while they remain
  reachable. The preview contains only the independently accepted static Phase
  0 application and no user data or server-side state.
- The remote setting can drift after manual enablement. The proposed preflight
  detects drift before upload.
- A likely orphan immutable version from run `30262328350` remains at zero
  traffic, but its exact ID cannot be recovered from the retained sanitized
  artifact. Future evidence must preserve the version ID whenever upload
  occurred.
- A new production attempt can expose a different provider behavior. Existing
  strict time, stability, evidence, purge, and rollback controls remain
  mandatory.
- One runner cannot prove simultaneous global edge convergence.

## Owner Disposition and Implementation

OWNER-DEC-TS001-PRODUCTION-PREVIEW-003 approves Alternative A, the exact
provider-state change, implementation, independent AU-AGENT-003 review, and
exactly one later production attempt after all gates pass.

The authenticated Cloudflare Dashboard now records Production Worker URL Off
and Preview URLs On. Reload verification confirmed the persisted state. The
custom domain, DNS, production traffic, and cache were not changed.

The implementation:

- performs an authenticated read-only Worker subdomain query before version
  upload;
- retains only `enabled` and `previewsEnabled`;
- fails before upload unless they are exactly `false` and `true`;
- records `uploadOccurred` and the immutable version ID after a successful
  upload even when no preview URL is returned;
- continues to remove the preview capability URL from live lifecycle and
  retained JSON;
- increments the deployment-evidence schema to version 3;
- adds deterministic exact-state, malformed/unauthorized response,
  no-upload/no-mutation, missing-preview provenance, and disclosure-boundary
  tests.

The implementation does not automate provider-state mutation and does not use
ordinary `wrangler deploy`. Protected merge, exact-main CI, and the controlled
attempt remain separate gates.

AU-AGENT-003 independently reviewed exact source
`497991c7eb5d9c558becafa2f4d2461e639be1ec`, assigned Quality Gate Decision
`PASS` and task-scoped Engineering Verification Status `VERIFIED`, and resolved
TS001-DEPLOY-012/013. Protected merge and exact-main CI remain open before the
single authorized attempt.

## References

- [Source of Truth Registry](../../../SOURCE_OF_TRUTH.md)
- [Production Deployment Record](PRODUCTION_DEPLOYMENT.md)
- [Immutable Preview and Hostname Purge Technical Alternative](PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
- [Production Deployment Verification](../../engineering/TASK-THINSLICE-001_PRODUCTION_DEPLOYMENT_VERIFICATION.md)
- [Cloudflare Preview URLs](https://developers.cloudflare.com/workers/versions-and-deployments/preview-urls/)
- [Cloudflare Worker Subdomain API](https://developers.cloudflare.com/api/resources/workers/subresources/scripts/subresources/subdomain/)
