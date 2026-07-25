# Architecture Decision Record Library

| Field | Value |
| --- | --- |
| Document ID | AU-ADR-INDEX-001 |
| Title | Architecture Decision Record Library |
| Status | `[IMPLEMENTED]` |
| Owner | AU-AGENT-002 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.6.0 |
| Created | 2026-07-20 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/DECISIONS.md`, `docs/SOURCE_OF_TRUTH.md`, `.codex/AGENT_REGISTRY.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | ADR added, approved, rejected, or superseded; decision index conflict; broken reference |

## Purpose

Maintain the indexed library for consequential technical decisions that require
durable context, alternatives, consequences, risks, migration, and rollback.

## Scope

Existing governance decisions remain in [docs/DECISIONS.md](../../DECISIONS.md).
No existing decision is moved or rewritten. Task-scoped architecture decisions
use this library and retain their own approval lifecycle.

## Current Records

| ADR | Title | Status | Task |
| --- | --- | --- | --- |
| [ADR-TS001-001](ADR-TS001-001-canonical-pattern-and-oxs-boundary.md) | Canonical Pattern and OXS Boundary | `[PROPOSED]`; independent disposition `ACCEPTED_WITH_GATES` | TASK-THINSLICE-001 |
| [ADR-TS001-002](ADR-TS001-002-tiled-canvas-rendering.md) | Tiled Canvas2D Rendering | `[PROPOSED]`; independent disposition `ACCEPTED_WITH_GATES` | TASK-THINSLICE-001 |
| [ADR-TS001-003](ADR-TS001-003-indexeddb-progress-event-log.md) | IndexedDB and Local Progress Event Log | `[PROPOSED]`; independent disposition `ACCEPTED_WITH_GATES` | TASK-THINSLICE-001 |
| [ADR-TS001-004](ADR-TS001-004-web-workspace-and-cloudflare-delivery.md) | Web Workspace and Cloudflare Delivery | `[PROPOSED]`; independent disposition `ACCEPTED_WITH_GATES` | TASK-THINSLICE-001 |

The independent pre-implementation architecture review is registered at
`product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md`.
AU-AGENT-003 design-only security review is registered at
`docs/reviews/engineering/TASK-THINSLICE-001_SECURITY_DESIGN_VERIFICATION.md`
with status `VERIFIED WITH FINDINGS`. The ADRs remain `[PROPOSED]` until their
recorded evidence gates complete; neither review authorizes implementation or
assigns project `[VERIFIED]`.

DEC-001 through DEC-004 and later governance decisions remain in
`docs/DECISIONS.md` and are not duplicated here.

## Owner

AU-AGENT-002 owns indexing, metadata, references, and supersession links.
AU-AGENT-001 owns technical decision approval routing. AU-AGENT-004 may author
Pattern Engine domain ADRs and owns their domain technical proposal; it cannot
override AU-AGENT-001 system architecture decisions. AU-AGENT-005 may author
backend, data, API, storage, synchronization, migration, backup, and recovery
ADRs under the same approval boundary. AU-AGENT-006 may author client
architecture, state, navigation, integration, offline, accessibility, and
client-performance ADRs under the same approval boundary.

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
