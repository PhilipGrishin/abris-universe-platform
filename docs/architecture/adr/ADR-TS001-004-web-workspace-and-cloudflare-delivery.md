# ADR-TS001-004 — Web Workspace and Cloudflare Delivery

| Field | Value |
| --- | --- |
| Document ID | ADR-TS001-004 |
| Title | Portable TypeScript Workspace and Immutable Cloudflare Delivery |
| Status | `[PROPOSED]`; independent architecture disposition `ACCEPTED_WITH_GATES`; protected production workflow and successful bounded deployment `[IMPLEMENTED]`, `[TESTED]`, task-scoped engineering `VERIFIED`; expanded project `[VERIFIED]` remains open |
| Owner | AU-AGENT-001 |
| Technical Approver | AU-AGENT-001 |
| Independent Architecture Review | `AU-EX-20260725-005`; `ACCEPTED_WITH_GATES` |
| Security Review | `AU-REVIEW-ENG-TS001-SEC-001`; `VERIFIED WITH FINDINGS` for design scope |
| Version | 1.3.14 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-27 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, PROD-DEC-007, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Supported platform change; workspace boundary change; hosting target change; pipeline or rollback failure; dependency policy change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Context

Phase 0 is web-first and targets the existing Cloudflare Worker/static endpoint
at `abris.653915.com`. Shared domain and renderer logic must not depend on React
or a future mobile framework.

## Problem

A single undifferentiated web application would make domain, importer,
renderer, and persistence boundaries difficult to enforce. A production deploy
that rebuilds or publishes mutable assets without prior-version provenance
would not satisfy rollback and audit requirements.

## Decision

Use a strict TypeScript pnpm workspace with a React/Vite SPA and portable
packages for domain, OXS import, rendering, and persistence. Turborepo may
orchestrate tasks. Mobile implementation and framework selection remain
deferred.

Deliver the static `dist/` artifact through the existing Cloudflare Worker
`abris-universe`. GitHub Actions builds from a frozen lockfile, runs mandatory
checks, uploads an immutable Cloudflare version, smokes its exact Workers
preview URL, promotes that version to `abris.653915.com`, purges only that
hostname, requires three consecutive complete production contracts, and
records both new and previous version IDs.

Production deployment is blocked until the existing placeholder is recorded as
a recoverable rollback target. The pipeline does not change DNS.
The Worker applies a restrictive reviewed CSP, `nosniff`,
`frame-ancestors 'none'`, and `Referrer-Policy: no-referrer`; both preview and
production smoke checks assert the headers before a release can pass.

## Alternatives

1. One Vite application without packages. Rejected because it weakens required
   domain boundaries.
2. Add a Phase 0 backend. Rejected as out of scope and unnecessary.
3. Cloudflare Pages as a new project. Rejected because the owner supplied an
   existing Worker target.
4. Direct `wrangler deploy` from a developer machine. Rejected because it lacks
   canonical CI evidence and controlled rollback.
5. Decide React Native now. Deferred because mobile is outside this task and
   OQ-003 remains product-owned.

## Consequences

- Shared packages remain usable by a later client without selecting that
  client's framework.
- The production artifact and source commit are traceable.
- A two-stage version upload and promotion supports smoke-before-traffic.
- Cloudflare credentials exist only in the protected GitHub environment.
- First production deploy requires external-state evidence that cannot be
  manufactured in repository documentation.

## Risks

- A version preview URL is publicly reachable during a protected production
  run. It contains only the independently accepted static application, is not
  advertised, and carries no user or server-side data. Pull-request previews
  remain disabled.
- Repository-plan features may limit environment reviewers; required branch
  checks and PR review remain mandatory controls.
- The current placeholder may not have a recoverable version or source.

## Migration

There is no hosting or application migration in this proposal. The first
delivery replaces the current placeholder only after its rollback anchor is
captured. Later build-system or hosting changes require a separate ADR.

## Rollback

Cloudflare rolls traffic back to the recorded previous immutable version and
the workflow repeats smoke checks. Static rollback leaves origin-scoped
IndexedDB untouched. Client releases must maintain backward-readable local
schema across one production rollback window.

## Affected Modules and Contracts

- workspace manifests and dependency rules
- `apps/web`
- GitHub Actions
- Cloudflare Wrangler configuration
- production evidence and rollback record

## Verification and Evidence

Required evidence includes clean install/build, all mandatory checks, action SHA
pinning, secret scan, least-privilege token review, immutable version smoke,
production smoke, rollback rehearsal, and local-data compatibility.

## Traceability

- PROD-DEC-007
- TASK-THINSLICE-001 sections 19, 24, 26, 34 through 36
- TRACE-DEPLOY-INPUT-001
- TRACE-DESIGN-TS001

## Review History

- 2026-07-25: Initial proposal by AU-AGENT-001. Approval pending.
- 2026-07-25: Claude Cowork independent architecture review
  `AU-EX-20260725-005` dispositioned this ADR `ACCEPTED_WITH_GATES`; R-8 is
  integrated in version 1.1.0. TD-GATE-003 and AU-AGENT-003 security review
  were open at that review stage.
- 2026-07-25: AU-AGENT-003 report `AU-REVIEW-ENG-TS001-SEC-001` records
  `VERIFIED WITH FINDINGS` for the design-only security scope. TS001-SEC-002
  design action is complete; runtime request-inventory/network-capture evidence
  and TD-GATE-003 remain open before deployment.
- 2026-07-26: PROD-DEC-013 authorizes the first production deployment.
  Version 1.2.0 records the main-only GitHub `production` environment,
  immutable upload/zero-traffic smoke/promotion/automatic-rollback workflow,
  and retained evidence contract. No production mutation occurred; credentials
  and TD-GATE-003 remain open.
- 2026-07-27: GitHub production credentials are configured. Attempt 1 captured
  the exact prior immutable version, uploaded the candidate at zero traffic,
  failed closed on a semantically stale edge response, and restored the prior
  version and public baseline. Version 1.3.0 records the locally tested
  propagation retry, exact Workers-domain ownership query, and hidden-artifact
  retention corrections. TD-GATE-003 remains open until the corrected
  production run records the route and successful assertions.
- 2026-07-27: Version 1.3.1 records AU-AGENT-003 task-scoped `VERIFIED`
  reverification of exact remediation `854ba305` without changing the
  architecture decision.
- 2026-07-27: Version 1.3.2 records that retained run `30248680612` closes
  TD-GATE-003 but still failed closed before promotion after six stale override
  responses. A bounded two-minute diagnostic remains inside the approved
  zero-traffic design; failure requires a separately reviewed alternative.
- 2026-07-27: Version 1.3.3 records AU-AGENT-003 task-scoped `VERIFIED` review
  of exact correction `a503500`. The 61-attempt window is restricted to
  zero-traffic pre-promotion smoke; post-promotion smoke remains at six.
  Superseded source `7381112` is not mergeable.
- 2026-07-27: Version 1.3.4 records attempt 3 as evidence, not a decision
  change. The zero-traffic candidate passed on semantic attempt 17. After
  promotion, smoke exhausted six attempts and the final retained runner-edge
  observation matched the exact prior cached baseline; exact rollback
  succeeded. A baseline-aware
  post-promotion transition is separately `[PROPOSED]` in
  `AU-TAP-TS001-001` and requires Project Owner approval.
- 2026-07-27: Version 1.3.5 records
  OWNER-DEC-TS001-PRODUCTION-TRANSITION-001. Alternative A is approved and its
  implementation candidate is tested: wait only on the exact prior baseline
  for no more than 61 observations and 120 seconds; run one full contract when
  the exact candidate sentinel appears; fail every unknown, transport, timeout,
  or candidate-contract state into exact rollback.
- 2026-07-27: Version 1.3.6 records AU-AGENT-003 task-scoped `VERIFIED` review
  at exact source `b4f25cda` and successful CI run `30252463472`. Protected
  merge remains required before the one authorized run.
- 2026-07-27: Version 1.3.7 records protected-main run `30253457090`. The
  candidate passed zero-traffic smoke and was promoted; an exact candidate
  transition observation was immediately followed by the prior cached
  baseline during the one-shot full contract. The workflow failed closed and
  restored the exact prior version/baseline. No retry is authorized;
  TS001-DEPLOY-007 blocks continuation pending separate disposition.
- 2026-07-27: Version 1.3.8 records
  OWNER-DEC-TS001-PRODUCTION-DELIVERY-002 and `AU-TAP-TS001-002`. The approved
  continuation uses the exact immutable Workers preview, exact-version
  promotion, a separate least-privilege hostname-purge credential, and three
  consecutive complete production contracts. Exact-source AU-AGENT-003
  verification and protected merge remain required before one controlled
  attempt.
- 2026-07-27: Version 1.3.9 records AU-AGENT-003 task-scoped Engineering
  Verification Status `VERIFIED` at exact source `1054a2f0`, no remaining
  finding, and successful CI runs `30261460673` and `30261463795`. Protected
  merge and live production/browser evidence remain open.
- 2026-07-27: Version 1.3.10 records protected-main run `30262328350`.
  Remote Preview URLs were disabled, Wrangler emitted no immutable preview
  URL, and the workflow failed before traffic or cache mutation. The prior
  version and public baseline remain intact. AU-AGENT-003 assigned
  `REWORK REQUIRED` with TS001-DEPLOY-012/013. `AU-TAP-TS001-003` proposes
  exact external state `enabled: false`, `previews_enabled: true`, a
  fail-closed preflight, and retained sanitized version provenance; no further
  attempt is authorized.
- 2026-07-27: Version 1.3.11 records
  OWNER-DEC-TS001-PRODUCTION-PREVIEW-003, reload-confirmed remote state
  `enabled: false`, `previews_enabled: true`, locally tested read-only
  exact-state preflight, deployment-evidence schema v3, and sanitized
  upload/version-ID retention. Independent exact-source review and protected
  merge remain open before the single new authorized attempt.
- 2026-07-27: Version 1.3.12 records AU-AGENT-003 task-scoped `VERIFIED` at
  exact remediation source `497991c`, resolution of TS001-DEPLOY-012/013, and
  no unresolved finding. Protected merge and exact-main CI were open at that
  revision.
- 2026-07-27: Version 1.3.13 records protected-main run `30266185702`.
  Immutable preview, exact promotion, and hostname purge passed; production
  stability attempt 3 received `/version.json` `404` while the candidate root
  remained active. Exact rollback and rollback purge restored the prior
  version/baseline. Production is `REWORK REQUIRED`; TS001-DEPLOY-014/015 are
  open; no new architecture decision is adopted.
- 2026-07-27: Version 1.3.14 records PR #16, protected merge `1021abf3`,
  exact-main CI `30278863068`, and successful production run `30278965044`.
  Immutable version `8c49fb69` passed preview, promotion, purge, bounded
  transition, and three consecutive candidate contracts. AU-AGENT-003 closes
  TS001-DEPLOY-014 for bounded deployment. The delivery architecture is not
  changed; global/long-duration and expanded product acceptance remain open.
