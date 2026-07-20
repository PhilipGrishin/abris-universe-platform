# Abris Universe AI Organization

| Field | Value |
| --- | --- |
| Document ID | AU-ORG-AI-001 |
| Title | Abris Universe AI Organization |
| Status | `[IMPLEMENTED]` |
| Owner | Project Owner |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `product/agents/README.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Organization change; role registration; authority conflict; review-route change |

## Purpose

Provide one shared navigation layer for the product and engineering AI
organizations while preserving their separate registries and decision rights.

## Product Organization

The [Claude Cowork Agent Registry](product/agents/README.md) contains the active
product organization and source definitions. Claude Cowork and the Project Owner
own product vision, requirements, domain and UX requirements, priorities, Task
Packages, acceptance criteria, and independent product acceptance.

## Engineering Organization

The [Codex Agent Registry](.codex/AGENT_REGISTRY.md) contains the active
engineering organization. AU-CODEX-PRIMARY governs source hierarchy and
workflow; AU-AGENT-001 owns technical meaning and engineering decisions;
AU-AGENT-002 owns documentation integration without owning product or technical
meaning.

## Shared Boundary

The registries are intentionally separate. A role in one registry is not active
in the other. Product sources define outcomes and acceptance; engineering
sources define approved technical decisions and implementation evidence. The
Project Owner resolves authority conflicts through
`docs/SOURCE_OF_TRUTH.md`.

## Lifecycle and Adding Roles

Register roles only from owner-approved source instructions. Update the owning
registry first, then this index, workflow references, and traceability. Never
infer activation from a roadmap, Task Package, or planning document.

## Related Sources

- `PROJECT_MANIFEST.md`
- `product/agents/README.md`
- `.codex/AGENT_REGISTRY.md`
- `docs/CODEX_AGENTS.md`
- `docs/SHARED_WORKFLOW.md`
