# TASK-THINSLICE-001 Route-1 Fixture and Workspace Scaffold Review

| Field | Value |
| --- | --- |
| Document ID | AU-REVIEW-TECH-TS001-ROUTE1-001 |
| Title | TASK-THINSLICE-001 Route-1 Fixture and Workspace Scaffold Review |
| Status | `[IMPLEMENTED]`, `[TESTED]`; no implementation acceptance or project `[VERIFIED]` |
| Owner | AU-AGENT-001 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | TASK-THINSLICE-001 v1.1, PROD-DEC-009, Technical Design v1.2.2, `product/reviews/TASK-THINSLICE-001_Design_Revision_Confirmation.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Fixture or generator change; compatibility evidence; workspace boundary; importer implementation; gate disposition |
| Task ID | TASK-THINSLICE-001 / DEP-001-ROUTE-1 |
| Documentation Impact | Material |

## 1. Purpose

Review the permitted post-confirmation work: project-original route-1 OXS
fixtures and a strict non-behavioral workspace scaffold.

## 2. Scope

Included:

- deterministic OXS 1.0 fixture generation;
- coordinate, symbol, empty, unsupported, scale, malformed, and security cases;
- expected canonical and ImportReport records;
- provenance, rights, checksums, source charts, and compatibility evidence;
- private pnpm package boundaries for web, domain, importer, renderer, and
  persistence;
- checks that prohibit runtime files during the scaffold-only stage.

Excluded:

- importer, domain, renderer, persistence, UI, pipeline, or deployment
  implementation;
- dependencies or lockfile-based supply-chain claims;
- arbitrary OXS producer compatibility;
- exact-symbol claims for unknown producer profiles;
- product, release, security, performance, accessibility, or project
  `[VERIFIED]` acceptance.

## 3. Confirmed Evidence

- The official Ursa Software source documents OXS 1.0 as UTF-8 XML and defines
  chart properties, palette items, full-cross stitches, and the mandatory
  `properties`, `fullstitches`, and `backstitches` sections.
- The official `piggies.OXS` was inspected transiently at the already
  registered OQ5-E01 checksum and was not committed. Its 69×73 chart contains
  y=72, which is compatible with zero-based coordinates but does not alone
  prove origin, axes, or index base.
- The project-original minimal fixture is 7×5 with four distinct corner
  symbol/palette pairs and asymmetric interior `(2,3)`.
- The deterministic medium fixture contains exactly 100,000 full crosses, 32
  non-cloth palette entries, a dense region, and a deterministic sparse region.
- Every generated artifact has a SHA-256 in `manifest.json`.
- The workspace contains five private ESM package boundaries and no runtime
  implementation files.

## 4. Gate Disposition

### TD-GATE-001

`[TESTED]`, closed for `Abris Universe Route-1 Fixture Generator 1.0.0`.
Top-left origin, right/down axes, zero base, and non-transposed `x,y` ordering
are proven by the exact source chart and raw XML boundary coordinates.

This does not claim that every OXS producer uses the same convention. The
importer may implement the registered profile and must detect another profile
or reject it; it may not guess an offset, mirror, inversion, or transposition.

### TD-GATE-002

Route-1 evidence is `[TESTED]`: A–E are literal Unicode Basic Latin source
codes with no bundled proprietary font. The overall gate remains `[OPEN]` for
exact-symbol claims about other producers. Deterministic fallback and warning
contracts remain binding.

### Workspace scaffold

`[IMPLEMENTED]`, `[TESTED]`. Package identities and dependency directions are
reserved; runtime implementation remains absent.

## 5. Validation

- `node tests/fixtures/oxs/generate-fixtures.mjs --check`
- `node tests/fixtures/oxs/verify-fixtures.mjs`
- `node scripts/verify-workspace.mjs`
- `pnpm test`
- `xmllint --noout` for all well-formed fixture classes, with expected failure
  for `corrupt-truncated.oxs`
- manifest SHA-256 and deterministic byte comparison

## 6. Findings and Risks

- No blocking finding exists for route-1 fixture generation or scaffolding.
- Producer compatibility remains intentionally narrow; treating the Ursa
  sample as decisive would be an unsupported claim.
- The committed medium fixture is approximately 4.3 MiB; this is intentional
  early scale evidence and remains well below the 64 MiB source limit.
- Importer behavior, canonical hashes, and ImportReport output are expectations
  until executable importer tests exist.

## 7. Documentation Review

AU-AGENT-002 placement, metadata, navigation, terminology, links,
traceability, duplication, and lifecycle checks are required in the same
change. No parallel source of product or architecture truth is introduced.

## 8. Result

The route-1 fixture evidence and workspace scaffold are ready for canonical Git
integration. The registered implementation sequence may proceed to
`domain-core`, followed by the bounded OXS importer. Importer implementation
must preserve the narrow compatibility profile and all remaining gates.

## 9. References

- [Fixture Registry](../../../../tests/fixtures/oxs/README.md)
- [Compatibility Matrix](../../../../tests/fixtures/oxs/COMPATIBILITY_MATRIX.md)
- [Technical Design](../../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Design Revision Confirmation](../../../../product/reviews/TASK-THINSLICE-001_Design_Revision_Confirmation.md)
- [Source of Truth Registry](../../../SOURCE_OF_TRUTH.md)
