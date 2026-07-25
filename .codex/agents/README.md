# Codex Agent Definition Index

| Field | Value |
| --- | --- |
| Document ID | AU-AGENT-INDEX-001 |
| Title | Codex Agent Definition Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | Project Owner |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `.codex/AGENT_REGISTRY.md`, `AGENTS.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Agent registration; role instruction change; authority conflict; agent retirement or supersession |

## Purpose

Index the complete operating definitions of registered Codex specialist agents
without replacing the authoritative identity and boundary registry.

## Scope

This index covers owner-supplied operating definitions for active Codex
specialists. `.codex/AGENT_REGISTRY.md` remains authoritative for active agent
identity, registration status, and cross-role boundaries.

## Registered Definitions

- [AU-AGENT-003 — Engineering Quality, DevSecOps & Security Lead](definitions/au-agent-003-engineering-quality-devsecops-security-lead.md)
- [AU-AGENT-004 — Pattern Engine, Import, Rendering & Algorithms Lead](definitions/au-agent-004-pattern-engine-import-rendering-algorithms-lead.md)

AU-AGENT-001 and AU-AGENT-002 were registered before this definition library
was established. Their complete active boundaries remain directly in
`.codex/AGENT_REGISTRY.md` and `docs/CODEX_AGENTS.md`; this index does not
duplicate or silently relocate them.

## Owner

AU-CODEX-PRIMARY registers identities and authority. AU-AGENT-002 maintains
navigation, metadata, references, terminology, traceability, and lifecycle
without changing role meaning. The Project Owner approves role instructions.

## Lifecycle

Add a definition only after the Project Owner supplies the role instruction and
AU-CODEX-PRIMARY completes overlap and authority review. Preserve superseded
definitions and record their replacement; never silently delete role history.

## Adding Agent Definitions

Each definition must preserve the owner-supplied mission and include
responsibilities, authority, prohibitions, inputs, outputs, interfaces,
reviewer, handoff target, status semantics, evidence requirements, and
Definition of Done. Register the role in `.codex/AGENT_REGISTRY.md`, update
`docs/CODEX_AGENTS.md`, workflows, Source of Truth, traceability, and persistent
state, and validate all local links.

## Related Sources

- `docs/SOURCE_OF_TRUTH.md`
- `.codex/AGENT_REGISTRY.md`
- `docs/CODEX_AGENTS.md`
- `docs/SHARED_WORKFLOW.md`
- `docs/standards/DOCUMENTATION_STANDARD.md`
