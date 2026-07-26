import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { importOxsRoute1 } from "@abris-universe/oxs-importer";
import type {
  FullCrossStitch,
  Pattern,
  PatternVersion,
} from "@abris-universe/domain-core";
import {
  INITIAL_TILE_SIZE,
  MAX_RENDER_REQUESTED_TILES,
  MAX_RENDER_STRING_CODE_UNITS,
  RendererIntegrityError,
  TiledPatternRenderer,
  buildPatternTiles,
  contrastRatio,
  readableGlyphColor,
  relativeLuminance,
  selectRendererExecutionPath,
  tileInRange,
  visibleTileRange,
  type Canvas2DLike,
  type PatternSummary,
  type PatternTile,
  type PatternTileProvider,
  type ProgressRenderState,
  type RenderFrame,
  type TileRange,
  type Viewport,
} from "../src/index.ts";

class RecordingCanvas implements Canvas2DLike {
  fillStyle = "";
  strokeStyle = "";
  font = "";
  lineWidth = 1;
  textAlign: CanvasTextAlign = "start";
  textBaseline: CanvasTextBaseline = "alphabetic";
  readonly calls: string[] = [];

  clearRect(x: number, y: number, width: number, height: number): void {
    this.calls.push(`clear:${x}:${y}:${width}:${height}`);
  }
  fillRect(): void { this.calls.push("fill"); }
  strokeRect(x: number, y: number, width: number, height: number): void {
    this.calls.push(`rect:${x}:${y}:${width}:${height}`);
  }
  fillText(text: string): void { this.calls.push(`text:${text}`); }
  beginPath(): void { this.calls.push("begin"); }
  moveTo(): void { this.calls.push("move"); }
  lineTo(): void { this.calls.push("line"); }
  stroke(): void { this.calls.push("stroke"); }
  setTransform(): void { this.calls.push("transform"); }
}

class MemoryProvider implements PatternTileProvider {
  readonly ranges: TileRange[] = [];
  readonly summary: PatternSummary;
  readonly tiles: readonly PatternTile[];

  constructor(
    summary: PatternSummary,
    tiles: readonly PatternTile[],
  ) {
    this.summary = summary;
    this.tiles = tiles;
  }

  async getPatternSummary(patternVersionId: string): Promise<PatternSummary> {
    assert.equal(patternVersionId, this.summary.patternVersionId);
    return this.summary;
  }

  async getTiles(
    patternVersionId: string,
    range: TileRange,
    signal: AbortSignal,
  ): Promise<readonly PatternTile[]> {
    if (signal.aborted) throw new DOMException("Aborted.", "AbortError");
    assert.equal(patternVersionId, this.summary.patternVersionId);
    this.ranges.push(range);
    return this.tiles.filter((tile) => tileInRange(tile, range));
  }
}

const viewport: Viewport = {
  offsetX: 0,
  offsetY: 0,
  cellSize: 20,
  width: 200,
  height: 120,
  devicePixelRatio: 1,
};

function smallPattern(): {
  readonly pattern: Pattern;
  readonly version: PatternVersion;
  readonly stitches: readonly FullCrossStitch[];
} {
  const pattern: Pattern = {
    id: "pattern-render",
    metadata: {
      name: "Renderer",
      width: 80,
      height: 64,
      fabric: {
        type: null,
        countX: null,
        countY: null,
        countUnit: null,
        clothPaletteItemId: null,
      },
    },
    grid: {
      width: 80,
      height: 64,
      origin: "top-left",
      coordinateBase: 0,
      xDirection: "right",
      yDirection: "down",
    },
    paletteItems: [
      {
        id: "palette-dark",
        sourceIndex: 1,
        role: "thread",
        threadBrand: null,
        brandCode: null,
        displayName: "Dark",
        displayColor: "#101010",
      },
    ],
    symbols: [
      {
        id: "symbol-x",
        sourceCode: "X",
        visual: {
          kind: "text-code-point",
          value: "X",
          fontFamily: "sans-serif",
        },
      },
    ],
    createdAt: "2026-07-25T10:00:00.000Z",
    provenanceRef: "source-render",
  };
  const version: PatternVersion = {
    id: "version-render",
    patternId: pattern.id,
    canonicalFormatVersion: "1.0.0",
    createdAt: pattern.createdAt,
    sourceFileId: "source-render",
    importJobId: "job-render",
    canonicalContentHash: "a".repeat(64),
    tileSetRef: "tiles:version-render",
  };
  const stitches: FullCrossStitch[] = [
    {
      id: "stitch-a",
      type: "full-cross",
      x: 1,
      y: 2,
      symbolId: "symbol-x",
      paletteItemId: "palette-dark",
    },
    {
      id: "stitch-b",
      type: "full-cross",
      x: 33,
      y: 1,
      symbolId: "symbol-x",
      paletteItemId: "palette-dark",
    },
    {
      id: "stitch-c",
      type: "full-cross",
      x: 2,
      y: 33,
      symbolId: "symbol-x",
      paletteItemId: "palette-dark",
    },
  ];
  return { pattern, version, stitches };
}

function summary(
  pattern: Pattern,
  version: PatternVersion,
  stitchCount = 3,
): PatternSummary {
  return {
    patternVersionId: version.id,
    grid: pattern.grid,
    paletteItems: pattern.paletteItems,
    symbols: pattern.symbols,
    tileSize: INITIAL_TILE_SIZE,
    stitchCount,
  };
}

function frame(): {
  readonly frame: RenderFrame;
  readonly staticCanvas: RecordingCanvas;
  readonly progressCanvas: RecordingCanvas;
} {
  const staticCanvas = new RecordingCanvas();
  const progressCanvas = new RecordingCanvas();
  return {
    frame: {
      staticContext: staticCanvas,
      progressContext: progressCanvas,
      budgetMs: 100,
    },
    staticCanvas,
    progressCanvas,
  };
}

test("partitions 32x32 tiles deterministically and sorts by local cell index", () => {
  const { version, stitches } = smallPattern();
  const tiles = buildPatternTiles(version.id, [...stitches].reverse());
  assert.deepEqual(
    tiles.map((tile) => [tile.tileX, tile.tileY, tile.stitches.map((item) => item.id)]),
    [
      [0, 0, ["stitch-a"]],
      [1, 0, ["stitch-b"]],
      [0, 1, ["stitch-c"]],
    ],
  );
  assert.equal(tiles.some((tile) => tile.stitches.length === 0), false);
});

test("calculates a clamped visible tile range with one-tile prefetch", () => {
  const { pattern, version } = smallPattern();
  assert.deepEqual(
    visibleTileRange(summary(pattern, version), {
      ...viewport,
      offsetX: -640,
      width: 320,
    }),
    { minTileX: 0, maxTileX: 2, minTileY: 0, maxTileY: 1 },
  );
  const oneCellTiles = { ...summary(pattern, version), tileSize: 1 };
  assert.deepEqual(
    visibleTileRange(oneCellTiles, {
      ...viewport,
      offsetX: -64,
      offsetY: -64,
      cellSize: 32,
      width: 32,
      height: 32,
    }),
    { minTileX: 1, maxTileX: 3, minTileY: 1, maxTileY: 3 },
  );
  assert.deepEqual(
    visibleTileRange(oneCellTiles, {
      ...viewport,
      offsetX: -64.5,
      offsetY: 0,
      cellSize: 32,
      width: 32,
      height: 32,
    }),
    { minTileX: 1, maxTileX: 4, minTileY: 0, maxTileY: 1 },
  );
  assert.deepEqual(
    visibleTileRange(oneCellTiles, {
      ...viewport,
      offsetX: 200,
      offsetY: 200,
      cellSize: 32,
      width: 32,
      height: 32,
    }),
    { minTileX: 0, maxTileX: -1, minTileY: 0, maxTileY: -1 },
  );
});

test("loads bounded tiles, draws separate layers, and hit-tests canonical cells", async () => {
  const { pattern, version, stitches } = smallPattern();
  const tiles = buildPatternTiles(version.id, stitches);
  const provider = new MemoryProvider(summary(pattern, version), tiles);
  const states = new Map<string, ProgressRenderState>([
    ["stitch-a", { status: "committed", value: "marked" }],
  ]);
  const renderer = new TiledPatternRenderer(provider, {
    getState: (id) =>
      states.get(id) ?? { status: "committed", value: "unmarked" },
  });
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport(viewport);
  assert.equal(await renderer.loadVisibleTiles(new AbortController().signal), true);

  const output = frame();
  const metrics = renderer.render(output.frame);
  assert.equal(metrics.mode, "readable");
  assert.equal(metrics.complete, true);
  assert.equal(output.staticCanvas.calls.includes("text:X"), true);
  assert.equal(output.progressCanvas.calls.includes("stroke"), true);
  assert.deepEqual(renderer.hitTest({ x: 25, y: 45 }), {
    stitchId: "stitch-a",
    x: 1,
    y: 2,
  });

  const staticFills = output.staticCanvas.calls.filter(
    (call) => call === "fill",
  ).length;
  const savingCallStart = output.progressCanvas.calls.length;
  states.set("stitch-a", {
    status: "saving",
    committed: "unmarked",
    pending: "marked",
  });
  renderer.setProgress(["stitch-a"]);
  renderer.render(output.frame);
  const savingCalls = output.progressCanvas.calls.slice(savingCallStart);
  assert.equal(savingCalls.includes("begin"), true);
  assert.equal(
    savingCalls.filter((call) => call.startsWith("rect:")).length,
    1,
  );

  const progressCallStart = output.progressCanvas.calls.length;
  states.set("stitch-a", {
    status: "not-saved",
    committed: "unmarked",
  });
  renderer.setProgress(["stitch-a"]);
  renderer.render(output.frame);
  assert.equal(
    output.staticCanvas.calls.filter((call) => call === "fill").length,
    staticFills,
  );
  assert.equal(output.progressCanvas.strokeStyle, "#B00020");
  const failedMarkCalls = output.progressCanvas.calls.slice(progressCallStart);
  assert.equal(failedMarkCalls.includes("begin"), false);
  assert.equal(
    failedMarkCalls.filter((call) => call.startsWith("rect:")).length,
    2,
  );

  const failedUnmarkStart = output.progressCanvas.calls.length;
  states.set("stitch-a", {
    status: "not-saved",
    committed: "marked",
  });
  renderer.setProgress(["stitch-a"]);
  renderer.render(output.frame);
  const failedUnmarkCalls =
    output.progressCanvas.calls.slice(failedUnmarkStart);
  assert.equal(failedUnmarkCalls.includes("begin"), true);
  assert.equal(
    failedUnmarkCalls.filter((call) => call.startsWith("rect:")).length,
    2,
  );
});

test("overview mode omits glyph claims and disables hit testing", async () => {
  const { pattern, version, stitches } = smallPattern();
  const provider = new MemoryProvider(
    summary(pattern, version),
    buildPatternTiles(version.id, stitches),
  );
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport({ ...viewport, cellSize: 8 });
  await renderer.loadVisibleTiles(new AbortController().signal);
  const output = frame();
  assert.equal(renderer.render(output.frame).mode, "overview");
  assert.equal(output.staticCanvas.calls.some((call) => call.startsWith("text:")), false);
  assert.equal(renderer.hitTest({ x: 12, y: 20 }), null);
});

test("uses a supplied glyph atlas and exposes the validated static scene", async () => {
  const { pattern, version, stitches } = smallPattern();
  const provider = new MemoryProvider(
    summary(pattern, version),
    buildPatternTiles(version.id, stitches),
  );
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport({ ...viewport, width: 800, height: 800 });
  await renderer.loadVisibleTiles(new AbortController().signal);
  let atlasDraws = 0;
  const output = frame();
  const result = renderer.render({
    ...output.frame,
    glyphAtlas: {
      drawGlyph: () => {
        atlasDraws += 1;
        return true;
      },
      clear: () => undefined,
    },
  });
  assert.equal(result.complete, true);
  assert.equal(atlasDraws, stitches.length);
  assert.equal(
    output.staticCanvas.calls.some((call) => call.startsWith("text:")),
    false,
  );
  assert.deepEqual(
    renderer.getStaticScene().stitches.map((stitch) => stitch.id),
    stitches.map((stitch) => stitch.id),
  );
});

test("selects explicit capability paths and readable glyph contrast", () => {
  assert.equal(
    selectRendererExecutionPath(true, true),
    "offscreen-worker",
  );
  assert.equal(
    selectRendererExecutionPath(false, true),
    "incremental-main-thread",
  );
  for (const color of ["#000000", "#777777", "#FFFFFF"] as const) {
    const glyph = readableGlyphColor(color);
    assert.ok(
      contrastRatio(
        relativeLuminance(color),
        glyph === "#000000" ? 0 : 1,
      ) >= 4.5,
    );
  }
});

test("renders incrementally when the supplied frame budget is exhausted", async () => {
  const { pattern, version, stitches } = smallPattern();
  const provider = new MemoryProvider(
    summary(pattern, version),
    buildPatternTiles(version.id, stitches),
  );
  let tick = 0;
  const renderer = new TiledPatternRenderer(provider, undefined, () => tick++);
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport(viewport);
  await renderer.loadVisibleTiles(new AbortController().signal);
  const output = frame();
  const first = renderer.render({ ...output.frame, budgetMs: 1 });
  assert.equal(first.complete, false);
  let final = first;
  while (!final.complete) {
    final = renderer.render({ ...output.frame, budgetMs: 1 });
  }
  assert.equal(final.complete, true);
});

test("discards an aborted tile request", async () => {
  const { pattern, version, stitches } = smallPattern();
  const provider = new MemoryProvider(
    summary(pattern, version),
    buildPatternTiles(version.id, stitches),
  );
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport(viewport);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    renderer.loadVisibleTiles(controller.signal),
    (error: unknown) =>
      error instanceof DOMException && error.name === "AbortError",
  );
});

test("discards a tile result made stale by a viewport change", async () => {
  const { pattern, version, stitches } = smallPattern();
  const patternSummary = summary(pattern, version, stitches.length);
  let release: (() => void) | undefined;
  const provider: PatternTileProvider = {
    getPatternSummary: async () => patternSummary,
    getTiles: async () => {
      await new Promise<void>((resolve) => {
        release = resolve;
      });
      return buildPatternTiles(version.id, stitches);
    },
  };
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(patternSummary);
  renderer.setViewport(viewport);
  const pending = renderer.loadVisibleTiles(new AbortController().signal);
  renderer.setViewport({ ...viewport, offsetX: -320 });
  release?.();
  assert.equal(await pending, false);
});

test("budgets changed progress cells incrementally without static redraw", async () => {
  const { pattern, version } = smallPattern();
  const stitches: FullCrossStitch[] = [];
  for (let y = 0; y < 64; y += 1) {
    for (let x = 0; x < 64; x += 1) {
      stitches.push({
        id: `dense-${y}-${x}`,
        type: "full-cross",
        x,
        y,
        symbolId: "symbol-x",
        paletteItemId: "palette-dark",
      });
    }
  }
  const patternSummary = summary(pattern, version, stitches.length);
  const provider = new MemoryProvider(
    patternSummary,
    buildPatternTiles(version.id, stitches),
  );
  let pending = false;
  let controlled = false;
  let tick = 0;
  const renderer = new TiledPatternRenderer(
    provider,
    {
      getState: () =>
        pending
          ? { status: "committed", value: "marked" }
          : { status: "committed", value: "unmarked" },
    },
    () => (controlled ? tick++ : 0),
  );
  renderer.setPattern(patternSummary);
  renderer.setViewport({
    ...viewport,
    cellSize: 16,
    width: 1024,
    height: 1024,
  });
  await renderer.loadVisibleTiles(new AbortController().signal);
  const output = frame();
  assert.equal(
    renderer.render({ ...output.frame, budgetMs: 10_000 }).complete,
    true,
  );
  const staticFills = output.staticCanvas.calls.filter(
    (call) => call === "fill",
  ).length;
  pending = true;
  renderer.setProgress(stitches.map((stitch) => stitch.id));
  controlled = true;
  const first = renderer.render({ ...output.frame, budgetMs: 2 });
  assert.equal(first.complete, false);
  assert.ok(first.drawnProgressStitches > 0);
  assert.ok(first.drawnProgressStitches < stitches.length);
  let current = first;
  while (!current.complete) {
    current = renderer.render({ ...output.frame, budgetMs: 2 });
  }
  assert.equal(
    output.staticCanvas.calls.filter((call) => call === "fill").length,
    staticFills,
  );
});

test("fails closed on corrupt or over-returned provider tiles", async () => {
  const { pattern, version, stitches } = smallPattern();
  const patternSummary = summary(pattern, version);
  const validTile = buildPatternTiles(version.id, stitches)[0]!;
  const cases: ReadonlyArray<{
    readonly expectedCode: string;
    readonly tiles: readonly PatternTile[];
  }> = [
    {
      expectedCode: "RENDER_INVALID_TILE_RESPONSE",
      tiles: [{ ...validTile, patternVersionId: "wrong-version" }],
    },
    {
      expectedCode: "RENDER_INVALID_TILE_RESPONSE",
      tiles: [{ ...validTile, tileX: 2 }],
    },
    {
      expectedCode: "RENDER_DUPLICATE_TILE",
      tiles: [validTile, validTile],
    },
    {
      expectedCode: "RENDER_INVALID_STITCH",
      tiles: [
        {
          ...validTile,
          stitches: [{ ...validTile.stitches[0]!, x: 33 }],
        },
      ],
    },
    {
      expectedCode: "RENDER_INVALID_STITCH",
      tiles: [
        {
          ...validTile,
          stitches: [{ ...validTile.stitches[0]!, x: 80 }],
        },
      ],
    },
    {
      expectedCode: "RENDER_INVALID_STITCH",
      tiles: [
        {
          ...validTile,
          stitches: [
            { ...validTile.stitches[0]!, symbolId: "missing-symbol" },
          ],
        },
      ],
    },
    {
      expectedCode: "RENDER_DUPLICATE_STITCH",
      tiles: [
        {
          ...validTile,
          stitches: [validTile.stitches[0]!, validTile.stitches[0]!],
        },
      ],
    },
    {
      expectedCode: "RENDER_UNSORTED_TILE",
      tiles: [
        {
          ...validTile,
          stitches: [
            validTile.stitches[0]!,
            {
              ...validTile.stitches[0]!,
              id: "stitch-before",
              x: 2,
              y: 1,
            },
          ],
        },
      ],
    },
    {
      expectedCode: "RENDER_TILE_RESPONSE_LIMIT",
      tiles: [validTile, validTile, validTile, validTile, validTile],
    },
    {
      expectedCode: "RENDER_TILE_RESPONSE_LIMIT",
      tiles: [{ ...validTile, stitches: [] }],
    },
  ];
  for (const item of cases) {
    const provider: PatternTileProvider = {
      getPatternSummary: async () => patternSummary,
      getTiles: async () => item.tiles,
    };
    const renderer = new TiledPatternRenderer(provider);
    renderer.setPattern(patternSummary);
    renderer.setViewport(viewport);
    await assert.rejects(
      renderer.loadVisibleTiles(new AbortController().signal),
      (error: unknown) =>
        error instanceof RendererIntegrityError &&
        error.code === item.expectedCode,
    );
  }
});

test("does not query the provider when the viewport is outside the grid", async () => {
  const { pattern, version } = smallPattern();
  const provider = new MemoryProvider(summary(pattern, version), []);
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(summary(pattern, version));
  renderer.setViewport({
    ...viewport,
    offsetX: 500,
    offsetY: 500,
  });
  assert.equal(
    await renderer.loadVisibleTiles(new AbortController().signal),
    true,
  );
  assert.equal(provider.ranges.length, 0);
});

test("rejects malformed symbol visuals before drawing", () => {
  const { pattern, version } = smallPattern();
  const invalidSummaries = [
    {
      ...summary(pattern, version),
      symbols: [
        {
          id: "symbol-x",
          sourceCode: "X",
        },
      ],
    },
    {
      ...summary(pattern, version),
      symbols: [
        {
          id: "symbol-x",
          sourceCode: "X",
          visual: { kind: "unknown" },
        },
      ],
    },
  ];
  for (const invalidSummary of invalidSummaries) {
    const renderer = new TiledPatternRenderer(
      new MemoryProvider(
        invalidSummary as unknown as PatternSummary,
        [],
      ),
    );
    assert.throws(
      () =>
        renderer.setPattern(invalidSummary as unknown as PatternSummary),
      (error: unknown) =>
        error instanceof RendererIntegrityError &&
        error.code === "RENDER_INVALID_SUMMARY",
    );
  }
});

test("rejects an oversized pattern version identity before provider use", () => {
  const { pattern, version } = smallPattern();
  const patternSummary: PatternSummary = {
    ...summary(pattern, version),
    patternVersionId: "v".repeat(MAX_RENDER_STRING_CODE_UNITS + 1),
  };
  let providerCalls = 0;
  const renderer = new TiledPatternRenderer({
    getPatternSummary: async () => patternSummary,
    getTiles: async () => {
      providerCalls += 1;
      return [];
    },
  });
  assert.throws(
    () => renderer.setPattern(patternSummary),
    (error: unknown) =>
      error instanceof RendererIntegrityError &&
      error.code === "RENDER_INVALID_SUMMARY",
  );
  assert.equal(providerCalls, 0);
});

test("enforces absolute tile request and response limits", async () => {
  const { pattern, version } = smallPattern();
  let providerCalls = 0;
  const oversizedRequestSummary: PatternSummary = {
    ...summary(pattern, version, 500_000),
    grid: {
      ...pattern.grid,
      width: 1_000,
      height: 501,
    },
    tileSize: 1,
  };
  const requestProvider: PatternTileProvider = {
    getPatternSummary: async () => oversizedRequestSummary,
    getTiles: async () => {
      providerCalls += 1;
      return [];
    },
  };
  const requestRenderer = new TiledPatternRenderer(requestProvider);
  requestRenderer.setPattern(oversizedRequestSummary);
  requestRenderer.setViewport({
    ...viewport,
    cellSize: 1,
    width: 1_000,
    height: 501,
  });
  await assert.rejects(
    requestRenderer.loadVisibleTiles(new AbortController().signal),
    (error: unknown) =>
      error instanceof RendererIntegrityError &&
      error.code === "RENDER_TILE_REQUEST_LIMIT",
  );
  assert.equal(providerCalls, 0);

  const maximumRequestSummary: PatternSummary = {
    ...oversizedRequestSummary,
    grid: {
      ...oversizedRequestSummary.grid,
      height: 500,
    },
  };
  const responseProvider: PatternTileProvider = {
    getPatternSummary: async () => maximumRequestSummary,
    getTiles: async () =>
      new Array(MAX_RENDER_REQUESTED_TILES + 1) as PatternTile[],
  };
  const responseRenderer = new TiledPatternRenderer(responseProvider);
  responseRenderer.setPattern(maximumRequestSummary);
  responseRenderer.setViewport({
    ...viewport,
    cellSize: 1,
    width: 1_000,
    height: 500,
  });
  await assert.rejects(
    responseRenderer.loadVisibleTiles(new AbortController().signal),
    (error: unknown) =>
      error instanceof RendererIntegrityError &&
      error.code === "RENDER_TILE_RESPONSE_LIMIT",
  );
});

test("keeps medium-fixture work bounded to requested visible tiles", async () => {
  const bytes = readFileSync(
    join(
      import.meta.dirname,
      "../../../tests/fixtures/oxs/generated/medium-full-cross.oxs",
    ),
  );
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
  assert.notEqual(imported.status, "rejected");
  if (imported.status === "rejected") return;
  const started = performance.now();
  const tiles = buildPatternTiles(
    imported.canonical.patternVersion.id,
    imported.canonical.stitches,
  );
  const tileBuildMs = performance.now() - started;
  const provider = new MemoryProvider(
    summary(
      imported.canonical.pattern,
      imported.canonical.patternVersion,
      imported.canonical.stitches.length,
    ),
    tiles,
  );
  const renderer = new TiledPatternRenderer(provider);
  renderer.setPattern(
    summary(
      imported.canonical.pattern,
      imported.canonical.patternVersion,
      imported.canonical.stitches.length,
    ),
  );
  renderer.setViewport({
    offsetX: 0,
    offsetY: 0,
    cellSize: 16,
    width: 1365,
    height: 768,
    devicePixelRatio: 1,
  });
  await renderer.loadVisibleTiles(new AbortController().signal);
  const output = frame();
  const metrics = renderer.render({ ...output.frame, budgetMs: 10_000 });
  assert.equal(imported.canonical.stitches.length, 100_000);
  assert.ok(metrics.visibleStitches < imported.canonical.stitches.length);
  assert.ok(metrics.visibleTiles <= 12);
  assert.ok(Number.isFinite(tileBuildMs));
});
