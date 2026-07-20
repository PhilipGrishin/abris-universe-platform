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

- **Status:** `[OPEN]`
- **Question:** What persistent mechanism should Codex use to deliver Technical
  Reviews and Completion Reports to Claude Cowork and receive `[VERIFIED]`
  outcomes?
- **Why it matters:** A file-only record captures evidence but does not itself
  establish delivery or independent acceptance.
- **Recommended option:** Use a versioned handoff file plus the owner's chosen
  Claude Cowork channel, then record the returned decision and evidence link.
- **Can continue without answer:** Technical preparation and file-based handoffs.
- **Blocked:** Confirmed independent `[VERIFIED]` status.
- **Decision owner:** Project owner / Claude Cowork
