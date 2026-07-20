# Open Questions

## OQ-001 — Repository Origin

- **Status:** `[OPEN]`
- **Question:** Should this workspace root be initialized as a new Git
  repository, or should an existing Abris Universe repository be imported or
  linked here?
- **Why it matters:** The answer determines history, branch policy, existing
  architecture, dependencies, and where baseline documents belong.
- **Recommended option:** If implementation exists elsewhere, import the existing
  repository and integrate this baseline after an overlap review. Otherwise,
  explicitly authorize initialization of a new repository.
- **Can continue without answer:** Governance documentation review.
- **Blocked:** Product implementation, Git workflow, CI/CD, and source audit.
- **Decision owner:** Project owner

## OQ-002 — Product Source of Truth

- **Status:** `[OPEN]`
- **Question:** Where are the authoritative, versioned Claude Cowork product
  documents and Task Packages stored, and what identifies the current version?
- **Why it matters:** Codex cannot trace technical decisions or acceptance
  evidence without a stable product source.
- **Recommended option:** Provide a repository path or approved connected source
  with immutable Task IDs and requirement versions.
- **Can continue without answer:** Governance documentation review.
- **Blocked:** Technical Design Proposal for product features.
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
