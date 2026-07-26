# TASK-THINSLICE-001 Client Accessibility and Platform Matrix

| Field | Value |
| --- | --- |
| Document ID | AU-CAP-TS001-CLIENT-001 |
| Title | TASK-THINSLICE-001 Client Accessibility and Platform Matrix |
| Status | `[TESTED]` for the listed Chromium/macOS profile; other profiles `[OPEN]` |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Quality Reviewer | AU-AGENT-003 |
| Version | 1.4.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | Technical Design sections 8.4 and 11.2; ADR-TS001-002; implementation commits `1c2bd5d7e83de32471ebe29d50809f42b0244039` and `d69b5c564cf17a042d2bf36ef1a864031e802676`; manual evidence source `470a30a7ea04860c9dacab5ae6edace960ca7d6d` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Browser, OS, viewport, assistive technology, interaction, semantics, color, motion, or source change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose and Scope

Declare only the client platform and accessibility behavior exercised by
retained evidence. This matrix does not change product requirements or infer
support for untested browsers, mobile devices, or assistive technologies.

## Platform Matrix

| Platform | Engine and version | Result | Evidence and limitation |
| --- | --- | --- | --- |
| macOS 26.5.2, MacBook Pro M3 | Chromium/Chrome 150.0.0.0 | `[TESTED]` | Import, OffscreenCanvas Worker rendering, forced main-thread fallback, keyboard Canvas interaction, IndexedDB, Web Locks, reload, grayscale state, and axe audit |
| Other current Chromium desktop platforms | Not run | `[OPEN]` | Capability inference is prohibited |
| Firefox desktop | Not run | `[OPEN]` | No support claim |
| WebKit/Safari desktop | Not run | `[OPEN]` | No support claim |
| Mobile browsers and installed clients | Not run | `[OPEN]` | No support claim |

The current Phase 0 engineering evidence therefore supports only the exact
listed Chromium/macOS profile. Expanding the matrix requires a new
source-qualified row and evidence.

## Accessibility Evidence

- Pinned axe-core 4.10.3 reported zero violations and 37 passing rules on the
  exact source.
- Axe returned one incomplete manual-review group for contrast on elements
  with layered or translucent backgrounds; it is not represented as an
  automated pass.
- The initial audit found missing page `h1`, invalid generic-toolbar ARIA, and
  viewer eyebrow contrast defects. Exact source `1c2bd5d` corrected all three
  before the zero-violation rerun.
- The browser accessibility tree exposes the page heading, imported-project
  summary, named pattern region, named control group, named Canvas image,
  one-based selected-stitch status, and polite save status.
- Native buttons and the Canvas accept keyboard input. The exact browser flow
  exercised zoom, pan, selection, Enter/Space mark toggling, and visible saved
  or read-only state.
- The retained grayscale screenshot keeps stitch symbols visible and distinct
  without relying only on thread color.
- The stylesheet contains the production
  `prefers-reduced-motion: reduce` rule. The benchmark-only reduced-motion
  state disables animation and transition duration for visual inspection.
- Exact clean source `d69b5c5` replaced the remaining translucent header and
  project-summary backgrounds with opaque values and darkened the secondary
  brand text. Axe-core 4.10.3 again reported zero violations and reduced its
  incomplete contrast set from 15 targets to the five toolbar direction
  buttons.
- Manual WCAG contrast calculations disposition every remaining axe target and
  the remediated contextual text: toolbar controls `#f4f1e9` on `#214d49`
  measured 8.37:1; toolbar output on `#183f3c` measured 10.25:1; secondary
  brand text measured 5.23:1; summary labels measured 4.61:1; and summary
  values measured 15.44:1. Each exceeds the 4.5:1 normal-text threshold.
- Rendered DOM inspection recorded the focusable order as home link, file
  input, zoom controls, four pan controls, then the pattern Canvas. This is
  supporting structural evidence only and is not represented as a successful
  physical Tab traversal.

## Manual Accessibility Evidence

At exact clean source `470a30a`, the Project Owner completed a physical
keyboard and macOS VoiceOver session on the declared Chrome/macOS profile.
The retained
[manual evidence artifact](../benchmarks/evidence/TASK-THINSLICE-001/manual-accessibility-470a30a.json)
records:

- a corrected physical Tab traversal in the exact order home link, import
  control, zoom out/in, pan left/up/down/right, and pattern Canvas;
- visible physical focus with no reported order mismatch;
- VoiceOver names and roles for the home link, import control, six viewer
  controls, and named Canvas;
- the spoken Canvas pattern name, 512×256 summary, 100,000-stitch count, and
  keyboard instructions;
- physical Canvas ArrowRight and Plus operation;
- spoken selected-stitch coordinate, symbol, color, marked/unmarked state,
  `Saving…`, and `Saved locally`.

The initial attempt after clicking the middle project-summary region and its
Option+Tab repeat both started at `Zoom out`. They are retained as rejected
full-document methods because the click established the sequential-focus
starting point after the header. The valid pass-candidate used page reload and
no content click before physical Tab traversal. The correction is not hidden
or represented as an implementation fix.

The manual evidence is `[TESTED]` and remains a pass-candidate until
AU-AGENT-003 independently reviews its sufficiency and finding disposition.

## Remaining Accessibility Limitations

- The VoiceOver version, exact viewport, and audio output were not
  independently captured.
- The session is Project Owner-confirmed manual evidence, not automated
  screen-reader telemetry.
- Mobile viewport, touch target, browser zoom, forced-colors, and non-Chromium
  accessibility behavior remain unverified.

TS001-IMPL-003 now has the requested manual evidence but is not self-declared
closed. AU-AGENT-003 retains authority over its exact-source disposition.

## Common Mistakes

- Zero axe violations is not equivalent to screen-reader acceptance.
- A grayscale screenshot is not proof of forced-colors support.
- Chromium/macOS evidence must not be generalized to Firefox, Safari, mobile,
  or every desktop OS.
- Visible Canvas pixels do not replace an accessible name and status output.

## Review Checklist

- [x] Exact source, tool version, browser, OS, viewport, and DPR recorded.
- [x] Automated browser accessibility audit retained.
- [x] Keyboard Canvas interactions exercised.
- [x] Accessible names and live status present in the accessibility tree.
- [x] Grayscale/non-color-only visual state retained.
- [x] Reduced-motion rule and evidence state checked.
- [x] Manual screen-reader session completed.
- [x] Reliable corrected physical Tab/focus traversal completed.
- [x] Incomplete contrast targets manually dispositioned with exact ratios.
- [ ] Additional supported browser/platform rows exercised.
- [ ] AU-AGENT-003 independent review of the new manual evidence completed.

## References

- [Raw Evidence Index](../benchmarks/evidence/TASK-THINSLICE-001/README.md)
- [Client Implementation Review](../../reviews/technical/TASK-THINSLICE-001/CLIENT_INTEGRATION_IMPLEMENTATION_REVIEW.md)
- [Capability Matrix Index](README.md)
- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
