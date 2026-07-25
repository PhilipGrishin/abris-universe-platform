# ADR-TS001-004 — Web Workspace and Cloudflare Delivery

| Field | Value |
| --- | --- |
| Document ID | ADR-TS001-004 |
| Title | Portable TypeScript Workspace and Immutable Cloudflare Delivery |
| Status | `[PROPOSED]` |
| Owner | AU-AGENT-001 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, PROD-DEC-007 |
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
checks, uploads an immutable Cloudflare version, smokes that version, promotes
it to `abris.653915.com`, and records both new and previous version IDs.

Production deployment is blocked until the existing placeholder is recorded as
a recoverable rollback target. The pipeline does not change DNS.

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

- A public preview URL could expose unreleased work; previews remain disabled
  until access policy is approved.
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
