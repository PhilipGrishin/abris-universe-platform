import { readFileSync } from "node:fs";
import { join } from "node:path";

import { importOxsRoute1 } from "@abris-universe/oxs-importer";
import {
  INITIAL_TILE_SIZE,
  TiledPatternRenderer,
  buildPatternTiles,
  tileInRange,
  type Canvas2DLike,
  type PatternSummary,
  type PatternTile,
  type PatternTileProvider,
  type TileRange,
} from "../src/index.ts";

class CountingCanvas implements Canvas2DLike {
  fillStyle = "";
  strokeStyle = "";
  font = "";
  lineWidth = 1;
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";
  operations = 0;

  clearRect(): void { this.operations += 1; }
  fillRect(): void { this.operations += 1; }
  strokeRect(): void { this.operations += 1; }
  fillText(): void { this.operations += 1; }
  beginPath(): void { this.operations += 1; }
  moveTo(): void { this.operations += 1; }
  lineTo(): void { this.operations += 1; }
  stroke(): void { this.operations += 1; }
  setTransform(): void { this.operations += 1; }
}

class MemoryTileProvider implements PatternTileProvider {
  private readonly summary: PatternSummary;
  private readonly tiles: readonly PatternTile[];

  constructor(
    summary: PatternSummary,
    tiles: readonly PatternTile[],
  ) {
    this.summary = summary;
    this.tiles = tiles;
  }

  async getPatternSummary(patternVersionId: string): Promise<PatternSummary> {
    if (patternVersionId !== this.summary.patternVersionId) {
      throw new Error("Unknown pattern version.");
    }
    return this.summary;
  }

  async getTiles(
    patternVersionId: string,
    range: TileRange,
    signal: AbortSignal,
  ): Promise<readonly PatternTile[]> {
    if (signal.aborted) {
      throw new DOMException("Aborted.", "AbortError");
    }
    if (patternVersionId !== this.summary.patternVersionId) {
      throw new Error("Unknown pattern version.");
    }
    return this.tiles.filter((tile) => tileInRange(tile, range));
  }
}

const bytes = readFileSync(
  join(
    import.meta.dirname,
    "../../../tests/fixtures/oxs/generated/medium-full-cross.oxs",
  ),
);
const importStarted = performance.now();
const imported = importOxsRoute1({
  bytes,
  originalName: "medium-full-cross.oxs",
  bytesRef: "blob:medium",
  sourceFileId: "source:medium",
  importJobId: "job:medium",
  patternId: "pattern:medium",
  patternVersionId: "version:medium",
  tileSetRef: "tiles:medium",
  receivedAt: "2026-07-25T10:00:00.000Z",
  startedAt: "2026-07-25T10:00:00.000Z",
  completedAt: "2026-07-25T10:01:00.000Z",
});
const importMs = performance.now() - importStarted;
if (imported.status === "rejected") {
  throw new Error("Registered medium fixture was rejected.");
}

const tileStarted = performance.now();
const tiles = buildPatternTiles(
  imported.canonical.patternVersion.id,
  imported.canonical.stitches,
);
const tileBuildMs = performance.now() - tileStarted;
const summary: PatternSummary = {
  patternVersionId: imported.canonical.patternVersion.id,
  grid: imported.canonical.pattern.grid,
  paletteItems: imported.canonical.pattern.paletteItems,
  symbols: imported.canonical.pattern.symbols,
  tileSize: INITIAL_TILE_SIZE,
  stitchCount: imported.canonical.stitches.length,
};
const provider = new MemoryTileProvider(summary, tiles);
const renderer = new TiledPatternRenderer(provider);
renderer.setPattern(summary);
renderer.setViewport({
  offsetX: 0,
  offsetY: 0,
  cellSize: 16,
  width: 1365,
  height: 768,
  devicePixelRatio: 1,
});
const loadStarted = performance.now();
await renderer.loadVisibleTiles(new AbortController().signal);
const tileQueryMs = performance.now() - loadStarted;

const staticContext = new CountingCanvas();
const progressContext = new CountingCanvas();
const renderStarted = performance.now();
let frames = 0;
let metrics;
do {
  metrics = renderer.render({
    staticContext,
    progressContext,
    budgetMs: 8,
  });
  frames += 1;
} while (!metrics.complete);
const renderMs = performance.now() - renderStarted;

process.stdout.write(
  `${JSON.stringify(
    {
      evidenceClass: "node-renderer-core-regression-signal",
      performanceAcceptance: false,
      node: process.version,
      fixture: "medium-full-cross.oxs",
      sourceBytes: bytes.byteLength,
      stitches: imported.canonical.stitches.length,
      totalTiles: tiles.length,
      visibleTiles: metrics.visibleTiles,
      visibleStitches: metrics.visibleStitches,
      frames,
      canvasContractOperations:
        staticContext.operations + progressContext.operations,
      importMs,
      tileBuildMs,
      tileQueryMs,
      renderMs,
    },
    null,
    2,
  )}\n`,
);
