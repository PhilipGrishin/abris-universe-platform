# Web Client Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-WEB-001 |
| Title | Web Client Workspace |
| Status | `[IMPLEMENTED]` scaffold; runtime implementation absent |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Client implementation; workspace boundary change; platform change; public contract change |

## Purpose and Scope

Reserve the approved Phase 0 web-client package boundary. This directory will
own presentation, interaction, accessibility, client state, and integration
with public importer, renderer, and persistence contracts.

## Current Boundary

This is a non-behavioral scaffold. It contains no application entry point,
dependency, UI, product behavior, API bypass, importer logic, rendering
algorithm, persistence implementation, or deployment configuration.

## Lifecycle and Additions

AU-AGENT-006 adds client code only after its upstream contracts and task gates
permit implementation. Every addition must preserve UI/business separation,
declare Documentation Impact, add proportionate tests, and route engineering
evidence to AU-AGENT-003.

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../docs/SOURCE_OF_TRUTH.md)
- [Client Lead Definition](../../.codex/agents/definitions/au-agent-006-mobile-web-client-lead.md)
