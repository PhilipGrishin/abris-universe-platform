# Request for Comments Library

| Field | Value |
| --- | --- |
| Document ID | AU-RFC-INDEX-001 |
| Title | Request for Comments Library |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/architecture/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | RFC added or disposition changed; proposal/decision conflict; orphan RFC |

## Purpose

Maintain reviewable proposals for cross-cutting engineering changes before a
binding technical decision or implementation is approved.

## Scope

RFCs capture proposals, evidence, alternatives, compatibility, rollout, and open
questions. They do not change architecture or product behavior by themselves.

## Current Records

None. RFCs will be created only from an approved engineering task.

## Owner

AU-AGENT-002 owns indexing, metadata, navigation, and lifecycle. Proposal authors
own content; AU-AGENT-001 owns technical disposition.

## Lifecycle

RFCs are proposed, reviewed, accepted, rejected, withdrawn, or superseded. An
accepted RFC must link to any required ADR; acceptance does not silently replace
canonical specifications or decisions.

## Adding RFCs

Use [TEMPLATE.md](TEMPLATE.md). Register owners, reviewers, Documentation Impact,
affected sources, alternatives, risks, compatibility, migration, rollback, and
decision outputs. Update traceability and glossary where relevant.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Architecture Index](../README.md)
- [ADR Library](../adr/README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
