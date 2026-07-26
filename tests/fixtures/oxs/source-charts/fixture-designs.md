# Route-1 Fixture Source Designs

| Field | Value |
| --- | --- |
| Document ID | AU-TEST-OXS-SOURCE-DESIGNS-001 |
| Title | Route-1 Fixture Source Designs |
| Status | `[IMPLEMENTED]`, `[TESTED]` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `../README.md`, `../manifest.json` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Fixture design, generator, format, gate, or expected-result change |

## Purpose and Scope

Describe the human-reviewable source design for every generated route-1 fixture without duplicating generated XML or expected-result records.

## Designs

- `minimal-full-cross.oxs`: exact 7×5 ASCII chart in `minimal-full-cross.txt`.
- `medium-full-cross.oxs`: 512×256; dense x=0..319 and deterministic sparse x=320..511; exactly 100,000 stitches.
- `unsupported-content.oxs`: one full cross plus one part stitch, one backstitch, and one knot.
- `empty-full-cross.oxs`: valid 3×2 chart with no stitches.
- Rejection fixtures each isolate the named malformed, DTD, reference, duplicate, coordinate, or grid-limit condition.

## Lifecycle and Additions

Change a design only through the deterministic generator, regenerate manifest checksums and expectations, rerun fixture verification, and update the technical review record.

## Related Sources

- [Fixture Registry](../README.md)
- [Fixture Manifest](../manifest.json)
- [Compatibility Matrix](../COMPATIBILITY_MATRIX.md)
