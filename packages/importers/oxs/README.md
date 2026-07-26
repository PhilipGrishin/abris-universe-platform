# OXS Importer Workspace

| Field | Value |
| --- | --- |
| Document ID | AU-WORKSPACE-OXS-001 |
| Title | OXS Importer Workspace |
| Status | `[IMPLEMENTED]`, `[TESTED]` bounded route-1 importer core; integrated through the client-owned Worker within the declared Phase 0 profile |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.3.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-26 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, ADR-TS001-001, `tests/fixtures/oxs/README.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | TD-GATE-001 or TD-GATE-002 disposition; importer implementation; supported-format contract change |

## Purpose and Scope

Reserve the platform-independent package boundary for bounded OXS 1.0
validation, parsing, canonical mapping, and ImportReport production.

## Implemented Boundary

The package implements:

- strict UTF-8 and OXS 1.0 detection;
- non-DOM, non-network, chunk-fed SAX parsing with DTD, processing-instruction,
  structure, depth, element, attribute, metadata, extension, palette, stitch,
  unsupported-object, grid, byte, and memory controls;
- explicit acceptance of only the registered
  `Abris Universe Route-1 Fixture Generator 1.0.0` coordinate profile;
- canonical Pattern, PatternVersion, PaletteItem, SymbolDefinition, and
  FullCrossStitch mapping through `@abris-universe/domain-core`;
- collision-safe SHA-256-derived imported IDs and deterministic canonical
  content hashing;
- unsupported-content and source-progress warnings without converting source
  `marked` state into ProgressEvent;
- bounded user-safe ImportReport diagnostics that contain no raw XML;
- a runtime ImportReport validator with explicit total, issue, field, detail,
  scalar, count, and hash bounds for the persistence boundary; and
- deterministic generated-symbol fallback for source-code collisions.

Runtime dependencies are pinned to `saxes` 6.0.0 (ISC) and
`@noble/hashes` 2.2.0 (MIT). The importer package is platform-independent and
has no DOM, network, storage, renderer, client, or UI dependency.

## Remaining Boundaries

Only the project-original route-1 producer profile is accepted. Other producer
coordinates are rejected rather than guessed. Exact symbol evidence is limited
to the route-1 generator's literal project-original Unicode source codes.

The pure importer package deliberately contains no Worker, storage, renderer,
or UI dependency. The current web client invokes it through a dedicated module
Worker and separately owns cancellation, transferable-byte messaging,
SourceFile Blob persistence, atomic canonical commit, tile construction, and
user-safe errors. Those integration behaviors are not package-internal
capabilities and must be evidenced through the client and persistence records.

## Verification

```sh
pnpm --filter @abris-universe/oxs-importer typecheck
pnpm --filter @abris-universe/oxs-importer test
```

The focused suite covers golden minimal/medium/empty cases, exactly 100,000
stitches, deterministic IDs/hashes, registered rejection fixtures, unsupported
content, `marked` isolation, structural and reference failures, symbol
collision fallback, unknown producer rejection, invalid UTF-8, and reduced
adversarial parser budgets. Accepted, rejected, and malformed ImportReport
validation is covered explicitly.

## Lifecycle and Additions

New producer profiles require separate coordinate and lawful symbol evidence.
Additions must preserve original bytes, reject unsafe XML, avoid network and UI
dependencies, keep mapping deterministic, and extend golden, malformed, limit,
compatibility, and regression evidence.

## Related Sources

- [Technical Design](../../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Canonical Pattern ADR](../../../docs/architecture/adr/ADR-TS001-001-canonical-pattern-and-oxs-boundary.md)
- [Route-1 Fixtures](../../../tests/fixtures/oxs/README.md)
- [Pattern Lead Definition](../../../.codex/agents/definitions/au-agent-004-pattern-engine-import-rendering-algorithms-lead.md)
