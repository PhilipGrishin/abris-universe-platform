# TASK-THINSLICE-001 Threat Model

| Field | Value |
| --- | --- |
| Document ID | AU-THREAT-TS001-001 |
| Title | TASK-THINSLICE-001 Phase 0 Threat Model |
| Status | `[PROPOSED]`; architecture disposition `ACCEPTED_WITH_GATES`; AU-AGENT-003 security design review `VERIFIED WITH FINDINGS` |
| Owner | AU-AGENT-001 with AU-AGENT-004 through AU-AGENT-006 domain inputs |
| Technical Approver | AU-AGENT-001 |
| Security Reviewer | AU-AGENT-003 |
| Version | 1.5.4 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-27 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, `AU-TAP-TS001-002`, `AU-TAP-TS001-003`, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md`, `docs/reviews/technical/TASK-THINSLICE-001/OXS_IMPORTER_IMPLEMENTATION_REVIEW.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Data flow, parser, persistence, dependency, hosting, analytics, or deployment credential change; security finding or incident |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Define the Phase 0 assets, trust boundaries, abuse cases, required controls, and
evidence obligations without claiming that unimplemented controls are tested.

## Scope

The model covers the local-only web SPA, untrusted OXS files, browser workers,
canonical Pattern processing, Canvas rendering, IndexedDB, GitHub Actions, and
Cloudflare static delivery. It excludes accounts, backend services, APIs,
payments, sync, analytics transmission, and third-party pattern processing.

## Assets

- original user-selected OXS bytes;
- canonical Pattern and provenance;
- local Project and progress history;
- availability and responsiveness of the browser UI;
- integrity of the production static artifact;
- GitHub and Cloudflare deployment credentials;
- source, build, test, and deployment provenance.

## Actors

- the local user;
- a malicious or malformed file author;
- an attacker able to influence a dependency or CI action;
- an unauthorized pull-request contributor;
- an attacker probing a public preview or production site;
- browser/platform failures, quota eviction, and crashes.

## Trust Boundaries and Data Flow

```text
untrusted local file
  -> browser File API
  -> parser Web Worker
  -> validated canonical result
  -> IndexedDB
  -> renderer and accessible UI

canonical GitHub repository
  -> protected GitHub Actions
  -> Cloudflare API
  -> immutable Worker version
  -> exact *.workers.dev preview contract
  -> exact-version promotion
  -> hostname-only cache purge
  -> abris.653915.com
```

Imported data crosses from an untrusted file into an isolated parser. Only
validated typed records cross into storage and rendering. The application has
no product-data network egress in Phase 0.

## Threats and Required Controls

| ID | Threat | Required control | Required evidence | Residual risk |
| --- | --- | --- | --- | --- |
| TM-001 | XML entity expansion or external entity access | Reject DOCTYPE/DTD; non-network streaming parser | DTD/entity negative tests; parser configuration review | Parser-library defects |
| TM-002 | CPU or memory exhaustion from oversized XML | Hard byte, depth, element, attribute, palette, stitch, grid, and extension limits; worker cancellation | Boundary and one-over-limit tests; memory measurements | Valid maximum file may still stress low-end devices |
| TM-003 | Invalid references or coordinates corrupt canonical state | Strict numeric, uniqueness, referential, range, and duplicate-cell validation before commit | Golden and corrupt-case tests | Unknown producer quirks |
| TM-004 | Source strings execute or inject markup | Treat all source values as text; no `innerHTML`; bounded diagnostics | Static review and malicious-string browser test | Browser/library defect |
| TM-005 | Unsupported OXS data is silently lost or misrepresented | Preserve original bytes; explicit warning counts; no partial-success claim | Unsupported-content golden test and source-byte hash | User may overlook warnings |
| TM-006 | OXS `marked` contaminates user progress | Never map source `marked`; emit stable warning | Golden test with marked source | None after correct enforcement |
| TM-007 | Progress is reported saved before durable commit | Commit-driven UI state; atomic event/projection transaction; explicit failure | Quota/abort/reload tests | Browser storage eviction outside active transaction; abrupt power loss where strict durability is unavailable or not honored |
| TM-008 | Partial import creates orphan or inconsistent records | explicit importing attempt plus atomic success/failure transitions; no partial canonical commit | fault-injection tests at each put and interrupted-attempt recovery | Browser implementation defect |
| TM-009 | Local data is evicted or unavailable | Request persistent storage; expose durability and quota state; never silently reset | Capability and denial tests | No manual backup in approved scope |
| TM-010 | Worker or renderer denial of service blocks UI | Worker isolation, cancellation, visible-tile work, bounded cache | long-task and cancellation evidence | Main-thread fallback limitations |
| TM-011 | Dependency or GitHub Action compromise | Frozen lockfile, minimal dependencies, action SHA pinning, review, read-only default token | dependency inventory, provenance and workflow review | Upstream compromise |
| TM-012 | Cloudflare credential exfiltration or over-broad cache authority | Protected environment secrets, no fork secret access, separate Worker-deploy and zone-scoped Cache Purge tokens, no logging, no DNS permission | secret scan, step-scope review, token-permission review, sanitized-evidence tests | GitHub/Cloudflare account compromise |
| TM-013 | Unreviewed code reaches production | protected main, required checks, serialized environment deploy, immutable version evidence | branch/workflow evidence and deployment rehearsal | Repository-plan control limitations |
| TM-014 | Failed deploy or stale cache cannot restore service | capture prior version/artifact; automatic and manual rollback; purge the exact hostname after promotion and rollback with a strict operation timeout; bounded post-rollback baseline verification using the shared remaining deadline | rollback rehearsal, purge timeout tests, and recorded IDs | Distributed cache convergence cannot be proven globally |
| TM-015 | Public preview exposes unreleased content | no pull-request previews; production workflow uses only the unadvertised exact version URL after protected merge; preview contains the accepted static app and no user/server data; version-upload output is suppressed and the URL is omitted from retained evidence | workflow/config review, evidence-redaction test, and build secret/network scan | Anyone who obtains the capability URL while it remains reachable can view the accepted static UI |
| TM-016 | Static rollback cannot read newer IndexedDB schema | one-release backward read compatibility; migration/rollback review | prior-client compatibility test | Multi-release downgrade is not guaranteed |
| TM-017 | Product pattern data is transmitted unexpectedly | no analytics client for pattern data; restrictive `connect-src`; reviewed minimum runtime request inventory; no pattern-derived URL, body, header, log, analytics, or telemetry content | header assertion, dependency review, inventory comparison, and full network capture across import, render, toggle, reload, and error paths | Browser extensions and device compromise |
| TM-018 | Fixture provenance or redistribution authority is missing or falsified | project-original route-1 fixtures by default; explicit Decision Log grant for route 2; checksums and provenance README | fixture inventory, rights record, generator review, and checksum verification | Fraudulent or mistaken source-owner assertion |
| TM-019 | Static application executes injected content or is framed after a dependency defect | Worker-enforced CSP, `nosniff`, `frame-ancestors 'none'`, no-referrer policy, no inline/runtime-remote assets | pre-promotion and production header assertions; CSP browser test | Browser or platform enforcement defect |
| TM-020 | Concurrent tabs corrupt progress ordering or derive from stale state | exclusive per-project Web Lock; read-only second tab; in-transaction derivation and sequence; event payload hash | two-context concurrency and duplicate-ID tests | Web Locks unavailable disables editing |
| TM-021 | Failed imports retain large orphaned source Blobs | byte limit before persistence; failure/interruption transaction deletes Blob and preserves bounded metadata/report | repeated-failure quota and orphan-absence tests | Browser transaction defect |
| TM-022 | Production completes while edges alternate between prior, candidate, or unknown cache states | hostname-only purge; exact prior/candidate/unknown classification; three consecutive complete candidate contracts; abort-aware request/backoff; 25-observation and 120-second limits; immediate rollback on unknown or inconsistent state | deterministic stability/deadline tests and retained production evidence | One runner edge cannot prove simultaneous global convergence |
| TM-023 | Remote Worker subdomain state drifts from repository configuration and consumes an attempt without a usable immutable preview | owner-controlled exact state `enabled: false`, `previews_enabled: true`; read-only exact-state preflight before version upload; preserve sanitized upload/version provenance; fail closed on false, missing, malformed, or unauthorized state | reload-confirmed dashboard state; deterministic preflight, no-upload/no-mutation, provenance, and disclosure-boundary tests `[TESTED]`; exact-source AU-AGENT-003 `VERIFIED` at `497991c` | Remote state can drift after verification; attempt 5 likely left an untraceable zero-traffic version |

## Security Requirements

1. Imported bytes and values remain untrusted until validation completes.
2. File-size and allocation preflight precedes opaque source-Blob staging.
   Structural and referential validation precedes canonical allocation and
   canonical-result persistence. Failed or interrupted staging follows the
   explicit transactional Blob-cleanup contract.
3. No user pattern data is transmitted.
4. No raw imported content is placed into HTML, logs, build evidence, or
   telemetry.
5. No production secret exists in source, build output, logs, screenshots, or
   pull-request jobs.
6. Save success means a committed transaction.
7. Production promotion and rollback identify immutable source and platform
   versions.
8. Security controls are independently reviewed by AU-AGENT-003 before an
   Engineering Verification Report can pass.
9. Progress and import transactions request strict durability when supported;
   unsupported abrupt-power-loss durability is recorded rather than overstated.
10. Cache mutation is limited to the registered production hostname and uses a
    credential separate from Worker deployment authority.

AU-AGENT-003 independently reverified the immutable-preview and hostname-purge
implementation at exact source `1054a2f0`. Findings concerning unbounded
purge, non-abort-aware deadlines, ambiguous response classification, and
preview-capability retention are resolved. The task-scoped Engineering
Verification Status is `VERIFIED`; live credential scope and provider behavior
remain outside that exact-source review.

## Open Findings

- `THREAT-OPEN-001`: `[IMPLEMENTED]`, `[TESTED]` for importer core. Exact
  dependencies are `saxes` 6.0.0 and `@noble/hashes` 2.2.0; non-DOM parsing,
  DTD/processing-instruction rejection, bounded diagnostics, and hard limits
  have focused tests. Dedicated Worker integration, cancellation, and bounded
  Phase 0 AU-AGENT-003 implementation review are complete. Actual
  import-Worker peak memory remains mandatory in Prototype 9.1 before any
  500,000-stitch scale claim.
- `THREAT-OPEN-002`: `[TESTED]`, closed for the current rollback anchor and
  credential separation. Historical runs restored the registered prior
  version; the owner configured a separate zone-scoped Cache Purge token
  without exposing its value. Live purge execution remains a deployment gate.
- `THREAT-OPEN-003`: `[CONFIRMED]` bounded exception. Pull-request previews
  remain disabled. The Project Owner approved the unadvertised exact-version
  preview only inside the protected post-merge production workflow; it
  contains the accepted static app and no user/server data.
- `THREAT-OPEN-004`: browser persistent-storage grants cannot be guaranteed and
  manual backup is outside scope.
- `THREAT-OPEN-005`: `[TESTED]`, closed for design scope. AU-AGENT-003
  reviewed the revised CSP, persistence, multi-tab, parser-worker, and fixture
  controls through `AU-REVIEW-ENG-TS001-SEC-001`; implementation evidence
  remains separate.
- `THREAT-OPEN-006`: the measured Chrome runtime request inventory is
  `[IMPLEMENTED]`, `[TESTED]` for the declared local profile. Production
  header/request assertions and broader-platform capture remain open.

## Importer-Core Evidence Update

- TM-001 and TM-003 importer-core controls are `[IMPLEMENTED]`, `[TESTED]`.
- TM-002 hard byte/structure/allocation controls are `[IMPLEMENTED]`,
  `[TESTED]`; Worker cancellation is tested. Actual import-Worker peak memory
  is an owner-approved Phase 0 evidence limitation under the tested 384 MiB
  preflight control and mandatory Prototype 9.1 measurement.
- TM-005 unsupported reporting and durable original-source persistence are
  `[IMPLEMENTED]`, `[TESTED]` for the registered route-1 profile.
- TM-006 is `[IMPLEMENTED]`, `[TESTED]`: source `marked` emits a warning and
  never enters Pattern or Progress.
- TM-011 now has exact dependency versions, lockfile integrity, MIT/ISC
  production-license inventory, and an advisory audit with no known
  vulnerabilities at audit time. AU-AGENT-003 implementation review is
  complete within its documented bounded disposition.

## Consolidated Implementation Evidence Update

- TM-007 committed-save behavior, optimistic visual rollback, reload, and
  close-tab/new-tab recovery are `[IMPLEMENTED]`, `[TESTED]` on Chrome 150 /
  macOS 26.5.2. Safe real quota exhaustion, eviction, and abrupt power loss
  remain unverified.
- TM-010 dedicated import/render Worker paths, cancellation, bounded tile and
  glyph caches, incremental fallback, and measured-profile long-task evidence
  are `[IMPLEMENTED]`, `[TESTED]`. Cross-browser and 500,000-stitch scale
  claims remain open.
- TM-017 the registered local runtime request inventory and `connect-src
  'none'` policy are `[IMPLEMENTED]`, `[TESTED]`; production assertion remains
  a deployment gate.
- TM-019 local Worker-header/CSP rehearsal is `[IMPLEMENTED]`, `[TESTED]`;
  production response assertions remain open.
- TM-020 real Web Locks contention fails closed and visually restores the
  committed progress state on the declared profile.
- TM-012, TM-014, TM-015, and TM-022 immutable-preview, credential-separation,
  hostname-purge, stability-quorum, and rollback-convergence controls are
  `[IMPLEMENTED]`, locally `[TESTED]`. Exact-source AU-AGENT-003 review and live
  production evidence remain open.

The underlying consolidated implementation has task-scoped Engineering
Verification Status `VERIFIED WITH FINDINGS`. The Completion Report remains
under its separate internal quality gate. This update does not assign product
acceptance, release readiness, deployment authorization, or project
`[VERIFIED]`.

This update assigns no Engineering Verification Status, security acceptance, or
project `[VERIFIED]`.

## Verification Checklist

- [x] Every implemented Phase 0 TM control has executable or inspectable
      evidence; production-only and deferred controls remain explicitly open.
- [x] Limits match the Technical Design and tests.
- [x] No unexpected network request occurs on the declared local Chrome
      profile during import, render, toggle, or
      reload.
- [x] Dependency and action inventories are reviewed.
- [x] CI permission and secret boundaries are tested for the no-deploy
      workflow.
- [x] Historical rollback rehearsal restores the prior Cloudflare version and
      registered public baseline; the new post-rollback purge path is locally
      tested and awaits live evidence.
- [ ] CSP and required HTTP headers pass pre-promotion and production checks.
- [x] Two-context progress and failed-import Blob-lifecycle tests pass on the
      declared repository/browser evidence boundaries.
- [x] AU-AGENT-003 records design findings and a Quality Gate Decision.

## References

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Immutable Preview and Hostname Purge Alternative](../../reviews/technical/TASK-THINSLICE-001/PRODUCTION_IMMUTABLE_PREVIEW_PURGE_TECHNICAL_ALTERNATIVE.md)
- [Threat Model Index](README.md)
- [Project Risks](../../RISKS.md)
- [Independent Pre-Implementation Architecture Review](../../../product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md)
- [Independent Design Revision Confirmation](../../../product/reviews/TASK-THINSLICE-001_Design_Revision_Confirmation.md)
- [AU-AGENT-003 Pre-Code Security Design Verification](../../reviews/engineering/TASK-THINSLICE-001_SECURITY_DESIGN_VERIFICATION.md)
