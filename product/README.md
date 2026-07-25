# Product Contour

| Field | Value |
| --- | --- |
| Document ID | AU-PROD-INDEX-001 |
| Title | Product Contour |
| Status | `[IMPLEMENTED]` |
| Owner | Project Owner / Claude Cowork |
| Technical Approver | Project Owner |
| Version | 1.3.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `PROJECT_MANIFEST.md`, `collaboration/README.md` |
| Supersedes | External-workspace physical navigation only |
| Superseded By | None |
| Review Triggers | Product authority change; product source import; Task Package lifecycle change; repository topology change |

## Purpose

Provide the portable repository entry point for approved product knowledge,
product governance, Claude Cowork roles, Task Packages, research, product-side
architecture inputs, and independent product reviews.

## Scope

This contour owns product meaning and product acceptance records. It does not
own engineering implementation, approve an engineering stack, or replace the
engineering sources under `docs/` and `.codex/`.

## Authority

Project-owner decisions and approved versioned Task Packages have the highest
project authority. Product meaning is owned by the Project Owner and Claude
Cowork. Engineering meaning remains with the Codex engineering organization.
AU-AGENT-002 maintains documentation integration but owns neither meaning.

Resolve every conflict through `docs/SOURCE_OF_TRUTH.md`; this index is a
navigation layer, not a parallel source of truth.

Imported owner-approved source documents retain their original language for
fidelity. This is an explicit source-import exception; new repository-native
artifacts continue to follow the project English-language policy.

## Canonical Product Sources

- [Master Product Specification v1.0](specifications/Abris_Universe_Master_Product_Specification_RU.docx)
  is the current approved consolidated product specification.
- [Product Decision Log](decisions/05_Decision_Log.md) contains product and
  owner decisions; each entry retains its own status.
- [Task Packages](task-packages/README.md) are authoritative only at their
  declared version and approval state.
- [Claude Cowork Organization](agents/README.md) registers the product roles
  from their imported source definitions.
- [Product Governance](governance/README.md) contains the imported Claude Cowork
  project instructions and the Codex context pack.

The Product Vision/Roadmap and product-side Architecture input are approved
without content changes under PROD-DEC-005. Stack recommendations and proposed
ADRs still require Codex Technical Review. Research evidence remains
subordinate to approved decisions and specifications.

PROD-DEC-009 selects OXS 1.0 for the Phase 0 importer, confirms the authorized
`SXP` to `XSP` wording normalization, and establishes the rights-safe fixture
rule. TASK-THINSLICE-001 v1.1 is the current editorial revision. These product
inputs authorize Technical Design, not implementation.

## Navigation

- [Governance](governance/README.md)
- [Specifications](specifications/README.md)
- [Task Packages](task-packages/README.md)
- [Decisions](decisions/README.md)
- [Research](research/README.md)
- [Architecture Inputs](architecture-inputs/README.md)
- [Reviews and Acceptance](reviews/README.md)
- [Claude Cowork Agents](agents/README.md)
- [Archive](archive/README.md)
- [Source Integration Map](governance/SOURCE_INTEGRATION_MAP.md)

## Task Package Lifecycle

Every Task Package requires a stable ID, explicit version, status, owner,
acceptance criteria, dependencies, evidence requirements, prohibited changes,
reviewers, and Documentation Impact. A changed requirement creates a new
version; history is not silently overwritten. Approval for Codex review does
not imply approval to implement before engineering intake gates pass.

## Claude Cowork and Codex Interaction

The shared lifecycle is defined in `docs/SHARED_WORKFLOW.md`. Product sources
provide intent, scope, constraints, and acceptance. Codex produces technical
review, design, implementation, tests, evidence, and Completion Reports. Claude
Cowork independently returns `VERIFIED` or `REWORK REQUIRED`; no author accepts
its own work.

Use the controlled route in `collaboration/README.md` for every substantive
Claude–Codex communication and artifact transfer, regardless of direct
repository availability. Claude reads the prepared inbox and writes only to its
outbox. Codex validates and is the sole Git writer; transport does not make a
returned artifact canonical or accepted. Chat history is not evidence. Project
Owner manual input is limited to the registered trigger phrases `Codex
finished` and `Claude finished` unless a later explicit owner governance
decision changes the route.

## Acceptance Records

Product and independent acceptance reports belong under `product/reviews/` and
must reference the exact Task Package version, engineering commit or release,
evidence reviewed, reviewer, decision, defects, and required rework.

The first completed record is the
[INIT-002 Independent Acceptance Report](reviews/INIT-002_Independent_Acceptance_Report.md).
Its `VERIFIED` decision is limited to the repository initialization and
governance-integration scope stated by the report and exchange outcome.

## Lifecycle

Update this index whenever a canonical product source, product document class,
role registry, Task Package status, or acceptance route changes. Superseded
documents remain traceable.

## Adding Documents

Classify authority before import, record provenance and checksum where
practical, place the document in exactly one canonical location, update the
appropriate index and traceability, and avoid copying product definitions into
navigation documents.

## Related Sources

- `PROJECT_MANIFEST.md`
- `docs/SOURCE_OF_TRUTH.md`
- `AI_ORGANIZATION.md`
- `docs/SHARED_WORKFLOW.md`
- `collaboration/README.md`
