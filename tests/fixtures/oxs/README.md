# OXS Route-1 Fixture Registry

| Field | Value |
| --- | --- |
| Document ID | AU-TEST-OXS-FIXTURE-REGISTRY-001 |
| Title | OXS Route-1 Fixture Registry |
| Status | `[IMPLEMENTED]`, `[TESTED]`; not independently `[VERIFIED]` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | PROD-DEC-009, `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, `docs/SOURCE_OF_TRUTH.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | OXS contract, fixture, generator, compatibility profile, expected result, importer behavior, or rights status change |

## Purpose

Provide project-original, deterministic OXS 1.0 evidence for coordinate,
symbol, unsupported-content, empty-pattern, scale, malformed-input, and security
boundaries without committing vendor samples.

## Scope

The registry covers ten generated OXS fixtures and their expected-result
records. It is test data and test tooling only. It does not implement an
importer, establish behavior for an unknown producer, or provide product,
security, release, or project `[VERIFIED]` acceptance.

## Fixture Set

| Fixture | Purpose | Expected result |
| --- | --- | --- |
| `minimal-full-cross.oxs` | Non-square 7×5 coordinate boundary with four distinct corner pairs and asymmetric interior stitch | Completed |
| `medium-full-cross.oxs` | Exactly 100,000 stitches, 32 non-cloth colors, dense and sparse tile regions | Completed |
| `unsupported-content.oxs` | Full cross plus part stitch, backstitch, and knot | Completed with explicit warnings |
| `empty-full-cross.oxs` | Valid 3×2 chart with zero stitches | Completed with empty-pattern message |
| `corrupt-truncated.oxs` | Truncated XML | Rejected |
| `security-doctype.oxs` | Well-formed XML containing a DTD declaration | Rejected |
| `invalid-palette-reference.oxs` | Stitch references missing palette index | Rejected |
| `duplicate-palette-index.oxs` | Duplicate source palette index | Rejected |
| `out-of-bounds-coordinate.oxs` | Coordinate exceeds the declared grid | Rejected |
| `oversized-declared-grid.oxs` | Axis exceeds the Phase 0 10,000-cell limit | Rejected |

## Evidence Map

For every fixture:

- `generated/` contains the generated OXS bytes;
- `expected/` contains expected canonical fields or `null` for rejection plus
  the expected ImportReport disposition;
- `manifest.json` records byte length and SHA-256;
- `source-charts/` records the human-reviewable source design;
- `generate-fixtures.mjs` is the deterministic generation recipe;
- `PROVENANCE.md` records authorship and the rights boundary.

The medium canonical expectation uses a deterministic normalized-stitch SHA-256
instead of duplicating 100,000 stitch objects in another multi-megabyte file.
This remains an exact golden oracle because the generator order and normalized
encoding are fixed.

## Owner, Lifecycle, and Additions

AU-AGENT-004 owns fixture technical meaning. AU-AGENT-001 accepts coordinate and
mapping evidence. AU-AGENT-002 maintains placement, navigation, and
traceability. AU-AGENT-003 reviews the later importer and test evidence.

Add or change fixtures only through the deterministic generator. Regenerate all
outputs, update expectations and source designs, run `pnpm test`, review
provenance and rights, update the technical review and traceability, and never
commit a vendor sample without separately registered authority.

## Related Sources

- [Fixture Provenance](PROVENANCE.md)
- [Compatibility Matrix](COMPATIBILITY_MATRIX.md)
- [Symbol Mapping](SYMBOL_MAPPING.md)
- [Fixture Source Designs](source-charts/fixture-designs.md)
- [Technical Design](../../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Source of Truth Registry](../../../docs/SOURCE_OF_TRUTH.md)
