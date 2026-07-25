# Open Questions

## OQ-001 — Repository Origin

- **Status:** `[CONFIRMED]`
- **Answer:** The Project Owner authorized the private shared repository
  `PhilipGrishin/abris-universe-platform` with `main` as the default branch.
  This workspace is its initial working tree.
- **Resolution evidence:** `docs/SOURCE_OF_TRUTH.md`, DEC-006, and the INIT-002
  handoff record.
- **Result:** Repository origin is resolved. Application architecture and CI/CD
  remain separate open decisions.
- **Decision owner:** Project owner

## OQ-002 — Product Source of Truth

- **Status:** `[CONFIRMED]`
- **Answer:** Imported product sources are maintained under `product/`. The
  approved consolidated source is Master Product Specification v1.0; product
  decisions are in `product/decisions/05_Decision_Log.md`; versioned work is
  under `product/task-packages/`.
- **Source provenance:** The initial read-only Claude Cowork workspace was not a
  Git repository. Its file-level checksums and dispositions are recorded in
  `product/governance/SOURCE_INTEGRATION_MAP.md`.
- **Result:** Repository product-source location is resolved. Later changes in
  the external workspace require controlled re-import or a separately approved
  source-integration workflow.
- **Decision owner:** Project owner / Claude Cowork

## OQ-003 — First Specialist Agent

- **Status:** `[CONFIRMED]`
- **Answer:** Lead Software Architect & Development Orchestrator was supplied and
  registered as AU-AGENT-001 on 2026-07-20.
- **Why it matters:** Responsibilities and interfaces must be registered before
  the specialist performs project work.
- **Resolution evidence:** `.codex/AGENT_REGISTRY.md`, `docs/CODEX_AGENTS.md`,
  DEC-004, and the AGENT-001 handoff entry.
- **Result:** The first specialist registration is complete. Future specialists
  remain unregistered until their individual instructions are supplied.
- **Decision owner:** Project owner

## OQ-004 — Independent Handoff Channel

- **Status:** `[CONFIRMED]`
- **Answer:** Use the registered local Collaboration Bridge with exact-source
  task manifests, controlled Claude inbox/outbox, Codex validation and staging,
  canonical integration, provenance archive, and traceability updates.
- **Evidence:** Completed exchange `AU-EX-20260721-001`, its validated outcome,
  canonical Independent Acceptance Report, and external archive record.
- **Result:** The file-based channel is the exclusive route for substantive
  Claude–Codex communication regardless of direct repository availability and
  establishes delivery and return provenance when the registered validation and
  integration workflow completes.
- **Decision owner:** Project Owner / Claude Cowork / AU-CODEX-PRIMARY

## OQ-005 — First Phase 0 Import Format

- **Status:** `[CONFIRMED]` owner criterion; technical spike `[OPEN]`
- **Answer:** Per PROD-DEC-006, the Project Owner confirmed the criterion on
  2026-07-21: minimize parsing complexity while remaining representative of
  real user files.
- **Delegated choice:** The concrete format is selected by a bounded Codex spike
  over two or three structured XSD/PAT/SXP-class candidates, excluding PDF and
  raster inputs, with the recommendation justified inside the
  TASK-THINSLICE-001 Technical Review.
- **Result:** Only the technical spike remains open; importer coding cannot
  begin before the spike recommendation and Technical Review disposition.
- **Decision owner:** Project Owner for the criterion; AU-AGENT-004 prepares the
  technical recommendation; AU-AGENT-001 approves the Technical Review
  disposition.
