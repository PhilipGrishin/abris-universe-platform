/// <reference lib="webworker" />

import {
  READABLE_CELL_SIZE_CSS_PX,
  readableGlyphColor,
  type StaticRenderScene,
} from "@abris-universe/renderer";
import {
  TILE_RASTER_CACHE_BYTE_LIMIT,
  tileRasterBytes,
  tileRasterCacheable,
  tileRasterEdgeDevicePx,
  tileRasterKey,
} from "./render-worker-cache.ts";

interface DrawMessage {
  readonly type: "draw";
  readonly requestId: number;
  readonly scene: StaticRenderScene;
}

const scope: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;
const glyphAtlas = new Map<string, OffscreenCanvas>();
const tileRasters = new Map<
  string,
  { readonly canvas: OffscreenCanvas; readonly bytes: number }
>();
const MAX_ATLAS_ENTRIES = 512;
const MAX_TILE_RASTER_ENTRIES = 8;
let tileRasterBytesUsed = 0;
let activeRequestId = 0;
let output: OffscreenCanvas | null = null;

const yieldToMessages = (): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, 0));

function atlasGlyph(
  glyph: string,
  fontFamily: string,
  color: string,
  cellSize: number,
  devicePixelRatio: number,
): OffscreenCanvas {
  const bucket = Math.max(1, Math.round(cellSize * 4) / 4);
  const ratio = Math.round(devicePixelRatio * 100) / 100;
  const key = [glyph, fontFamily, color, bucket, ratio].join("\u0000");
  const existing = glyphAtlas.get(key);
  if (existing !== undefined) return existing;
  if (glyphAtlas.size >= MAX_ATLAS_ENTRIES) {
    const oldest = glyphAtlas.keys().next().value;
    if (oldest !== undefined) glyphAtlas.delete(oldest);
  }
  const edge = Math.max(1, Math.ceil(bucket * ratio));
  const canvas = new OffscreenCanvas(edge, edge);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Glyph atlas context is unavailable.");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.fillStyle = color;
  context.font = `${Math.max(10, bucket * 0.65)}px ${fontFamily}`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(glyph, bucket / 2, bucket / 2);
  glyphAtlas.set(key, canvas);
  return canvas;
}

function evictTileRasters(requiredBytes: number): void {
  while (
    tileRasters.size >= MAX_TILE_RASTER_ENTRIES ||
    tileRasterBytesUsed + requiredBytes > TILE_RASTER_CACHE_BYTE_LIMIT
  ) {
    const oldestKey = tileRasters.keys().next().value;
    if (oldestKey === undefined) return;
    const oldest = tileRasters.get(oldestKey);
    tileRasters.delete(oldestKey);
    tileRasterBytesUsed -= oldest?.bytes ?? 0;
  }
}

function drawStitch(
  context: OffscreenCanvasRenderingContext2D,
  scene: StaticRenderScene,
  stitch: StaticRenderScene["stitches"][number],
  left: number,
  top: number,
  readable: boolean,
  paletteById: ReadonlyMap<
    string,
    StaticRenderScene["summary"]["paletteItems"][number]
  >,
  symbolById: ReadonlyMap<
    string,
    StaticRenderScene["summary"]["symbols"][number]
  >,
): void {
  const { viewport } = scene;
  const palette = paletteById.get(stitch.paletteItemId);
  const symbol = symbolById.get(stitch.symbolId);
  if (palette === undefined || symbol === undefined) {
    throw new Error("Static scene contains a broken renderer reference.");
  }
  context.fillStyle = palette.displayColor;
  context.fillRect(left, top, viewport.cellSize, viewport.cellSize);
  if (!readable) return;
  context.strokeStyle = "#808080";
  context.lineWidth = 1;
  context.strokeRect(left, top, viewport.cellSize, viewport.cellSize);
  const glyph =
    symbol.visual.kind === "text-code-point" ? symbol.visual.value : "×";
  const fontFamily =
    symbol.visual.kind === "text-code-point"
      ? symbol.visual.fontFamily
      : "sans-serif";
  const atlas = atlasGlyph(
    glyph,
    fontFamily,
    readableGlyphColor(palette.displayColor),
    viewport.cellSize,
    viewport.devicePixelRatio,
  );
  context.drawImage(
    atlas,
    0,
    0,
    atlas.width,
    atlas.height,
    left,
    top,
    viewport.cellSize,
    viewport.cellSize,
  );
}

function cachedTileRaster(
  scene: StaticRenderScene,
  tileX: number,
  tileY: number,
  stitches: readonly StaticRenderScene["stitches"][number][],
  readable: boolean,
  paletteById: ReadonlyMap<
    string,
    StaticRenderScene["summary"]["paletteItems"][number]
  >,
  symbolById: ReadonlyMap<
    string,
    StaticRenderScene["summary"]["symbols"][number]
  >,
): OffscreenCanvas | null {
  const { summary, viewport } = scene;
  const edge = tileRasterEdgeDevicePx(
    summary.tileSize,
    viewport.cellSize,
    viewport.devicePixelRatio,
  );
  if (!tileRasterCacheable(edge)) return null;
  const key = tileRasterKey({
    patternVersionId: summary.patternVersionId,
    tileX,
    tileY,
    tileSize: summary.tileSize,
    cellSize: viewport.cellSize,
    devicePixelRatio: viewport.devicePixelRatio,
    readable,
  });
  const existing = tileRasters.get(key);
  if (existing !== undefined) {
    tileRasters.delete(key);
    tileRasters.set(key, existing);
    return existing.canvas;
  }
  const canvas = new OffscreenCanvas(edge, edge);
  const context = canvas.getContext("2d");
  if (context === null) throw new Error("Tile raster context is unavailable.");
  context.setTransform(
    viewport.devicePixelRatio,
    0,
    0,
    viewport.devicePixelRatio,
    0,
    0,
  );
  const tileOriginX = tileX * summary.tileSize;
  const tileOriginY = tileY * summary.tileSize;
  for (const stitch of stitches) {
    drawStitch(
      context,
      scene,
      stitch,
      (stitch.x - tileOriginX) * viewport.cellSize,
      (stitch.y - tileOriginY) * viewport.cellSize,
      readable,
      paletteById,
      symbolById,
    );
  }
  const bytes = tileRasterBytes(edge);
  evictTileRasters(bytes);
  tileRasters.set(key, { canvas, bytes });
  tileRasterBytesUsed += bytes;
  return canvas;
}

async function draw(requestId: number, scene: StaticRenderScene): Promise<void> {
  activeRequestId = requestId;
  const { summary, viewport, stitches } = scene;
  const width = Math.max(1, Math.round(viewport.width * viewport.devicePixelRatio));
  const height = Math.max(1, Math.round(viewport.height * viewport.devicePixelRatio));
  if (output === null || output.width !== width || output.height !== height) {
    output = new OffscreenCanvas(width, height);
  }
  const context = output.getContext("2d");
  if (context === null) throw new Error("Static render context is unavailable.");
  context.setTransform(
    viewport.devicePixelRatio,
    0,
    0,
    viewport.devicePixelRatio,
    0,
    0,
  );
  context.clearRect(0, 0, viewport.width, viewport.height);
  const paletteById = new Map(
    summary.paletteItems.map((item) => [item.id, item]),
  );
  const symbolById = new Map(summary.symbols.map((item) => [item.id, item]));
  const readable = viewport.cellSize >= READABLE_CELL_SIZE_CSS_PX;
  const startedAt = performance.now();
  const stitchesByTile = new Map<
    string,
    Array<(typeof stitches)[number]>
  >();
  for (const stitch of stitches) {
    const tileX = Math.floor(stitch.x / summary.tileSize);
    const tileY = Math.floor(stitch.y / summary.tileSize);
    const key = `${tileX}:${tileY}`;
    const existing = stitchesByTile.get(key);
    if (existing === undefined) stitchesByTile.set(key, [stitch]);
    else existing.push(stitch);
  }

  let drawnStitches = 0;
  for (const [coordinate, tileStitches] of stitchesByTile) {
    if (activeRequestId !== requestId) {
      scope.postMessage({ type: "cancelled", requestId });
      return;
    }
    const [tileXText, tileYText] = coordinate.split(":");
    const tileX = Number(tileXText);
    const tileY = Number(tileYText);
    const raster = cachedTileRaster(
      scene,
      tileX,
      tileY,
      tileStitches,
      readable,
      paletteById,
      symbolById,
    );
    if (raster !== null) {
      context.drawImage(
        raster,
        0,
        0,
        raster.width,
        raster.height,
        viewport.offsetX + tileX * summary.tileSize * viewport.cellSize,
        viewport.offsetY + tileY * summary.tileSize * viewport.cellSize,
        summary.tileSize * viewport.cellSize,
        summary.tileSize * viewport.cellSize,
      );
    } else {
      for (const stitch of tileStitches) {
        drawStitch(
          context,
          scene,
          stitch,
          viewport.offsetX + stitch.x * viewport.cellSize,
          viewport.offsetY + stitch.y * viewport.cellSize,
          readable,
          paletteById,
          symbolById,
        );
      }
    }
    drawnStitches += tileStitches.length;
    await yieldToMessages();
  }

  const bitmap = output.transferToImageBitmap();
  scope.postMessage(
    {
      type: "rendered",
      requestId,
      bitmap,
      durationMs: performance.now() - startedAt,
      drawnStitches,
      atlasEntries: glyphAtlas.size,
    },
    [bitmap],
  );
}

scope.addEventListener("message", (event: MessageEvent<DrawMessage>) => {
  if (event.data.type !== "draw") return;
  void draw(event.data.requestId, event.data.scene).catch(() => {
    scope.postMessage({
      type: "failed",
      requestId: event.data.requestId,
      message: "Static render Worker failed.",
    });
  });
});
