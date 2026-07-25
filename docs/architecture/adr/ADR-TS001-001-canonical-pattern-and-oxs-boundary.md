# ADR-TS001-001 — Canonical Pattern and OXS Boundary

| Field | Value |
| --- | --- |
| Document ID | ADR-TS001-001 |
| Title | Canonical Pattern and OXS Boundary |
| Status | `[PROPOSED]`; independent architecture disposition `ACCEPTED_WITH_GATES` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Independent Architecture Review | `AU-EX-20260725-005`; `ACCEPTED_WITH_GATES` |
| Security Review | `AU-REVIEW-ENG-TS001-SEC-001`; `VERIFIED WITH FINDINGS` for design scope |
| Version | 1.1.1 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md`, TASK-THINSLICE-001 v1.1, PROD-DEC-009, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Import format change; canonical model change; OXS coordinate or symbol evidence; new supported stitch type; compatibility failure |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Context

Phase 0 imports OXS 1.0, but the domain model must remain usable by later
importers and must preserve the approved Symbol/PaletteItem and Pattern/Progress
separations.

## Problem

Using OXS elements directly as the application model would couple domain
identity, coordinates, symbols, progress, and unsupported content to one source
format. It would also risk importing OXS `marked` state as user progress and
inventing a thread brand that OXS does not provide.

## Decision

Adopt a versioned, immutable canonical Pattern/PatternVersion independent of
OXS. OXS is a bounded adapter that:

- validates untrusted source bytes;
- maps only the supported full-cross subset;
- creates separate Symbol and PaletteItem records;
- retains the original source bytes and explicit provenance;
- reports unsupported content;
- ignores OXS `marked` for progress purposes;
- normalizes coordinates only through an evidence-backed compatibility rule.
- proves coordinate origin, axes, index base, and transposition with an
  asymmetric non-square fixture; and
- deterministically disambiguates source-code or rendered-glyph collisions
  while preserving the original code and emitting a stable warning.

Canonical coordinates are zero-based/top-left. OXS source-origin and symbol-code
interpretation remain explicit pre-code evidence gates; no heuristic is allowed.

## Alternatives

1. Use the OXS document as the runtime model. Rejected because it couples every
   consumer to one import format and violates canonical-domain intent.
2. Flatten Symbol into PaletteItem. Rejected by an explicit domain invariant.
3. Convert every OXS section into a future-facing generalized stitch model.
   Rejected as unapproved Phase 1 scope.
4. Drop unsupported content. Rejected because it creates silent data loss.

## Consequences

- Importers and the renderer share stable contracts.
- Reimport can create a new PatternVersion while deterministic content remains
  comparable by hash.
- Original bytes carry source fidelity for unsupported sections.
- Coordinate and symbol compatibility evidence is mandatory before importer
  implementation and exact-symbol acceptance.
- Future canonical-format changes require versioning and migration review.

## Risks

- A project-original fixture may reveal producer-specific coordinate behavior.
- Browser glyphs may not reproduce proprietary OXS symbol fonts.
- Source retention increases local storage use.

## Migration

There is no existing application data. Initial records use canonical format
`1.0.0`. Later changes must declare read/write compatibility and a tested
migration; silent database reset is prohibited.

## Rollback

Before production data exists, rollback removes only unreleased code and test
data. After release, the immediately previous client must remain able to read
stored format `1.0.0`; rollback cannot delete SourceFile or ProgressEvent data.

## Affected Modules and Contracts

- `packages/domain-core`
- `packages/importers/oxs`
- `packages/persistence`
- `packages/renderer`
- fixture and compatibility records

## Verification and Evidence

Required evidence includes route-1 coordinate and symbol fixtures, golden
canonical output, deterministic content hashes, malformed/unsupported tests,
source-byte recovery, and architecture review.

## Traceability

- TASK-THINSLICE-001 FR-01, FR-02, sections 14, 18, 19, 22, 27
- PROD-DEC-009
- TRACE-DESIGN-TS001

## Review History

- 2026-07-25: Initial proposal by AU-AGENT-004 within AU-AGENT-001 system
  architecture. Approval pending.
- 2026-07-25: Claude Cowork independent architecture review
  `AU-EX-20260725-005` dispositioned this ADR `ACCEPTED_WITH_GATES`; R-2 and
  R-6 are integrated in version 1.1.0. TD-GATE-001, TD-GATE-002, and
  AU-AGENT-003 security review were open at that review stage.
- 2026-07-25: AU-AGENT-003 report `AU-REVIEW-ENG-TS001-SEC-001` records
  `VERIFIED WITH FINDINGS` for the design-only security scope and closes the
  security-review component of TD-GATE-004. Fixture and implementation evidence
  remain open.
