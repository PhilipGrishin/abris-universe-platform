# Abris Universe Platform Manifest

## 1. Document Metadata

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-MANIFEST-001 |
| Title | Abris Universe Platform Manifest |
| Status | `[IMPLEMENTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `product/README.md`, `AGENTS.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Repository topology; authority hierarchy; organization; canonical source; platform scope; implementation-state change |

This manifest is the repository entry point and navigation layer. It does not
create product or technical meaning. A conflict is resolved through
`docs/SOURCE_OF_TRUTH.md` and the applicable canonical source.

## 2. Project Identity

Abris Universe is a planned digital ecosystem for cross-stitch, beadwork, and
related crafts. The shared private repository is
`PhilipGrishin/abris-universe-platform`, with default branch `main`.

## 3. Confirmed Product Vision

The confirmed vision is an integrated journey from obtaining or importing a
pattern, through materials, stitching progress, statistics and planning, to
sharing, community, and future commercial ecosystem capabilities. The product
aims to reduce cognitive load, errors, and effort rather than act only as a
viewer. See the approved Master Product Specification and product sources
registered in `product/README.md`.

This long-term vision is not an implementation commitment for every capability.
Release scope is defined only by approved versioned Task Packages and owner
decisions.

## 4. Platform Scope

The repository is the version-controlled platform for product governance,
engineering governance, approved product sources, architecture decisions,
future implementation, tests, migrations, evidence, and independent acceptance
records.

## 5. Repository Purpose

Provide a technology-neutral and tool-neutral shared record that supports both
the Claude Cowork product organization and the Codex engineering organization
without merging their authority.

## 6. Product Contour

`product/` contains product specifications, decisions, Task Packages, research,
product-side architecture inputs, reviews, Claude role definitions, and product
navigation. Product meaning belongs to the Project Owner and Claude Cowork.

## 7. Engineering Contour

`AGENTS.md`, `.codex/`, and `docs/` contain engineering governance,
architecture and decision processes, engineering documentation, traceability,
standards, and future implementation evidence. Technical meaning belongs to
AU-AGENT-001 and assigned technical owners within AU-CODEX-PRIMARY governance.

## 8. Product and Engineering Authority Boundaries

- Product: vision, requirements, domain and UX requirements, priorities,
  acceptance criteria, Task Packages, owner decisions, independent acceptance.
- Engineering: technical analysis, architecture proposals, implementation
  design, code, tests, migrations, technical documentation, Completion Reports,
  and engineering evidence.
- Documentation: AU-AGENT-002 owns structure, navigation, terminology
  consistency, traceability, and lifecycle, but not product or technical
  meaning.
- Final authority: Project Owner decisions and approved versioned Task Packages
  retain the highest applicable authority.

## 9. Claude Cowork Organization

The product organization is registered in `product/agents/README.md`. It
contains the global Chief Project Orchestrator function and seven specialized
product roles sourced from the audited Claude workspace.

## 10. Codex Engineering Organization

The engineering organization is registered in `.codex/AGENT_REGISTRY.md` and
explained in `docs/CODEX_AGENTS.md`. The two registries remain separate; use
`AI_ORGANIZATION.md` for shared navigation.

## 11. Registered Active Agents

- Claude Cowork: Chief Project Orchestrator plus the seven specialized roles in
  `product/agents/README.md`.
- Codex: AU-CODEX-PRIMARY, AU-AGENT-001, and AU-AGENT-002.

## 12. Planned Agents

The following Codex directions are `[PLANNED]`, not active: Pattern Engine and
Import; Mobile and Web; Backend, Data, and Synchronization; Engineering Quality,
DevOps, and Security. Activation requires owner-provided role instructions and
registration. Names in a Task Package do not activate a role.

## 13. Source of Truth Hierarchy

Use `docs/SOURCE_OF_TRUTH.md`. Project-owner decisions and approved versioned
Task Packages are highest, followed by scoped instructions, executable evidence
when it exists, approved decisions, and maintained documentation. Navigation
documents never override their canonical sources.

## 14. Shared Product-to-Engineering Workflow

The lifecycle from discovery through `VERIFIED` or `REWORK REQUIRED` is defined
in `docs/SHARED_WORKFLOW.md`. Product hands off a versioned Task Package; Codex
performs technical review, design, implementation, tests, and reporting; Claude
Cowork independently reviews the result.

## 15. Documentation System

Engineering documentation is indexed by `docs/README.md` and governed by
`docs/standards/DOCUMENTATION_STANDARD.md`. Product documentation is indexed by
`product/README.md`. AU-AGENT-002 maintains cross-contour navigation,
terminology consistency, traceability, and lifecycle.

## 16. Repository Map

```text
/
|-- PROJECT_MANIFEST.md       shared repository entry point
|-- AI_ORGANIZATION.md        shared organization index
|-- AGENTS.md                 engineering operating instructions
|-- .codex/                   Codex governance and agent registry
|-- docs/                     engineering knowledge and evidence
`-- product/                  product knowledge, governance, and acceptance
```

No application source tree exists yet. Its structure is `[TBD]` and requires an
approved Technical Design.

## 17. Current Project State

- `[IMPLEMENTED]` Private shared repository and `main` branch foundation.
- `[IMPLEMENTED]` Engineering governance and documentation infrastructure.
- `[IMPLEMENTED]` Controlled import of the initial Claude product contour.
- `[IMPLEMENTED]` Separate Claude and Codex role registries and shared workflow.
- `[OPEN]` Product implementation and executable architecture.
- Not `[VERIFIED]` pending independent review.

## 18. Confirmed Capabilities

Confirmed product capability areas include pattern viewing and tracking,
pattern import and conversion, offline progress, synchronization, creator and
community capabilities, education, analytics, and future ecosystem services.
These are capability landscape statements, not proof of implementation or
release scope.

## 19. Not Yet Implemented

No application code, runtime architecture, approved stack, database, cloud
provider, API implementation, CI/CD implementation, deployment, migration,
automated test suite, or product feature exists in this repository.

## 20. Open Product Questions

The canonical product open-question register is inside
`product/decisions/05_Decision_Log.md`. Draft Vision/Roadmap approval, first
import-format criteria, scope conflicts, and source versioning require their
declared owners. Engineering must not resolve product meaning silently.

## 21. Open Architecture Questions

Repository topology is resolved. Technology stack, platform implementation,
data model, internal format, API, offline/sync design, rendering architecture,
security boundaries, deployment, and CI/CD remain `[OPEN]` or `[PROPOSED]` as
registered in `docs/ARCHITECTURE.md` and product architecture inputs.

## 22. Verification and Approval Model

`[IMPLEMENTED]`, `[TESTED]`, and `[VERIFIED]` are distinct. Codex supplies
technical evidence. Independent Claude Cowork reviewers evaluate product,
domain, architecture, quality, security, and acceptance criteria. No agent
independently accepts its own work.

## 23. Security and Confidentiality Baseline

The repository is private. Secrets must never be committed; use environment
variables or approved secret stores. Do not send user pattern data to third
parties without an approved process. File ingestion, user data, progress,
payments, rights, sync, backup, restore, and migrations remain high-risk areas
requiring explicit controls and evidence.

## 24. Related Canonical Documents

- `docs/SOURCE_OF_TRUTH.md`
- `product/README.md`
- `AGENTS.md`
- `.codex/AGENT_REGISTRY.md`
- `product/agents/README.md`
- `AI_ORGANIZATION.md`
- `docs/SHARED_WORKFLOW.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/CURRENT_STATUS.md`

## 25. Manifest Maintenance Rules

AU-CODEX-PRIMARY owns this manifest; AU-AGENT-002 maintains structure, links,
terminology, traceability, and lifecycle. Update it when repository identity,
authority, organization, canonical navigation, or current platform state
changes. Link to canonical facts instead of duplicating them. Meaning changes
require the authorized product or technical owner; this manifest cannot approve
them.
