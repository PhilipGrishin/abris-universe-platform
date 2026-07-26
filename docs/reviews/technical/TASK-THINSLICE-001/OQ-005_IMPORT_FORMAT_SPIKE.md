# OQ-005 Import-Format Spike

| Field | Value |
| --- | --- |
| Document ID | AU-SPIKE-OQ-005-001 |
| Title | OQ-005 Import-Format Spike for TASK-THINSLICE-001 |
| Status | `[IMPLEMENTED]`, `[TESTED]`; recommendation accepted by PROD-DEC-009 |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `product/task-packages/07_TaskPackage_EP01_ThinSlice.md` v1.0 exact review source, `product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md` current editorial revision, `product/decisions/05_Decision_Log.md` PROD-DEC-006 and PROD-DEC-009, `product/architecture-inputs/02_Architecture_and_Stack.md` section 9.5 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Product clarification; new licensed representative fixture; official format specification change; candidate-set change |

## Review Identity

- **Task:** TASK-THINSLICE-001 / AU-CDX-TASK-001 v1.0
- **Question:** OQ-005, concrete first structured import format
- **Confirmed criterion:** Minimal parsing complexity while remaining
  representative of real user files
- **Documentation Impact:** Material
- **Execution boundary:** Evidence gathering only; no importer or application
  code was created

## Method

Two real vendor-distributed candidate files were inspected without executing
their Windows applications:

1. the official Ursa Software OXS sample linked from the published OXS
   specification; and
2. `Turtle.xsp`, distributed inside the official Cross Stitch Professional
   Platinum demo package.

Official vendor documentation was used to establish format identity,
interoperability, and parsing constraints. Files remained transient and were
not committed because redistribution authority has not been established.

## Evidence

| Evidence ID | Candidate | Provenance | Observed result |
| --- | --- | --- | --- |
| OQ5-E01 | OXS 1.0 | `https://www.ursasoftware.com/OXSFormat/piggies.OXS`, linked by the official specification | 148,856-byte UTF-8 XML; SHA-256 `19dbeac548730070c544d6676348e2045ae95bd21137ebb3b8f778cf720e9b05`; XML validation passed |
| OQ5-E02 | OXS 1.0 | Same file, inspected with XML queries | 69×73 grid; 7 non-cloth palette entries; 1,000 full stitches; 1,105 backstitches; 18 ornaments |
| OQ5-E03 | XSP | `Turtle.xsp` extracted without execution from official `xsplatdemo.exe` | 25,942-byte encrypted ZIP-compatible container; SHA-256 `e07b8a8628d8c905cc3b8b7deb7638b5daee39996cabd18854c1232d5afdf804`; contains one encrypted `turtle.xsu` payload |
| OQ5-E04 | XSP | Official XStitch Pro manual, pages 61–63 | Confirms `.xsp` identity, encrypted file handling, proprietary format evolution, and vendor/plugin-based interoperability |
| OQ5-E05 | Format identity | Official Cross Stitch Saga help | Lists XSD as Pattern Maker v4, PAT as PC Stitch v6–10, XSP as Cross Stitch Professional Platinum, and OXS as Open Cross Stitch Format |

The official XSP demo package SHA-256 was
`5dba46fab062c91d9ec1976c854dc35f84f28aaf89d180b71107e71d2461556f`.
It was extracted with `innoextract` and never executed.

## Candidate Comparison

| Criterion | OXS | XSP |
| --- | --- | --- |
| Structured interactive pattern | Yes; documented XML pattern interchange | Yes; native Cross Stitch Professional pattern |
| Real vendor sample inspected | Yes | Yes |
| Public official specification | Yes | No public payload schema found |
| Basic parse path | Standard XML parser with strict security configuration | Encrypted inner payload requires vendor capability or unsupported reverse engineering |
| Phase 0 fields | Grid size, palette, source symbols, full-stitch coordinates are explicit | Cannot be established from the encrypted payload without vendor support |
| Representative complexity | Real pattern also contains out-of-scope stitch classes, exercising explicit rejection/ignore policy | Real native pattern, but contents cannot be independently mapped |
| Forward compatibility | Unknown elements can be ignored under the published contract; original file can be retained | Vendor/version behavior is opaque |
| Security burden | XML limits and XXE/entity controls are required but well understood | Encrypted/proprietary parsing adds unknown attack surface and dependency risk |
| Licensing/fixture readiness | Specification and sample are public, but repository redistribution rights are not stated | Vendor demo permits use in its software; redistribution or reverse-engineering rights are not established |
| Expected implementation complexity | Low to moderate | High and presently indeterminate |

PAT and XSD were considered at the documentation level but were not scored as
sample-backed candidates. Official ecosystem sources confirm they are
structured pattern formats, but no official public schema and no
redistribution-authorized real sample were established during this bounded
spike. Treating undocumented community reverse engineering as authoritative
would violate the evidence and rights controls.

## Findings

### OQ5-F01 — OXS is the lowest-complexity representative candidate

**Status:** `[CONFIRMED]` by PROD-DEC-009

OXS is the only inspected candidate with both a real vendor sample and a public
field-level specification. It directly exposes the Phase 0 grid, palette,
symbol reference, and full-stitch coordinates while also demonstrating how
out-of-scope data may appear in real files.

### OQ5-F02 — `SXP` conflicts with official format identity

**Status:** `[CONFIRMED]` resolved by PROD-DEC-009

The exact review-source Task Package and architecture input said `SXP`.
PROD-DEC-009 confirmed it as a typographical error for `XSP` and authorized the
wording-only normalization in the current product sources.

### OQ5-F03 — rights-safe fixture route is authorized

**Status:** `[CONFIRMED]` authority; fixture production `[OPEN]`

PROD-DEC-009(3) authorizes project-original route-1 fixtures and limits
third-party material to explicitly licensed commitment or transient
cross-validation. The required small, medium, and permitted corrupted
project-original fixtures have not been produced. Each fixture must retain the
authorized authorship or generation record, checksum, golden values, and
permitted transformations.

### OQ5-F04 — OXS source semantics require an explicit mapping contract

**Status:** `[OPEN]` for Technical Design

OXS stores a `symbol` attribute with a palette entry and may embed `marked`
state. Abris Universe must preserve its invariants: Symbol and PaletteItem are
separate canonical entities, and Pattern is separate from Progress. The
importer mapping must not turn the OXS source layout into a canonical 1:1
constraint or silently import source progress.

## Recommendation

**OXS 1.0 is the selected first Phase 0 importer format** under PROD-DEC-009.

The importer scope should accept the documented OXS container, map only the
approved Phase 0 subset, preserve the original file and provenance, and issue
explicit warnings or rejection for unsupported content. The exact mapping,
limits, errors, symbol policy, extension retention, and progress handling
belong in the Technical Design Proposal.

## Decision State

- **Criterion:** `[CONFIRMED]` by PROD-DEC-006
- **Technical recommendation:** `[CONFIRMED]` OXS 1.0 by PROD-DEC-009
- **Concrete product integration:** `[IMPLEMENTED]`
- **DEP-001:** format and authority resolved; route-1 fixtures still `[OPEN]`
- **Importer development:** blocked

## Required Next Evidence

1. Project-original representative OXS fixtures under PROD-DEC-009(3).
2. Technical Design mapping table from OXS fields to canonical entities.
3. Security limits for XML size, depth, attributes, entity/DTD handling,
   coordinate bounds, palette references, and stitch counts.
4. Golden expected canonical Pattern and negative-fixture policy.

## References

- `product/task-packages/07_TaskPackage_EP01_ThinSlice.md`
- `product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md`
- `product/decisions/05_Decision_Log.md`
- `product/architecture-inputs/02_Architecture_and_Stack.md`
- `https://www.ursasoftware.com/OXSFormat/`
- `https://www.ursasoftware.com/OXSFormat/piggies.OXS`
- `https://crossstitchsaga.ru/help_expert.html`
- `https://crossstitchsaga.ru/`
- `https://www.dpsoftware.com/xspro/xspdown2.htm`
- `https://www.dpsoftware.com/manuals/xsplat.pdf`
- `https://www.pcstitch.com/PatternViewer/PatView.aspx`
