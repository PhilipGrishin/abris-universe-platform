# Domain Core Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-DOMAIN-001 |
| Title | Domain Core Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]` canonical domain contracts |
| Owner | AU-AGENT-001 with assigned domain agents |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-001 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Canonical contract implementation or change; package dependency change; schema version change |

## Purpose and Scope

Reserve the framework-independent package for canonical Pattern, PatternVersion,
Project, ProgressEvent, validation, identity, and version contracts.

## Implemented Boundary

The package implements the Technical Design v1.4.0 canonical types and focused
runtime validation for:

- SourceFile, Pattern, PatternVersion, Grid, SymbolDefinition, PaletteItem, and
  FullCrossStitch;
- Project, ImportJob, ProgressEvent, and rebuildable ProgressState;
- canonical format `1.0.0` and storage schema `1`;
- grid, identity, reference, cloth/thread, one-stitch-per-cell, lifecycle, and
  progress-order invariants; and
- detached validation plus deep freezing of a committed canonical snapshot.

The package has no runtime dependency and contains no OXS parsing, deterministic
import-ID generation, canonical hashing algorithm, storage adapter, renderer,
browser API, client state, or UI behavior. Those remain owned by later
implementation stages.

## Lifecycle and Additions

Add code only from the confirmed Technical Design contract. Public interfaces
require TSDoc, invariant tests, explicit versioning, Documentation Impact, and
AU-AGENT-003 verification evidence before completion. Run:

```sh
pnpm --filter @abris-universe/domain-core typecheck
pnpm --filter @abris-universe/domain-core test
```

## Related Sources

- [Technical Design](../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Canonical Pattern ADR](../../docs/architecture/adr/ADR-TS001-001-canonical-pattern-and-oxs-boundary.md)
- [Source of Truth Registry](../../docs/SOURCE_OF_TRUTH.md)
