import type {
  FullCrossStitch,
  Grid,
  PaletteItem,
  SymbolDefinition,
} from "@abris-universe/domain-core";

export const INITIAL_TILE_SIZE = 32;
export const READABLE_CELL_SIZE_CSS_PX = 16;
export const MAX_RENDER_REQUESTED_TILES = 500_000;
export const MAX_RENDER_STITCHES = 500_000;
export const MAX_RENDER_STRING_CODE_UNITS = 8 * 1024;

export interface PatternTile {
  readonly patternVersionId: string;
  readonly tileY: number;
  readonly tileX: number;
  readonly stitches: readonly FullCrossStitch[];
}

export interface TileRange {
  readonly minTileX: number;
  readonly maxTileX: number;
  readonly minTileY: number;
  readonly maxTileY: number;
}

export interface PatternSummary {
  readonly patternVersionId: string;
  readonly grid: Grid;
  readonly paletteItems: readonly PaletteItem[];
  readonly symbols: readonly SymbolDefinition[];
  readonly tileSize: number;
  readonly stitchCount: number;
}

export interface PatternTileProvider {
  getPatternSummary(patternVersionId: string): Promise<PatternSummary>;
  getTiles(
    patternVersionId: string,
    range: TileRange,
    signal: AbortSignal,
  ): Promise<readonly PatternTile[]>;
}

export interface Viewport {
  readonly offsetX: number;
  readonly offsetY: number;
  readonly cellSize: number;
  readonly width: number;
  readonly height: number;
  readonly devicePixelRatio: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

export interface StitchHit {
  readonly stitchId: string;
  readonly x: number;
  readonly y: number;
}

export type ProgressMark = "unmarked" | "marked";

export type ProgressRenderState =
  | {
      readonly status: "committed";
      readonly value: ProgressMark;
    }
  | {
      readonly status: "saving";
      readonly committed: ProgressMark;
      readonly pending: ProgressMark;
    }
  | {
      readonly status: "not-saved";
      readonly committed: ProgressMark;
    };

export interface ProgressStateProvider {
  getState(stitchId: string): ProgressRenderState;
}

export interface Canvas2DLike {
  fillStyle: string;
  strokeStyle: string;
  font: string;
  lineWidth: number;
  textAlign: CanvasTextAlign;
  textBaseline: CanvasTextBaseline;
  clearRect(x: number, y: number, width: number, height: number): void;
  fillRect(x: number, y: number, width: number, height: number): void;
  strokeRect(x: number, y: number, width: number, height: number): void;
  fillText(text: string, x: number, y: number): void;
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  stroke(): void;
  setTransform(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    f: number,
  ): void;
}

export interface RenderFrame {
  readonly staticContext: Canvas2DLike;
  readonly progressContext: Canvas2DLike;
  readonly budgetMs: number;
}

export interface RenderMetrics {
  readonly mode: "readable" | "overview";
  readonly visibleTiles: number;
  readonly visibleStitches: number;
  readonly drawnStaticStitches: number;
  readonly drawnProgressStitches: number;
  readonly complete: boolean;
  readonly elapsedMs: number;
}

export type RendererExecutionPath =
  | "offscreen-worker-capable"
  | "incremental-main-thread";

export interface PatternRenderer {
  setPattern(summary: PatternSummary): void;
  setViewport(viewport: Viewport): void;
  setProgress(changedStitchIds: readonly string[]): void;
  loadVisibleTiles(signal: AbortSignal): Promise<boolean>;
  render(frame: RenderFrame): RenderMetrics;
  hitTest(point: Point): StitchHit | null;
  dispose(): void;
}
