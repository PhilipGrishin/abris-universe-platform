# Engineering Traceability Matrix

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-TRACE-001 |
| Title | Engineering Traceability Matrix |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.3.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Requirement, decision, agent, canonical document, implementation evidence, or acceptance status change |

## Purpose

Map engineering requirements and decisions to their owners, implementation or
organizational artifacts, verification evidence, and documentation without
redefining source content.

## Scope

The matrix covers engineering organization, documentation governance, shared
repository initialization, product-source integration, and cross-contour
authority. Product implementation traceability begins only after engineering
intake of a versioned Task Package.

## Current Traceability

| Trace ID | Source requirement or decision | Authority | Implementation artifacts | Evidence status |
| --- | --- | --- | --- | --- |
| TRACE-ORG-001 | Register AU-AGENT-002 as a permanent integrated engineering role | Project-owner approval, 2026-07-20 | `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`, `AGENTS.md` | `[IMPLEMENTED]` |
| TRACE-DOC-001 | Establish a single source-of-truth hierarchy | Project-owner approval; existing source priority | `docs/SOURCE_OF_TRUTH.md` | `[IMPLEMENTED]` |
| TRACE-DOC-002 | Preserve content-owner/documentation-steward separation | Project-owner approval | `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md`, `docs/standards/DOCUMENTATION_STANDARD.md` | `[IMPLEMENTED]` |
| TRACE-DOC-003 | Add Documentation Impact to task and delivery gates | Project-owner approval | `docs/DEVELOPMENT_WORKFLOW.md`, `docs/standards/DOCUMENTATION_STANDARD.md` | `[IMPLEMENTED]` |
| TRACE-DOC-004 | Create Handbook infrastructure without Handbook content | Project-owner approval | `docs/handbook/README.md`, `docs/handbook/CHAPTER_TEMPLATE.md` | `[IMPLEMENTED]` |
| TRACE-DOC-005 | Create scalable indexes for ADRs, RFCs, specifications, standards, assurance, and reviews | Project-owner approval | Documentation indexes under `docs/` | `[IMPLEMENTED]` |
| TRACE-REPO-001 | Establish private canonical shared platform repository | Project-owner approval, 2026-07-20; DEC-006 | Git history, `docs/SOURCE_OF_TRUTH.md`, `PROJECT_MANIFEST.md` | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-PROD-001 | Audit and integrate Claude Cowork product sources without changing the external workspace | Project-owner approval, 2026-07-20 | `product/`, `product/governance/SOURCE_INTEGRATION_MAP.md` | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-ORG-002 | Preserve separate Claude Cowork and Codex registries and authority | Project-owner approval; DEC-006 | `product/agents/README.md`, `.codex/AGENT_REGISTRY.md`, `AI_ORGANIZATION.md` | `[IMPLEMENTED]` |
| TRACE-WORKFLOW-001 | Register shared product-to-engineering lifecycle and acceptance route | Project-owner approval, 2026-07-20 | `docs/SHARED_WORKFLOW.md`, product and engineering indexes | `[IMPLEMENTED]` |
| TRACE-TASK-001 | Import AU-CDX-TASK-001 v1.0 for Codex review without activating unregistered agents | Approved Task Package v1.0; Codex registration rules | `product/task-packages/07_TaskPackage_EP01_ThinSlice.md`, `product/task-packages/README.md` | `[IMPLEMENTED]`; engineering intake `[OPEN]` |
| TRACE-COLLAB-001 | Establish a controlled local Claude-Codex exchange while GitHub remains canonical | Project-owner bridge instruction, 2026-07-21; DEC-007 | `collaboration/README.md`, `collaboration/schemas/`, `collaboration/scripts/` | `[IMPLEMENTED]`, `[TESTED]`; exercised operating model `[VERIFIED]` |
| TRACE-COLLAB-002 | Keep Codex as the sole Git writer and preserve separate product, technical, and documentation authority | Project-owner bridge instruction; DEC-006; DEC-007 | `AGENTS.md`, `.codex/AGENT_REGISTRY.md`, `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md` | `[IMPLEMENTED]` |
| TRACE-ACCEPT-001 | Independently review repository initialization and governance integration for exact range `9c85d3d..1ccaace` | Claude Cowork Quality, Security & Independent Acceptance Lead; exchange `AU-EX-20260721-001` | `product/reviews/INIT-002_Independent_Acceptance_Report.md`, `collaboration/manifests/AU-EX-20260721-001/outcome.json` | `[VERIFIED]` only within recorded scope and limitations |
| TRACE-FINDING-F1 | Activate specialized Codex agents instead of assigning all AU-CDX-TASK-001 work to AU-AGENT-001 | Acceptance F1; Owner Decision F1 | `docs/TASKS.md` INIT-002-F1 | Resolution `[APPROVED]`; activation `[OPEN]` |
| TRACE-FINDING-F2 | Resolve product/engineering Decision ID namespace collision | Acceptance F2 | `docs/TASKS.md` INIT-002-F2 | `[OPEN]` |
| TRACE-FINDING-F3 | Activate an independent Engineering Quality role before product implementation | Acceptance F3; RISK-005; Owner Decision F1 | `docs/TASKS.md` INIT-002-F3 | `[OPEN]` |
| TRACE-FINDING-F4 | Register the Collaboration Bridge Protocol after a complete round-trip | Acceptance F4 | `docs/SOURCE_OF_TRUTH.md`, `collaboration/`, exchange outcome | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-FINDING-F5 | Prevent divergence between canonical repository artifacts and local Claude copies | Acceptance F5 | `docs/TASKS.md` INIT-002-F5, RISK-010 | `[OPEN]` |

## Owner

AU-AGENT-002 maintains mappings, identifiers, link integrity, and lifecycle. The
source owner remains responsible for requirement or decision meaning.

## Lifecycle

Update traceability in the same task that adds or changes a requirement,
decision, contract, specification, migration, test obligation, or acceptance
result. Never infer missing approval.

## Adding Mappings

Provide a stable Trace ID, exact source reference and version, authority owner,
affected implementation or organizational artifacts, verification evidence,
documentation links, and current status. Record gaps explicitly rather than
using assumed links.

## Related Sources

- `docs/SOURCE_OF_TRUTH.md`
- `docs/standards/DOCUMENTATION_STANDARD.md`
- `docs/TASKS.md`
- `docs/DECISIONS.md`
