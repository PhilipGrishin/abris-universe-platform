# Engineering Review Checklist Index

| Field | Value |
| --- | --- |
| Document ID | AU-CHECK-INDEX-001 |
| Title | Engineering Review Checklist Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/DEVELOPMENT_WORKFLOW.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Review gate, requirement, risk, standard, or architecture change |

## Purpose

Index reusable review checklists derived from approved requirements, standards,
risks, and architecture.

## Scope

No product-domain checklist exists yet. The mandatory documentation checks are
defined by the Documentation Standard and Documentation Review Report template.
The cross-cutting engineering quality checks are defined by the AU-AGENT-003
operating definition and Engineering Verification Report template.

## Current Checklists

- Documentation validation gate in
  `docs/standards/DOCUMENTATION_STANDARD.md`.
- Engineering verification scope in
  `.codex/agents/definitions/au-agent-003-engineering-quality-devsecops-security-lead.md`
  and its evidence capture in `docs/reviews/engineering/TEMPLATE.md`.

## Owner

AU-AGENT-002 owns indexing and cross-reference consistency. Technical and quality
owners approve checklist coverage and meaning.

## Lifecycle

Review checklists whenever an input requirement, standard, risk, architecture
constraint, or failure mode changes. A checklist cannot be the only source of a
requirement.

## Adding Checklists

Provide the review purpose, triggering gate, canonical requirement references,
owner, approver, expected evidence, failure disposition, traceability, and
Documentation Impact.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Assurance Index](../README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
- [Development Workflow](../../DEVELOPMENT_WORKFLOW.md)
- [Engineering Verification Reports](../../reviews/engineering/README.md)
