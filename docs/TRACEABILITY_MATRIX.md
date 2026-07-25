# Engineering Traceability Matrix

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-TRACE-001 |
| Title | Engineering Traceability Matrix |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.8.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
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
| TRACE-ORG-003 | Register AU-AGENT-003 as the independent Engineering Quality, DevSecOps & Security Lead without implementation or product-acceptance authority | Project-owner operating instruction, 2026-07-25; Owner Decision F1 | `.codex/AGENT_REGISTRY.md`, `.codex/agents/definitions/au-agent-003-engineering-quality-devsecops-security-lead.md`, `docs/CODEX_AGENTS.md`, `docs/reviews/engineering/` | `[IMPLEMENTED]`, `[TESTED]`; not project `[VERIFIED]` |
| TRACE-ORG-004 | Register AU-AGENT-004 as Pattern Engine, Import, Rendering & Algorithms Lead without inventing architecture or implementation | Project-owner operating instruction, 2026-07-25; Owner Decision F1 | `.codex/AGENT_REGISTRY.md`, `.codex/agents/definitions/au-agent-004-pattern-engine-import-rendering-algorithms-lead.md`, `docs/CODEX_AGENTS.md`, assurance and specification indexes | `[IMPLEMENTED]`, `[TESTED]`; domain implementation `[OPEN]` |
| TRACE-ORG-005 | Register AU-AGENT-005 as Backend, Data & Synchronization Lead without inventing architecture, schemas, APIs, or implementation | Project-owner operating instruction, 2026-07-25; Owner Decision F1 | `.codex/AGENT_REGISTRY.md`, `.codex/agents/definitions/au-agent-005-backend-data-synchronization-lead.md`, `docs/CODEX_AGENTS.md`, specification, ADR, benchmark, migration, and threat-model indexes | `[IMPLEMENTED]`, `[TESTED]`; domain implementation `[OPEN]` |
| TRACE-ORG-006 | Register AU-AGENT-006 as Mobile & Web Client Lead without inventing product behavior, client architecture, platform scope, or implementation | Project-owner operating instruction, 2026-07-25; Owner Decision F1 | `.codex/AGENT_REGISTRY.md`, `.codex/agents/definitions/au-agent-006-mobile-web-client-lead.md`, `docs/CODEX_AGENTS.md`, specification, ADR, benchmark, capability, checklist, and threat-model indexes | `[IMPLEMENTED]`, `[TESTED]`; domain implementation `[OPEN]` |
| TRACE-GIT-001 | Automatically review and merge checked agent-registration branches | Project-owner instruction, 2026-07-25; OWNER-DEC-AGENT-MERGE-001 | `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md`, `docs/DEVELOPMENT_WORKFLOW.md`, GitHub PR #1, PR #2, PR #3, and PR #4 | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-WORKFLOW-001 | Register shared product-to-engineering lifecycle and acceptance route | Project-owner approval, 2026-07-20 | `docs/SHARED_WORKFLOW.md`, product and engineering indexes | `[IMPLEMENTED]` |
| TRACE-TASK-001 | Import AU-CDX-TASK-001 v1.0 for Codex review without activating unregistered agents | Approved Task Package v1.0; Codex registration rules | `product/task-packages/07_TaskPackage_EP01_ThinSlice.md`, `product/task-packages/README.md` | `[IMPLEMENTED]`; engineering intake `[OPEN]` |
| TRACE-COLLAB-001 | Establish a controlled local Claude-Codex exchange while GitHub remains canonical | Project-owner bridge instruction, 2026-07-21; DEC-007 | `collaboration/README.md`, `collaboration/schemas/`, `collaboration/scripts/` | `[IMPLEMENTED]`, `[TESTED]`; exercised operating model `[VERIFIED]` |
| TRACE-COLLAB-002 | Keep Codex as the sole Git writer and preserve separate product, technical, and documentation authority | Project-owner bridge instruction; DEC-006; DEC-007 | `AGENTS.md`, `.codex/AGENT_REGISTRY.md`, `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md` | `[IMPLEMENTED]` |
| TRACE-ACCEPT-001 | Independently review repository initialization and governance integration for exact range `9c85d3d..1ccaace` | Claude Cowork Quality, Security & Independent Acceptance Lead; exchange `AU-EX-20260721-001` | `product/reviews/INIT-002_Independent_Acceptance_Report.md`, `collaboration/manifests/AU-EX-20260721-001/outcome.json` | `[VERIFIED]` only within recorded scope and limitations |
| TRACE-FINDING-F1 | Activate specialized Codex agents instead of assigning all AU-CDX-TASK-001 work to AU-AGENT-001 | Acceptance F1; Owner Decision F1 | `docs/TASKS.md` INIT-002-F1, `.codex/AGENT_REGISTRY.md` | AU-AGENT-003–006 `[IMPLEMENTED]`, `[TESTED]`; product implementation remains `[OPEN]` |
| TRACE-FINDING-F2 | Resolve product/engineering Decision ID namespace collision | Acceptance F2 | `docs/TASKS.md` INIT-002-F2 | `[OPEN]` |
| TRACE-FINDING-F3 | Activate an independent Engineering Quality role before product implementation | Acceptance F3; RISK-005; Owner Decision F1; owner instruction 2026-07-25 | `docs/TASKS.md` INIT-002-F3, `.codex/AGENT_REGISTRY.md`, `docs/reviews/engineering/` | `[IMPLEMENTED]`, `[TESTED]`; task assignment remains required |
| TRACE-FINDING-F4 | Register the Collaboration Bridge Protocol after a complete round-trip | Acceptance F4 | `docs/SOURCE_OF_TRUTH.md`, `collaboration/`, exchange outcome | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-FINDING-F5 | Prevent divergence between canonical repository artifacts and local Claude copies | Acceptance F5 | `docs/TASKS.md` INIT-002-F5, RISK-010 | `[OPEN]` |
| TRACE-VALIDATION-003 | Validate the complete engineering organization, Bridge, synchronization, and TASK-THINSLICE-001 intake readiness without implementation or silent authority repair | INIT-003 owner-directed validation request, 2026-07-21 | `docs/reviews/documentation/INIT-003_Organizational_Validation_Report.md`, `docs/TASKS.md`, `docs/CURRENT_STATUS.md`, `.codex/CURRENT_FOCUS.md`, `docs/HANDOFF_LOG.md`; exchange `AU-EX-20260725-001` | `[IMPLEMENTED]`, `[TESTED]`; independent acceptance `[OPEN]` |

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
