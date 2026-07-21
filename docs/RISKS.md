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
- **Owner:** To be assigned per Task Package

## RISK-005 — Independent Engineering Review Is Not Yet Available

- **Status:** `[OPEN]`
- **Probability:** Certain until the reviewer role is registered
- **Impact:** High for substantial implementation
- **Trigger:** AU-AGENT-001 designs, integrates, or reviews product code before a
  separate Engineering Quality reviewer is registered and assigned.
- **Affected areas:** Architecture review, security, performance, integration,
  release confidence, and acceptance evidence.
- **Prevention:** Register the owner-supplied Engineering Quality role before
  relying on independent engineering acceptance.
- **Mitigation:** Perform explicit self-review and automated checks, label them
  non-independent, preserve evidence, and avoid claiming Engineering Quality
  acceptance.
- **Fallback:** Request external or Claude Cowork-directed independent review for
  high-risk work before release.
- **Owner:** Project owner for role instruction; AU-AGENT-001 for disclosure

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
