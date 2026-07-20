# Technical Risk Register

## RISK-001 — Work Starts in the Wrong Repository

- **Status:** `[OPEN]`
- **Probability:** Medium
- **Impact:** High
- **Trigger:** Product code is requested before OQ-001 is resolved.
- **Affected areas:** All implementation, Git history, CI/CD, and documentation.
- **Prevention:** Confirm whether to initialize this directory or import an
  existing repository before coding.
- **Mitigation:** Keep current changes documentation-only and portable.
- **Fallback:** Move the reviewed baseline into the confirmed repository without
  deleting or overwriting existing assets.
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
