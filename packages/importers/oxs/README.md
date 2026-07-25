# OXS Importer Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-OXS-001 |
| Title | OXS Importer Workspace |
| Status | `[IMPLEMENTED]` scaffold; importer implementation absent |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-001, `tests/fixtures/oxs/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | TD-GATE-001 or TD-GATE-002 disposition; importer implementation; supported-format contract change |

## Purpose and Scope

Reserve the platform-independent package boundary for bounded OXS 1.0
validation, parsing, canonical mapping, and ImportReport production.

## Current Boundary

This is a non-behavioral scaffold. It contains no parser, format detection,
mapping, heuristic, dependency, or production code. Fixture tooling under
`tests/fixtures/oxs/` is test-data generation and must not be imported as
runtime behavior.

## Lifecycle and Additions

Importer code may begin only after TD-GATE-001 closes. Exact-symbol claims
remain blocked by TD-GATE-002. Additions must preserve original bytes, reject
unsafe XML, avoid network and UI dependencies, keep mapping deterministic, and
provide golden, malformed, limit, compatibility, and regression evidence.

## Related Sources

- [Technical Design](../../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Canonical Pattern ADR](../../../docs/architecture/adr/ADR-TS001-001-canonical-pattern-and-oxs-boundary.md)
- [Route-1 Fixtures](../../../tests/fixtures/oxs/README.md)
- [Pattern Lead Definition](../../../.codex/agents/definitions/au-agent-004-pattern-engine-import-rendering-algorithms-lead.md)
