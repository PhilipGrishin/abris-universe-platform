# Source of Truth Registry

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-SOT-001 |
| Title | Source of Truth Registry |
| Status | `[IMPLEMENTED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Source authority changes; new canonical document class; source conflict; repository integration |

## Purpose

Define where authoritative Abris Universe engineering knowledge lives, how
sources are prioritized, and how conflicts, supersession, and explanatory
documentation are handled.

## Scope

This registry governs project, product, architecture, implementation,
organizational, operational, and documentation sources used by the Codex
engineering organization. It does not create product requirements or technical
architecture.

## Authority Hierarchy

Use the existing project source priority without silent reinterpretation:

1. Explicit project-owner decisions and versioned Claude Cowork Task Packages.
2. Applicable scoped `AGENTS.md` and `AGENTS.override.md` instructions.
3. Executable source, tests, schemas, configuration, and repository history.
4. Approved technical decisions in `docs/DECISIONS.md` and approved ADRs.
5. Maintained current-state, specification, architecture, standards, and
   operational documentation registered below.
6. Official documentation and authoritative external evidence.
7. Explicitly labeled assumptions.

If higher-priority sources conflict, record a Conflict Report and stop the
conflicting work until the proper owner decides. AU-AGENT-002 maintains this
registry but cannot change the hierarchy without AU-CODEX-PRIMARY and
project-owner approval.

## Canonical Source Map

| Knowledge class | Canonical source | Authority owner | Notes |
| --- | --- | --- | --- |
| Project-wide engineering governance | `AGENTS.md` | AU-CODEX-PRIMARY | More specific scoped instructions may narrow it. |
| Operational project instructions | `.codex/PROJECT_INSTRUCTIONS.md` | AU-CODEX-PRIMARY | Must remain consistent with `AGENTS.md`. |
| Agent identities and boundaries | `.codex/AGENT_REGISTRY.md` | AU-CODEX-PRIMARY | `docs/CODEX_AGENTS.md` is the readable organizational view. |
| Product intent and acceptance criteria | Versioned Claude Cowork Task Package | Project Owner / Claude Cowork | Location and version protocol remain OQ-002. |
| Implemented behavior | Source, tests, schemas, configuration, and Git history | Assigned technical owner | No implementation repository exists yet. |
| Technical decisions | `docs/DECISIONS.md` and approved files under `docs/architecture/adr/` | AU-AGENT-001 | ADR indexes must not restate decision content. |
| Architecture overview | `docs/ARCHITECTURE.md` | AU-AGENT-001 | Detailed architecture documents may be indexed under `docs/architecture/`. |
| Proposed cross-cutting changes | Files under `docs/architecture/rfc/` | Proposal owner; AU-AGENT-001 approver | An RFC is not an approved decision unless its disposition says so and required ADRs exist. |
| Engineering specifications | `docs/specifications/` | Assigned technical owner | Each specification declares its own owner and approver. |
| Engineering standards | `docs/standards/` | AU-CODEX-PRIMARY or assigned technical owner | Documentation governance is defined by `docs/standards/DOCUMENTATION_STANDARD.md`. |
| Current technical state | `docs/CURRENT_STATUS.md` | AU-CODEX-PRIMARY | Must reflect executable evidence when code exists. |
| Current work | `.codex/CURRENT_FOCUS.md` and `docs/TASKS.md` | AU-CODEX-PRIMARY / assigned task owner | Neither replaces the Task Package. |
| Internal engineering change history | `docs/CHANGELOG_INTERNAL.md` | AU-AGENT-002 | Records significant project changes; does not replace Git history or decision records. |
| Approved terminology | `docs/GLOSSARY.md` | AU-AGENT-002; meaning approved by source owner | The glossary references, rather than redefines, domain sources. |
| Traceability | `docs/TRACEABILITY_MATRIX.md` | AU-AGENT-002 | A mapping layer, not an authority for requirement or decision meaning. |
| Engineering Handbook | `docs/handbook/` | AU-AGENT-002 | Explanatory navigation and synthesis; never a parallel source of technical truth. |
| Risks | `docs/RISKS.md` | AU-CODEX-PRIMARY / named risk owner | Risk status does not approve a technical change. |
| Documentation review evidence | `docs/reviews/documentation/` | AU-AGENT-002 | Review findings do not change source meaning by themselves. |

## Handbook Authority Rule

The Engineering Handbook explains the system and connects canonical sources. It
must not duplicate ADRs, RFCs, specifications, architecture documents, or
product decisions. Technical facts must be referenced. Handbook content may be
created only from approved engineering knowledge.

## Owner

AU-CODEX-PRIMARY owns source hierarchy and authority decisions. AU-AGENT-002
maintains registry structure, navigation, metadata, consistency, traceability,
and lifecycle. The project owner approves organizational authority changes.

## Registration Rules

Every new canonical document must:

1. Use the required metadata defined by the Documentation Standard.
2. Identify one owner and one technical approver.
3. Declare dependencies, supersession, and review triggers.
4. Be added to the appropriate index and this registry when it introduces a new
   canonical source.
5. Link to existing definitions instead of copying them.
6. Be included in the Traceability Matrix when it implements or explains a
   requirement, decision, contract, risk control, migration, or acceptance
   criterion.

## Supersession and Conflict Rules

- Never silently delete or overwrite an authoritative document.
- A replacement declares `Supersedes`; the prior document declares
  `Superseded By` and remains available unless an approved retention decision
  says otherwise.
- A documentation-only cleanup cannot alter engineering or product meaning.
- Conflicting definitions require a Documentation Review Report and escalation
  to the relevant content owner.
- AU-AGENT-002 may correct navigation, metadata, and broken references without
  changing meaning. Meaning changes require the technical or product owner.

## Lifecycle

AU-AGENT-002 reviews this registry whenever source authority, document classes,
repository topology, or agent ownership changes. AU-CODEX-PRIMARY approves
governance hierarchy changes. The project owner approves changes that alter
organizational authority.

## Adding New Sources

Submit the proposed source with its metadata, authority owner, technical
approver, relationship to existing sources, duplication analysis, traceability
impact, and intended lifecycle. Do not register a source while an unresolved
authority conflict exists.

## Related Sources

- `AGENTS.md`
- `.codex/PROJECT_INSTRUCTIONS.md`
- `.codex/AGENT_REGISTRY.md`
- `docs/DECISIONS.md`
- `docs/ARCHITECTURE.md`
- `docs/standards/DOCUMENTATION_STANDARD.md`
