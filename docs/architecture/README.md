# Architecture Documentation Index

| Field | Value |
| --- | --- |
| Document ID | AU-ARCH-INDEX-001 |
| Title | Architecture Documentation Index |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-20 |
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
- [Architecture Decision Records](adr/README.md)
- [Requests for Comments](rfc/README.md)

No detailed product or system architecture document is present.

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
