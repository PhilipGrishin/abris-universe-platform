# TASK-THINSLICE-001 Technical Design Proposal

| Field | Value |
| --- | --- |
| Document ID | AU-TDP-TS001-001 |
| Title | TASK-THINSLICE-001 Phase 0 Thin-Slice Technical Design Proposal |
| Status | `[PROPOSED]`; independent architecture disposition `ACCEPTED_WITH_GATES`; AU-AGENT-003 security design review `VERIFIED WITH FINDINGS`; evidence gates open |
| Owner | AU-AGENT-001 |
| Technical Approver | AU-AGENT-001 after architecture review; independent product architecture acceptance remains separate |
| Independent Architecture Reviewer | Claude Cowork System Architecture, Data & AI Governance Lead through `AU-EX-20260725-005` |
| Version | 1.2.1 |
| Created | 2026-07-25 |
| Last Updated | 2026-07-25 |
| Dependencies | `product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md`, PROD-DEC-005 through PROD-DEC-010, `docs/reviews/technical/TASK-THINSLICE-001/TECHNICAL_REVIEW.md`, `product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md` |
| Supersedes | None |
| Superseded By | None |
| Review Triggers | Task Package change; architecture-review finding; OXS contract evidence change; canonical-format change; renderer benchmark result; browser-storage compatibility change; Cloudflare deployment contract change; security finding |
| Task ID | TASK-THINSLICE-001 / AU-CDX-TASK-001 v1.1 |
| Documentation Impact | Material |

## 1. Purpose and Decision Boundary

Define the smallest production-oriented technical architecture for the approved
Phase 0 web thin slice:

```text
OXS 1.0 bytes
  -> bounded importer
  -> immutable canonical PatternVersion
  -> tiled symbol renderer
  -> local Project and append-only ProgressEvent
  -> durable IndexedDB commit
  -> static web delivery at abris.653915.com
```

This proposal selects technical mechanisms inside approved product constraints.
It does not change product behavior, authorize application implementation,
create fixtures, claim performance, or assign project `[VERIFIED]`.

Version 1.1.0 integrates the mandatory R-1 through R-8 design findings from
`AU-EX-20260725-005` without changing the returned review meaning. The review
accepted the design and all four task ADRs with gates; it did not assign project
acceptance or authorize implementation while the remaining gates are open.
Version 1.2.0 records the AU-AGENT-003 design-review dispositions for opaque
source staging and same-origin request inventory without changing architecture
or product behavior.
Version 1.2.1 registers the independent `VERIFIED WITH FINDINGS` design-only
security result and closes TD-GATE-004 without changing technical meaning.

## 2. Scope and Non-Scope

### In scope

- OXS 1.0 validation and full-cross mapping;
- original-file retention and import provenance;
- the minimum versioned Pattern domain;
- tiled symbol rendering, zoom, pan, hit testing, and progress overlay;
- one local Project per imported PatternVersion in the Phase 0 flow;
- append-only local progress events and a rebuildable projection;
- IndexedDB persistence and recovery behavior;
- bounded untrusted-XML processing;
- route-1 fixture and evidence plans;
- a static React web client and GitHub-to-Cloudflare delivery design.

### Out of scope

All Task Package section 10 exclusions remain prohibited. In particular, this
design introduces no backend, account, network synchronization, manual backup,
mobile client, highlight engine, statistics, undo/redo, PDF or image import,
fractional stitches, backstitches, knots, beads, or progress export.

Unsupported OXS content is reported and retained in the original source bytes;
it is not converted into hidden Phase 1 behavior.

## 3. Evidence Classification

### Confirmed

- TASK-THINSLICE-001 v1.1 is the current product handoff.
- OXS 1.0 is the selected import format under PROD-DEC-009.
- Symbol and PaletteItem are separate entities.
- Pattern/PatternVersion and Project/ProgressEvent are separate entities.
- Full-cross is the only supported stitch type in this slice.
- The original file must be retained.
- Rendering is tiled from the first slice.
- Storage is local to one browser/device; no backend is required.
- The production target is the existing Cloudflare endpoint
  `https://abris.653915.com`.

### Derived

- The canonical grid needs one explicit coordinate convention independent of
  OXS producer conventions.
- A visible-tile query is the necessary boundary between Pattern storage and
  the renderer.
- Save success must mean an IndexedDB transaction committed, not merely that UI
  state changed.
- A static deploy must remain backward-compatible with browser-local data
  because deployment rollback cannot roll back IndexedDB.

### Open pre-code evidence

| Gate | Required evidence | Owner | Effect |
| --- | --- | --- | --- |
| TD-GATE-001 | Project-original non-square OXS fixture with four distinct corner symbol/palette pairs, one asymmetric interior stitch, and a full coordinate-convention record | AU-AGENT-004 | Blocks importer implementation until origin, axis directions, index base, and transposition behavior are proven |
| TD-GATE-002 | Project-original symbol fixture plus lawful font/glyph mapping evidence | AU-AGENT-004 with AU-AGENT-006 | Blocks claims that rendered symbols match OXS source semantics |
| TD-GATE-003 | Current Cloudflare Worker version ID, route ownership, and recoverable placeholder artifact recorded before first production deploy | AU-AGENT-001 | Blocks production deployment, not local implementation |
| TD-GATE-004 | `AU-EX-20260725-005` architecture disposition integrated; R-1 through R-8 design amendments complete; AU-AGENT-003 report `AU-REVIEW-ENG-TS001-SEC-001` records `VERIFIED WITH FINDINGS` and no mandatory unresolved finding | AU-AGENT-001 and AU-AGENT-003 within their separate authorities | `[TESTED]`, closed at design level; implementation and release verification remain separate |

No source coordinate offset or glyph meaning may be guessed to bypass these
gates.

TD-GATE-004 is closed at the independently reverified source
`b4eaedc0233f1f785beff87968c300d54c449c28`. TD-GATE-001, TD-GATE-002, and
TD-GATE-003 remain open within their recorded scopes.

## 4. Selected System Shape

Use a strict TypeScript pnpm workspace with a React/Vite web SPA. Turborepo may
orchestrate workspace tasks but must not contain domain behavior.

```text
apps/web
  presentation, import flow, viewer controls, accessibility, app state

packages/domain-core
  canonical entities, validation, IDs, version contracts, progress semantics

packages/importers/oxs
  OXS tokenizer/parser, validation, mapping, ImportReport

packages/renderer
  tile addressing, visible-set calculation, Canvas2D drawing, hit testing

packages/persistence
  IndexedDB records, transactions, projections, schema upgrades

tests/fixtures
  project-original OXS inputs, canonical goldens, corrupt cases, generators
```

Dependency direction is one way:

```text
apps/web -> importer / renderer / persistence -> domain-core
```

`domain-core` imports no browser, React, importer, renderer, or persistence
module. The renderer consumes readonly query contracts and never mutates
Pattern or Project. Persistence does not own product semantics. The importer
does not import progress.

Exact package versions and action commit SHAs are implementation decisions
recorded in the lockfile and pipeline review; this proposal does not pre-claim
their security or compatibility.

## 5. Canonical Domain Contract

### 5.1 Versioning and identity

- `canonicalFormatVersion` starts at `1.0.0`.
- `storageSchemaVersion` starts at `1`.
- A `PatternVersion` is immutable after its import transaction commits.
- Reimporting the same bytes may create a new `PatternVersion`; an independent
  `canonicalContentHash` proves deterministic mapped content.
- Imported Symbol, PaletteItem, and Stitch IDs are deterministic
  SHA-256-derived identifiers scoped by the source-file hash and a stable
  source key. Pattern and PatternVersion instance IDs remain independent.
- User-created event IDs use `crypto.randomUUID()` and are stable across
  retries.
- Timestamps are ISO-8601 UTC strings generated at the boundary that owns the
  operation. Instance IDs and timestamps are excluded from
  `canonicalContentHash`.

### 5.2 Required records

```ts
type CanonicalFormatVersion = "1.0.0";
type StitchType = "full-cross";

interface SourceFile {
  id: string;
  originalName: string;
  mediaType: string;
  declaredFormat: "oxs";
  detectedFormatVersion: "1.0" | null;
  byteLength: number;
  sha256: string;
  bytesRef: string | null;
  retentionStatus: "retained" | "deleted-after-failure";
  receivedAt: string;
}

interface Pattern {
  id: string;
  metadata: PatternMetadata;
  grid: Grid;
  paletteItems: readonly PaletteItem[];
  symbols: readonly SymbolDefinition[];
  createdAt: string;
  provenanceRef: string;
}

interface PatternMetadata {
  name: string | null;
  width: number;
  height: number;
  fabric: {
    type: string | null;
    countX: number | null;
    countY: number | null;
    countUnit: "stitches-per-inch" | null;
    clothPaletteItemId: string | null;
  };
}

interface PatternVersion {
  id: string;
  patternId: string;
  canonicalFormatVersion: CanonicalFormatVersion;
  createdAt: string;
  sourceFileId: string;
  importJobId: string;
  canonicalContentHash: string;
  tileSetRef: string;
}

interface Grid {
  width: number;
  height: number;
  origin: "top-left";
  coordinateBase: 0;
  xDirection: "right";
  yDirection: "down";
}

interface SymbolDefinition {
  id: string;
  sourceCode: string;
  visual: SymbolVisual;
}

type SymbolVisual =
  | { kind: "text-code-point"; value: string; fontFamily: string }
  | { kind: "generated"; generatorVersion: 1; ordinal: number };

interface PaletteItem {
  id: string;
  sourceIndex: number;
  role: "cloth" | "thread";
  threadBrand: string | null;
  brandCode: string | null;
  displayName: string | null;
  displayColor: `#${string}`;
}

interface FullCrossStitch {
  id: string;
  type: "full-cross";
  x: number;
  y: number;
  symbolId: string;
  paletteItemId: string;
  strandCount?: number;
}

type Project =
  | {
      id: string;
      patternVersionId: null;
      importJobId: string;
      createdAt: string;
      updatedAt: string;
      status: "importing" | "import_failed";
    }
  | {
      id: string;
      patternVersionId: string;
      importJobId: string;
      createdAt: string;
      updatedAt: string;
      status: "ready";
    };

interface ImportJob {
  id: string;
  sourceFileId: string;
  importerId: "oxs";
  importerVersion: string;
  status:
    | "importing"
    | "completed"
    | "completed_with_warnings"
    | "rejected"
    | "interrupted";
  startedAt: string;
  completedAt: string | null;
  reportRef: string | null;
  warningCodes: readonly string[];
}

interface ProgressEvent {
  schemaVersion: 1;
  id: string;
  projectId: string;
  patternVersionId: string;
  localSequence: number;
  type: "mark" | "unmark";
  targetStitchId: string;
  occurredAt: string;
  deviceId: string;
  source: "user";
}
```

`SymbolVisual` is a versioned tagged union. Phase 0 supports a validated
text/code-point mapping and a deterministic generated fallback. It does not
encode color. A fallback is visible in `ImportReport`; it is never presented as
an exact source glyph.

`ProgressState` is a rebuildable projection:

```ts
type ProgressState = ReadonlyMap<string, "marked" | "unmarked">;
```

Events are ordered by local append sequence, with event ID as the idempotency
key. `deviceId` is a stable installation identifier created with
`crypto.randomUUID()` on first local initialization and retained in database
metadata; it is not an account or cross-origin tracking identifier.
`targetStitchId` is the accepted technical refinement of the Task Package
`targetRef`: the deterministic stitch ID resolves to the exact canonical
coordinate while avoiding coordinate-only ambiguity. No network merge rule or
CRDT is introduced in Phase 0.

`Stitch` is a versioned tagged union. Its Phase 0 member is
`FullCrossStitch`; later stitch members can be added through a canonical-format
version without changing the meaning of `full-cross`.

`Grid.width` and `Grid.height` are authoritative. The same values exposed in
`PatternMetadata` are readonly derived aliases and are not independently
persisted or hashed.

### 5.3 Required invariants

1. `PatternVersion` content cannot change after commit.
2. Every stitch references an existing Symbol and thread PaletteItem.
3. A Symbol may be referenced with different PaletteItems in future versions;
   no uniqueness constraint couples them.
4. A PaletteItem may be referenced with different Symbols in future versions.
5. Canonical coordinates are integers within
   `0 <= x < width` and `0 <= y < height`.
6. At most one Phase 0 full-cross stitch occupies one canonical cell.
7. Cloth is a PaletteItem role but is never a stitch palette reference.
8. Progress references a stable stitch ID and the exact PatternVersion.
9. Source bytes, ImportJob, and ImportReport remain separately addressable.
10. Unknown or unsupported source content never becomes canonical full-cross
    data implicitly.

## 6. OXS 1.0 Import Contract

### 6.1 Pipeline

```text
File selection
  -> byte and UTF-8 checks
  -> worker message with transferable bytes
  -> bounded streaming XML parse
  -> structural and referential validation
  -> OXS-to-canonical mapping
  -> deterministic canonical hash and tiles
  -> staged persistence with one atomic canonical-result commit
  -> ImportReport and Project
```

The browser MIME value is advisory. Detection requires an XML document whose
root is `chart` and whose `properties.oxsversion` is exactly `1.0`.
`properties`, `fullstitches`, and `backstitches` must exist even when their
supported count is zero, as required by the OXS 1.0 structure. A palette must
exist when a supported stitch references it.

The parser must be a non-DOM, non-network streaming parser. Any DOCTYPE or DTD
declaration is rejected. External resource resolution, stylesheet execution,
HTML insertion, and script execution are absent by construction.

### 6.2 Binding mapping

| OXS source | Canonical target | Rule |
| --- | --- | --- |
| `chart/properties/@chartwidth` | `Pattern.grid.width` and metadata width | Strict positive base-10 integer |
| `chart/properties/@chartheight` | `Pattern.grid.height` and metadata height | Strict positive base-10 integer |
| `chart/properties/@title` | `Pattern.metadata.name` | Trim outer whitespace; preserve original in import provenance |
| `@stitchesperinch`, `@stitchesperinch_y` | optional fabric count X/Y | Strict finite positive decimal; absence remains `null` |
| `chart/palette/palette_item/@index` | `PaletteItem.sourceIndex` | Unique non-negative integer |
| palette index `0` | cloth PaletteItem | Never referenced by a supported stitch |
| `@number` | `PaletteItem.brandCode` | Preserve as string; do not infer DMC or a brand |
| `@name` | `PaletteItem.displayName` | Plain text only |
| `@color` | `PaletteItem.displayColor` | Normalize validated six-digit RGB to `#RRGGBB` |
| `@symbol` | `SymbolDefinition.sourceCode` | Preserve opaque source code; visual mapping is separately validated |
| `@strands` | optional stitch strand count | Preserve only when valid; not used to drive Phase 0 behavior |
| `chart/fullstitches/stitch/@x,@y` | `FullCrossStitch.x,y` | Normalize to canonical zero-based coordinates only after TD-GATE-001 proves the source origin |
| `@palindex` | stitch palette reference | Must resolve to a non-cloth PaletteItem |
| `@marked` | no Pattern or Progress field | Report `OXS_SOURCE_PROGRESS_IGNORED`; never create a ProgressEvent |

The format does not supply an authoritative thread brand field. `threadBrand`
therefore remains `null`; treating the number as DMC would invent data.

OXS `partstitches`, `backstitches`, ornaments, knots, beads, blends, and other
out-of-scope sections are counted and reported as unsupported. Their original
bytes remain retained through `SourceFile`. The application must not claim a
complete import when unsupported content is present: the report uses
`completed_with_warnings` and names every skipped category and count.

### 6.3 Coordinate evidence rule

Canonical coordinates are always zero-based/top-left. The official OXS field
listing available to this review did not establish whether all producers write
zero-based or one-based coordinates. The importer therefore has no permitted
default offset yet.

TD-GATE-001 must use a project-original non-square fixture (`width != height`)
with four corner stitches that each use a distinct palette/symbol pair and at
least one asymmetrically placed interior stitch. Export it through the chosen
OXS-compatible producer and compare every raw coordinate with the visible
source chart. The compatibility matrix records origin corner, X direction, Y
direction, index base, axis ordering/transposition, and producer/version. A
mismatch between producers becomes a detected compatibility profile or a
rejected file, not a heuristic.

### 6.4 Symbol evidence rule

The OXS source `symbol` value is preserved as an opaque code. TD-GATE-002 must
prove how the chosen producer's codes map to lawfully distributable browser
glyphs. If exact rendering cannot be proven, import remains possible only with
an explicit symbol-substitution warning and deterministic generated symbols;
the result cannot satisfy the exact-symbol acceptance criterion until product
acceptance dispositions that limitation.

For one OXS source code used with one palette index, the Symbol identity key is
`sourceCode`. If the same source code is used by multiple palette indices, the
lowest source palette index deterministically retains the validated source
visual and each later conflicting use receives a separately generated Symbol
whose identity is derived from source hash, source code, and palette index. The
importer emits `OXS_SYMBOL_CODE_COLLISION` for every disambiguated use. If two
different source codes resolve to the same browser glyph, the same deterministic
fallback rule applies with `OXS_SYMBOL_GLYPH_COLLISION`. Palette index remains
import provenance, not a canonical Symbol/PaletteItem uniqueness constraint.

### 6.5 ImportReport

```ts
interface ImportReport {
  schemaVersion: 1;
  importJobId: string;
  status: "completed" | "completed_with_warnings" | "rejected";
  errors: readonly ImportIssue[];
  warnings: readonly ImportIssue[];
  counts: {
    paletteItems: number;
    symbols: number;
    fullCrossStitches: number;
    unsupportedByKind: Readonly<Record<string, number>>;
  };
  sourceSha256: string;
  canonicalContentHash?: string;
}
```

Each issue has a stable code, severity, user-safe message key, technical
location, and bounded diagnostic details. Raw XML is never included in UI
messages or telemetry.

## 7. Import Security Limits

All limits are hard rejection boundaries for Phase 0 and are checked before
large allocations:

| Control | Phase 0 limit | Failure |
| --- | ---: | --- |
| Source bytes | 64 MiB | `OXS_LIMIT_FILE_BYTES` |
| Decoded UTF-8 bytes | 64 MiB | `OXS_LIMIT_TEXT_BYTES` |
| XML nesting depth | 16 | `OXS_LIMIT_XML_DEPTH` |
| Total XML elements | 1,000,000 | `OXS_LIMIT_ELEMENTS` |
| Attributes per element | 32 | `OXS_LIMIT_ATTRIBUTES` |
| One attribute value | 8 KiB | `OXS_LIMIT_ATTRIBUTE_BYTES` |
| One metadata text value | 64 KiB | `OXS_LIMIT_METADATA_BYTES` |
| Total retained metadata/extensions | 256 KiB | `OXS_LIMIT_EXTENSION_BYTES` |
| Grid dimension | 1 through 10,000 cells per axis | `OXS_LIMIT_GRID` |
| Palette entries | 4,096 | `OXS_LIMIT_PALETTE` |
| Supported full-cross stitches | 500,000 | `OXS_LIMIT_STITCHES` |
| Total reported unsupported objects | 500,000 | `OXS_LIMIT_UNSUPPORTED` |

Additional rejection conditions include invalid UTF-8, DOCTYPE/DTD, unsupported
OXS version, missing required sections, duplicate palette indices, duplicate
full-cross coordinates, non-finite or non-integer required numbers, unresolved
palette references, cloth references from stitches, and coordinates outside
the canonical grid after the proven normalization.

Parsing runs in a dedicated Web Worker and supports cancellation. Security is
enforced by byte, element, and allocation budgets rather than a device-dependent
wall-clock timeout. If worker creation or initialization fails, import rejects
with `IMPORT_WORKER_UNAVAILABLE`; it never silently parses on the UI thread. A
preflight estimator rejects an import when source bytes plus decoded text,
canonical buffers, tile buffers, and bounded parser overhead would exceed the
provisional 384 MiB import-worker peak budget. No imported content leaves the
browser.

The task-scoped threat model is
[TASK-THINSLICE-001 Threat Model](../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md).

## 8. Tile and Rendering Contract

### 8.1 Storage tile

- Tile coordinates are derived by `floor(x / tileSize)` and
  `floor(y / tileSize)`.
- Initial `tileSize` is 32×32 cells.
- Each tile stores compact readonly stitch records sorted by local cell index.
- Empty tiles are represented by absence, not allocated arrays.
- Tile size is part of the tile-set metadata, not a canonical Pattern invariant;
  it may change after measured evidence without changing domain coordinates.

### 8.2 Runtime boundary

```ts
interface PatternTileProvider {
  getPatternSummary(patternVersionId: string): Promise<PatternSummary>;
  getTiles(
    patternVersionId: string,
    range: TileRange,
    signal: AbortSignal
  ): Promise<readonly PatternTile[]>;
}

interface PatternRenderer {
  setPattern(summary: PatternSummary): void;
  setViewport(viewport: Viewport): void;
  setProgress(changedStitchIds: readonly string[]): void;
  render(frame: RenderFrame): RenderMetrics;
  hitTest(screenPoint: Point): StitchHit | null;
  dispose(): void;
}
```

The client requests the viewport plus a one-tile prefetch margin. Requests carry
an `AbortSignal`; stale pan/zoom requests are discarded. The renderer never
queries all stitches for a frame.

### 8.3 Canvas strategy

- Canvas2D is the Phase 0 primary renderer behind `PatternRenderer`.
- Static pattern content and dynamic progress marks use separate logical
  layers so a toggle invalidates only the affected tile/overlay.
- A glyph atlas is cached by device-pixel-ratio and zoom bucket.
- The grid and symbols are drawn from the same viewport transform to avoid
  drift.
- Rendering may run through `OffscreenCanvas` in a worker when supported.
- A main-thread Canvas2D fallback renders incrementally within a frame budget;
  browser support does not silently remove symbols or interactions.
- No stitch is represented by a DOM node.
- WebGL is not selected for Phase 0. The renderer interface is the migration
  seam if measured Prototype 9.1 evidence later requires it.

### 8.4 Interaction and accessibility

Hit testing converts the pointer through the inverse viewport transform to one
canonical cell and then resolves the tile-local stitch. A click/tap on a
supported stitch emits one toggle command only when pointer movement remains at
or below 6 CSS pixels and no pan gesture has been recognized. A larger movement
is pan-only and cannot mark a stitch. Rapid toggles are serialized by the client
command queue.

Readable symbol mode begins at a cell size of 16 CSS pixels. At or above that
threshold, the renderer selects black or white glyph treatment by calculated
background relative luminance and must achieve at least 4.5:1 glyph/background
contrast. Below the threshold, the renderer displays a non-interactive overview,
omits glyph claims, prevents progress toggles, and exposes a resource-backed
“zoom in to read symbols” status.

Progress state is never represented by hue alone:

- `unmarked` preserves the readable source/generated symbol;
- `marked` adds a persistent geometric completion mark and a luminance change;
- `saving` adds a distinct non-color-only pending outline;
- `not-saved` restores the last committed mark state and adds a persistent
  error outline/status.

Exact colors, line weights, and motion belong to the approved UI design, but
automated and manual tests must distinguish all four states in grayscale and
with reduced motion.

Canvas content exposes an accessible name and current chart summary. Zoom and
pan controls are real DOM controls with keyboard operation. The currently
focused/selected stitch is represented in an accessible DOM status region with
coordinate, symbol, and color information. User-facing coordinates are
one-based counted-chart coordinates; canonical storage and hit testing remain
zero-based. This is technical accessibility support for the approved flow; it
does not add unapproved viewer features.

## 9. Local Persistence

### 9.1 Database

Use native IndexedDB through a thin typed adapter. The adapter may use a small
wrapper library, but domain code depends only on repository interfaces.

Database name: `abris-universe`

Initial object stores:

| Store | Key | Purpose |
| --- | --- | --- |
| `sourceFiles` | `SourceFile.id` | Original OXS Blob and provenance |
| `importJobs` | `ImportJob.id` | Attempt status and report |
| `patterns` | `Pattern.id` | Immutable pattern header and dictionaries |
| `patternVersions` | `PatternVersion.id` | Version/provenance/content hash |
| `patternTiles` | `[patternVersionId, tileY, tileX]` | Compact full-cross tiles |
| `projects` | `Project.id` | Local project record |
| `progressEvents` | `[projectId, localSequence]` | Append-only event log |
| `progressEventIds` | `ProgressEvent.id` | Idempotency lookup containing project ID, local sequence, and canonical payload SHA-256 |
| `progressProjections` | `[projectId, stitchId]` | Rebuildable current state |
| `metadata` | key | Schema, stable installation `deviceId`, per-project sequence, and capability metadata |

### 9.2 Import transaction

File byte length is checked against the 64 MiB limit before any Blob is
persisted. The accepted-size import attempt then stores the opaque SourceFile
Blob, an `importing` ImportJob, and an `importing` Project in one short
transaction. Parsing, validation, hashing, and tile construction run outside
any IndexedDB transaction.

On success, a second single read-write transaction stores the
ImportReport, Pattern, PatternVersion, tiles, changes the ImportJob to
`completed` or `completed_with_warnings`, and changes the same Project to
`ready`. Any failed put or quota error aborts that entire success commit. The UI
opens the Project only after transaction completion.

On rejected input, a short transaction stores the bounded report and changes
the ImportJob and Project to `rejected`/`import_failed`; no Pattern,
PatternVersion, or tile is written. That same transaction deletes the Blob,
sets `bytesRef` to `null`, and sets `retentionStatus` to
`deleted-after-failure` while retaining source hash/size/name metadata and the
bounded report. On startup, an attempt left `importing` by a crash is changed to
`interrupted`/`import_failed` and receives the same Blob cleanup without
interpreting partial canonical data. Successful and
`completed_with_warnings` imports retain the original Blob.

### 9.3 Progress transaction

For each toggle:

1. acquire the exclusive Web Lock `au:project:<projectId>:progress-writer`;
2. if the lock is held by another tab, expose this tab as read-only until the
   lock becomes available; if Web Locks is unavailable, progress editing is
   disabled with a typed capability error rather than risking concurrent writes;
3. create a stable event ID and optimistically paint the overlay as `saving`;
4. in one read-write transaction, read the committed projection, derive `mark`
   or `unmark`, allocate and increment `nextLocalSequence`, build the event with
   `deviceId`, calculate its canonical payload SHA-256, idempotently add the
   event-ID record, append the event, update the projection, and update Project
   `updatedAt`;
5. on commit, mark UI state `saved`;
6. on abort/quota/error, revert to the last committed projection and expose
   `not saved` without discarding the live Project.

Reapplying an identical event ID with identical payload is a no-op. Reusing an
event ID with a different payload hash is a corruption error. Event sequence
allocation, command derivation, event append, projection update, and Project
update are one transaction. Events are never updated in place.

### 9.4 Recovery and lifecycle

On startup, the adapter opens schema version 1, validates metadata, loads the
Project, and verifies or rebuilds the progress projection from events. An
incomplete transaction leaves no partial PatternVersion or event.

The client requests persistent browser storage after the first successful
project creation when the API is supported. Denial is surfaced as a durability
risk but does not claim a product backup feature. `QuotaExceededError`,
blocked upgrades, and unavailable IndexedDB are explicit operational states.

Progress and import transactions request IndexedDB durability `strict` when the
browser supports the option. When it is unsupported, transaction completion is
still the application save boundary for reload/tab-close recovery, while
abrupt-power-loss durability remains an explicit residual risk in the Threat
Model and supported-platform evidence.

Future schema upgrades must be additive or include a tested forward migration
and code rollback compatibility. Production code must never solve an upgrade
failure by silently deleting the database.

## 10. Client State and Error Boundaries

Client state is separated into:

- route/application state;
- import workflow state;
- viewport state;
- immutable Pattern summary and visible tile cache;
- committed progress projection;
- transient save state.

The optional read-only legend is derived from used
`(symbolId, paletteItemId)` references and displays both fields. It provides no
filter, grouping, hide/show, or highlight behavior.

Domain and persistence errors use typed codes. UI messages use resource keys,
not raw exception strings or raw imported text. An importer or renderer worker
failure is contained by an error boundary and produces a retry/reopen path
without corrupting committed data.

No analytics endpoint is implemented. The product-requested import and
first-mark events may be represented by typed local event names only; sending
them requires a later approved analytics design.

## 11. Test and Evidence Design

### 11.1 Route-1 fixtures

Fixtures are project-original and committed only after their generation task is
approved. The set must include:

1. `minimal-full-cross.oxs`: small chart, known corners, multiple symbols and
   colors, no unsupported content; the TD-GATE-001 version is non-square, uses
   four distinct corner pairs, and contains an asymmetric interior stitch;
2. `medium-full-cross.oxs`: deterministic generator output with 100,000
   full-cross stitches, at least 32 symbols/colors, sparse and dense tiles;
3. `unsupported-content.oxs`: lawful project-original full-cross plus
   out-of-scope elements to verify warnings and preservation;
4. `corrupt-truncated.oxs`: intentionally truncated project-original XML;
5. `empty-full-cross.oxs`: valid project-original chart with zero stitches,
   expected successful ImportReport message, and defined empty-viewer state;
6. bounded security cases for DTD, limits, invalid references, duplicates, and
   coordinates.

Each fixture has a provenance README, generation recipe, SHA-256, expected
canonical JSON, expected ImportReport, license statement, and human-reviewed
source chart. No vendor sample is committed.

### 11.2 Automated checks

- domain invariant and serialization tests;
- OXS golden mapping and deterministic content-hash tests;
- unsupported/corrupt/security-limit tests;
- tile partition, visible-set, hit-test, and rendering golden tests;
- progress idempotency and rapid-toggle ordering tests;
- two-browser-context writer-lock, sequence-allocation, stale-projection, and
  duplicate-ID/payload-hash tests;
- IndexedDB atomic import, quota failure, projection rebuild, reload, and
  upgrade tests, including failed/interrupted Blob orphan absence;
- keyboard/accessibility automated checks plus manual screen-reader review;
- end-to-end import, view, zoom/pan, toggle, reload, and reopen test;
- production build and deployment smoke tests.

### 11.3 Performance

No performance claim exists at design time. Provisional budgets and the
reproducible environment are defined in
[TASK-THINSLICE-001 Benchmark Plan](../../assurance/benchmarks/TASK-THINSLICE-001_BENCHMARK_PLAN.md).
Budget changes require measured evidence and review; they are not silently
loosened to make a test pass.

## 12. Deployment Design

### 12.1 Runtime

The production artifact is a static SPA built to `dist/` and served by the
existing Cloudflare Worker named `abris-universe` at
`https://abris.653915.com`. Cloudflare Workers Static Assets is used with SPA
fallback. No backend route, server-side session, database, or third-party
pattern upload is introduced.

The build emits a non-secret `version.json` containing application version,
source commit, and build timestamp for smoke verification.

The static-assets Worker applies these minimum response headers to HTML and
app-owned assets:

```text
Content-Security-Policy:
  default-src 'self';
  script-src 'self';
  style-src 'self';
  img-src 'self' data:;
  font-src 'self';
  connect-src 'self';
  worker-src 'self';
  object-src 'none';
  base-uri 'none';
  form-action 'none';
  frame-ancestors 'none'
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
```

The build must not require inline scripts/styles or remote runtime assets.
Changing the CSP or adding a network destination requires security review and a
Documentation Impact assessment.

Before deployment, the client and Worker must have a reviewed minimum runtime
request inventory. It identifies every script-initiated same-origin connection,
its method, route, payload class, and purpose. If the production client requires
no such connection, `connect-src` is tightened from `'self'` to `'none'`. If a
same-origin connection remains necessary, it is limited to reviewed
non-pattern static metadata and may not carry pattern-derived data in a URL,
request body, header, log, analytics event, or telemetry.

### 12.2 GitHub workflow

```text
feature branch
  -> pull request
  -> install from frozen lockfile
  -> formatting/lint/type checks
  -> unit + golden + persistence + renderer checks
  -> production build
  -> security and dependency review
  -> optional protected preview
  -> merge to main
  -> repeat trusted build checks
  -> upload immutable Cloudflare version
  -> smoke preview version
  -> deploy version to production
  -> smoke abris.653915.com
  -> record deployment evidence
```

GitHub Actions permissions default to `contents: read`. Cloudflare credentials
are production-environment secrets:

- `CLOUDFLARE_API_TOKEN`;
- `CLOUDFLARE_ACCOUNT_ID`.

The token is scoped to the required account and Worker deployment permission.
It receives no DNS-edit authority. The repository contains only variable names,
never values. Third-party actions are pinned to full commit SHAs during
implementation.

Pull-request preview deployment is enabled only after its URL access model is
approved and protected. Until then, PRs produce a build artifact without a
public deployment. Forked pull requests never receive production secrets.

### 12.3 Production safeguards

- only the protected default branch can target the GitHub `production`
  environment;
- required checks must pass before merge and deployment;
- concurrent production deploys are serialized;
- deployment records source commit, immutable Cloudflare version ID, previous
  version ID, workflow run, smoke result, and operator;
- the workflow deploys the same reviewed build/version, not a locally rebuilt
  artifact;
- the existing custom domain remains attached to the existing Worker; the
  pipeline does not mutate DNS.

Before the first deploy, TD-GATE-003 records the existing placeholder version
and a recoverable artifact. If the platform cannot provide a restorable prior
version, first production deployment remains blocked until the owner accepts a
specific rollback alternative.

### 12.4 Smoke and rollback

Pre-promotion smoke checks validate the immutable preview version:

- HTTPS response succeeds;
- `version.json` reports the expected source commit;
- application shell and hashed assets load;
- SPA fallback resolves a non-root route;
- no secret is present in the build;
- CSP, `nosniff`, `frame-ancestors`, and `Referrer-Policy` match the reviewed
  policy;
- the observed request set matches the reviewed runtime request inventory;
- a full browser network capture across import, render, toggle, reload, and
  representative error paths contains no pattern-derived data in URLs, request
  bodies, headers, logs, analytics, or telemetry;
- browser smoke opens the import entry point without console errors.

After promotion, the same checks run against `abris.653915.com`. Failure
automatically invokes Cloudflare rollback to the recorded prior version and
re-runs smoke checks. Manual rollback uses the same recorded version ID.

Static rollback does not mutate or delete IndexedDB. Every released client
schema change must remain readable by the immediately previous production
version or have a separately approved migration/rollback design.

## 13. Decision Dispositions

| Product proposal | Phase 0 disposition | Canonical record |
| --- | --- | --- |
| ADR-001 canonical format independent of import | Adopted as `[PROPOSED]` | ADR-TS001-001 |
| ADR-002 tiled Canvas2D behind renderer interface | Adopted as `[PROPOSED]`; WebGL deferred to evidence | ADR-TS001-002 |
| ADR-003 progress event log over CRDT | Adopted locally as `[PROPOSED]`; network merge rules deferred | ADR-TS001-003 |
| ADR-004 shared web/mobile monorepo | Narrowed to portable TypeScript core and web workspace; mobile framework remains out of scope | ADR-TS001-004 |
| ADR-005 modular monolith | No backend in Phase 0; in-process modular boundaries only |
| ADR-006 PostgreSQL system of record | `[DEFERRED]`; no server-side data in Phase 0 |
| ADR-007 one write region plus CDN | Static Cloudflare delivery adopted; backend region decision `[DEFERRED]` |
| ADR-008 ICU resource strings | Resource-backed client messages required; exact library selected and pinned during implementation review |

No product proposal is silently treated as an already approved engineering
decision. `AU-EX-20260725-005` dispositions all four task-scoped ADRs as
`ACCEPTED_WITH_GATES`. They remain `[PROPOSED]` until the revised design,
applicable evidence gates, and AU-AGENT-003 security review are recorded.

## 14. Risks and Controls

| Risk | Control | Residual state |
| --- | --- | --- |
| OXS producer coordinate ambiguity | TD-GATE-001 boundary fixture; no heuristic offset | `[OPEN]`, blocks importer code |
| OXS symbol/font ambiguity | TD-GATE-002 glyph fixture and lawful mapping | `[OPEN]`, blocks exact-symbol claim |
| XML resource exhaustion | Streaming worker parser and hard limits | Review and tests required |
| Silent local data loss | Atomic transactions, committed-state UI, persistence request, explicit quota errors | Browser eviction remains an environmental risk |
| Concurrent-tab progress corruption | One exclusive project writer, in-transaction sequence/derivation, payload-hash idempotency record | Web Locks capability required for editing |
| Canvas accessibility gap | DOM controls, status representation, keyboard path, manual assistive-tech evidence | Review required |
| Tiled renderer misses future 500k target | Medium fixture now; separate 500k prototype before scale claim | `[OPEN]`, non-blocking for Phase 0 design |
| Public preview leaks unreleased UI | No public preview until access policy exists | Controlled |
| First deploy cannot restore placeholder | TD-GATE-003 recoverable version/artifact | `[OPEN]`, blocks production deploy |
| Browser-side code execution or product-data egress | Worker-enforced restrictive headers and smoke assertions | Dependency/browser defects remain review risks |
| Dependency/action supply chain | Frozen lockfile, least privilege, pinned action SHAs, review | Implementation evidence required |

## 15. Implementation Sequence After Approval

1. Complete AU-AGENT-003 review of the revised security-relevant design and
   ADR sections.
2. Produce and review the route-1 coordinate and symbol fixtures.
3. Scaffold the strict workspace and dependency boundaries.
4. Implement and test `domain-core`.
5. Implement the bounded OXS importer and golden/security tests.
6. Implement IndexedDB repositories and recovery tests.
7. Implement tiled renderer and measured medium-fixture prototype.
8. Integrate the accessible web flow and end-to-end persistence.
9. Add the reviewed CI pipeline and a non-production deployment rehearsal.
10. Pass AU-AGENT-003 engineering verification.
11. Capture the current production rollback anchor and perform the separately
    authorized production deployment.
12. Produce the Completion Report and send evidence through the Collaboration
    Bridge for independent Claude acceptance.

## 16. Architecture Review Checklist

- [ ] Exact Task Package and product decisions are unchanged.
- [x] `AU-EX-20260725-005` independent architecture review completed with
      `ACCEPTED_WITH_GATES`; R-1 through R-8 integrated in version 1.1.0.
- [x] AU-AGENT-003 security review of the revised security-relevant sections is
      recorded.
- [ ] TD-GATE-001 coordinate evidence is accepted.
- [ ] TD-GATE-002 symbol evidence is accepted or product limitation is
      explicitly dispositioned.
- [ ] Canonical entities and version boundaries satisfy section 18.
- [ ] Symbol/Palette and Pattern/Progress independence are enforceable.
- [ ] Unsupported OXS data is visible and source-preserved.
- [ ] Security limits are justified and testable.
- [ ] Renderer never requires whole-pattern per-frame work or per-stitch DOM.
- [ ] Save success maps to a committed transaction.
- [ ] Storage and client rollback compatibility are explicit.
- [ ] Deployment uses immutable source/version evidence and a recoverable prior
      production version.
- [x] ADR-TS001-001 through ADR-TS001-004 have independent architecture
      dispositions; they remain `[PROPOSED]` behind their evidence gates.
- [ ] Documentation and traceability are complete.

## 17. References

- [Source of Truth Registry](../../SOURCE_OF_TRUTH.md)
- [TASK-THINSLICE-001 v1.1](../../../product/task-packages/08_TaskPackage_EP01_ThinSlice_v1.1.md)
- [Technical Review](../../reviews/technical/TASK-THINSLICE-001/TECHNICAL_REVIEW.md)
- [OQ-005 Spike](../../reviews/technical/TASK-THINSLICE-001/OQ-005_IMPORT_FORMAT_SPIKE.md)
- [ADR Library](../adr/README.md)
- [Threat Model](../../assurance/threat-models/TASK-THINSLICE-001_THREAT_MODEL.md)
- [Benchmark Plan](../../assurance/benchmarks/TASK-THINSLICE-001_BENCHMARK_PLAN.md)
- [Independent Pre-Implementation Architecture Review](../../../product/reviews/TASK-THINSLICE-001_Pre-Implementation_Architecture_Review.md)
- [AU-AGENT-003 Pre-Code Security Design Verification](../../reviews/engineering/TASK-THINSLICE-001_SECURITY_DESIGN_VERIFICATION.md)
- [OXS Format Specification](https://www.ursasoftware.com/OXSFormat/)
- [Cloudflare Workers Static Assets SPA routing](https://developers.cloudflare.com/workers/static-assets/routing/single-page-application/)
- [Cloudflare Workers versions and deployments](https://developers.cloudflare.com/workers/configuration/versions-and-deployments/)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [StorageManager persistence](https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist)
