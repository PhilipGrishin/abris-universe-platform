# OXS Coordinate Compatibility Matrix

| Field | Value |
| --- | --- |
| Document ID | AU-CAP-OXS-COORD-001 |
| Title | OXS Coordinate Compatibility Matrix |
| Status | `[TESTED]` for the route-1 generator profile; other producers `[OPEN]` |
| Owner | AU-AGENT-004 |
| Technical Approver | AU-AGENT-001 |
| Version | 1.0.0 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `README.md`, `source-charts/minimal-full-cross.txt`, `manifest.json`, TD-GATE-001 |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Producer, producer version, coordinate evidence, OXS version, mapping rule, or compatibility result change |

## Purpose and Scope

Record evidence for origin corner, axis directions, index base, and axis
ordering without generalizing one producer profile to all OXS producers.

## Compatibility Records

| Producer profile | OXS | Fixture/evidence | Origin | X | Y | Base | Axis order | Result |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- |
| Abris Universe Route-1 Fixture Generator 1.0.0 | 1.0 | `minimal-full-cross.oxs` and exact ASCII source chart | top-left | right | down | 0 | `x,y`, not transposed | `[TESTED]`; accepted initial profile |
| Ursa Software 2021 | 1.0 | Official transient `piggies.OXS`, SHA-256 `19dbeac548730070c544d6676348e2045ae95bd21137ebb3b8f778cf720e9b05` | Not proven by sample alone | Not proven | Not proven | Compatible with 0; not dispositive | Not proven | `[OPEN]`; vendor file not committed |
| Other producers | Unknown | No registered evidence | Unknown | Unknown | Unknown | Unknown | Unknown | `[OPEN]`; detect profile or reject, never guess |

## Boundary Evidence

The 7×5 route-1 chart maps visible cells to raw coordinates:

| Visible position | Source code | Palette index | Raw `(x,y)` |
| --- | --- | ---: | --- |
| top-left | A | 1 | `(0,0)` |
| top-right | B | 2 | `(6,0)` |
| bottom-left | C | 3 | `(0,4)` |
| bottom-right | D | 4 | `(6,4)` |
| asymmetric interior | E | 5 | `(2,3)` |

All four corners have distinct symbol/palette pairs. The non-square dimensions
and asymmetric interior point make mirroring, inversion, and transposition
observable.

## Gate Disposition

TD-GATE-001 is `[TESTED]` and closed for the initial route-1 producer profile.
This permits importer implementation against the explicit profile. It does not
authorize a default offset or compatibility claim for Ursa Software or any
other producer. Unknown or conflicting coordinate conventions require a
registered compatibility profile or deterministic rejection.

## Lifecycle and Additions

Add one row per producer/version with the exact file checksum, visible source
chart, boundary coordinates, reviewer, and result. Preserve failed and
superseded profiles.

## Related Sources

- [Fixture Registry](README.md)
- [Minimal Source Chart](source-charts/minimal-full-cross.txt)
- [Technical Design](../../../docs/architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [Capability Matrix Index](../../../docs/assurance/capability-matrices/README.md)
