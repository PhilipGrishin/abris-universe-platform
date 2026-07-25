import type {
  PatternSummary,
  Point,
  StitchHit,
  TileRange,
  Viewport,
} from "./contracts.ts";

function requireViewport(viewport: Viewport): void {
  if (
    !Number.isFinite(viewport.offsetX) ||
    !Number.isFinite(viewport.offsetY) ||
    !Number.isFinite(viewport.cellSize) ||
    viewport.cellSize <= 0 ||
    !Number.isFinite(viewport.width) ||
    viewport.width <= 0 ||
    !Number.isFinite(viewport.height) ||
    viewport.height <= 0 ||
    !Number.isFinite(viewport.devicePixelRatio) ||
    viewport.devicePixelRatio <= 0
  ) {
    throw new TypeError("Viewport values must be finite and positive.");
  }
}

export function screenToCanonicalCell(
  viewport: Viewport,
  point: Point,
): { readonly x: number; readonly y: number } {
  requireViewport(viewport);
  return {
    x: Math.floor((point.x - viewport.offsetX) / viewport.cellSize),
    y: Math.floor((point.y - viewport.offsetY) / viewport.cellSize),
  };
}

export function visibleTileRange(
  summary: PatternSummary,
  viewport: Viewport,
  prefetchTiles = 1,
): TileRange {
  requireViewport(viewport);
  if (!Number.isSafeInteger(prefetchTiles) || prefetchTiles < 0) {
    throw new TypeError("Prefetch margin must be a non-negative integer.");
  }
  const firstX = Math.floor(-viewport.offsetX / viewport.cellSize);
  const firstY = Math.floor(-viewport.offsetY / viewport.cellSize);
  const lastX = Math.ceil(
    (viewport.width - viewport.offsetX) / viewport.cellSize,
  );
  const lastY = Math.ceil(
    (viewport.height - viewport.offsetY) / viewport.cellSize,
  );
  const maxTileX = Math.max(
    0,
    Math.ceil(summary.grid.width / summary.tileSize) - 1,
  );
  const maxTileY = Math.max(
    0,
    Math.ceil(summary.grid.height / summary.tileSize) - 1,
  );
  return {
    minTileX: Math.max(
      0,
      Math.floor(Math.max(0, firstX) / summary.tileSize) - prefetchTiles,
    ),
    maxTileX: Math.min(
      maxTileX,
      Math.floor(Math.min(summary.grid.width - 1, lastX) / summary.tileSize) +
        prefetchTiles,
    ),
    minTileY: Math.max(
      0,
      Math.floor(Math.max(0, firstY) / summary.tileSize) - prefetchTiles,
    ),
    maxTileY: Math.min(
      maxTileY,
      Math.floor(Math.min(summary.grid.height - 1, lastY) / summary.tileSize) +
        prefetchTiles,
    ),
  };
}

export function insideGrid(
  summary: PatternSummary,
  cell: { readonly x: number; readonly y: number },
): boolean {
  return (
    cell.x >= 0 &&
    cell.y >= 0 &&
    cell.x < summary.grid.width &&
    cell.y < summary.grid.height
  );
}

export function toStitchHit(
  stitchId: string,
  x: number,
  y: number,
): StitchHit {
  return { stitchId, x, y };
}
