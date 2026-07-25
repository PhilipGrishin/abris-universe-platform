# Abris Universe Platform Manifest

## 1. Document Metadata

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-MANIFEST-001 |
| Title | Abris Universe Platform Manifest |
| Status | `[IMPLEMENTED]`, not `[VERIFIED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.9.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `product/README.md`, `AGENTS.md`, `collaboration/README.md` |
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
- Engineering quality: AU-AGENT-003 independently reviews implementation
  quality and evidence before product acceptance, but does not implement
  features, redesign architecture, or approve product acceptance.
- Pattern engineering: AU-AGENT-004 owns Pattern Engine, import,
  rendering-core, algorithm, compatibility, and pattern-processing performance
  implementation inside AU-AGENT-001 architecture and approved product
  requirements.
- Backend engineering: AU-AGENT-005 owns backend services, persistence,
  database, APIs, storage, synchronization, migration, and data integrity inside
  AU-AGENT-001 architecture and approved product and security requirements.
- Client engineering: AU-AGENT-006 owns mobile and web client architecture,
  presentation, interaction, state, navigation, public API and rendering
  integration, local cache and storage, offline client behavior, accessibility,
  responsiveness, and client performance inside AU-AGENT-001 architecture and
  approved product and UX requirements.
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
- Codex: AU-CODEX-PRIMARY and AU-AGENT-001 through AU-AGENT-006.

## 12. Planned Agents

None. AU-AGENT-001 through AU-AGENT-006 are active from complete
owner-provided instructions. Any future role requires a separate owner
instruction and governed registration.

## 13. Source of Truth Hierarchy

Use `docs/SOURCE_OF_TRUTH.md`. Project-owner decisions and approved versioned
Task Packages are highest, followed by scoped instructions, executable evidence
when it exists, approved decisions, and maintained documentation. Navigation
documents never override their canonical sources.

## 14. Shared Product-to-Engineering Workflow

The lifecycle from discovery through project `[VERIFIED]` or a product rework
decision is defined in `docs/SHARED_WORKFLOW.md`. Product hands off a versioned
Task Package; Codex performs technical review, design, implementation, tests,
and reporting; AU-AGENT-003 performs independent engineering verification;
Claude Cowork independently reviews the result for product acceptance.

All substantive Claude–Codex communication and artifact transfer crosses the
organizational boundary exclusively through the controlled bridge in
`collaboration/`, regardless of direct repository availability. Chat history is
not evidence. Project Owner manual input is limited to the registered trigger
phrases `Codex finished` and `Claude finished` unless a later explicit owner
governance decision changes the route. GitHub remains canonical and
AU-CODEX-PRIMARY remains the sole Git writer and GitHub operator.

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
|-- apps/                     approved application package boundaries
|-- packages/                 approved portable package boundaries
|-- docs/                     engineering knowledge and evidence
|-- product/                  product knowledge, governance, and acceptance
|-- collaboration/           governed local Claude-Codex exchange contracts
`-- tests/                    project-original fixtures and test evidence
```

The package tree is an `[IMPLEMENTED]`, `[TESTED]` workspace from the
independently confirmed Technical Design. `packages/domain-core` now contains
the bounded canonical model and invariant validation; every sibling package
remains a non-behavioral scaffold.

## 17. Current Project State

- `[IMPLEMENTED]` Private shared repository and `main` branch foundation.
- `[IMPLEMENTED]` Engineering governance and documentation infrastructure.
- `[IMPLEMENTED]` Controlled import of the initial Claude product contour.
- `[IMPLEMENTED]` Separate Claude and Codex role registries and shared workflow.
- `[IMPLEMENTED]`, `[TESTED]` Controlled Option B local collaboration bridge.
- `[IMPLEMENTED]`, `[TESTED]` AU-AGENT-003 independent engineering
  quality-gate role and report infrastructure.
- `[IMPLEMENTED]`, `[TESTED]` AU-AGENT-004 pattern-processing domain role
  registration; no Pattern Engine implementation is claimed.
- `[IMPLEMENTED]`, `[TESTED]` AU-AGENT-005 backend/data/synchronization domain
  role registration; no backend implementation is claimed.
- `[IMPLEMENTED]`, `[TESTED]` AU-AGENT-006 mobile/web client domain role
  registration; no client application implementation is claimed.
- `[IMPLEMENTED]`, `[TESTED]` The pnpm workspace reserves the approved web,
  domain-core, OXS importer, renderer, and persistence package boundaries.
- `[IMPLEMENTED]`, `[TESTED]` `packages/domain-core` implements canonical
  records, version constants, cross-record invariants, immutable snapshot
  validation, Project lifecycle validation, and progress projection with strict
  typecheck and 9 focused tests.
- `[IMPLEMENTED]`, `[TESTED]` Ten project-original OXS route-1 fixtures,
  deterministic generation, checksums, expected results, provenance,
  compatibility evidence, and local verification exist.
- `[VERIFIED]` INIT-002 platform repository initialization, product and
  engineering contour integration, governance boundaries, Source of Truth
  organization, and the Collaboration Bridge operating model exercised by
  exchange `AU-EX-20260721-001`, subject to the report's limitations.
- `[OPEN]` User-facing product runtime, importer, renderer, persistence, client,
  CI/CD, and deployment implementation.
- The verified status does not cover application implementation, stack, runtime
  architecture, AU-CDX-TASK-001 implementation, AU-AGENT-003 through
  AU-AGENT-006 activation, Engineering Handbook content, or unreviewed bridge
  tooling changes.

## 18. Confirmed Capabilities

Confirmed product capability areas include pattern viewing and tracking,
pattern import and conversion, offline progress, synchronization, creator and
community capabilities, education, analytics, and future ecosystem services.
These are capability landscape statements, not proof of implementation or
release scope.

## 19. Not Yet Implemented

No executable application, database, API, CI/CD implementation, deployment,
migration, or user-facing product feature exists. The canonical domain library,
test-only fixture generation, and workspace checks are executable engineering
components and must not be misrepresented as a completed product capability.

## 20. Open Product Questions

The canonical product open-question register is inside
`product/decisions/05_Decision_Log.md`. Draft Vision/Roadmap approval, first
import-format criteria, scope conflicts, and source versioning require their
declared owners. Engineering must not resolve product meaning silently.

## 21. Open Architecture Questions

Repository topology and initial package boundaries are resolved. The
task-scoped canonical model, importer, rendering, persistence, security, and
delivery contracts remain `[PROPOSED]`; their implementation and evidence
remain open as registered in the Technical Design and ADRs.

## 22. Verification and Approval Model

`[IMPLEMENTED]`, `[TESTED]`, and `[VERIFIED]` are distinct. Codex supplies
technical evidence. Independent Claude Cowork reviewers evaluate product,
domain, architecture, quality, security, and acceptance criteria. No agent
independently accepts its own work.

The bounded INIT-002 decision is recorded in
`product/reviews/INIT-002_Independent_Acceptance_Report.md` and must not be
generalized beyond its commit, scope, evidence, or limitations.

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
- `collaboration/README.md`
- `docs/ARCHITECTURE.md`
- `docs/DECISIONS.md`
- `docs/CURRENT_STATUS.md`
- `product/reviews/INIT-002_Independent_Acceptance_Report.md`

## 25. Manifest Maintenance Rules

AU-CODEX-PRIMARY owns this manifest; AU-AGENT-002 maintains structure, links,
terminology, traceability, and lifecycle. Update it when repository identity,
authority, organization, canonical navigation, or current platform state
changes. Link to canonical facts instead of duplicating them. Meaning changes
require the authorized product or technical owner; this manifest cannot approve
them.
