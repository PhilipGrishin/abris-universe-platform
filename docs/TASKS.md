# Technical Tasks

## Active and Acceptance Follow-up Records

### BRIDGE-001 — Local Claude-Codex Collaboration Bridge

- **Status:** `[IMPLEMENTED]`, `[TESTED]`; exercised operating model
  `[VERIFIED]` through `AU-EX-20260721-001`
- **Owner:** AU-CODEX-PRIMARY
- **Reviewer:** Quality, Security & Independent Acceptance Lead through
  exchange `AU-EX-20260721-001`
- **Documentation Impact:** Material
- **Outcome:** Option B bridge infrastructure, schemas, dry-run-first tooling,
  governance integration, and the exact-source first review package are ready.
- **Acceptance result:** The schema-valid return was staged, integrated, and
  archived. Verification covers the operating model exercised by the exchange,
  not every bridge implementation change or future exchange.
- **Evidence:** `collaboration/`, DEC-007, RISK-009, and the BRIDGE-001 handoff.

No product implementation task is active. AU-CDX-TASK-001 v1.0 remains
available for engineering intake and Technical Review only.

### INIT-002-F1 — Activate Specialized Codex Agents

- **Status:** Owner resolution `[APPROVED]`; activation `[OPEN]`
- **Source:** Independent Acceptance Report F1 and Owner Decision F1.
- **Resolution:** `ACTIVATE SPECIALIZED CODEX AGENTS`; do not remap the whole
  AU-CDX-TASK-001 implementation to AU-AGENT-001.
- **Owner:** Project Owner / AU-CODEX-PRIMARY for governed registration.
- **Dependencies:** Full owner-provided operating instruction for each role;
  approval gate; AU-AGENT-003 before product implementation and AU-AGENT-004
  before the import-format spike.
- **Prohibited:** This record does not activate AU-AGENT-003–006.

### INIT-002-F2 — Resolve Decision-ID Namespace Collision

- **Status:** `[OPEN]`
- **Source:** Independent Acceptance Report F2.
- **Owner:** AU-AGENT-002 for navigation analysis; Project Owner and
  AU-CODEX-PRIMARY for namespace approval.
- **Required result:** A non-destructive prefixed namespace and migration map
  preserving all product and engineering decision history and references.

### INIT-002-F3 — Activate Independent Engineering Quality Role

- **Status:** `[OPEN]`
- **Source:** Independent Acceptance Report F3; RISK-005; Owner Decision F1.
- **Owner:** Project Owner for the full instruction; AU-CODEX-PRIMARY for
  registration.
- **Required result:** Register AU-AGENT-003 before first product
  implementation. AU-AGENT-001 self-review remains non-independent.

### INIT-002-F4 — Canonicalize Collaboration Bridge Protocol

- **Status:** `[IMPLEMENTED]`, `[TESTED]`
- **Source:** Independent Acceptance Report F4.
- **Owner:** AU-CODEX-PRIMARY; AU-AGENT-002 for documentation lifecycle.
- **Result:** `collaboration/README.md`, schemas, manifests, scripts, and the
  completed exchange are registered through `docs/SOURCE_OF_TRUTH.md`; the first
  full round-trip is archived with provenance.

### INIT-002-F5 — Prevent Repository and Claude-Copy Divergence

- **Status:** `[OPEN]`, Claude-side control reported
- **Source:** Independent Acceptance Report F5.
- **Owner:** Claude Cowork product coordination owner; AU-CODEX-PRIMARY for
  exchange enforcement.
- **Required result:** Repository copies remain canonical for maintained product
  artifacts; local Claude copies remain drafting/bridge state; later changes
  use registered exchanges and explicit source mapping.

## Completed

### INIT-002 — Initialize Shared Platform Repository and Product Sources

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, `[VERIFIED]` within the independent
  report's exact source, scope, evidence, and limitations
- **Documentation Impact:** Material
- **Outcome:** Created the private shared repository, preserved the engineering
  baseline as its own commit, audited and integrated the Claude Cowork product
  contour, registered separate product and engineering organizations, and
  established shared navigation and workflow.
- **Documentation result:** `PROJECT_MANIFEST.md`, `product/`,
  `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md`, and updated governance.
- **Documentation exception:** None.
- **Evidence:** Repository history, `product/governance/SOURCE_INTEGRATION_MAP.md`,
  `docs/SOURCE_OF_TRUTH.md`, the INIT-002 handoff entry, and
  `product/reviews/INIT-002_Independent_Acceptance_Report.md`.
- **Not included:** Product implementation, approved runtime architecture,
  technology selection, CI/CD automation, AU-CDX-TASK-001 implementation,
  planned agent activation, or Engineering Handbook content.

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
