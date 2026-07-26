import type {
  Canvas2DLike,
  GlyphAtlasDraw,
  GlyphAtlasLike,
} from "@abris-universe/renderer";

const MAX_ATLAS_ENTRIES = 512;
const MAX_GLYPH_BITMAP_EDGE = 512;

type GlyphCanvas = HTMLCanvasElement | OffscreenCanvas;

interface GlyphEntry {
  readonly canvas: GlyphCanvas;
  readonly edge: number;
}

function zoomBucket(cellSize: number): number {
  return Math.max(1, Math.round(cellSize * 4) / 4);
}

export function glyphAtlasKey(draw: GlyphAtlasDraw): string {
  return [
    draw.glyph,
    draw.fontFamily,
    draw.color,
    zoomBucket(draw.cellSize),
    Math.round(draw.devicePixelRatio * 100) / 100,
  ].join("\u0000");
}

function createGlyphCanvas(edge: number): GlyphCanvas {
  if (typeof OffscreenCanvas !== "undefined") {
    return new OffscreenCanvas(edge, edge);
  }
  const canvas = document.createElement("canvas");
  canvas.width = edge;
  canvas.height = edge;
  return canvas;
}

export class BrowserGlyphAtlas implements GlyphAtlasLike {
  readonly #entries = new Map<string, GlyphEntry>();

  drawGlyph(context: Canvas2DLike, draw: GlyphAtlasDraw): boolean {
    const target = context as CanvasRenderingContext2D;
    if (typeof target.drawImage !== "function") return false;
    const bucket = zoomBucket(draw.cellSize);
    const edge = Math.ceil(bucket * draw.devicePixelRatio);
    if (edge < 1 || edge > MAX_GLYPH_BITMAP_EDGE) return false;
    const key = glyphAtlasKey(draw);
    let entry = this.#entries.get(key);
    if (entry === undefined) {
      if (this.#entries.size >= MAX_ATLAS_ENTRIES) {
        const oldest = this.#entries.keys().next().value;
        if (oldest !== undefined) this.#entries.delete(oldest);
      }
      const canvas = createGlyphCanvas(edge);
      const glyphContext = canvas.getContext("2d");
      if (glyphContext === null) return false;
      glyphContext.setTransform(
        draw.devicePixelRatio,
        0,
        0,
        draw.devicePixelRatio,
        0,
        0,
      );
      glyphContext.clearRect(0, 0, bucket, bucket);
      glyphContext.fillStyle = draw.color;
      glyphContext.font = `${Math.max(10, bucket * 0.65)}px ${draw.fontFamily}`;
      glyphContext.textAlign = "center";
      glyphContext.textBaseline = "middle";
      glyphContext.fillText(draw.glyph, bucket / 2, bucket / 2);
      entry = { canvas, edge };
      this.#entries.set(key, entry);
    }
    target.drawImage(
      entry.canvas as CanvasImageSource,
      0,
      0,
      entry.edge,
      entry.edge,
      draw.left,
      draw.top,
      draw.cellSize,
      draw.cellSize,
    );
    return true;
  }

  clear(): void {
    this.#entries.clear();
  }

  get size(): number {
    return this.#entries.size;
  }
}
