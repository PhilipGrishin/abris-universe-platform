# Technical Tasks

## Active and Acceptance Follow-up Records

### INIT-003-ORG-VALIDATION — Full Engineering Organization Readiness Validation

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, `[VERIFIED]` within the exact
  independent report scope and limitations
- **Owner:** AU-CODEX-PRIMARY
- **Reviewers:** Project Owner for authority findings; AU-AGENT-001 for
  technical boundaries; AU-AGENT-002 for documentation lifecycle; Claude
  Cowork Quality, Security & Independent Acceptance Lead through
  `AU-EX-20260725-001`
- **Documentation Impact:** Material
- **Outcome:** Validated all seven engineering roles, every pairwise boundary,
  the acceptance and interaction model, documentation consistency, Bridge
  contracts and tests, completed-exchange integrity, shared-folder safety,
  synchronization, communication routing, and TASK-THINSLICE-001 intake
  mapping without product implementation or silent authority changes.
- **Report:** `docs/reviews/documentation/INIT-003_Organizational_Validation_Report.md`
- **Findings:** OVR-001 owner/provenance field normalization, OVR-002
  standalone exclusion-field normalization, OVR-003 persistent-state lag,
  OVR-004 archive-aware status reporting, and OVR-005 exclusive Bridge
  governance normalization are `[IMPLEMENTED]`, `[TESTED]`.
- **Acceptance:** `AU-EX-20260725-001` returned `COMPLETED` / `VERIFIED`; the
  report was validated, preserved byte-for-byte, integrated, and archived.
  Verification applies only to source `f748c95` and the recorded organizational
  scope. It does not approve product implementation, architecture, stack,
  production readiness, or TASK-THINSLICE-001 implementation.
- **Next gate:** Route the registered non-blocking follow-ups. Do not begin
  product development before the separate AU-CDX-TASK-001 Technical Review.

### INIT-003-OVR-001 — Normalize AU-CODEX-PRIMARY Instruction Provenance

- **Status:** `[IMPLEMENTED]`, `[TESTED]`; wording-only normalization complete
- **Source:** INIT-003 OVR-001; independent acceptance report section 5.
- **Owner:** Project Owner for exact wording; AU-CODEX-PRIMARY and
  AU-AGENT-002 for approved normalization.
- **Required result:** Add explicit owner-instruction provenance and date to the
  canonical PRIMARY entry without changing authority.
- **Evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`, and
  OWNER-DEC-INIT003-DISPOSITIONS-001.

### INIT-003-OVR-002 — Add Standalone Does-Not-Own Fields

- **Status:** `[IMPLEMENTED]`, `[TESTED]`; wording-only normalization complete
- **Source:** INIT-003 OVR-002; independent acceptance report section 5.
- **Owner:** AU-CODEX-PRIMARY for governance; AU-AGENT-002 for structure;
  Project Owner for any wording that changes meaning.
- **Required result:** Add explicit `Does not own` fields for
  AU-CODEX-PRIMARY and AU-AGENT-003 while preserving their existing substantive
  exclusions.
- **Evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`, deterministic
  heading/field checks, and OWNER-DEC-INIT003-DISPOSITIONS-001.

### INIT-003-OVR-004 — Make Exchange Status Reporting Archive-Aware

- **Status:** `[IMPLEMENTED]`, `[TESTED]`; not project `[VERIFIED]`
- **Source:** INIT-003 OVR-004; RISK-009.
- **Owner:** AU-CODEX-PRIMARY.
- **Required result:** In a separate tooling task, make status reporting
  distinguish active, returned, integrated, and archived states; add tests and
  preserve current validation safety.
- **Evidence:** 19/19 Bridge unit tests and live reports for archived exchanges
  `AU-EX-20260721-001` and `AU-EX-20260725-001`.

### INIT-003-OVR-005 — Normalize Exclusive Bridge Communication Governance

- **Status:** `[IMPLEMENTED]`, `[TESTED]`; wording-only normalization complete
- **Source:** INIT-003 OVR-005; owner-directed INIT-003 communication rule.
- **Owner:** Project Owner for exact canonical wording; AU-CODEX-PRIMARY and
  AU-AGENT-002 for approved integration.
- **Required result:** Normalize canonical governance so substantive future
  Claude–Codex communication uses the Collaboration Bridge and owner manual
  input is limited to registered trigger phrases.
- **Evidence:** `AGENTS.md`, `.codex/PROJECT_INSTRUCTIONS.md`,
  `PROJECT_MANIFEST.md`, `AI_ORGANIZATION.md`, `docs/SHARED_WORKFLOW.md`,
  `docs/SOURCE_OF_TRUTH.md`, `collaboration/README.md`, and `product/README.md`.

### INIT-003-PD-001 — Import Cowork DEC-005 Through DEC-008 Through Product Decision Exchange

- **Status:** `[IMPLEMENTED]`, `[TESTED]` preparation; Bridge return and
  canonical product integration `[OPEN]`
- **Source:** INIT-003 Independent Acceptance Report section 6 and Project Owner
  directive dated 2026-07-25.
- **Owner:** Claude Cowork / Project Owner for product meaning;
  AU-CODEX-PRIMARY for exchange preparation and validation.
- **Required result:** Open a new `PRODUCT_DECISION` exchange, receive the
  authoritative decision artifacts, validate them, and integrate them into the
  product decision source without changing meaning.
- **Included owner input:** Cowork DEC-005, DEC-006, DEC-007 (Phase 0 target
  deployment at `https://abris.653915.com` on Cloudflare static hosting, with
  permanent GitHub-to-CI-to-deploy pipeline deferred to Technical Design), and
  DEC-008 (the owner dispositions in
  OWNER-DEC-INIT003-DISPOSITIONS-001).
- **Prohibited interpretation:** The INIT-003 acceptance report alone does not
  authorize direct edits to `product/decisions/05_Decision_Log.md`.
- **Next gate:** Complete and integrate exchange `AU-EX-20260725-002`, then
  begin Technical Review plus the bounded OQ-005 import-format spike. No
  development begins before the Technical Review.

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

- **Status:** Owner resolution `[APPROVED]`; AU-AGENT-003 through AU-AGENT-006
  `[IMPLEMENTED]`, `[TESTED]`; follow-up complete
- **Source:** Independent Acceptance Report F1 and Owner Decision F1.
- **Resolution:** `ACTIVATE SPECIALIZED CODEX AGENTS`; do not remap the whole
  AU-CDX-TASK-001 implementation to AU-AGENT-001.
- **Owner:** Project Owner / AU-CODEX-PRIMARY for governed registration.
- **Dependencies:** Satisfied. Each role received a complete owner-provided
  operating instruction and passed the registration approval gate.
- **Result:** AU-AGENT-003 through AU-AGENT-006 were registered from their
  complete owner instructions on 2026-07-25. Independent quality, Pattern
  Engine, Backend/Data/Sync, and Mobile/Web Client ownership prerequisites are
  available.
- **Prohibited interpretation:** This completion does not approve product
  implementation, runtime architecture, technology selection, platform scope,
  or AU-CDX-TASK-001 execution.

### INIT-002-F2 — Resolve Decision-ID Namespace Collision

- **Status:** `[OPEN]`
- **Source:** Independent Acceptance Report F2.
- **Owner:** AU-AGENT-002 for navigation analysis; Project Owner and
  AU-CODEX-PRIMARY for namespace approval.
- **Required result:** A non-destructive prefixed namespace and migration map
  preserving all product and engineering decision history and references.

### INIT-002-F3 — Activate Independent Engineering Quality Role

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not project `[VERIFIED]`
- **Source:** Independent Acceptance Report F3; RISK-005; Owner Decision F1.
- **Owner:** Project Owner for role meaning; AU-CODEX-PRIMARY for registration.
- **Result:** AU-AGENT-003 is registered as an independent engineering
  quality-gate specialist; Engineering Verification Reports and workflow gates
  are registered. AU-AGENT-001 self-review remains non-independent.

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

### AGENT-006 — Register Mobile & Web Client Lead

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not project `[VERIFIED]`
- **Owner:** AU-CODEX-PRIMARY
- **Reviewer:** Project Owner for supplied role meaning; AU-AGENT-001 for
  architecture boundary; AU-AGENT-002 for documentation consistency;
  AU-AGENT-003 is the independent reviewer of future client implementation, not
  of its own registration; AU-AGENT-004 for Pattern Engine and rendering-core
  contracts; AU-AGENT-005 for API, authentication, persistence, and
  synchronization contracts.
- **Documentation Impact:** Material
- **Outcome:** Registered AU-AGENT-006; preserved mobile, web, client
  architecture, presentation, interaction, UI and approved UX implementation,
  navigation, state, integration, local cache and storage, offline client,
  accessibility, responsiveness, performance, evidence, and documentation
  responsibilities; defined interfaces and prohibitions; and kept product and
  UX meaning, rendering algorithms, import, backend architecture, persistence,
  synchronization rules, system architecture, independent quality, and product
  acceptance outside its authority.
- **Documentation result:** Complete operating definition, agent registries,
  organization navigation, workflow routing, architecture governance,
  specification/ADR/benchmark/capability/checklist/threat-model ownership,
  traceability, and persistent project state.
- **Documentation exception:** None.
- **Evidence:** `.codex/AGENT_REGISTRY.md`,
  `.codex/agents/definitions/au-agent-006-mobile-web-client-lead.md`,
  `docs/CODEX_AGENTS.md`, relevant documentation indexes, and the AGENT-006
  handoff entry.
- **Not included:** Mobile or web application or product implementation,
  client architecture or technology selection, UI components, platform
  approval, UX changes, API or rendering implementation, synchronization-rule
  changes, accessibility or performance claims, or AU-CDX-TASK-001 execution.

### AGENT-005 — Register Backend, Data & Synchronization Lead

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not project `[VERIFIED]`
- **Owner:** AU-CODEX-PRIMARY
- **Reviewer:** Project Owner for supplied role meaning; AU-AGENT-001 for
  architecture boundary; AU-AGENT-002 for documentation consistency;
  AU-AGENT-003 is the independent reviewer of future domain implementation, not
  of its own registration; AU-AGENT-004 for shared Pattern Engine contracts.
- **Documentation Impact:** Material
- **Outcome:** Registered AU-AGENT-005; preserved backend, data, persistence,
  database, API, authentication, synchronization, conflict mechanism, storage,
  backup, recovery, migration, integrity, performance, security, evidence, and
  documentation responsibilities; defined interfaces and prohibitions; and
  kept product, UX, UI, rendering algorithms, system architecture, independent
  quality, and product acceptance outside its authority.
- **Documentation result:** Complete operating definition, agent registries,
  organization navigation, workflow routing, architecture governance,
  specification/ADR/benchmark/migration/threat-model ownership, traceability,
  and persistent project state.
- **Documentation exception:** None.
- **Evidence:** `.codex/AGENT_REGISTRY.md`,
  `.codex/agents/definitions/au-agent-005-backend-data-synchronization-lead.md`,
  `docs/CODEX_AGENTS.md`, relevant documentation indexes, and the AGENT-005
  handoff entry.
- **Not included:** Backend or product implementation, physical schema or API
  design, synchronization or conflict policy, authentication provider,
  technology selection, runtime architecture, migration execution, or
  compatibility or performance claims.

### AGENT-004 — Register Pattern Engine, Import, Rendering & Algorithms Lead

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not project `[VERIFIED]`
- **Owner:** AU-CODEX-PRIMARY
- **Reviewer:** Project Owner for supplied role meaning; AU-AGENT-001 for
  architecture boundary; AU-AGENT-002 for documentation consistency;
  AU-AGENT-003 is the independent reviewer of future domain implementation, not
  of its own registration.
- **Documentation Impact:** Material
- **Outcome:** Registered AU-AGENT-004; preserved Pattern Engine, import,
  rendering-core, algorithm, compatibility, performance, memory, evidence, and
  documentation responsibilities; defined interfaces and prohibitions; and
  kept product, UX, UI, backend, synchronization, system architecture,
  independent quality, and product acceptance outside its authority.
- **Documentation result:** Complete operating definition, agent registries,
  organization navigation, workflow routing, architecture governance,
  specification/ADR/benchmark/capability ownership, traceability, and persistent
  project state.
- **Documentation exception:** None.
- **Evidence:** `.codex/AGENT_REGISTRY.md`,
  `.codex/agents/definitions/au-agent-004-pattern-engine-import-rendering-algorithms-lead.md`,
  `docs/CODEX_AGENTS.md`, relevant documentation indexes, and the AGENT-004
  handoff entry.
- **Not included:** Pattern Engine or product implementation, internal model or
  algorithm design, supported-format approval, runtime architecture, UI,
  backend, synchronization, benchmarks, or compatibility claims.

### AGENT-003 — Register Engineering Quality, DevSecOps & Security Lead

- **Status:** `[IMPLEMENTED]`, `[TESTED]`, not project `[VERIFIED]`
- **Owner:** AU-CODEX-PRIMARY
- **Reviewer:** Project Owner for supplied role meaning; documentation
  consistency reviewed under AU-AGENT-002 rules.
- **Documentation Impact:** Material
- **Outcome:** Registered AU-AGENT-003; preserved its non-implementation and
  non-product-acceptance boundaries; defined inputs, outputs, verification
  scope, evidence rule, findings, severity, quality-gate statuses, independence,
  interfaces, and Definition of Done; and inserted engineering verification
  before Claude Cowork product acceptance.
- **Documentation result:** `.codex/agents/`,
  `docs/reviews/engineering/`, agent registries, workflows, Source of Truth,
  glossary, traceability, and persistent project state.
- **Documentation exception:** None.
- **Evidence:** `.codex/AGENT_REGISTRY.md`,
  `.codex/agents/definitions/au-agent-003-engineering-quality-devsecops-security-lead.md`,
  `docs/CODEX_AGENTS.md`, `docs/reviews/engineering/README.md`, and the AGENT-003
  handoff entry.
- **Not included:** Product implementation, architecture redesign, CI/CD
  implementation, product acceptance, an Engineering Verification Report for
  nonexistent product code, or AU-AGENT-004–006 activation.

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
- `[DEFERRED]` Any future specialist registration until a separate complete
  owner-provided instruction is received.

## Required Fields for New Technical Tasks

Every new technical task record must include Task ID, requirement version,
owner, reviewer, dependencies, acceptance evidence, and Documentation Impact as
`None`, `Minor`, `Material`, or `Breaking`. Non-`None` impact requires a
documentation result or approved registered Documentation Exception before
completion.
