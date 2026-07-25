# Product Decision Index

| Field | Value |
| --- | --- |
| Document ID | AU-PROD-DECISION-INDEX-001 |
| Title | Product Decision Index |
| Status | `[IMPLEMENTED]` |
| Owner | Delivery, Documentation & Codex Coordination Lead |
| Technical Approver | Project Owner |
| Version | 1.1.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `product/README.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Owner decision; product conflict; supersession; Task Package change |

## Purpose and Scope

Index product and owner decisions without merging them with engineering ADRs or
`docs/DECISIONS.md`.

## Canonical Register

- [Abris Universe Product Decision Log](05_Decision_Log.md)
  now includes owner-approved Cowork DEC-005 through DEC-008. Use
  `PROD-DEC-xxx` for cross-contour references from DEC-005 onward.

Each decision retains its own status. Recommendations and derived resolutions
must not be presented as owner-approved decisions unless their entry records
that approval.

## Owner, Lifecycle, and Additions

The Project Owner approves decisions that require owner authority. Preserve
superseded entries and link replacements. Add Decision ID, date, context,
options, decision, rationale, status, owner, consequences, review trigger, and
affected Task Packages.

## Related Sources

- `product/specifications/README.md`
- `product/task-packages/README.md`
- `docs/DECISIONS.md`
- `docs/SOURCE_OF_TRUTH.md`
