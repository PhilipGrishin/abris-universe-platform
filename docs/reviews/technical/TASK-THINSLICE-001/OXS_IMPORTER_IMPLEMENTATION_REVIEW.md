# TASK-THINSLICE-001 OXS Importer Implementation Review

| Field | Value |
| --- | --- |
| Document ID | AU-TECHREV-TS001-OXS-001 |
| Title | TASK-THINSLICE-001 Bounded OXS Importer Implementation Review |
| Status | `[IMPLEMENTED]`, `[TESTED]`; independent engineering verification pending |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 at the consolidated implementation gate |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | Technical Design v1.5.0; ADR-TS001-001; domain-core implementation review; route-1 fixture registry |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | OXS parser, limits, mapping, producer profile, canonical hash, dependency, fixture, worker boundary, or AU-AGENT-003 finding change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Record the bounded OXS route-1 importer-core implementation and evidence without
claiming general OXS compatibility, persistence, client integration, security
verification, product acceptance, or project `[VERIFIED]`.

## Scope

The reviewed implementation is `packages/importers/oxs` version 0.1.0. It
accepts only OXS 1.0 produced by the registered
`Abris Universe Route-1 Fixture Generator 1.0.0` coordinate profile and maps
its supported full-cross subset to `@abris-universe/domain-core`.

Other producers are rejected with `OXS_COORDINATE_PROFILE_UNSUPPORTED`.

## Implemented Contracts

- Strict source-size and preflight-memory checks before parsing.
- Fatal UTF-8 decoding and exact OXS 1.0/root/required-section detection.
- Chunk-fed SAX parsing without DOM, network access, stylesheet execution,
  HTML insertion, or script execution.
- DTD/DOCTYPE and non-XML processing-instruction rejection.
- Hard depth, element, attribute, attribute-value, metadata, extension,
  grid-axis, palette, full-cross, unsupported-object, and parsed-memory limits.
- Strict positive grid dimensions and non-negative integer source indices and
  coordinates.
- Unique palette indices, one cloth item at source index zero, thread-only
  stitch references, unique canonical cells, in-bounds coordinates, and
  referential integrity.
- Separate PaletteItem and SymbolDefinition identities.
- Collision-safe SHA-256-derived palette, symbol, and stitch IDs.
- Deterministic canonical content hash independent of instance IDs and
  timestamps.
- Normalized `#RRGGBB`, nullable thread brand, preserved brand code/name, and
  optional valid strand count.
- Unsupported part stitches, backstitches, objects, and extensions remain out
  of canonical full-cross data and are reported as warnings.
- Source `marked` attributes produce `OXS_SOURCE_PROGRESS_IGNORED` and never
  create or mutate Progress data.
- ImportReport diagnostics use bounded codes, locations, and details without
  raw XML.

## Evidence

| Check | Result |
| --- | --- |
| `pnpm typecheck` | `[TESTED]`; strict TypeScript 7.0.2 passes |
| Importer focused suite | `[TESTED]`; 14 passed, 0 failed |
| Full workspace suite | `[TESTED]`; fixture, boundary, domain, and importer suites pass |
| Minimal fixture | `[TESTED]`; all five asymmetric/corner mappings and expected normalized stitch hash match |
| Medium fixture | `[TESTED]`; 100,000 stitches, 33 palette items, 32 symbols, and expected normalized stitch hash match |
| Registered negative fixtures | `[TESTED]`; malformed XML, DTD, duplicate palette, invalid reference, out-of-bounds coordinate, and oversized grid return exact expected codes |
| Determinism | `[TESTED]`; imported IDs and canonical content hash are stable while instance IDs remain independent |
| Dependency audit | `[TESTED]`; no known vulnerabilities at audit time |

The medium test duration is only a local regression signal. It is not a
controlled benchmark result and does not close any performance acceptance gate.

## Dependency Review

- `saxes` 6.0.0: ISC, streaming SAX parser, one dependency (`xmlchars`).
- `@noble/hashes` 2.2.0: MIT, portable SHA-256 implementation, no runtime
  dependency.
- Both versions are exact in the manifest and integrity-locked by
  `pnpm-lock.yaml`.

`xmlchars` 2.2.0 is the transitive MIT dependency of `saxes`. The production
license inventory contains only MIT and ISC packages. No dependency changes
product meaning.

## Findings and Limitations

- The importer core is designed for execution inside the later client-owned Web
  Worker. Worker creation, cancellation, transferable messaging, and
  `IMPORT_WORKER_UNAVAILABLE` behavior are not implemented in this package.
- Original bytes are represented by SourceFile and its `bytesRef`, but Blob
  retention and atomic persistence are not implemented yet.
- Canonical tile construction is not part of this stage.
- Only the registered route-1 coordinate profile is accepted.
- Literal-symbol evidence covers the project-original route-1 generator code
  set. Exact-symbol claims for other producers, fonts, or proprietary mappings
  remain blocked by TD-GATE-002.
- AU-AGENT-003 has not issued consolidated implementation verification.

## Documentation Result

The Technical Design mapping now uses the official OXS `charttitle` attribute,
correcting the earlier `title` label without changing product meaning or
architecture. Package, task, status, risk, traceability, capability, changelog,
and handoff records identify the implemented and remaining boundaries. No
Documentation Exception is required.

## Next Step

Implement the IndexedDB persistence and recovery contracts. Integrate the
importer core into a dedicated Web Worker only during the later client stage;
do not introduce a UI-thread fallback.

## References

- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Canonical Pattern ADR](../../../architecture/adr/ADR-TS001-001-canonical-pattern-and-oxs-boundary.md)
- [Domain Core Review](DOMAIN_CORE_IMPLEMENTATION_REVIEW.md)
- [Route-1 Fixture Registry](../../../../tests/fixtures/oxs/README.md)
- [OXS Importer Package](../../../../packages/importers/oxs/README.md)
- [Official OXS 1.0 Format](https://www.ursasoftware.com/OXSFormat/)
