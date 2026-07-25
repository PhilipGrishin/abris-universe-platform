# Migration Documentation Index

| Field | Value |
| --- | --- |
| Document ID | AU-MIG-INDEX-001 |
| Title | Migration Documentation Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/DEVELOPMENT_WORKFLOW.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Schema, contract, data volume, deployment order, recovery, or compatibility change |

## Purpose

Index migration plans, validation evidence, backup and recovery procedures, and
historical migration results.

## Scope

No migration exists yet. This index does not define a schema or migration plan.

## Current Migrations

None.

## Owner

AU-AGENT-002 maintains indexing, metadata, links, traceability, and lifecycle.
AU-AGENT-005 owns backend/data migration design, implementation, validation,
backup, recovery, compatibility, and evidence. AU-AGENT-001 approves
cross-system sequencing and architecture; AU-AGENT-003 independently reviews
migration safety evidence.

## Lifecycle

Migration documentation begins before execution and remains after completion as
audit and recovery evidence. Supersession must preserve executed-history links.

## Adding Migrations

Provide reason, source and target versions, data volume, compatibility,
procedure, dry run, validation, backup, failure handling, deployment order,
rollback or recovery, observability, evidence, owners, approvers, traceability,
and Documentation Impact.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Assurance Index](../README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
- [Development Workflow](../../DEVELOPMENT_WORKFLOW.md)
