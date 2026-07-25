# Technical Design Library

| Field | Value |
| --- | --- |
| Document ID | AU-TD-INDEX-001 |
| Title | Technical Design Library |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.5.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`, `docs/architecture/README.md`, `docs/standards/DOCUMENTATION_STANDARD.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Technical Design added, approved, rejected, superseded, or materially changed; broken navigation; source-hierarchy change |

## Purpose

Index task-scoped Technical Design Proposals and their lifecycle without
duplicating product requirements, ADR decisions, specifications, or evidence.

## Scope

This library contains implementation-facing system designs authored from
approved requirements. A proposal is not implementation evidence, product
acceptance, or project `[VERIFIED]` status.

## Current Designs

| Task | Design | Status | Architecture review |
| --- | --- | --- | --- |
| TASK-THINSLICE-001 | [Phase 0 Thin-Slice Technical Design Proposal](TASK-THINSLICE-001_TECHNICAL_DESIGN.md) | `[PROPOSED]`; independent revision disposition `CONFIRMED_ACCEPTED_WITH_GATES`; security design `VERIFIED WITH FINDINGS` | TD-GATE-001 closed for route-1 profile; TD-GATE-004 closed; scaffold, fixtures, and domain-core `[TESTED]`; TD-GATE-002/003 and remaining implementation evidence `[OPEN]` |

## Owner

AU-AGENT-002 maintains structure, metadata, navigation, consistency, and
lifecycle. AU-AGENT-001 owns system-design meaning and approval. Assigned domain
agents own their domain inputs. Product meaning remains with the Project Owner
and Claude Cowork.

## Lifecycle

A design moves from `[PROPOSED]` to `[APPROVED]` only after its declared review
gate and ADR dispositions complete. Implementation and verification statuses
are recorded separately. Superseded designs remain available with explicit
links in both directions.

## Adding Designs

Every design must identify its exact Task Package and version, owners,
Documentation Impact, confirmed facts, assumptions, open gates, module
boundaries, contracts, security, compatibility, tests, deployment, rollback,
ADRs, and traceability. Update this index, the Source of Truth Registry,
Traceability Matrix, task record, and persistent status in the same change.

## Related Sources

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [Architecture Index](../README.md)
- [ADR Library](../adr/README.md)
- [Engineering Specifications](../../specifications/README.md)
- [Documentation Standard](../../standards/DOCUMENTATION_STANDARD.md)
