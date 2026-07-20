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
- **Review status:** Implemented and tested locally; independent verification
  remains outstanding.

## Decision Process

Future entries should include Decision ID, status, date, context, decision,
alternatives, rationale, consequences, reversibility, owner, and related Task
IDs. Product decisions are referenced here only as constraints; they remain in
the authoritative product source registered through
`docs/SOURCE_OF_TRUTH.md`.
