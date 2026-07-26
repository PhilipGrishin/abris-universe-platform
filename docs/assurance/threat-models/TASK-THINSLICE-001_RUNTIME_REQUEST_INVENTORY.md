# TASK-THINSLICE-001 Runtime Request Inventory

| Field | Value |
| --- | --- |
| Document ID | AU-SEC-TS001-RUNTIME-001 |
| Title | TASK-THINSLICE-001 Runtime Request Inventory |
| Status | `[IMPLEMENTED]`, `[TESTED]` locally and in measured browser profile; production assertion `[OPEN]` |
| Owner | AU-AGENT-006 |
| Technical Approver | AU-AGENT-001 |
| Security Reviewer | AU-AGENT-003 |
| Version | 1.1.0 |
| Created | 2026-07-26 |
| Last Updated | 2026-07-26 |
| Dependencies | Technical Design v1.5.2 section 12; Threat Model v1.3.0 TM-017 and TM-019; static control commit `35bbb34bdeb5c4133de88e4edea36762281a65ca`; measured browser source `37e657eb6571c525154e07ed225d6b877358fb99` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Client network API, asset, Worker, analytics, telemetry, CSP, hosting, or error-reporting change |
| Task ID | TASK-THINSLICE-001 |
| Documentation Impact | Material |

## Purpose

Define the minimum permitted Phase 0 runtime request surface and preserve the
local-only pattern-data boundary. The measured browser resource inventory does
not replace production response verification.

## Runtime Request Surface

| Initiator | Request | Purpose | Pattern-derived data permitted |
| --- | --- | --- | --- |
| Browser navigation | `GET /` or another same-origin SPA path | Load the application shell through static-asset fallback | None |
| HTML parser | `GET /assets/<content-hash>.js` | Load the application module | None |
| HTML parser | `GET /assets/<content-hash>.css` | Load application styles | None |
| Application runtime | `GET /assets/import.worker-<content-hash>.js` | Create the dedicated same-origin import Worker | None |
| External smoke tooling only | `GET /version.json` | Read non-secret build provenance | None |

There are no remote fonts, images, analytics, error-reporting transports,
backend APIs, WebSockets, Server-Sent Events, or product-data upload endpoints.
The client does not fetch `version.json`; it is reserved for operational smoke
tooling.

## Script-Initiated Connection Inventory

Application source contains no `fetch`, `XMLHttpRequest`, `WebSocket`,
`EventSource`, or `sendBeacon` call. The import module uses `new Worker(...)`,
which is controlled by `worker-src 'self'`, not `connect-src`.

The implemented Content Security Policy therefore uses:

```text
connect-src 'none'
```

Adding any script-initiated connection invalidates this inventory and requires
technical and security review before merge.

## Pattern-Data Boundary

- Imported OXS bytes remain in the browser Worker and IndexedDB boundary.
- Canonical Pattern, Project, ProgressEvent, filenames, titles, symbols,
  palette values, coordinates, and diagnostics must not appear in a request
  URL, body, header, remote log, analytics record, or telemetry record.
- Opt-in engineering console records contain bounded timings and aggregate
  stitch/tile counts only. They have no transport and are not enabled by
  default.
- Wrangler CLI telemetry is disabled by repository scripts. It is a build-tool
  concern and never receives browser pattern data.

## Implemented Controls and Evidence

- Static build verification fails if a prohibited browser network API appears
  in `apps/web/src`.
- Static and Wrangler bundles are scanned for registered credential markers.
- The Worker accepts only `GET` and `HEAD`; other methods return `405` before
  the asset binding.
- CSP is `default-src 'self'` with `connect-src 'none'`,
  `worker-src 'self'`, `object-src 'none'`, `base-uri 'none'`,
  `form-action 'none'`, and `frame-ancestors 'none'`.
- Local workerd exact-source smoke at commit `35bbb34` returned `200` for the
  application shell, SPA fallback, and `version.json`; returned `405` for
  `POST`; and served the reviewed CSP, `nosniff`, and no-referrer headers.
- Unit tests assert the Worker header and method boundary.
- The source-qualified browser benchmark exercised minimal and medium import,
  corrupt rejection, history creation, and reload. Its complete Resource Timing
  surface contained only the registered same-origin benchmark, shared
  application chunks, and import Worker; no external origin appeared.
- The interactive application surface contained only its same-origin hashed
  script, stylesheet, and render Worker.

## Remaining Evidence

The implementation-runtime portion of TS001-SEC-002 is tested for the measured
Chromium/macOS profile. Before production promotion, assert this inventory and
the reviewed headers against the authorized production URL, and block
promotion on any unexpected request or pattern-derived value. Broader browser
coverage remains coupled to the client platform matrix.

## Lifecycle

AU-AGENT-006 owns client request meaning and evidence. AU-AGENT-001 approves
the technical boundary. AU-AGENT-003 independently reviews completeness and
findings. AU-AGENT-002 maintains navigation and traceability without changing
the inventory meaning.

## References

- [Threat Model](TASK-THINSLICE-001_THREAT_MODEL.md)
- [Threat Model Index](README.md)
- [Technical Design](../../architecture/designs/TASK-THINSLICE-001_TECHNICAL_DESIGN.md)
- [CI and Deployment Rehearsal](../../reviews/technical/TASK-THINSLICE-001/CI_AND_DEPLOYMENT_REHEARSAL.md)
- [Browser Persistence and Runtime Review](../../reviews/technical/TASK-THINSLICE-001/BROWSER_PERSISTENCE_AND_RUNTIME_REVIEW.md)
- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
