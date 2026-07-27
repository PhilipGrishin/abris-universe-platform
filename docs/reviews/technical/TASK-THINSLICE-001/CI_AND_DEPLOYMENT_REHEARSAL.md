# TASK-THINSLICE-001 CI and Deployment Rehearsal

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-CI-001 |
| Title | TASK-THINSLICE-001 CI and Deployment Rehearsal |
| Status | No-deploy rehearsal `[TESTED]`; production attempt 1 failed closed and rollback `[TESTED]`; semantic-propagation, route-evidence, and artifact-retention remediation locally `[TESTED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.4.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-27 |
| Dependencies | Technical Design v1.5.2 section 12; ADR-TS001-004; Threat Model TM-011 through TM-019; exact implementation commit `35bbb34bdeb5c4133de88e4edea36762281a65ca` |
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
hash is unchanged.

Production remains blocked by:

- TD-GATE-003: capture the current Worker version/route and recoverable
  placeholder artifact;
- corrected workflow exact-source AU-AGENT-003 reverification and merge;
- retained route-ownership and preflight evidence;
- full runtime network capture against the registered inventory;
- production header/smoke assertion;
- production workflow engineering verification.

PROD-DEC-013 closes the explicit authorization item. The main-only GitHub
environment and versioned deployment workflow are now implemented. The
workflow captures the current immutable version and route ownership, stages
the candidate at zero traffic, retries the exact semantic contract during
version-override propagation, promotes it, repeats production smoke, and rolls
back automatically on failure.

## Rollback

Attempt 1 proved rollback to the exact prior version and public baseline. The
unused zero-traffic candidate version remains immutable Cloudflare history; it
does not receive production traffic.

## Quality Gate

AU-AGENT-003 initially assigned `REWORK REQUIRED` at exact consolidated source
`43782195`. Later source-qualified implementation, benchmark, persistence,
accessibility, and manual evidence remediated the mandatory bounded Phase 0
implementation findings; the current underlying implementation status is
`VERIFIED WITH FINDINGS`. Completion Report v1.0.0 separately received
`REWORK REQUIRED` for report/documentation completeness. Production remains
blocked by its explicit deployment gates regardless of either internal status.
The implementation owner cannot change AU-AGENT-003 status.

The new production workflow and smoke scripts require a separate exact-source
AU-AGENT-003 review before merge and dispatch.

## References

- [Runtime Request Inventory](../../../assurance/threat-models/TASK-THINSLICE-001_RUNTIME_REQUEST_INVENTORY.md)
- [Threat Model](../../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [ADR-TS001-004](../../../architecture/adr/ADR-TS001-004-web-workspace-and-cloudflare-delivery.md)
- [Client Integration Review](CLIENT_INTEGRATION_IMPLEMENTATION_REVIEW.md)
- [Task Review Index](README.md)
- [Consolidated Implementation Verification](../../engineering/TASK-THINSLICE-001_IMPLEMENTATION_VERIFICATION.md)
