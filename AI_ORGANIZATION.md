# Abris Universe AI Organization

| Field | Value |
| --- | --- |
| Document ID | AU-ORG-AI-001 |
| Title | Abris Universe AI Organization |
| Status | `[IMPLEMENTED]` |
| Owner | Project Owner |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.6.0 |
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
approved architecture and product requirements; AU-AGENT-005 owns backend,
data, API, persistence, storage, synchronization, migration, and integrity
inside the same governance envelope; AU-AGENT-006 owns mobile and web client
architecture, presentation, user interaction, state, navigation, integration,
offline client behavior, accessibility, and client performance without owning
product or UX meaning.

## Shared Boundary

The registries are intentionally separate. A role in one registry is not active
in the other. Product sources define outcomes and acceptance; engineering
sources define approved technical decisions and implementation evidence. The
Project Owner resolves authority conflicts through
`docs/SOURCE_OF_TRUTH.md`.

## Local Collaboration Interface

The controlled bridge in [`collaboration/`](collaboration/README.md) is the
exclusive route for substantive Claude–Codex communication and artifact
transfer, regardless of direct repository availability. It does not merge the
organizations or transfer authority. Chat history is not evidence; Project
Owner manual input is limited to the registered trigger phrases `Codex
finished` and `Claude finished` unless a later explicit owner governance
decision changes the route.
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
