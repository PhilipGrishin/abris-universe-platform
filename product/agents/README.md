# Claude Cowork Agent Registry

| Field | Value |
| --- | --- |
| Document ID | AU-PROD-AGENTS-001 |
| Title | Claude Cowork Agent Registry |
| Status | `[IMPLEMENTED]` |
| Owner | Project Owner / Claude Cowork |
| Technical Approver | Project Owner |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `product/governance/CLAUDE_COWORK_PROJECT_INSTRUCTIONS.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Claude role change; role source change; responsibility conflict; acceptance authority change |

## Purpose

Register the existing Claude Cowork product organization from its imported
source files without merging it with the Codex engineering registry.

## Scope and Authority

Claude Cowork owns product vision, requirements, domain and UX requirements,
priorities, Task Packages, acceptance criteria, and independent product
acceptance. These roles do not implement production code or independently
change Codex engineering decisions.

## Active Organization

| Role | Source | Primary authority |
| --- | --- | --- |
| Chief Project Orchestrator | [Claude Cowork Project Instructions](../governance/CLAUDE_COWORK_PROJECT_INSTRUCTIONS.md) | Global product orchestration and owner escalation; no separate role file exists. |
| Product Strategy & Requirements Lead | [Source definition](definitions/product-strategy-requirements-lead.md) | Product strategy, requirements, prioritization, roadmap, and Task Packages. |
| Embroidery Domain & UX Lead | [Source definition](definitions/embroidery-domain-ux-lead.md) | Embroidery domain meaning, user workflows, UX, terminology, and accessibility requirements. |
| System Architecture, Data & AI Governance Lead | [Source definition](definitions/system-architecture-data-ai-governance-lead.md) | Product-side architecture constraints, logical data requirements, and independent architecture review. |
| Quality, Security & Independent Acceptance Lead | [Source definition](definitions/quality-security-independent-acceptance-lead.md) | Independent quality, security, privacy, and product acceptance. |
| Ecosystem, Community & Commercial Product Lead | [Source definition](definitions/ecosystem-community-commercial-product-lead.md) | Ecosystem, community, creator, marketplace, brand, education, and commercial product scope. |
| Research & Product Analytics Lead | [Source definition](definitions/research-product-analytics-lead.md) | Research evidence, product analytics, experiments, and uncertainty reduction. |
| Delivery, Documentation & Codex Coordination Lead | [Source definition](definitions/delivery-documentation-codex-coordination-lead.md) | Product delivery coordination, product documentation, Task Package handoff, and acceptance routing. |

## Boundary With Codex

The Claude organization may define required outcomes and independently review
results. Codex owns technical analysis, engineering architecture proposals,
implementation, tests, migrations, and engineering evidence. The shared index
is `AI_ORGANIZATION.md`; the Codex registry remains
`.codex/AGENT_REGISTRY.md`.

## Lifecycle and Adding Roles

Change or add a Claude role only from an owner-approved source definition.
Record overlaps, reviewers, activation status, and source provenance. Never
infer a role from a Task Package name alone.

## Related Sources

- `AI_ORGANIZATION.md`
- `product/README.md`
- `docs/SOURCE_OF_TRUTH.md`
- `.codex/AGENT_REGISTRY.md`
