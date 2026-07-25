import type { FullCrossStitch } from "@abris-universe/domain-core";
import {
  READABLE_CELL_SIZE_CSS_PX,
  type Canvas2DLike,
  type PatternSummary,
  type PatternTile,
  type PatternTileProvider,
  type PatternRenderer,
  type Point,
  type ProgressStateProvider,
  type RenderFrame,
  type RendererExecutionPath,
  type RenderMetrics,
  type StitchHit,
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
  getState: () => "unmarked",
};

export function selectRendererExecutionPath(
  supportsOffscreenCanvas: boolean,
  supportsWorker: boolean,
): RendererExecutionPath {
  return supportsOffscreenCanvas && supportsWorker
    ? "offscreen-worker-capable"
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
  #staticCursor = 0;
  #staticDirty = true;
  #overlayDirty = true;
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
    this.#invalidateAll();
  }

  setViewport(viewport: Viewport): void {
    this.#loadGeneration += 1;
    this.#viewport = viewport;
    this.#invalidateAll();
  }

  setProgress(changedStitchIds: readonly string[]): void {
    if (changedStitchIds.length > 0) {
      this.#overlayDirty = true;
    }
  }

  async loadVisibleTiles(signal: AbortSignal): Promise<boolean> {
    const summary = this.#requireSummary();
    const viewport = this.#requireViewport();
    const generation = ++this.#loadGeneration;
    const tiles = await this.#provider.getTiles(
      summary.patternVersionId,
      visibleTileRange(summary, viewport),
      signal,
    );
    if (signal.aborted || generation !== this.#loadGeneration) {
      return false;
    }
    this.#tiles = new Map(
      tiles.map((tile) => [tileKey(tile.tileX, tile.tileY), tile]),
    );
    this.#visibleStitches = tiles.flatMap((tile) => tile.stitches);
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

    if (!this.#staticDirty && this.#overlayDirty) {
      frame.progressContext.clearRect(0, 0, viewport.width, viewport.height);
      if (readable) {
        for (const stitch of this.#visibleStitches) {
          if (this.#progress.getState(stitch.id) !== "unmarked") {
            this.#drawProgress(frame.progressContext, stitch, viewport);
            drawnProgressStitches += 1;
          }
        }
      }
      this.#overlayDirty = false;
    }

    return {
      mode: readable ? "readable" : "overview",
      visibleTiles: this.#tiles.size,
      visibleStitches: this.#visibleStitches.length,
      drawnStaticStitches,
      drawnProgressStitches,
      complete: !this.#staticDirty && !this.#overlayDirty,
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

  dispose(): void {
    this.#loadGeneration += 1;
    this.#summary = null;
    this.#viewport = null;
    this.#paletteById.clear();
    this.#symbolById.clear();
    this.#tiles.clear();
    this.#visibleStitches = [];
  }

  #invalidateAll(): void {
    this.#staticCursor = 0;
    this.#staticDirty = true;
    this.#overlayDirty = true;
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

  #drawStatic(
    context: Canvas2DLike,
    stitch: FullCrossStitch,
    viewport: Viewport,
    readable: boolean,
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
    context.fillStyle = readableGlyphColor(palette.displayColor);
    context.font = `${Math.max(10, viewport.cellSize * 0.65)}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      symbol.visual.kind === "text-code-point" ? symbol.visual.value : "×",
      left + viewport.cellSize / 2,
      top + viewport.cellSize / 2,
    );
  }

  #drawProgress(
    context: Canvas2DLike,
    stitch: FullCrossStitch,
    viewport: Viewport,
  ): void {
    const state = this.#progress.getState(stitch.id);
    const left = viewport.offsetX + stitch.x * viewport.cellSize;
    const top = viewport.offsetY + stitch.y * viewport.cellSize;
    const right = left + viewport.cellSize;
    const bottom = top + viewport.cellSize;
    context.beginPath();
    context.strokeStyle =
      state === "not-saved"
        ? "#B00020"
        : state === "saving"
          ? "#1A5FB4"
          : "#202020";
    context.lineWidth = state === "marked" ? 2 : 3;
    context.moveTo(left + 2, top + 2);
    context.lineTo(right - 2, bottom - 2);
    context.moveTo(right - 2, top + 2);
    context.lineTo(left + 2, bottom - 2);
    context.stroke();
    if (state === "saving" || state === "not-saved") {
      context.strokeRect(left + 1, top + 1, viewport.cellSize - 2, viewport.cellSize - 2);
    }
  }
}
