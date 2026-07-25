# Architecture Documentation Index

| Field | Value |
| --- | --- |
| Document ID | AU-ARCH-INDEX-001 |
| Title | Architecture Documentation Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.4.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/ARCHITECTURE.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Architecture source added or superseded; ADR/RFC lifecycle change; navigation defect |

## Purpose

Index approved architecture documentation and its decision/proposal libraries
without creating or changing architecture.

## Scope

The canonical current overview remains [docs/ARCHITECTURE.md](../ARCHITECTURE.md).
This directory provides scalable navigation for detailed architecture documents,
ADRs, and RFCs when approved sources exist.

## Current Sources

- [Architecture and Repository Assessment](../ARCHITECTURE.md)
- [Technical Design Library](designs/README.md)
- [Architecture Decision Records](adr/README.md)
- [Requests for Comments](rfc/README.md)

The first task-scoped Technical Design Proposal remains `[PROPOSED]` with
independent revision disposition `CONFIRMED_ACCEPTED_WITH_GATES`. Architecture
and AU-AGENT-003 design-only security review are complete. TD-GATE-001 is
`[TESTED]` and closed for the initial route-1 producer profile; TD-GATE-004 is
closed. Canonical domain-core implementation is `[IMPLEMENTED]`, `[TESTED]`.
Exact-symbol claims for other producers, remaining implementation, runtime,
performance, and deployment evidence remain open. These dispositions are not
product or project `[VERIFIED]` acceptance.

## Owner

AU-AGENT-002 maintains structure, metadata, links, terminology, and lifecycle.
AU-AGENT-001 owns architecture meaning and technical approval.

## Lifecycle

Update this index when an architecture source is approved, superseded, archived,
or relocated through an approved change. Never silently move existing sources.

## Adding Documents

Require an approved task, Documentation Impact, content owner, technical
approver, source dependencies, decision references, traceability update, and
documentation review. New architecture meaning requires AU-AGENT-001 approval.

## Related Sources

- [Source of Truth Registry](../SOURCE_OF_TRUTH.md)
- [Documentation Standard](../standards/DOCUMENTATION_STANDARD.md)
- [Decisions](../DECISIONS.md)
