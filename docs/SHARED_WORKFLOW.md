# Shared Product-to-Engineering Workflow

| Field | Value |
| --- | --- |
| Document ID | AU-WORKFLOW-SHARED-001 |
| Title | Shared Product-to-Engineering Workflow |
| Status | `[APPROVED]` |
| Owner | AU-CODEX-PRIMARY / Delivery, Documentation & Codex Coordination Lead |
| Technical Approver | Project Owner |
| Version | 1.1.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `product/README.md`, `docs/DEVELOPMENT_WORKFLOW.md`, `collaboration/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Product-to-engineering lifecycle change; artifact path change; acceptance model change; approved automation |

## Purpose

Define the shared, repository-based lifecycle from product discovery through
independent acceptance without merging product and engineering authority.

## Scope

This document routes artifacts and statuses. Product requirements remain in the
product contour; technical decisions and evidence remain in the engineering
contour.

## Lifecycle

```text
Product discovery
  -> product decision
  -> versioned Task Package
  -> engineering intake
  -> Technical Review
  -> Technical Design
  -> implementation
  -> tests and evidence
  -> Completion Report
  -> Claude independent review
  -> VERIFIED or REWORK REQUIRED
```

Clarification, Conflict, or Technical Alternative records may pause the flow and
return the affected question to its authorized owner.

## Artifact Routing

| Artifact | Canonical repository class | Authority |
| --- | --- | --- |
| Product decisions and owner decisions | `product/decisions/` | Project Owner / Claude Cowork |
| Versioned Task Packages | `product/task-packages/` | Product owner identified by the package |
| Technical Reviews | Task-scoped engineering review path registered when the first artifact exists | AU-AGENT-001 or assigned engineering reviewer |
| Technical Designs | `docs/architecture/rfc/` or a task-scoped design source registered in `docs/SOURCE_OF_TRUTH.md` | AU-AGENT-001 / assigned technical owner |
| Clarification and Conflict Reports | Task-scoped engineering review path, referenced by the affected Task Package and decision log | Author records evidence; authorized product or technical owner decides |
| Completion Reports | Task-scoped engineering report path registered when the first artifact exists | AU-AGENT-001 consolidates engineering evidence |
| Acceptance Reports | `product/reviews/` | Independent Claude Cowork reviewer |
| Engineering ADRs | `docs/architecture/adr/` | Assigned technical owner and approver |
| Traceability | `docs/TRACEABILITY_MATRIX.md` | AU-AGENT-002 maintains mappings; source owners retain meaning |

No empty artifact directories are created in advance. The first real artifact
establishes its task-scoped path and index under the Source of Truth rules.

## State Rules

- `[IMPLEMENTED]` means present in project artifacts or code.
- `[TESTED]` requires stated verification evidence.
- `[VERIFIED]` requires independent Claude Cowork acceptance.
- `REWORK REQUIRED` is an acceptance outcome requiring a new engineering cycle.
- No author independently verifies its own result.

## Documentation Impact

Every Task Package, Technical Design, Technical Review, and Completion Report
declares `Documentation Impact` as `None`, `Minor`, `Material`, or `Breaking`.
Non-`None` impact requires a documentation result or an approved registered
exception before completion.

## GitHub Use

GitHub stores versioned artifacts, review history, commits, and future pull
requests. Branch protection, Issues, labels, Actions, automated intake, and
agent API automation remain `[PROPOSED]` and are not enabled by this document.

AU-CODEX-PRIMARY is the sole Git writer and GitHub operator for artifacts
returned by Claude. Claude does not commit, push, merge, or directly edit the
canonical repository.

## Local Bridge Route

When Claude lacks reliable repository access, use the canonical twelve-step
exchange lifecycle in `collaboration/README.md`. It covers task identification,
versioned exact-commit packaging, bounded Claude read/write access, return
validation, authorized meaning review, AU-AGENT-002 placement, Codex-only branch
and Git integration, provenance archive, and traceability/status updates.
Generated and external bridge copies are non-canonical transport state. Invalid
output never enters staging, and valid staging never implies integration or
acceptance.

## Owner, Lifecycle, and Additions

Product and engineering owners jointly maintain routing through their separate
authority. AU-AGENT-002 maintains links and traceability. Update this workflow
only through an approved governance decision and keep artifact indexes current.

## Related Sources

- `product/README.md`
- `docs/DEVELOPMENT_WORKFLOW.md`
- `AI_ORGANIZATION.md`
- `docs/SOURCE_OF_TRUTH.md`
- `collaboration/README.md`
