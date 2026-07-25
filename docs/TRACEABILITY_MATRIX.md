# Engineering Traceability Matrix

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-TRACE-001 |
| Title | Engineering Traceability Matrix |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 2.9.0 |
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
| TRACE-TASK-001 | Maintain AU-CDX-TASK-001 as a versioned product handoff without bypassing engineering gates | Approved Task Package v1.0; PROD-DEC-009 editorial authorization | `product/task-packages/07_TaskPackage_EP01_ThinSlice.md`, `product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md`, `product/task-packages/README.md` | v1.0 preserved; v1.1 current `[APPROVED]`; Technical Design `[PROPOSED]`; gated implementation in progress |
| TRACE-COLLAB-001 | Establish a controlled local Claude-Codex exchange while GitHub remains canonical | Project-owner bridge instruction, 2026-07-21; DEC-007 | `collaboration/README.md`, `collaboration/schemas/`, `collaboration/scripts/` | `[IMPLEMENTED]`, `[TESTED]`; exercised operating model `[VERIFIED]` |
| TRACE-COLLAB-002 | Keep Codex as the sole Git writer and preserve separate product, technical, and documentation authority | Project-owner bridge instruction; DEC-006; DEC-007 | `AGENTS.md`, `.codex/AGENT_REGISTRY.md`, `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md` | `[IMPLEMENTED]` |
| TRACE-COLLAB-003 | End each completed Codex work package ready for owner-mediated Claude handoff with the exact standalone marker `Codex finished` without treating the marker as evidence or acceptance | OWNER-DEC-CODEX-HANDOFF-001; Project Owner 2026-07-25 | `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md`, `collaboration/README.md`, `docs/SHARED_WORKFLOW.md`, `docs/SOURCE_OF_TRUTH.md` | `[IMPLEMENTED]` |
| TRACE-ACCEPT-001 | Independently review repository initialization and governance integration for exact range `9c85d3d..1ccaace` | Claude Cowork Quality, Security & Independent Acceptance Lead; exchange `AU-EX-20260721-001` | `product/reviews/INIT-002_Independent_Acceptance_Report.md`, `collaboration/manifests/AU-EX-20260721-001/outcome.json` | `[VERIFIED]` only within recorded scope and limitations |
| TRACE-FINDING-F1 | Activate specialized Codex agents instead of assigning all AU-CDX-TASK-001 work to AU-AGENT-001 | Acceptance F1; Owner Decision F1 | `docs/TASKS.md` INIT-002-F1, `.codex/AGENT_REGISTRY.md` | AU-AGENT-003–006 `[IMPLEMENTED]`, `[TESTED]`; product implementation remains `[OPEN]` |
| TRACE-FINDING-F2 | Resolve product/engineering Decision ID namespace collision | Acceptance F2 | `docs/TASKS.md` INIT-002-F2 | `[OPEN]` |
| TRACE-FINDING-F3 | Activate an independent Engineering Quality role before product implementation | Acceptance F3; RISK-005; Owner Decision F1; owner instruction 2026-07-25 | `docs/TASKS.md` INIT-002-F3, `.codex/AGENT_REGISTRY.md`, `docs/reviews/engineering/` | `[IMPLEMENTED]`, `[TESTED]`; task assignment remains required |
| TRACE-FINDING-F4 | Register the Collaboration Bridge Protocol after a complete round-trip | Acceptance F4 | `docs/SOURCE_OF_TRUTH.md`, `collaboration/`, exchange outcome | `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-FINDING-F5 | Prevent divergence between canonical repository artifacts and local Claude copies | Acceptance F5 | `docs/TASKS.md` INIT-002-F5, RISK-010 | `[OPEN]` |
| TRACE-VALIDATION-003 | Validate the complete engineering organization, Bridge, synchronization, and TASK-THINSLICE-001 intake readiness without implementation or silent authority repair | INIT-003 owner-directed validation request, 2026-07-21 | `docs/reviews/documentation/INIT-003_Organizational_Validation_Report.md`, `docs/TASKS.md`, `docs/CURRENT_STATUS.md`, `.codex/CURRENT_FOCUS.md`, `docs/HANDOFF_LOG.md`; exchange `AU-EX-20260725-001` | `[IMPLEMENTED]`, `[TESTED]`, `[VERIFIED]` within exact acceptance scope |
| TRACE-ACCEPT-002 | Independently review INIT-003 engineering-organization readiness at exact source `f748c95` | Claude Cowork Quality, Security & Independent Acceptance Lead; exchange `AU-EX-20260725-001` | `product/reviews/INIT-003_Independent_Acceptance_Report.md`, `collaboration/manifests/AU-EX-20260725-001/outcome.json` | `[VERIFIED]` only within recorded scope and limitations |
| TRACE-INIT003-OVR | Normalize OVR-001, OVR-002, and OVR-005 without authority changes; implement tested archive-aware status reporting for OVR-004 | INIT-003 Independent Acceptance Report section 5; Project Owner directive 2026-07-25 | `.codex/AGENT_REGISTRY.md`, canonical Bridge governance documents, `collaboration/scripts/report-exchange-status.mjs`, 19-test Bridge suite, RISK-009 | `[IMPLEMENTED]`, `[TESTED]`; tooling not project `[VERIFIED]` |
| TRACE-INIT003-PD | Formally integrate transmitted Cowork DEC-005 through DEC-008 only through a new Product Decision exchange | INIT-003 Independent Acceptance Report section 6; Project Owner directive 2026-07-25 | `product/decisions/05_Decision_Log.md`; exchange `AU-EX-20260725-002` and its outcome | `[IMPLEMENTED]`, `[TESTED]`; result `COMPLETED / NO_DECISION` |
| TRACE-DEPLOY-INPUT-001 | Preserve owner-confirmed Phase 0 Cloudflare target and design its permanent pipeline without deploying | PROD-DEC-007; Project Owner 2026-07-25 | `product/decisions/05_Decision_Log.md`, `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-004, exchange `AU-EX-20260725-002` | Product input `[CONFIRMED]`; HTTPS endpoint `[TESTED]`; pipeline `[PROPOSED]`; placeholder rollback anchor `[OPEN]` |
| TRACE-TECHREVIEW-001 | Perform TASK-THINSLICE-001 Technical Review and bounded OQ-005 spike before development | TASK-THINSLICE-001 v1.0 exact review source; PROD-DEC-006; PROD-DEC-008 | `docs/reviews/technical/TASK-THINSLICE-001/`, `docs/TASKS.md` | Review and spike `[IMPLEMENTED]`, `[TESTED]`; clarification and design-review gates resolved; implementation proceeds under remaining gates |
| TRACE-OQ005-001 | Select the Phase 0 structured importer by the confirmed minimal-complexity/representativeness criterion without silently changing product meaning | PROD-DEC-006; PROD-DEC-009; OQ-005; TASK-THINSLICE-001 v1.1 | `product/decisions/05_Decision_Log.md`, `docs/reviews/technical/TASK-THINSLICE-001/OQ-005_IMPORT_FORMAT_SPIKE.md`, `product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md`, `tests/fixtures/oxs/` | OXS/XSP evidence `[TESTED]`; OXS 1.0 and terminology `[CONFIRMED]`; route-1 fixtures `[IMPLEMENTED]`, `[TESTED]` |
| TRACE-CLARIFY-TS001 | Route OQ-005 terminology, format, and fixture-authority questions exclusively through the exact-source Collaboration Bridge | Technical Review gate; PROD-DEC-008; Collaboration Bridge contract | Exchange `AU-EX-20260725-004` and outcome; rejected predecessor `AU-EX-20260725-003` retained with withdrawal evidence | Return valid and integrated as PROD-DEC-009; `COMPLETED / NO_DECISION`; no `[VERIFIED]`; clarification gate closed |
| TRACE-DESIGN-TS001 | Complete the TASK-THINSLICE-001 Technical Design and architecture review before development | TASK-THINSLICE-001 v1.1; PROD-DEC-009; Technical Review | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-001 through ADR-TS001-004, task threat model, task benchmark plan, exchanges `AU-EX-20260725-005` and `AU-EX-20260725-006` | Design package `[PROPOSED]`; revision disposition `CONFIRMED_ACCEPTED_WITH_GATES`; TD-GATE-001 closed for route-1 profile; TD-GATE-004 closed; remaining evidence `[OPEN]` |
| TRACE-ARCHREVIEW-TS001 | Independently review the exact pre-code design and integrate mandatory findings without changing Claude-authored meaning | `AU-EX-20260725-005`; System Architecture, Data & AI Governance Lead | Canonical architecture review under `product/reviews/`; Technical Design v1.1.0; revised ADRs, threat model, benchmark plan; exchange outcome | Return `[TESTED]`, `COMPLETED / NO_DECISION`; design and ADRs `ACCEPTED_WITH_GATES`; project `[VERIFIED]` not assigned; AU-AGENT-003 review later completed |
| TRACE-PROD-DEC010 | Preserve the owner-confirmed Abris Art launch/catalog/resource relationship while requiring explicit route-2 grants and leaving Phase 0 unchanged | PROD-DEC-010 transmitted in validated `AU-EX-20260725-005` return | `product/decisions/05_Decision_Log.md`, `product/decisions/README.md`, `docs/TASKS.md` PHASE1-ABRIS-ART-FORMAT-SURVEY | Product input `[CONFIRMED]`; Phase 1 survey `[DEFERRED]`; no content transfer authorized |
| TRACE-PROD-DEC011 | Preserve the owner-granted four-file XSP evidence, Bridge binary prohibition, licensed XSD export priority, and unchanged Phase 0 scope | PROD-DEC-011 transmitted in validated `AU-EX-20260725-006` return | `product/decisions/05_Decision_Log.md`, `product/decisions/README.md`, `docs/TASKS.md` PHASE1-ABRIS-ART-FORMAT-SURVEY | Product input `[CONFIRMED]`; survey substantially complete; XSD technical spike `[DEFERRED]`; no binary transfer or implementation authorized |
| TRACE-OXS-MAP-TS001 | Map OXS 1.0 to the canonical full-cross subset without importing source progress or inventing brand/symbol/coordinate meaning | TASK-THINSLICE-001 FR-01/FR-02 and sections 14/18/22; PROD-DEC-009 | Technical Design sections 5 through 7; ADR-TS001-001; `tests/fixtures/oxs/`; `packages/importers/oxs/`; importer implementation review | Route-1 importer core `[IMPLEMENTED]`, `[TESTED]`; coordinate and literal-symbol evidence `[TESTED]`; other producers `[OPEN]`; worker/persistence integration and project `[VERIFIED]` absent |
| TRACE-ROUTE1-TS001 | Produce project-original OXS fixtures and the approved non-behavioral workspace scaffold without vendor redistribution or product implementation | PROD-DEC-009; Technical Design sections 3/6/11/15; `AU-EX-20260725-006` | `tests/fixtures/oxs/`, `apps/web/`, `packages/`, `package.json`, `pnpm-workspace.yaml`, `scripts/verify-workspace.mjs`, route-1 technical review | Fixtures and scaffold `[IMPLEMENTED]`, `[TESTED]`; TD-GATE-001 closed for route-1 profile; runtime implementation and project `[VERIFIED]` absent |
| TRACE-DOMAIN-TS001 | Enforce the canonical Pattern/PatternVersion, Symbol/PaletteItem, source-provenance, and Pattern/Progress boundaries independently of OXS | TASK-THINSLICE-001 sections 14/18; Technical Design section 5; ADR-TS001-001 | `packages/domain-core/`, domain-core implementation review | `[IMPLEMENTED]`, `[TESTED]`; strict typecheck and 9 focused tests pass; AU-AGENT-003 consolidated verification and project `[VERIFIED]` absent |
| TRACE-OXS-SEC-TS001 | Bound untrusted route-1 OXS parsing and produce user-safe deterministic rejection/warning evidence without UI-thread fallback | Technical Design sections 6/7/11; task threat model; TD-GATE-004 | `packages/importers/oxs/`, 14 focused importer tests, registered negative fixtures, importer implementation review | Importer core limits `[IMPLEMENTED]`, `[TESTED]`; dedicated Worker/runtime verification and AU-AGENT-003 consolidated verification `[OPEN]` |
| TRACE-RENDER-TS001 | Use tiled symbol rendering with bounded visible-area work and an evidence path to future scale | TASK-THINSLICE-001 FR-03/FR-04 and sections 19/24/27 | Technical Design section 8; ADR-TS001-002; task benchmark plan | Architecture `[PROPOSED]`; performance result `[OPEN]`; no renderer implemented |
| TRACE-PERSIST-TS001 | Persist original source, immutable PatternVersion, Project, and idempotent progress without silent save loss | TASK-THINSLICE-001 FR-05 through FR-07 and sections 14/18/21/27 | Technical Design section 9; ADR-TS001-003; task threat model | Architecture `[PROPOSED]`; durability evidence `[OPEN]`; no storage implemented |
| TRACE-SECURITY-TS001 | Bound untrusted OXS processing and preserve local-only privacy | TASK-THINSLICE-001 sections 22/23/27 | Technical Design sections 7, 9, and 12; `docs/assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md`; `docs/reviews/engineering/TASK-THINSLICE-001_SECURITY_DESIGN_VERIFICATION.md` | Design review `VERIFIED WITH FINDINGS`; TD-GATE-004 closed; implementation/runtime control evidence `[OPEN]` |
| TRACE-ENGVERIFY-TS001-SEC | Independently review security-relevant design sections before lifting the TD-GATE-004 security hold | `AU-EX-20260725-005` N-9; AU-CDX-TASK-001-SECURITY-DESIGN-REVIEW | `docs/reviews/engineering/TASK-THINSLICE-001_SECURITY_DESIGN_VERIFICATION.md`, Technical Design v1.2.1, Threat Model v1.2.1, ADR review histories | AU-AGENT-003 `VERIFIED WITH FINDINGS`; TS001-SEC-001 resolved; TS001-SEC-002 design action complete/runtime evidence open; no project `[VERIFIED]` |
| TRACE-DESIGNCONFIRM-TS001 | Confirm the exact revised design and internal security-gate dispositions through the exclusive Collaboration Bridge before the next engineering stage | Project Owner 2026-07-25; AU-CDX-TASK-001-DESIGN-REVISION-CONFIRMATION | Exchange `AU-EX-20260725-006`; immutable source branch `codex/task-thinslice-001-design-revision-source` at `395c5d6`; canonical confirmation under `product/reviews/` | Return `[TESTED]`, `COMPLETED / NO_DECISION`, integrated byte-for-byte; disposition `CONFIRMED_ACCEPTED_WITH_GATES`; TD-GATE-004 closed; no project `[VERIFIED]` |

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
