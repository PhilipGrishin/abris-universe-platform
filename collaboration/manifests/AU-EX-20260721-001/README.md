# Platform Repository Initialization and Product/Engineering Governance Integration

| Metadata | Value |
|---|---|
| Document ID | AU-COLLAB-EX-20260721-001 |
| Title | Platform Repository Initialization and Product/Engineering Governance Integration |
| Status | PREPARED |
| Owner | AU-CODEX-PRIMARY |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-21 |
| Last Updated | 2026-07-21 |
| Dependencies | `docs/SOURCE_OF_TRUTH.md`; `collaboration/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Source commit changes; package validation failure; returned acceptance decision |

## Purpose

Register the first controlled Claude–Codex exchange for independent review of
the canonical repository initialization and product/engineering governance
integration.

## Scope

The review uses the exact range `9c85d3d..1ccaace` and the immutable text-source
snapshot registered in `task-manifest.json`. Product content, system
architecture, and implementation behavior are outside this review.

## Owner and Lifecycle

AU-CODEX-PRIMARY prepares, validates, stages, and archives the exchange. The
Quality, Security & Independent Acceptance Lead performs the independent review
without Git access. The record remains `PREPARED` until a schema-valid result is
returned; it is not `VERIFIED` by package preparation.

## Adding Exchange Artifacts

Do not add ad hoc payload files here. Modify `request.json` before preparation,
run the package tool, and let it generate `task-manifest.json`. Claude outputs
must first enter the external outbox and pass validation before any canonical
documentation decision.

## Sources of Truth

- [`docs/SOURCE_OF_TRUTH.md`](../../../docs/SOURCE_OF_TRUTH.md)
- [`collaboration/README.md`](../../README.md)
- [`request.json`](request.json)
- `task-manifest.json` after controlled preparation
