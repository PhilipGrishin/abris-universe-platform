# Architecture Decision Record Library

| Field | Value |
| --- | --- |
| Document ID | AU-ADR-INDEX-001 |
| Title | Architecture Decision Record Library |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/DECISIONS.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | ADR added, approved, rejected, or superseded; decision index conflict; broken reference |

## Purpose

Maintain the indexed library for consequential technical decisions that require
durable context, alternatives, consequences, risks, migration, and rollback.

## Scope

Existing governance decisions remain in [docs/DECISIONS.md](../../DECISIONS.md).
No existing decision is moved or rewritten in this phase. New substantial ADRs
may use this library when a Task Package and architecture review require them.

## Current Records

No individual ADR files exist. DEC-001 through DEC-004 remain in
`docs/DECISIONS.md` and are not duplicated here.

## Owner

AU-AGENT-002 owns indexing, metadata, references, and supersession links.
AU-AGENT-001 owns technical decision meaning and approval routing.

## Lifecycle

ADRs are proposed, reviewed, approved or rejected, and explicitly superseded.
History remains available. An ADR index entry never replaces the ADR content.

## Adding ADRs

Use [TEMPLATE.md](TEMPLATE.md). Provide Task ID, Documentation Impact, context,
decision owner, alternatives, consequences, risks, affected modules, migration,
rollback, review evidence, and traceability. Update `docs/DECISIONS.md` with a
reference, not a duplicate decision body.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Architecture Index](../README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
- [Decisions](../../DECISIONS.md)
