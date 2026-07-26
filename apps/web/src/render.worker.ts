/// <reference lib="webworker" />

import {
  READABLE_CELL_SIZE_CSS_PX,
  readableGlyphColor,
  type StaticRenderScene,
} from "@abris-universe/renderer";

interface DrawMessage {
  readonly type: "draw";
  readonly requestId: number;
  readonly scene: StaticRenderScene;
}

const scope: DedicatedWorkerGlobalScope = self as DedicatedWorkerGlobalScope;
const glyphAtlas = new Map<string, OffscreenCanvas>();
const MAX_ATLAS_ENTRIES = 512;
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

  for (let index = 0; index < stitches.length; index += 1) {
    if (activeRequestId !== requestId) {
      scope.postMessage({ type: "cancelled", requestId });
      return;
    }
    const stitch = stitches[index]!;
    const palette = paletteById.get(stitch.paletteItemId);
    const symbol = symbolById.get(stitch.symbolId);
    if (palette === undefined || symbol === undefined) {
      throw new Error("Static scene contains a broken renderer reference.");
    }
    const left = viewport.offsetX + stitch.x * viewport.cellSize;
    const top = viewport.offsetY + stitch.y * viewport.cellSize;
    context.fillStyle = palette.displayColor;
    context.fillRect(left, top, viewport.cellSize, viewport.cellSize);
    if (readable) {
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
    if (index > 0 && index % 512 === 0) await yieldToMessages();
  }

  const bitmap = output.transferToImageBitmap();
  scope.postMessage(
    {
      type: "rendered",
      requestId,
      bitmap,
      durationMs: performance.now() - startedAt,
      drawnStitches: stitches.length,
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
