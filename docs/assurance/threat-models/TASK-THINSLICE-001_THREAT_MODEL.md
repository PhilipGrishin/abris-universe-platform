# TASK-THINSLICE-001 Threat Model

| Field | Value |
| --- | --- |
| Document ID | AU-THREAT-TS001-001 |
| Title | TASK-THINSLICE-001 Phase 0 Threat Model |
| Status | `[PROPOSED]`; independent security review open |
| Owner | AU-AGENT-001 with AU-AGENT-004 through AU-AGENT-006 domain inputs |
| Technical Approver | AU-AGENT-001 |
| Security Reviewer | AU-AGENT-003 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1 |
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
| TM-007 | Progress is reported saved before durable commit | Commit-driven UI state; atomic event/projection transaction; explicit failure | Quota/abort/reload tests | Browser storage eviction outside active transaction |
| TM-008 | Partial import creates orphan or inconsistent records | One short multi-store transaction after parse/validation | Fault-injection tests at each put | Browser implementation defect |
| TM-009 | Local data is evicted or unavailable | Request persistent storage; expose durability and quota state; never silently reset | Capability and denial tests | No manual backup in approved scope |
| TM-010 | Worker or renderer denial of service blocks UI | Worker isolation, cancellation, visible-tile work, bounded cache | long-task and cancellation evidence | Main-thread fallback limitations |
| TM-011 | Dependency or GitHub Action compromise | Frozen lockfile, minimal dependencies, action SHA pinning, review, read-only default token | dependency inventory, provenance and workflow review | Upstream compromise |
| TM-012 | Cloudflare credential exfiltration | Environment secrets, no fork secret access, least privilege, no logging, no DNS permission | secret scan and token-permission review | GitHub/Cloudflare account compromise |
| TM-013 | Unreviewed code reaches production | protected main, required checks, serialized environment deploy, immutable version evidence | branch/workflow evidence and deployment rehearsal | Repository-plan control limitations |
| TM-014 | Failed deploy cannot restore service | capture prior version/artifact; automatic and manual rollback; post-rollback smoke | rollback rehearsal and recorded IDs | Initial placeholder may lack recoverable source |
| TM-015 | Public preview exposes unreleased content | no public preview until access policy is approved | workflow condition review | Authorized reviewers can still disclose content |
| TM-016 | Static rollback cannot read newer IndexedDB schema | one-release backward read compatibility; migration/rollback review | prior-client compatibility test | Multi-release downgrade is not guaranteed |
| TM-017 | Product pattern data is transmitted unexpectedly | no analytics/network client for pattern data; CSP/connect review when implemented | network capture and dependency review | Browser extensions and device compromise |

## Security Requirements

1. Imported bytes and values remain untrusted until validation completes.
2. Validation precedes canonical allocation and persistence.
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

## Open Findings

- `THREAT-OPEN-001`: exact parser dependency and configuration require
  implementation-time review.
- `THREAT-OPEN-002`: current Cloudflare token scope and recoverable placeholder
  version are external-state unknowns.
- `THREAT-OPEN-003`: public preview access control is not approved; previews
  remain disabled.
- `THREAT-OPEN-004`: browser persistent-storage grants cannot be guaranteed and
  manual backup is outside scope.

## Verification Checklist

- [ ] Every TM control has executable or inspectable evidence.
- [ ] Limits match the Technical Design and tests.
- [ ] No unexpected network request occurs during import, render, toggle, or
      reload.
- [ ] Dependency and action inventories are reviewed.
- [ ] CI permission and secret boundaries are tested.
- [ ] Rollback rehearsal restores the prior Cloudflare version.
- [ ] AU-AGENT-003 records findings and a Quality Gate Decision.

## References

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Threat Model Index](README.md)
- [Project Risks](../../RISKS.md)

