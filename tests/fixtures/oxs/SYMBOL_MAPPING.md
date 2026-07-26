# OXS Route-1 Symbol Mapping Evidence

| Field | Value |
| --- | --- |
| Document ID | AU-CAP-OXS-SYMBOL-001 |
| Title | OXS Route-1 Symbol Mapping Evidence |
| Status | `[TESTED]` for route-1 source codes; general producer mapping `[OPEN]` |
| Owner | AU-AGENT-004 with AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.1.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `README.md`, `generated/minimal-full-cross.oxs`, TD-GATE-002 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Symbol source code, glyph policy, font asset, producer profile, collision rule, or accessibility contract change |

## Purpose and Scope

Prove the source-code meaning and lawful rendering boundary for the
project-original route-1 fixture without asserting proprietary or unknown OXS
symbol semantics.

## Mapping

| Source code | Unicode scalar | Fixture role | Rendering evidence |
| --- | --- | --- | --- |
| `A` | U+0041 | top-left | Literal Basic Latin character |
| `B` | U+0042 | top-right | Literal Basic Latin character |
| `C` | U+0043 | bottom-left | Literal Basic Latin character |
| `D` | U+0044 | bottom-right | Literal Basic Latin character |
| `E` | U+0045 | asymmetric interior | Literal Basic Latin character |

The medium route-1 fixture extends the same project-original literal mapping to
`A`–`Z` and `a`–`f` (U+0041–U+005A and U+0061–U+0066). These 32 source values
are generator-authored Unicode characters, not proprietary glyph indices.

The fixture embeds literal Unicode source codes, not a proprietary font index.
No font file, vendor glyph, or third-party asset is copied or distributed.
Client rendering may use the platform font stack while canonical identity
preserves the literal source code. Pixel-identical font appearance is not
claimed.

## Gate Boundary

Route-1 symbol evidence and importer tests are complete for the generator's
literal `A`–`Z` and `a`–`f` code set. TD-GATE-002 remains `[OPEN]` for
exact-symbol claims about other producer profiles. Unknown numeric codes,
proprietary fonts, or cross-palette collisions must use the Technical Design
warning and deterministic fallback rules rather than an invented glyph
mapping.

## Lifecycle and Additions

Register each additional producer/version with source checksum, source-code
encoding, font or glyph rights evidence, collision behavior, and a reviewed
rendering result. Do not broaden this mapping by inference.

## Related Sources

- [Fixture Registry](README.md)
- [Compatibility Matrix](COMPATIBILITY_MATRIX.md)
- [Technical Design](../../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
