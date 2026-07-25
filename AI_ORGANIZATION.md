# Abris Universe AI Organization

| Field | Value |
| --- | --- |
| Document ID | AU-ORG-AI-001 |
| Title | Abris Universe AI Organization |
| Status | `[IMPLEMENTED]` |
| Owner | Project Owner |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.3.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `product/agents/README.md`, `.codex/AGENT_REGISTRY.md`, `collaboration/README.md` |
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
meaning; AU-AGENT-003 independently verifies engineering quality and evidence
without implementing features or approving product acceptance; AU-AGENT-004
owns Pattern Engine, import, rendering-core, and algorithm implementation inside
approved architecture and product requirements.

## Shared Boundary

The registries are intentionally separate. A role in one registry is not active
in the other. Product sources define outcomes and acceptance; engineering
sources define approved technical decisions and implementation evidence. The
Project Owner resolves authority conflicts through
`docs/SOURCE_OF_TRUTH.md`.

## Local Collaboration Interface

The controlled bridge in [`collaboration/`](collaboration/README.md) transports
versioned task packages and returned review artifacts when Claude cannot access
GitHub directly. It does not merge the organizations or transfer authority.
Claude reads its inbox and writes its outbox; AU-CODEX-PRIMARY validates,
integrates, and is the sole Git writer and GitHub operator. AU-AGENT-001 reviews
technical meaning and AU-AGENT-002 maintains documentation placement,
navigation, terminology, traceability, and lifecycle without changing meaning.
Before a completed engineering result is sent to Claude, AU-AGENT-003 performs
the independent engineering quality gate. Its unbracketed Engineering
Verification Status does not assign project `[VERIFIED]`.

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
- `collaboration/README.md`
