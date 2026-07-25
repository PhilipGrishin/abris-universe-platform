# OXS Route-1 Fixture Provenance

| Field | Value |
| --- | --- |
| Document ID | AU-TEST-OXS-PROVENANCE-001 |
| Title | OXS Route-1 Fixture Provenance |
| Status | `[CONFIRMED]` project-original authorship; `[TESTED]` generated-byte provenance |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | PROD-DEC-009, `README.md`, `generate-fixtures.mjs`, `manifest.json` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Authorship, license, generator, fixture bytes, external source, or redistribution change |

## Purpose and Scope

Record the authorship, generation, external-reference, and rights status for
the committed OXS route-1 fixtures.

## Provenance

- Every committed `.oxs`, expected JSON record, and source chart in this
  directory was authored by Abris Universe engineering through
  `generate-fixtures.mjs`.
- The generator was written from the public OXS 1.0 field-level specification
  and the approved Technical Design. It does not copy vendor sample content.
- The official Ursa Software `piggies.OXS` sample was inspected transiently for
  format cross-checking and was not committed, transformed into a fixture, or
  used as a source chart.
- `manifest.json` binds every generated artifact to exact bytes and SHA-256.

## Rights and License Statement

These fixtures are project-owned test artifacts authorized for use in the
private Abris Universe repository and its controlled engineering verification
workflow. No public license or external redistribution grant is implied.
Third-party samples remain excluded unless a separate explicit rights record
authorizes their commit.

## Lifecycle and Additions

Any new external input requires a recorded source, checksum, purpose, rights
status, allowed transformations, and disposition before fixture generation.
Never replace project-original data with a vendor file silently.

## Related Sources

- [Fixture Registry](README.md)
- [Fixture Manifest](manifest.json)
- [OXS 1.0 Specification](https://www.ursasoftware.com/OXSFormat/)
- [OQ-005 Spike](../../../docs/reviews/technical/TASK-THINSLICE-001/OQ-005_IMPORT_FORMAT_SPIKE.md)
