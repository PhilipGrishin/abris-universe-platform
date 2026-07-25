# Documentation Review Registry

| Field | Value |
| --- | --- |
| Document ID | AU-DOC-REVIEW-INDEX-001 |
| Title | Documentation Review Registry |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-CODEX-PRIMARY |
| Version | 1.2.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/standards/DOCUMENTATION_STANDARD.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Documentation defect; registered exception; full documentation audit; unresolved source conflict |

## Purpose

Index Documentation Review Reports and Documentation Exceptions with owners,
evidence, remediation, and status.

## Scope

Reports cover duplicated content, broken links, outdated terminology,
inconsistent definitions, missing glossary/ADR/checklist/traceability references,
missing metadata, orphan documents, source conflicts, and lifecycle defects.

## Current Reports and Exceptions

- [INIT-003 Organizational Validation Report](INIT-003_Organizational_Validation_Report.md)
  — full engineering-organization, documentation, Bridge, synchronization, and
  intake-readiness validation with five recorded findings; `[IMPLEMENTED]`,
  `[TESTED]`, `[VERIFIED]` within the exact INIT-003 acceptance scope.

## Owner

AU-AGENT-002 owns review structure, evidence links, routing, and lifecycle. The
relevant product or technical owner owns substantive remediation. AU-AGENT-002
cannot silently change meaning or self-assign `[VERIFIED]`.

## Lifecycle

Reports remain open until every finding is resolved, accepted as risk, deferred
with an owner and trigger, or rejected with evidence. Resolved reports remain
available for audit.

## Adding Reports

Use [TEMPLATE.md](TEMPLATE.md). Assign stable finding IDs, severity, evidence,
affected sources, content owners, remediation, status, and traceability. For a
Documentation Exception, include all exception fields required by the
Documentation Standard.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
- [Traceability Matrix](../../TRACEABILITY_MATRIX.md)
