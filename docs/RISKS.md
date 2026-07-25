# Technical Risk Register

## RISK-001 — Work Starts in the Wrong Repository

- **Status:** `[IMPLEMENTED]` mitigation; residual monitoring
- **Probability:** Low
- **Impact:** High
- **Trigger:** Work targets a repository other than the registered canonical
  repository or an unreviewed external copy is treated as current.
- **Affected areas:** All implementation, Git history, CI/CD, and documentation.
- **Prevention:** Resolve repository identity through
  `docs/SOURCE_OF_TRUTH.md` during bootstrap and use the configured `origin`.
- **Mitigation:** Canonical repository, branch, remote, and source import are
  registered with provenance and checksums.
- **Fallback:** Stop work, compare histories and source maps, and perform only an
  owner-approved non-destructive migration.
- **Owner:** Project owner

## RISK-002 — Product Behavior Is Invented

- **Status:** `[OPEN]`
- **Probability:** High without controls
- **Impact:** High
- **Trigger:** Design or implementation begins without a versioned Task Package
  and authoritative product documents.
- **Affected areas:** UX, domain model, data, architecture, tests, schedule, and
  acceptance.
- **Prevention:** Enforce Task Package validation and Technical Review gates.
- **Mitigation:** Label assumptions and issue Clarification or Conflict Reports.
- **Fallback:** Stop conflicting work and return a decision package to Claude
  Cowork or the project owner.
- **Owner:** Primary Codex role

## RISK-003 — Documentation Diverges From Executable Reality

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** Medium to High
- **Trigger:** Code arrives or changes without updating current status and
  technical records.
- **Affected areas:** Session continuity, design decisions, tests, and handoff.
- **Prevention:** Run session bootstrap and update persistent state in the same
  task as behavior changes. Use AU-AGENT-002 review, the Source of Truth
  Registry, Documentation Impact, indexes, and traceability.
- **Mitigation:** Prefer source, tests, schemas, configuration, and history over
  stale prose; record conflicts immediately.
- **Fallback:** Perform a fresh repository audit and mark stale claims.
- **Owner:** Primary Codex role

## RISK-004 — High-Risk Domains Lack Evidence

- **Status:** `[OPEN]`
- **Probability:** Unknown
- **Impact:** Critical
- **Trigger:** Work begins on file import, closed formats, pattern recognition,
  progress, offline/sync, migrations, rights, payments, backup, or restore
  without specific design and verification evidence.
- **Affected areas:** Data integrity, security, privacy, legal exposure,
  performance, and roadmap.
- **Prevention:** Require stricter design review, threat analysis, recovery plan,
  representative fixtures, and proportionate automated tests.
- **Mitigation:** Limit scope, preserve originals, use versioned contracts, and
  make operations idempotent where required.
- **Fallback:** Disable or roll back the affected capability using the approved
  task-specific plan.
- **Owner:** AU-AGENT-004 for Pattern Engine/import/rendering evidence;
  AU-AGENT-005 for backend/data/sync/migration/backup/recovery evidence;
  AU-AGENT-006 for client integration/offline/accessibility/responsiveness/
  supported-platform/performance evidence;
  AU-AGENT-003 for independent engineering verification; task-specific owners
  for remaining areas

## RISK-005 — Independent Engineering Review Is Missing or Bypassed

- **Status:** `[IMPLEMENTED]` role-registration mitigation; residual assignment
  monitoring
- **Probability:** Low when the quality gate is enforced
- **Impact:** High for substantial implementation
- **Trigger:** A Codex engineering result reaches completion or Claude handoff
  without an independent AU-AGENT-003 review assignment and report.
- **Affected areas:** Architecture review, security, performance, integration,
  release confidence, and acceptance evidence.
- **Prevention:** AU-AGENT-003 is registered and the Development Workflow
  requires its engineering quality gate before Claude product acceptance.
- **Mitigation:** Assign AU-AGENT-003 independently for each engineering result,
  preserve exact evidence, findings, and dispositions, and keep self-review
  labeled non-independent.
- **Fallback:** Block the Completion Report and request an independent
  AU-AGENT-003 review; if independence cannot be established, escalate to
  AU-CODEX-PRIMARY and the Project Owner.
- **Owner:** AU-CODEX-PRIMARY for gate enforcement; AU-AGENT-003 for review

## RISK-006 — Documentation Authority Is Confused With Meaning Authority

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** AU-AGENT-002 changes technical/product meaning or a Handbook,
  index, glossary, or traceability record becomes a parallel source of truth.
- **Affected areas:** Architecture, product behavior, specifications,
  terminology, task acceptance, and long-term maintainability.
- **Prevention:** Enforce the three-way ownership boundary and
  `docs/SOURCE_OF_TRUTH.md`; require content-owner approval for meaning changes;
  use references instead of duplicate definitions.
- **Mitigation:** Issue a Documentation Review Report, mark the conflict, stop
  relying on the lower-authority source, and route correction to the proper
  owner.
- **Fallback:** Restore the last approved canonical source and explicitly
  supersede or withdraw the conflicting document without deleting history.
- **Owner:** AU-AGENT-002 for detection; AU-CODEX-PRIMARY or relevant content
  owner for resolution

## RISK-007 — Documentation Governance Becomes a Bottleneck or Dead Structure

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** Medium
- **Trigger:** Every trivial task requires heavy review, indexes are created
  without content or ownership, or documentation is not maintained after
  creation.
- **Affected areas:** Delivery speed, maintenance cost, discoverability, and
  engineering trust.
- **Prevention:** Use the four-level Documentation Impact classification; allow
  concise `None` rationale and lightweight `Minor` review; create documents only
  for a defined purpose with owner, lifecycle, addition rules, and source links.
- **Mitigation:** Consolidate navigation by reference, report orphan/dead
  documents, and remove unnecessary process through an approved governance
  change without silently deleting knowledge.
- **Fallback:** Register a time-bounded Documentation Exception or simplify the
  process with AU-CODEX-PRIMARY approval while preserving required traceability.
- **Owner:** AU-AGENT-002 and AU-CODEX-PRIMARY

## RISK-008 — Shared Repository Blurs Product and Engineering Authority

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A product draft is treated as an approved engineering decision,
  a Codex proposal changes product meaning, or one agent registry is used to
  infer activation in the other organization.
- **Affected areas:** Requirements, architecture, role assignments, acceptance,
  traceability, and implementation scope.
- **Prevention:** Maintain separate `product/` and Codex registries, route all
  conflicts through `docs/SOURCE_OF_TRUTH.md`, and use
  `AI_ORGANIZATION.md` only as a navigation layer.
- **Mitigation:** Mark drafts and planned roles explicitly; require content-owner
  review and task-version traceability at every handoff.
- **Fallback:** Stop affected work, issue a Conflict Report, restore reliance on
  the higher-authority source, and record the owner decision.
- **Owner:** Project Owner, AU-CODEX-PRIMARY, and product coordination owner

## RISK-009 — Local Exchange Introduces Unsafe or Stale Artifacts

- **Status:** `[OPEN]`, controlled
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A package uses a stale commit, a return contains an unsafe or
  unregistered file, a checksum differs, a local path leaks into a committed
  artifact, or transport is mistaken for acceptance.
- **Affected areas:** Repository integrity, confidentiality, provenance,
  independent acceptance, product meaning, and documentation lifecycle.
- **Prevention:** Use exact source commits, unique Exchange IDs, schema and
  status validation, path confinement, symlink/binary/secret/size checks,
  registered extensions, SHA-256 checksums, Git-ignored runtime state, and
  dry-run-by-default write commands. Keep AU-CODEX-PRIMARY as sole Git writer.
- **Mitigation:** Reject invalid returns before staging, preserve evidence,
  regenerate stale packages, require authorized meaning review, and keep every
  state below `[VERIFIED]` until independent acceptance.
- **Archive-status control:** `[IMPLEMENTED]`, `[TESTED]` The status reporter
  distinguishes registered, prepared, exported, returned, integrated, and
  archived states. It revalidates archived task/return manifests, the archive
  record, canonical outcome, canonical report checksum, and archived
  return-manifest checksum. An advanced source branch is reported as
  `HISTORICAL_ARCHIVED`, not as an active-exchange failure.
- **Residual limitation:** Archive-aware reporting detects missing or
  inconsistent registered evidence but cannot recover deleted external archive
  data or independently verify the storage device. OVR-004 tooling is not
  project `[VERIFIED]`.
- **Fallback:** Stop the exchange, quarantine the affected local package, issue
  a security or conflict report, rotate any exposed credential through its
  owner, and resume only from a new Exchange ID and clean source commit.
- **Owner:** AU-CODEX-PRIMARY; AU-AGENT-002 for documentation lifecycle;
  applicable product or technical owner for meaning

## RISK-010 — Canonical Repository and Claude Workspace Copies Diverge

- **Status:** `[OPEN]`, controlled by exchange policy
- **Probability:** Medium
- **Impact:** High
- **Trigger:** A maintained product artifact is edited independently in the
  external Claude workspace after its repository copy became canonical.
- **Affected areas:** Product meaning, provenance, requirements, decisions,
  Task Packages, acceptance, and source hierarchy.
- **Prevention:** Treat repository artifacts as canonical; treat external copies
  as drafting or bridge state; route changes through unique exchanges with exact
  source identity, checksums, and explicit integration mapping.
- **Mitigation:** Detect checksum or content divergence before import, stop
  integration, identify the authorized source owner, and produce a controlled
  source-difference review.
- **Fallback:** Preserve both versions without overwrite, issue a Conflict
  Report, and require the Project Owner or Claude product authority to select
  the canonical meaning before Codex integration.
- **Owner:** Claude Cowork product coordination owner for local workflow;
  AU-CODEX-PRIMARY for repository exchange enforcement

## RISK-011 — Agent Registration Auto-Merge Bypasses Review

- **Status:** `[IMPLEMENTED]` controls; residual monitoring
- **Probability:** Low when guardrails are enforced
- **Impact:** High
- **Trigger:** An agent-registration branch merges with conflicts, unrelated
  changes, failed or pending required checks, unmet repository protection,
  unresolved mandatory findings, unsafe content, or incomplete role coverage.
- **Affected areas:** Engineering authority, source hierarchy, agent
  independence, workflow gates, traceability, and repository history.
- **Prevention:** Limit auto-merge to owner-supplied agent registration; branch
  from current `main`; inspect the exact diff; validate role coverage, links,
  metadata, terminology, traceability, inactive-role boundaries, safety, and
  applicable regression tests; create a PR; confirm mergeability and configured
  checks.
- **Mitigation:** Stop automatic merge on any failed guardrail, preserve the
  branch and PR evidence, remediate in the same scoped branch, and rerun all
  affected checks.
- **Fallback:** Leave the PR open and request Project Owner direction when a
  conflict, required review, protection rule, unclear target, or mandatory
  finding cannot be resolved safely.
- **Owner:** AU-CODEX-PRIMARY

## RISK-012 — Import Format or Fixtures Create Lock-In, Security, or Rights Exposure

- **Status:** `[OPEN]`, format and rights rule resolved; design `[PROPOSED]`;
  coordinate/symbol evidence and fixtures pending
- **Probability:** High without the OQ-005 and fixture gates
- **Impact:** High
- **Trigger:** Importer development starts from an undocumented/proprietary
  format, untrusted XML lacks resource limits, a source format dictates the
  canonical model, or third-party samples are committed without redistribution
  and derivative authority.
- **Affected areas:** Pattern correctness, data loss, security, compatibility,
  legal exposure, tests, repository distribution, and roadmap.
- **Prevention:** Use the confirmed OXS 1.0 selection; preserve original
  files; define a mapping contract; keep Symbol separate from PaletteItem and
  Pattern separate from Progress; disable unsafe XML features; impose resource
  limits; require fixture provenance and permission.
- **Mitigation:** PROD-DEC-009 resolves the format, terminology, and rights-safe
  acquisition rule. The Technical Design and ADR-TS001-001 define the bounded
  mapping and prohibit heuristic coordinate/symbol interpretation. Keep
  importer development blocked until route-1 coordinate and symbol fixtures
  exist, and require golden, malformed, size-limit, coordinate,
  palette-reference, and unsupported-content tests.
- **Fallback:** Reject the affected format or fixture, preserve evidence,
  disable the importer, restore the last known-good static deployment, and
  return the choice through a Technical Alternative or Conflict Report.
- **Owner:** AU-AGENT-004 for importer evidence; AU-AGENT-001 for architecture
  disposition; AU-AGENT-003 for independent security/quality verification;
  Project Owner or rights holder for fixture permission

## RISK-013 — Browser-Local Progress Is Lost or Misreported as Saved

- **Status:** `[OPEN]`; design controls `[PROPOSED]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** IndexedDB is unavailable, quota is exhausted, storage is evicted,
  an upgrade fails, or optimistic UI state is presented as durably saved.
- **Affected areas:** Progress integrity, user trust, reload recovery, rollback,
  and Phase 1 compatibility.
- **Prevention:** Keep Pattern and Progress separate; use short atomic
  transactions, append-only idempotent events with `deviceId`, in-transaction
  sequence allocation and payload hashes, a Web Locks single-writer policy
  across tabs, a rebuildable projection, strict IndexedDB durability when
  supported, commit-driven save status, persistent-storage requests, explicit
  quota errors, and one-release schema rollback compatibility.
- **Mitigation:** Revert failed optimistic state to the last committed
  projection, retain the live session, expose `not saved`, and stop release on
  failed two-context, idempotency, reload, or recovery evidence. Record the
  relaxed-durability residual on browsers that do not support strict mode.
- **Fallback:** Roll back the client without deleting IndexedDB and recover the
  projection from retained events. Manual backup remains out of approved Phase
  0 scope.
- **Owner:** AU-AGENT-005 for persistence design; AU-AGENT-006 for client
  surfacing; AU-AGENT-003 for independent verification

## RISK-014 — First Cloudflare Deployment Has No Recoverable Rollback Anchor

- **Status:** `[OPEN]`; blocks production deployment
- **Probability:** Unknown
- **Impact:** High
- **Trigger:** The current `abris-universe` placeholder is replaced before its
  immutable version ID or recoverable artifact is recorded.
- **Affected areas:** `abris.653915.com`, production availability, auditability,
  and deployment rollback.
- **Prevention:** Complete TD-GATE-003 before first production deployment:
  record the current Worker/version, route, smoke baseline, and restorable
  artifact; keep DNS unchanged; deploy immutable versions through protected
  CI; serve and assert CSP, `X-Content-Type-Options`, `frame-ancestors`, and
  `Referrer-Policy` controls.
- **Mitigation:** Smoke the uploaded version before promotion, record prior and
  new version IDs, serialize production deployments, and automatically roll
  back on failed production smoke.
- **Fallback:** If no prior version is recoverable, do not deploy until the
  Project Owner approves a specific replacement rollback artifact.
- **Owner:** AU-AGENT-001; AU-AGENT-003 reviews CI/CD and release evidence

## RISK-015 — Same-Origin Requests Expose Pattern-Derived Data

- **Status:** `[OPEN]`; design control `[PROPOSED]`; blocks deployment evidence,
  not the current design gate
- **Probability:** Low with the reviewed controls; unknown until implementation
- **Impact:** High
- **Trigger:** Production code makes an unregistered same-origin connection,
  keeps `connect-src 'self'` without a justified runtime need, or places
  pattern-derived content in a URL, request body, header, log, analytics event,
  or telemetry.
- **Affected areas:** Pattern confidentiality, local-only privacy boundary,
  CSP effectiveness, Cloudflare delivery, security evidence, and user trust.
- **Prevention:** Maintain a reviewed minimum runtime request inventory; use
  `connect-src 'none'` when no script-initiated connection is required; permit
  only reviewed non-pattern static metadata otherwise; prohibit analytics and
  telemetry for pattern data.
- **Mitigation:** Compare a full browser network capture against the inventory
  across import, render, toggle, reload, and representative error paths; block
  deployment on an unexpected request or pattern-derived payload.
- **Fallback:** Disable the offending connection or feature, tighten CSP,
  rebuild the immutable artifact, repeat security review and smoke evidence,
  and deploy only after the finding is cleared.
- **Owner:** AU-AGENT-001 for the contract; AU-AGENT-006 for client evidence;
  AU-AGENT-003 for independent reverification
