import type { FullCrossStitch } from "@abris-universe/domain-core";
import {
  MAX_RENDER_REQUESTED_TILES,
  MAX_RENDER_STITCHES,
  MAX_RENDER_STRING_CODE_UNITS,
  READABLE_CELL_SIZE_CSS_PX,
  type Canvas2DLike,
  type GlyphAtlasLike,
  type PatternSummary,
  type PatternTile,
  type PatternTileProvider,
  type PatternRenderer,
  type Point,
  type ProgressRenderState,
  type ProgressRenderFrame,
  type ProgressStateProvider,
  type RenderFrame,
  type RendererExecutionPath,
  type RenderMetrics,
  type StitchHit,
  type StaticRenderScene,
  type TileRange,
  type Viewport,
} from "./contracts.ts";
import { readableGlyphColor } from "./contrast.ts";
import { tileKey } from "./tiles.ts";
import {
  insideGrid,
  screenToCanonicalCell,
  toStitchHit,
  visibleTileRange,
} from "./viewport.ts";

const EMPTY_PROGRESS: ProgressStateProvider = {
  getState: () => ({ status: "committed", value: "unmarked" }),
};

export class RendererIntegrityError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RendererIntegrityError";
    this.code = code;
  }
}

function integrityFailure(code: string, message: string): never {
  throw new RendererIntegrityError(code, message);
}

function assertSummary(summary: PatternSummary): void {
  if (
    summary === null ||
    typeof summary !== "object" ||
    typeof summary.patternVersionId !== "string" ||
    summary.grid === null ||
    typeof summary.grid !== "object" ||
    !Array.isArray(summary.paletteItems) ||
    !Array.isArray(summary.symbols) ||
    summary.patternVersionId.length > MAX_RENDER_STRING_CODE_UNITS ||
    summary.patternVersionId.trim().length === 0 ||
    !Number.isSafeInteger(summary.tileSize) ||
    summary.tileSize <= 0 ||
    summary.tileSize > 10_000 ||
    !Number.isSafeInteger(summary.grid.width) ||
    summary.grid.width <= 0 ||
    summary.grid.width > 10_000 ||
    !Number.isSafeInteger(summary.grid.height) ||
    summary.grid.height <= 0 ||
    summary.grid.height > 10_000 ||
    summary.paletteItems.length > 4_096 ||
    summary.symbols.length > 4_096 ||
    !Number.isSafeInteger(summary.stitchCount) ||
    summary.stitchCount < 0 ||
    summary.stitchCount > MAX_RENDER_STITCHES ||
    summary.grid.origin !== "top-left" ||
    summary.grid.coordinateBase !== 0 ||
    summary.grid.xDirection !== "right" ||
    summary.grid.yDirection !== "down"
  ) {
    integrityFailure(
      "RENDER_INVALID_SUMMARY",
      "Pattern summary is not a valid canonical renderer summary.",
    );
  }
  const paletteIds = new Set<string>();
  for (const item of summary.paletteItems) {
    if (
      item === null ||
      typeof item !== "object" ||
      typeof item.id !== "string" ||
      typeof item.displayColor !== "string" ||
      item.id.trim().length === 0 ||
      item.id.length > MAX_RENDER_STRING_CODE_UNITS ||
      paletteIds.has(item.id)
    ) {
      integrityFailure(
        "RENDER_INVALID_SUMMARY",
        "Pattern summary contains an invalid or duplicate palette identity.",
      );
    }
    try {
      readableGlyphColor(item.displayColor);
    } catch {
      integrityFailure(
        "RENDER_INVALID_SUMMARY",
        "Pattern summary contains an invalid palette display color.",
      );
    }
    paletteIds.add(item.id);
  }
  const symbolIds = new Set<string>();
  for (const symbol of summary.symbols) {
    if (
      symbol === null ||
      typeof symbol !== "object" ||
      typeof symbol.id !== "string" ||
      typeof symbol.sourceCode !== "string" ||
      symbol.id.trim().length === 0 ||
      symbol.id.length > MAX_RENDER_STRING_CODE_UNITS ||
      symbol.sourceCode.length === 0 ||
      symbol.sourceCode.length > MAX_RENDER_STRING_CODE_UNITS ||
      symbol.visual === null ||
      typeof symbol.visual !== "object" ||
      symbolIds.has(symbol.id)
    ) {
      integrityFailure(
        "RENDER_INVALID_SUMMARY",
        "Pattern summary contains an invalid or duplicate symbol identity.",
      );
    }
    if (symbol.visual.kind === "text-code-point") {
      if (
        typeof symbol.visual.value !== "string" ||
        [...symbol.visual.value].length !== 1 ||
        typeof symbol.visual.fontFamily !== "string" ||
        symbol.visual.fontFamily.trim().length === 0 ||
        symbol.visual.fontFamily.length > MAX_RENDER_STRING_CODE_UNITS
      ) {
        integrityFailure(
          "RENDER_INVALID_SUMMARY",
          "Pattern summary contains an invalid text symbol visual.",
        );
      }
    } else if (
      symbol.visual.kind !== "generated" ||
      symbol.visual.generatorVersion !== 1 ||
      !Number.isSafeInteger(symbol.visual.ordinal) ||
      symbol.visual.ordinal < 0
    ) {
      integrityFailure(
        "RENDER_INVALID_SUMMARY",
        "Pattern summary contains an invalid or unknown symbol visual.",
      );
    }
    symbolIds.add(symbol.id);
  }
}

function isEmptyRange(range: {
  readonly minTileX: number;
  readonly maxTileX: number;
  readonly minTileY: number;
  readonly maxTileY: number;
}): boolean {
  return range.minTileX > range.maxTileX || range.minTileY > range.maxTileY;
}

export function selectRendererExecutionPath(
  supportsOffscreenCanvas: boolean,
  supportsWorker: boolean,
): RendererExecutionPath {
  return supportsOffscreenCanvas && supportsWorker
    ? "offscreen-worker"
    : "incremental-main-thread";
}

export class TiledPatternRenderer implements PatternRenderer {
  readonly #provider: PatternTileProvider;
  readonly #progress: ProgressStateProvider;
  readonly #clock: () => number;
  #summary: PatternSummary | null = null;
  #paletteById = new Map<string, PatternSummary["paletteItems"][number]>();
  #symbolById = new Map<string, PatternSummary["symbols"][number]>();
  #viewport: Viewport | null = null;
  #tiles = new Map<string, PatternTile>();
  #visibleStitches: readonly FullCrossStitch[] = [];
  #visibleById = new Map<string, FullCrossStitch>();
  #staticCursor = 0;
  #staticDirty = true;
  #overlayFullDirty = true;
  #overlayCursor = 0;
  #changedProgressIds = new Set<string>();
  #loadGeneration = 0;

  constructor(
    provider: PatternTileProvider,
    progress: ProgressStateProvider = EMPTY_PROGRESS,
    clock: () => number = performance.now.bind(performance),
  ) {
    this.#provider = provider;
    this.#progress = progress;
    this.#clock = clock;
  }

  setPattern(summary: PatternSummary): void {
    assertSummary(summary);
    this.#loadGeneration += 1;
    this.#summary = summary;
    this.#paletteById = new Map(
      summary.paletteItems.map((item) => [item.id, item]),
    );
    this.#symbolById = new Map(
      summary.symbols.map((item) => [item.id, item]),
    );
    this.#tiles.clear();
    this.#visibleStitches = [];
    this.#visibleById.clear();
    this.#invalidateAll();
  }

  setViewport(viewport: Viewport): void {
    this.#loadGeneration += 1;
    this.#viewport = viewport;
    this.#invalidateAll();
  }

  setProgress(changedStitchIds: readonly string[]): void {
    for (const stitchId of changedStitchIds) {
      if (stitchId.trim().length === 0) {
        throw new TypeError("Changed stitch identities must be non-empty.");
      }
      if (stitchId.length > MAX_RENDER_STRING_CODE_UNITS) {
        throw new TypeError("Changed stitch identity exceeds the renderer limit.");
      }
      if (this.#visibleById.has(stitchId)) {
        this.#changedProgressIds.add(stitchId);
      }
    }
  }

  async loadVisibleTiles(signal: AbortSignal): Promise<boolean> {
    const summary = this.#requireSummary();
    const viewport = this.#requireViewport();
    const generation = ++this.#loadGeneration;
    if (signal.aborted) {
      throw new DOMException("Aborted.", "AbortError");
    }
    const range = visibleTileRange(summary, viewport);
    if (isEmptyRange(range)) {
      this.#tiles.clear();
      this.#visibleStitches = [];
      this.#visibleById.clear();
      this.#invalidateAll();
      return true;
    }
    const requestedTileCount =
      (range.maxTileX - range.minTileX + 1) *
      (range.maxTileY - range.minTileY + 1);
    if (requestedTileCount > MAX_RENDER_REQUESTED_TILES) {
      integrityFailure(
        "RENDER_TILE_REQUEST_LIMIT",
        "Visible tile request exceeds the Phase 0 safety limit.",
      );
    }
    const tiles = await this.#provider.getTiles(
      summary.patternVersionId,
      range,
      signal,
    );
    if (signal.aborted || generation !== this.#loadGeneration) {
      return false;
    }
    this.#assertTiles(tiles, range, summary);
    this.#tiles = new Map(
      tiles.map((tile) => [tileKey(tile.tileX, tile.tileY), tile]),
    );
    this.#visibleStitches = tiles.flatMap((tile) => tile.stitches);
    this.#visibleById = new Map(
      this.#visibleStitches.map((stitch) => [stitch.id, stitch]),
    );
    this.#invalidateAll();
    return true;
  }

  render(frame: RenderFrame): RenderMetrics {
    const summary = this.#requireSummary();
    const viewport = this.#requireViewport();
    if (!Number.isFinite(frame.budgetMs) || frame.budgetMs <= 0) {
      throw new TypeError("Render budget must be positive.");
    }
    const start = this.#clock();
    const readable = viewport.cellSize >= READABLE_CELL_SIZE_CSS_PX;
    let drawnStaticStitches = 0;
    let drawnProgressStitches = 0;

    this.#prepareContext(frame.staticContext, viewport);
    this.#prepareContext(frame.progressContext, viewport);
    if (this.#staticDirty && this.#staticCursor === 0) {
      frame.staticContext.clearRect(0, 0, viewport.width, viewport.height);
    }
    while (
      this.#staticDirty &&
      this.#staticCursor < this.#visibleStitches.length
    ) {
      this.#drawStatic(
        frame.staticContext,
        this.#visibleStitches[this.#staticCursor]!,
        viewport,
        readable,
        frame.glyphAtlas,
      );
      this.#staticCursor += 1;
      drawnStaticStitches += 1;
      if (this.#clock() - start >= frame.budgetMs) {
        break;
      }
    }
    if (this.#staticCursor >= this.#visibleStitches.length) {
      this.#staticDirty = false;
      this.#staticCursor = 0;
    }

    if (
      !this.#staticDirty &&
      (drawnStaticStitches === 0 ||
        this.#clock() - start < frame.budgetMs)
    ) {
      drawnProgressStitches += this.#renderProgress(
        frame.progressContext,
        viewport,
        readable,
        start,
        frame.budgetMs,
      );
    }

    return {
      mode: readable ? "readable" : "overview",
      visibleTiles: this.#tiles.size,
      visibleStitches: this.#visibleStitches.length,
      drawnStaticStitches,
      drawnProgressStitches,
      complete:
        !this.#staticDirty &&
        !this.#overlayFullDirty &&
        this.#changedProgressIds.size === 0,
      elapsedMs: Math.max(0, this.#clock() - start),
    };
  }

  hitTest(point: Point): StitchHit | null {
    const summary = this.#requireSummary();
    const viewport = this.#requireViewport();
    if (viewport.cellSize < READABLE_CELL_SIZE_CSS_PX) {
      return null;
    }
    const cell = screenToCanonicalCell(viewport, point);
    if (!insideGrid(summary, cell)) {
      return null;
    }
    const tile = this.#tiles.get(
      tileKey(
        Math.floor(cell.x / summary.tileSize),
        Math.floor(cell.y / summary.tileSize),
      ),
    );
    const stitch = tile?.stitches.find(
      (candidate) => candidate.x === cell.x && candidate.y === cell.y,
    );
    return stitch === undefined
      ? null
      : toStitchHit(stitch.id, stitch.x, stitch.y);
  }

  getStaticScene(): StaticRenderScene {
    const summary = this.#requireSummary();
    const viewport = this.#requireViewport();
    return {
      summary,
      viewport,
      stitches: this.#visibleStitches,
    };
  }

  renderProgress(frame: ProgressRenderFrame): RenderMetrics {
    this.#requireSummary();
    const viewport = this.#requireViewport();
    if (!Number.isFinite(frame.budgetMs) || frame.budgetMs <= 0) {
      throw new TypeError("Render budget must be positive.");
    }
    const start = this.#clock();
    const readable = viewport.cellSize >= READABLE_CELL_SIZE_CSS_PX;
    this.#prepareContext(frame.progressContext, viewport);
    const drawnProgressStitches = this.#renderProgress(
      frame.progressContext,
      viewport,
      readable,
      start,
      frame.budgetMs,
    );
    return {
      mode: readable ? "readable" : "overview",
      visibleTiles: this.#tiles.size,
      visibleStitches: this.#visibleStitches.length,
      drawnStaticStitches: 0,
      drawnProgressStitches,
      complete:
        !this.#overlayFullDirty && this.#changedProgressIds.size === 0,
      elapsedMs: Math.max(0, this.#clock() - start),
    };
  }

  dispose(): void {
    this.#loadGeneration += 1;
    this.#summary = null;
    this.#viewport = null;
    this.#paletteById.clear();
    this.#symbolById.clear();
    this.#tiles.clear();
    this.#visibleStitches = [];
    this.#visibleById.clear();
    this.#changedProgressIds.clear();
  }

  #invalidateAll(): void {
    this.#staticCursor = 0;
    this.#staticDirty = true;
    this.#overlayCursor = 0;
    this.#overlayFullDirty = true;
    this.#changedProgressIds.clear();
  }

  #requireSummary(): PatternSummary {
    if (this.#summary === null) {
      throw new Error("Renderer pattern is not set.");
    }
    return this.#summary;
  }

  #requireViewport(): Viewport {
    if (this.#viewport === null) {
      throw new Error("Renderer viewport is not set.");
    }
    return this.#viewport;
  }

  #prepareContext(context: Canvas2DLike, viewport: Viewport): void {
    context.setTransform(
      viewport.devicePixelRatio,
      0,
      0,
      viewport.devicePixelRatio,
      0,
      0,
    );
  }

  #assertTiles(
    tiles: readonly PatternTile[],
    range: TileRange,
    summary: PatternSummary,
  ): void {
    if (!Array.isArray(tiles)) {
      integrityFailure(
        "RENDER_INVALID_TILE_RESPONSE",
        "Tile provider returned a non-array response.",
      );
    }
    const requestedTileCount =
      (range.maxTileX - range.minTileX + 1) *
      (range.maxTileY - range.minTileY + 1);
    if (
      tiles.length > MAX_RENDER_REQUESTED_TILES ||
      tiles.length > summary.stitchCount
    ) {
      integrityFailure(
        "RENDER_TILE_RESPONSE_LIMIT",
        "Tile response exceeds the absolute Phase 0 tile limit.",
      );
    }
    if (tiles.length > requestedTileCount) {
      integrityFailure(
        "RENDER_TILE_RESPONSE_LIMIT",
        "Tile provider returned more tiles than the requested range permits.",
      );
    }
    const maxGridTileX = Math.ceil(summary.grid.width / summary.tileSize) - 1;
    const maxGridTileY = Math.ceil(summary.grid.height / summary.tileSize) - 1;
    const tileKeys = new Set<string>();
    const stitchIds = new Set<string>();
    const stitchCells = new Set<string>();
    let stitchCount = 0;
    for (const tile of tiles) {
      if (
        tile === null ||
        typeof tile !== "object" ||
        tile.patternVersionId !== summary.patternVersionId ||
        !Number.isSafeInteger(tile.tileX) ||
        !Number.isSafeInteger(tile.tileY) ||
        tile.tileX < range.minTileX ||
        tile.tileX > range.maxTileX ||
        tile.tileY < range.minTileY ||
        tile.tileY > range.maxTileY ||
        tile.tileX < 0 ||
        tile.tileX > maxGridTileX ||
        tile.tileY < 0 ||
        tile.tileY > maxGridTileY ||
        !Array.isArray(tile.stitches)
      ) {
        integrityFailure(
          "RENDER_INVALID_TILE_RESPONSE",
          "Tile provider returned an invalid, mis-keyed, or out-of-range tile.",
        );
      }
      const key = tileKey(tile.tileX, tile.tileY);
      if (tileKeys.has(key)) {
        integrityFailure(
          "RENDER_DUPLICATE_TILE",
          "Tile provider returned the same tile more than once.",
        );
      }
      tileKeys.add(key);
      if (
        tile.stitches.length === 0 ||
        tile.stitches.length > summary.tileSize * summary.tileSize
      ) {
        integrityFailure(
          "RENDER_TILE_RESPONSE_LIMIT",
          "Tile contains more stitches than its cell capacity.",
        );
      }
      let previousLocalIndex = -1;
      for (const stitch of tile.stitches) {
        stitchCount += 1;
        if (
          stitchCount > MAX_RENDER_STITCHES ||
          stitchCount > summary.stitchCount ||
          stitchCount > requestedTileCount * summary.tileSize ** 2
        ) {
          integrityFailure(
            "RENDER_TILE_RESPONSE_LIMIT",
            "Tile response exceeds the requested cell capacity.",
          );
        }
        if (
          stitch === null ||
          typeof stitch !== "object" ||
          stitch.type !== "full-cross" ||
          typeof stitch.id !== "string" ||
          typeof stitch.paletteItemId !== "string" ||
          typeof stitch.symbolId !== "string" ||
          stitch.id.trim().length === 0 ||
          stitch.id.length > MAX_RENDER_STRING_CODE_UNITS ||
          stitch.paletteItemId.length > MAX_RENDER_STRING_CODE_UNITS ||
          stitch.symbolId.length > MAX_RENDER_STRING_CODE_UNITS ||
          !Number.isSafeInteger(stitch.x) ||
          !Number.isSafeInteger(stitch.y) ||
          stitch.x < 0 ||
          stitch.y < 0 ||
          stitch.x >= summary.grid.width ||
          stitch.y >= summary.grid.height ||
          Math.floor(stitch.x / summary.tileSize) !== tile.tileX ||
          Math.floor(stitch.y / summary.tileSize) !== tile.tileY ||
          !this.#paletteById.has(stitch.paletteItemId) ||
          !this.#symbolById.has(stitch.symbolId)
        ) {
          integrityFailure(
            "RENDER_INVALID_STITCH",
            "Tile provider returned an invalid stitch or broken reference.",
          );
        }
        const cell = `${stitch.y}:${stitch.x}`;
        if (stitchIds.has(stitch.id) || stitchCells.has(cell)) {
          integrityFailure(
            "RENDER_DUPLICATE_STITCH",
            "Tile provider returned a duplicate stitch identity or cell.",
          );
        }
        stitchIds.add(stitch.id);
        stitchCells.add(cell);
        const localIndex =
          (stitch.y % summary.tileSize) * summary.tileSize +
          (stitch.x % summary.tileSize);
        if (localIndex < previousLocalIndex) {
          integrityFailure(
            "RENDER_UNSORTED_TILE",
            "Tile stitches are not sorted by local cell index.",
          );
        }
        previousLocalIndex = localIndex;
      }
    }
  }

  #renderProgress(
    context: Canvas2DLike,
    viewport: Viewport,
    readable: boolean,
    start: number,
    budgetMs: number,
  ): number {
    let drawn = 0;
    if (this.#overlayFullDirty) {
      if (this.#overlayCursor === 0) {
        context.clearRect(0, 0, viewport.width, viewport.height);
      }
      if (!readable) {
        this.#overlayFullDirty = false;
        this.#changedProgressIds.clear();
        return 0;
      }
      while (this.#overlayCursor < this.#visibleStitches.length) {
        if (
          this.#drawProgress(
            context,
            this.#visibleStitches[this.#overlayCursor]!,
            viewport,
          )
        ) {
          drawn += 1;
        }
        this.#overlayCursor += 1;
        if (this.#clock() - start >= budgetMs) {
          return drawn;
        }
      }
      this.#overlayCursor = 0;
      this.#overlayFullDirty = false;
      return drawn;
    }

    while (this.#changedProgressIds.size > 0) {
      const stitchId = this.#changedProgressIds.values().next().value;
      if (stitchId === undefined) {
        break;
      }
      this.#changedProgressIds.delete(stitchId);
      const stitch = this.#visibleById.get(stitchId);
      if (stitch !== undefined) {
        const left = viewport.offsetX + stitch.x * viewport.cellSize;
        const top = viewport.offsetY + stitch.y * viewport.cellSize;
        context.clearRect(left, top, viewport.cellSize, viewport.cellSize);
        if (readable && this.#drawProgress(context, stitch, viewport)) {
          drawn += 1;
        }
      }
      if (this.#clock() - start >= budgetMs) {
        break;
      }
    }
    return drawn;
  }

  #assertProgressState(state: ProgressRenderState): void {
    const validMark = (value: unknown): boolean =>
      value === "unmarked" || value === "marked";
    if (
      state === null ||
      typeof state !== "object" ||
      (state.status === "committed" && !validMark(state.value)) ||
      (state.status === "saving" &&
        (!validMark(state.committed) || !validMark(state.pending))) ||
      (state.status === "not-saved" && !validMark(state.committed)) ||
      !["committed", "saving", "not-saved"].includes(state.status)
    ) {
      integrityFailure(
        "RENDER_INVALID_PROGRESS_STATE",
        "Progress provider returned an invalid render state.",
      );
    }
  }

  #drawStatic(
    context: Canvas2DLike,
    stitch: FullCrossStitch,
    viewport: Viewport,
    readable: boolean,
    glyphAtlas?: GlyphAtlasLike,
  ): void {
    const palette = this.#paletteById.get(stitch.paletteItemId);
    const symbol = this.#symbolById.get(stitch.symbolId);
    if (palette === undefined || symbol === undefined) {
      throw new Error(`Renderer reference is missing for stitch ${stitch.id}.`);
    }
    const left = viewport.offsetX + stitch.x * viewport.cellSize;
    const top = viewport.offsetY + stitch.y * viewport.cellSize;
    context.fillStyle = palette.displayColor;
    context.fillRect(left, top, viewport.cellSize, viewport.cellSize);
    if (!readable) {
      return;
    }
    context.strokeStyle = "#808080";
    context.lineWidth = 1;
    context.strokeRect(left, top, viewport.cellSize, viewport.cellSize);
    const glyphColor = readableGlyphColor(palette.displayColor);
    const glyph =
      symbol.visual.kind === "text-code-point" ? symbol.visual.value : "×";
    const fontFamily =
      symbol.visual.kind === "text-code-point"
        ? symbol.visual.fontFamily
        : "sans-serif";
    if (
      glyphAtlas?.drawGlyph(context, {
        glyph,
        fontFamily,
        color: glyphColor,
        left,
        top,
        cellSize: viewport.cellSize,
        devicePixelRatio: viewport.devicePixelRatio,
      }) === true
    ) {
      return;
    }
    context.fillStyle = glyphColor;
    context.font = `${Math.max(10, viewport.cellSize * 0.65)}px ${fontFamily}`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      glyph,
      left + viewport.cellSize / 2,
      top + viewport.cellSize / 2,
    );
  }

  #drawProgress(
    context: Canvas2DLike,
    stitch: FullCrossStitch,
    viewport: Viewport,
  ): boolean {
    const state = this.#progress.getState(stitch.id);
    this.#assertProgressState(state);
    const left = viewport.offsetX + stitch.x * viewport.cellSize;
    const top = viewport.offsetY + stitch.y * viewport.cellSize;
    const right = left + viewport.cellSize;
    const bottom = top + viewport.cellSize;
    const visibleMark =
      state.status === "committed"
        ? state.value
        : state.status === "saving"
          ? state.pending
          : state.committed;
    const hasStatus = state.status !== "committed";
    if (visibleMark === "unmarked" && !hasStatus) {
      return false;
    }
    context.strokeStyle =
      state.status === "not-saved"
        ? "#B00020"
        : state.status === "saving"
          ? "#1A5FB4"
          : "#202020";
    if (visibleMark === "marked") {
      context.fillStyle = "rgba(255,255,255,0.35)";
      context.fillRect(left, top, viewport.cellSize, viewport.cellSize);
      context.beginPath();
      context.lineWidth = 2;
      context.moveTo(left + 2, top + 2);
      context.lineTo(right - 2, bottom - 2);
      context.moveTo(right - 2, top + 2);
      context.lineTo(left + 2, bottom - 2);
      context.stroke();
    }
    if (state.status === "saving") {
      context.lineWidth = 3;
      context.strokeRect(
        left + 1,
        top + 1,
        viewport.cellSize - 2,
        viewport.cellSize - 2,
      );
    } else if (state.status === "not-saved") {
      context.lineWidth = 3;
      context.strokeRect(
        left + 1,
        top + 1,
        viewport.cellSize - 2,
        viewport.cellSize - 2,
      );
      context.strokeRect(
        left + 4,
        top + 4,
        viewport.cellSize - 8,
        viewport.cellSize - 8,
      );
    }
    return true;
  }
}
