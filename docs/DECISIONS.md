# Technical Decisions

## DEC-001 — Do Not Infer Product Architecture During Initialization

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Context:** The initial workspace contained no repository, code, or versioned
  product sources.
- **Decision:** Create only a governance and persistent-context baseline. Do not
  select a stack or create architecture, data model, API, internal pattern
  format, deployment, or feature implementation artifacts until their inputs are
  confirmed.
- **Reason:** This avoids converting assumptions into apparent product or
  technical commitments.
- **Consequence:** Product implementation is blocked until repository and source
  questions are resolved. The decision is reversible after evidence arrives.

## DEC-002 — Use Explicit Evidence Statuses

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Decision:** All project records distinguish confirmed, derived, assumed,
  open, conflicting, proposed, approved, implemented, tested, independently
  verified, deferred, rejected, and technical-debt states.
- **Consequence:** `[IMPLEMENTED]` and `[TESTED]` never imply `[VERIFIED]`.

## DEC-003 — Register Specialist Agents Only From Owner Instructions

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Decision:** Register no detailed specialist role until its instruction is
  provided by the project owner and overlap is reviewed.
- **Consequence:** The current registry contains only the primary technical
  governance contour and explicitly supplied specialist roles.

## DEC-004 — Separate the Governance Contour From the Lead Specialist

- **Status:** `[DERIVED]`
- **Date:** 2026-07-20
- **Related task:** AGENT-001
- **Context:** Both the original primary Codex instruction and the supplied Lead
  Architect instruction include technical review, coordination, documentation,
  and handoff responsibilities. The new instruction explicitly defines the Lead
  as the chief specialized agent.
- **Decision:** Treat AU-CODEX-PRIMARY as the project-wide governance envelope
  that owns rules, source priority, role registration, persistent state, and
  escalation ownership. Treat AU-AGENT-001 as the operational owner of product
  software architecture, decomposition, cross-module contracts, specialist
  coordination, integration, and consolidated Completion Reports.
- **Alternatives:** Collapse both records into one role; or leave duplicate
  ownership unresolved.
- **Reason:** The selected boundary preserves both owner instructions, gives the
  specialist a clear operational mandate, and avoids duplicate contract and
  architecture ownership.
- **Consequence:** AU-AGENT-001 authors technical delivery artifacts while the
  primary contour enforces and records the process. Neither can independently
  accept AU-AGENT-001 work.
- **Reversibility:** The owner can refine the boundary without changing product
  architecture or code.
- **Review status:** Owner correction is welcome if a different delegation model
  was intended.

## DEC-005 — Establish Documentation Stewardship as a Separate Engineering Role

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Related task:** AGENT-002
- **Context:** Engineering documentation responsibilities existed across the
  primary governance contour and Lead Architect, but no permanent role owned
  structure, navigation, terminology records, traceability, indexes, and
  lifecycle.
- **Decision:** Register AU-AGENT-002, Engineering Documentation Manager, as an
  integrated cross-cutting specialist. AU-CODEX-PRIMARY retains governance,
  source hierarchy, and organizational rules. AU-AGENT-001 and assigned domain
  agents retain technical meaning, architecture correctness, and engineering
  decisions. AU-AGENT-002 owns documentation structure, navigation,
  consistency, approved terminology records, traceability, and lifecycle.
- **Alternatives:** Leave documentation fragmented; make the role a standalone
  project; or transfer technical decision ownership to the documentation role.
- **Reason:** Separate stewardship improves maintainability and auditability
  without creating a parallel authority or changing engineering meaning.
- **Consequence:** Documentation Impact becomes a required delivery field.
  Non-`None` impact requires a documentation result or approved registered
  exception. The Handbook remains an explanatory reference layer, not a source
  that duplicates ADRs, RFCs, specifications, architecture, or product
  decisions.
- **Risks:** Authority confusion, duplicate sources, review bottlenecks, and dead
  documentation are tracked by RISK-006 and RISK-007.
- **Migration:** Existing documents remain in place. New indexes reference them;
  no content is moved or rewritten in this phase.
- **Rollback:** Remove the new documentation infrastructure and role references
  only through a project-owner decision; preserve any later canonical knowledge
  before removal.
- **Affected modules:** Engineering organization and documentation governance
  only. No product or runtime module is affected.
- **Review date:** Event-driven by source hierarchy, ownership, or repository
  integration changes; no calendar date is justified.

## DEC-006 — Use One Shared Repository With Separate Authority Contours

- **Status:** `[APPROVED]`
- **Date:** 2026-07-20
- **Related task:** INIT-002
- **Context:** Product governance existed in a non-version-controlled Claude
  Cowork workspace while engineering governance existed in a separate non-Git
  Codex workspace. The Project Owner selected one private platform repository.
- **Decision:** Use `PhilipGrishin/abris-universe-platform` as the private shared
  repository for product sources, engineering governance, future
  implementation, evidence, and acceptance. Keep `product/` and the Codex
  engineering contour in separate source classes, registries, and authority
  paths.
- **Alternatives:** Separate product and engineering repositories; import the
  Claude workspace without classification; or merge both organizations into
  one authority model.
- **Reason:** One versioned platform improves traceability and handoff while
  explicit contour boundaries prevent product and technical authority drift.
- **Consequence:** Product decisions and Task Packages remain owned by the
  Project Owner and Claude Cowork. Technical decisions and implementation
  remain owned by Codex. AU-AGENT-002 integrates documentation without owning
  meaning. The external source workspace is provenance, not a competing live
  repository. Imported approved product sources retain their original language
  for fidelity; this does not change the English policy for new artifacts.
- **Reversibility:** Repository topology can change through a new owner decision
  and a non-destructive migration with preserved history and source mapping.
- **Owner:** Project Owner
- **Review status:** `[VERIFIED]` by the INIT-002 Independent Acceptance Report
  for the exact repository and authority-contour scope at source commit
  `1ccaace`; later implementation changes remain outside that decision.

## DEC-007 — Use a Synchronized External Claude-Codex Bridge

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`, `[TESTED]`; exercised operating
  model `[VERIFIED]`
- **Date:** 2026-07-21
- **Related task:** BRIDGE-001
- **Context:** GitHub is canonical and Codex has repository access, but reliable
  direct Claude access to the repository is unconfirmed. Claude has an
  established external local workspace that must remain unchanged outside a new
  controlled exchange boundary.
- **Decision:** Use Option B: committed portable contracts, manifests, and
  tooling under `collaboration/`, with generated payloads in Git-ignored local
  runtime and a synchronized external `Collaboration-Bridge`. Store its absolute
  path only in Git-ignored local configuration. AU-CODEX-PRIMARY is the sole Git
  writer and GitHub operator.
- **Alternatives:** Option A inside the repository if reliable Claude access is
  later confirmed; direct ungoverned file copying; direct Claude Git access; or
  no local exchange.
- **Reason:** Option B uses Claude's established workspace while preserving one
  canonical repository, explicit authority, exact-source provenance, safety
  validation, and a reversible transport boundary.
- **Consequence:** Exchange payloads are non-canonical until validation,
  authorized meaning review, and Codex integration. All write-capable bridge
  commands default to dry-run. No bridge script commits, pushes, merges, or
  grants Claude repository write authority.
- **Reversibility:** A later approved decision may adopt Option A or another
  transport. Existing manifests and archives remain traceable; no source
  history needs destructive migration.
- **Owner:** Project Owner / AU-CODEX-PRIMARY
- **Review status:** Exchange `AU-EX-20260721-001` completed a validated full
  round-trip. The exercised operating model is independently accepted; this does
  not verify every tooling implementation change or future exchange.

## OWNER-DEC-F1-001 — Activate Specialized Codex Agents

- **Status:** `[APPROVED]`; AU-AGENT-003 through AU-AGENT-005 activation
  `[IMPLEMENTED]`; AU-AGENT-006 activation `[OPEN]`
- **Date:** 2026-07-21
- **Related records:** INIT-002-F1, INIT-002-F3, AU-CDX-TASK-001
- **Context:** Independent Acceptance Finding F1 confirmed that the Task Package
  names specialist Codex roles that were planned but inactive. Assigning the
  entire implementation to AU-AGENT-001 would collapse orchestration and
  specialist execution responsibilities.
- **Decision:** Activate specialized Codex agents in this order: AU-AGENT-003 —
  Engineering Quality, DevSecOps & Security Lead; AU-AGENT-004 — Pattern Engine,
  Import, Rendering & Algorithms Lead; AU-AGENT-005 — Backend, Data &
  Synchronization Lead; AU-AGENT-006 — Mobile/Web Client Lead. AU-AGENT-001
  retains intake, Technical Review, architecture, decomposition, assignment,
  contracts, integration, and the final engineering Completion Report.
- **Alternatives:** Assign all AU-CDX-TASK-001 work to AU-AGENT-001; retain the
  roles as inactive plans; or activate them without full operating instructions.
- **Reason:** Specialized execution preserves separation between architecture,
  implementation, independent engineering quality, and product acceptance.
- **Consequence:** Product implementation remains blocked until the required
  roles are individually instructed and registered in the approved order.
- **Reversibility:** A later owner decision may change role scope or assignment,
  but existing registration and task provenance must remain preserved.
- **Activation gate:** Names and order do not activate roles. Each role requires
  its full owner-provided operating instruction, overlap analysis, registration,
  and the approved activation workflow. AU-AGENT-003–006 remain inactive in
  this acceptance-integration task.
- **Prohibited interpretation:** The decision does not approve product
  implementation, stack, runtime architecture, or AU-CDX-TASK-001 execution.
- **Owner:** Project Owner
- **Review status:** AU-AGENT-003 through AU-AGENT-005 were registered from
  their full owner instructions on 2026-07-25. AU-AGENT-006 remains deferred to
  a separate owner input.

## OWNER-DEC-AGENT-MERGE-001 — Automatically Review and Merge Agent Registrations

- **Status:** `[APPROVED]`, `[IMPLEMENTED]`
- **Date:** 2026-07-25
- **Related records:** AGENT-003, AGENT-004, RISK-011
- **Context:** The Project Owner directed Codex to check and merge branches
  automatically when new engineering agents are created.
- **Decision:** For owner-supplied agent-registration tasks, Codex creates a
  scoped branch from current `main`, validates the exact organizational and
  documentation change, publishes a pull request, checks mergeability and
  configured required checks, and merges automatically when all gates pass.
- **Scope:** Agent registration and its necessary governance, documentation,
  workflow, traceability, status, and navigation changes only.
- **Guardrails:** Do not merge with conflicts, failed or pending required
  checks, unmet branch protection or review requirements, unrelated work,
  unresolved mandatory findings, secret or path-safety defects, or an unclear
  target branch. No auto-merge rule authorizes product implementation or
  destructive history changes.
- **Alternatives:** Require a separate owner approval before every
  agent-registration merge; commit directly to `main`; or leave registration
  branches open.
- **Reason:** Checked automatic merging keeps the canonical organization current
  between sequential agent instructions while retaining review history and
  avoiding direct-to-main changes.
- **Consequence:** Codex records PR and validation evidence for each agent
  registration and stops for owner input only when a guardrail blocks safe
  merge.
- **Reversibility:** The Project Owner may revoke or narrow the workflow.
  Existing merge commits and PR provenance remain preserved.
- **Owner:** Project Owner / AU-CODEX-PRIMARY
- **Review status:** Exercised successfully by PR #1 for the prior linear
  Collaboration Bridge, acceptance, and AU-AGENT-003 branch chain and by PR #2
  for AU-AGENT-004.

## Decision Process

Future entries should include Decision ID, status, date, context, decision,
alternatives, rationale, consequences, reversibility, owner, and related Task
IDs. Product decisions are referenced here only as constraints; they remain in
the authoritative product source registered through
`docs/SOURCE_OF_TRUTH.md`.
