# TASK-THINSLICE-001 CI and Deployment Rehearsal

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-CI-001 |
| Title | TASK-THINSLICE-001 CI and Deployment Rehearsal |
| Status | No-deploy rehearsal `[TESTED]`; historical attempts retained; remote-state/provenance remediation `[IMPLEMENTED]`, locally `[TESTED]`; independent exact-source review and protected merge `[OPEN]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.12.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-27 |
| Dependencies | OWNER-DEC-TS001-PRODUCTION-DELIVERY-002; OWNER-DEC-TS001-PRODUCTION-PREVIEW-003; `AU-TAP-TS001-002` v1.3.1; `AU-TAP-TS001-003` v1.2.0; Technical Design v1.5.15 section 12; ADR-TS001-004 v1.3.11; Production Deployment Verification v1.9.0; Production Deployment Record v2.1.0; Threat Model TM-011 through TM-023; exact reviewed source `1054a2f0a7c1385fd8d51661c6be013e90df9df5`; protected-main source `ebdde8ec7e3dc7cb292868ab9d908cd19f3b0e9b`; runs `30262250573` and `30262328350` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Workflow, action SHA, dependency, build, Worker, header, asset, Cloudflare, route, credential, or rollback change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record the implemented CI contract and a non-production Cloudflare deployment
rehearsal. This report does not authorize or claim a production deployment,
release readiness, product acceptance, or project `[VERIFIED]`.

## Implemented Scope

- GitHub Actions CI on pull requests and pushes to `main` or `codex/**`.
- Repository token permission limited to `contents: read`.
- Concurrency cancellation and a 20-minute job timeout.
- Full-commit SHA pinning for checkout, Node setup, pnpm setup, and artifact
  upload actions.
- Node 24 and pnpm 11.9.0 with frozen-lockfile installation.
- Strict typecheck, complete tests, static build verification, production
  dependency audit, and Wrangler dry-run.
- Fourteen-day retention of the non-production static and Worker build
  artifacts.
- Cloudflare Worker static-assets boundary with SPA fallback and no configured
  production route, custom domain, or deploy job.
- Generated non-secret `version.json` containing application version, full
  source commit, dirty-state flag, and build timestamp.

## Supply-Chain Boundary

| Component | Pin |
| --- | --- |
| `actions/checkout` | `11bd71901bbe5b1630ceea73d27597364c9af683` |
| `pnpm/action-setup` | `a7487c7e89a18df4991f7f222e4898a00d66ddda` |
| `actions/setup-node` | `49933ea5288caeca8642d1e84afbd3f7d6820020` |
| `actions/upload-artifact` | `ea165f8d65b6e75b540449e92b4886f43607fa02` |
| Wrangler | `4.114.0` |
| pnpm | `11.9.0` |

Only `esbuild` and `workerd` install scripts are permitted by workspace
configuration. The lockfile remains canonical for exact transitive integrity.

## Exact-Source Verification

Exact implementation commit:
`35bbb34bdeb5c4133de88e4edea36762281a65ca`.

| Check | Result |
| --- | --- |
| Frozen install | `[TESTED]`; lockfile already current |
| Strict workspace typecheck | `[TESTED]`; all six packages pass |
| Full workspace tests | `[TESTED]`; 64 passed, 0 failed |
| Static production build | `[TESTED]`; 51 modules; application JS 284.63 kB, 88.42 kB gzip; import Worker 54.10 kB |
| Build provenance | `[TESTED]`; full commit `35bbb34...`, `sourceDirty: false` |
| Static artifact policy | `[TESTED]`; seven files; hashed JS/CSS; no inline executable content, registered secret marker, or client network API |
| Production dependency audit | `[TESTED]`; no known vulnerabilities reported on 2026-07-26 |
| Wrangler dry-run | `[TESTED]`; eight static assets read; Worker upload 1.53 KiB, 0.68 KiB gzip; no deployment |
| Dry-run artifact policy | `[TESTED]`; three files, 4,189 bytes; no registered secret marker |
| Local workerd root and SPA fallback | `[TESTED]`; both returned `200`; fallback body matched the application shell |
| Local workerd provenance | `[TESTED]`; `version.json` returned the exact clean commit |
| Local workerd method boundary | `[TESTED]`; `POST /` returned `405 Method Not Allowed` |
| Local workerd response security | `[TESTED]`; reviewed CSP, `X-Content-Type-Options: nosniff`, and `Referrer-Policy: no-referrer` |
| GitHub Actions run `30191845477` | `[TESTED]`; exact head `43782195`; every CI step passed |
| Retained remote artifact | `[TESTED]`; `abris-static-43782195c2db734bc16e7401dcad4becbe3e0d4f`, 429,389 bytes, expires 2026-08-09 |

## Security Header Contract

The Worker applies:

```text
default-src 'self';
script-src 'self';
style-src 'self';
img-src 'self' data:;
font-src 'self';
connect-src 'none';
worker-src 'self';
object-src 'none';
base-uri 'none';
form-action 'none';
frame-ancestors 'none'
```

It also applies `X-Content-Type-Options: nosniff` and
`Referrer-Policy: no-referrer`.

## Production Boundary

No DNS mutation or secret exposure occurred. Both GitHub environment secret
names are configured. Workflow `30247393181` uploaded candidate
`f231b299-63d1-43f5-acb0-416ae989ab83`, registered it at zero percent, rejected
the still-propagating placeholder response, and restored prior version
`d1f2b05d-77d0-4d53-9c7a-73d61135979e` at 100 percent. The placeholder body
hash is unchanged. Corrected workflow `30248680612` retained the exact route,
preflight, candidate, and rollback JSON, closing TD-GATE-003. Its candidate
`b855e2e0-7221-456e-aaa6-55e947b0dcf0` also remained at zero traffic and was
rolled back after six complete semantic attempts still observed the
placeholder.

Production remains blocked by:

- exact-source AU-AGENT-003 review of the approved baseline-aware transition
  implementation;
- required remote CI and protected merge;
- full runtime network capture against the registered inventory;
- production header/smoke assertion;
- corrected production and browser verification.

Run `30250084131` proved the complete zero-traffic candidate contract on
semantic attempt 17, promoted candidate `5eca15e6-5ba4-4ab9-9ce7-16a7537e591c`,
then exhausted six production attempts. The final retained runner-edge
observation matched the exact prior cached placeholder. Automatic rollback
restored the prior version and baseline. The retained artifact digest is
`sha256:a6ad02c1019cc227db383a312bacc32d4f2966da304d6f087bb48e9177eb8a5d`.

PROD-DEC-013 closes the explicit authorization item. The main-only GitHub
environment and versioned deployment workflow are now implemented. The
workflow captures the current immutable version and route ownership, stages
the candidate at zero traffic, retries the exact semantic contract during
version-override propagation, promotes it, repeats production smoke, and rolls
back automatically on failure.

## Rollback

Attempts 1 through 3 proved rollback to the exact prior version and public
baseline. Attempt 3 also proved zero-traffic selection and brief promotion
before rollback. All three candidate versions remain immutable Cloudflare
history and currently receive no production traffic.

## Quality Gate

AU-AGENT-003 initially assigned `REWORK REQUIRED` at exact consolidated source
`43782195`. Later source-qualified implementation, benchmark, persistence,
accessibility, and manual evidence remediated the mandatory bounded Phase 0
implementation findings; the current underlying implementation status is
`VERIFIED WITH FINDINGS`. Completion Report v1.0.0 separately received
`REWORK REQUIRED` for report/documentation completeness. Production remains
blocked by its explicit deployment gates regardless of either internal status.
The implementation owner cannot change AU-AGENT-003 status.

AU-AGENT-003 independently assigned exact observability remediation `a503500`
task-scoped `VERIFIED`; 61 attempts apply only before promotion and production
smoke remains at six. Superseded `7381112` is not mergeable. The independently
allowed dispatch is now exhausted. The Project Owner approved Alternative A
and one new controlled attempt, contingent on an exact-source AU-AGENT-003
gate, required CI, and protected merge. Those gates passed, and run
`30253457090` exercised the one
authorized attempt. The candidate passed zero-traffic smoke and was promoted;
after a candidate transition observation, the one-shot contract received the
exact prior cached baseline and failed immediately into exact rollback.
AU-AGENT-003 records Alternative A safety execution `VERIFIED`, production
continuation `BLOCKED`, and High finding TS001-DEPLOY-007. No retry is
authorized.

The implementation classifies the registered prior GET/HEAD/content/hash
baseline separately from the exact candidate root sentinel, applies both
61-observation and strict 120-second limits, performs one complete candidate
contract without semantic retry, immediately rejects unknown and transport
states, and allowlists retained failure evidence. Twenty-seven focused
deployment tests pass.

## Immutable Preview and Purge Rehearsal

OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 replaces the blocked custom-domain
override continuation with:

- exact immutable Workers preview discovery and full-contract verification;
- exact-version promotion to 100 percent;
- hostname-only purge for `abris.653915.com` using a separate zone-scoped
  Cache Purge token and a strict 10-second operation timeout;
- three consecutive complete production contracts inside 25 observations and
  120 seconds;
- rollback, second hostname purge, active-version confirmation, and bounded
  registered-baseline restoration using the shared remaining deadline.

The no-deploy rehearsal now requires the exact reviewed Wrangler static-assets
configuration, including `workers_dev: false` and `preview_urls: true`, and
rejects every deployment or purge secret/variable marker in the generated
bundle. Local evidence passes strict typecheck, 46 script tests, 68 package
tests, production build verification, dependency audit with no known
vulnerabilities, and Wrangler dry-run. No Cloudflare mutation occurred.
AU-AGENT-003 independently reviewed exact source `1054a2f0`, resolved the
preliminary purge-timeout, deadline, classification, and preview-capability
findings, recorded no remaining finding, and assigned task-scoped Engineering
Verification Status `VERIFIED`. Both exact-source CI runs pass. The protected
merge and single authorized attempt subsequently completed as recorded below.
Abort-aware request and backoff tests distinguish exact prior, exact candidate,
and unknown states.

Protected merge `ebdde8ec` retained a byte-identical reviewed implementation,
and exact-main CI run `30262250573` passed. Production run `30262328350`
passed every repository and credential-presence gate, then failed closed at
version upload because the remote Worker had Preview URLs disabled and
Wrangler emitted no `preview_url`. No promotion, production cache purge, or
traffic mutation occurred. `AU-TAP-TS001-003` proposes the missing remote
precondition, read-only exact-state preflight, and sanitized upload/version-ID
retention. AU-AGENT-003 assigned production continuation `REWORK REQUIRED`
with TS001-DEPLOY-012/013. The consumed run is not repeatable under the
existing authority.

OWNER-DEC-TS001-PRODUCTION-PREVIEW-003 authorizes the exact remote-state
remediation and one later controlled attempt after all gates. Dashboard reload
confirmed Production Worker URL Off and Preview URLs On. The workflow now
queries the read-only Worker subdomain endpoint before upload, requires exact
state, and retains only its two booleans. Deployment-evidence schema v3 records
`uploadOccurred` and the immutable version ID after successful upload even
when preview discovery fails. Focused exact-state, malformed/unauthorized
response, no-upload/no-mutation, provenance, and disclosure-boundary tests
pass. Independent exact-source review, required CI, and protected merge remain
open.

## References

- [Runtime Request Inventory](../../../assurance/threat-models/TASK-THINSLICE-001_RUNTIME_REQUEST_INVENTORY.md)
- [Threat Model](../../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Client Integration Review](CLIENT_INTEGRATION_IMPLEMENTATION_REVIEW.md)
- [Task Review Index](README.md)
- [Production Propagation Technical Alternative Proposal](PRODUCTION_PROPAGATION_TECHNICAL_ALTERNATIVE.md)
- [Immutable Preview and Hostname Purge Technical Alternative](PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
- [Remote Preview Enablement Technical Alternative](PRODUCTION_PREVIEW_ENABLEMENT_TECHNICAL_ALTERNATIVE.md)
- [Consolidated Implementation Verification](../../engineering/TASK-THINSLICE-001_IMPLEMENTATION_VERIFICATION.md)
