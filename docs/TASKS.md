# Technical Tasks

## Active

No product implementation task is active. AU-CDX-TASK-001 v1.0 is available for
engineering intake and Technical Review only.

## Completed

### INIT-002 — Initialize Shared Platform Repository and Product Sources

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]`
- **Documentation Impact:** Material
- **Outcome:** Created the private shared repository, preserved the engineering
  baseline as its own commit, audited and integrated the Claude Cowork product
  contour, registered separate product and engineering organizations, and
  established shared navigation and workflow.
- **Documentation result:** `PROJECT_MANIFEST.md`, `product/`,
  `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md`, and updated governance.
- **Documentation exception:** None.
- **Evidence:** Repository history, `product/governance/SOURCE_INTEGRATION_MAP.md`,
  `docs/SOURCE_OF_TRUTH.md`, and the INIT-002 handoff entry.
- **Not included:** Product implementation, approved runtime architecture,
  technology selection, CI/CD automation, or independent verification.

### AGENT-002 — Register Engineering Documentation Manager

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]`
- **Documentation Impact:** Material
- **Outcome:** Registered AU-AGENT-002 as a permanent integrated specialist;
  preserved the three-way ownership boundary; created the approved scalable
  documentation infrastructure; established metadata, lifecycle, Source of
  Truth, glossary, traceability, Handbook, ADR/RFC, specification, standards,
  assurance, and documentation-review rules; and added Documentation Impact to
  engineering delivery gates.
- **Documentation result:** The complete AGENT-002 organizational and
  documentation infrastructure in `AGENTS.md`, `.codex/`, and `docs/`.
- **Documentation exception:** None.
- **Evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`,
  `docs/SOURCE_OF_TRUTH.md`, `docs/standards/DOCUMENTATION_STANDARD.md`,
  `docs/TRACEABILITY_MATRIX.md`, and the AGENT-002 handoff entry.
- **Not included:** Engineering Handbook chapters, product decisions, product or
  system architecture, application code, or independent acceptance.

### AGENT-001 — Register Lead Software Architect & Development Orchestrator

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]`
- **Outcome:** Registered AU-AGENT-001 as the chief specialist; defined its
  mission, ownership, prohibitions, inputs, outputs, interfaces, reviewers, and
  Definition of Done; resolved overlap with the primary governance contour;
  completed the initial Architecture & Repository Assessment; and recorded the
  independent engineering review gap.
- **Evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`,
  `docs/ARCHITECTURE.md`, RISK-005, DEC-004, and the AGENT-001 handoff entry.
- **Not included:** Product architecture, application code, unprovided
  specialist roles, or independent acceptance.

### INIT-001 — Workspace Audit and Governance Baseline

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not `[VERIFIED]`
- **Outcome:** Audited the empty non-Git workspace and created the minimum useful
  governance, context, workflow, agent, task, decision, risk, question, and
  handoff documents.
- **Evidence:** `docs/WORKSPACE_AUDIT.md`; documentation consistency checks in
  `docs/HANDOFF_LOG.md`.

## Deferred Until Inputs Exist

- `[DEFERRED]` Product architecture, system map, data model, internal pattern
  format, API contracts, security design, privacy design, testing strategy,
  performance targets, release plan, runbooks, fixtures, and application code.
- `[DEFERRED]` Further specialist registration until each owner-provided
  instruction is received.

## Required Fields for New Technical Tasks

Every new technical task record must include Task ID, requirement version,
owner, reviewer, dependencies, acceptance evidence, and Documentation Impact as
`None`, `Minor`, `Material`, or `Breaking`. Non-`None` impact requires a
documentation result or approved registered Documentation Exception before
completion.
