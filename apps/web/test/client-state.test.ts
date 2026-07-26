import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ClientProgressState,
  clampCellSize,
  syncCanvasBackingStore,
  zoomViewport,
} from "../src/client-state.ts";
import { glyphAtlasKey } from "../src/glyph-atlas.ts";
import { countedCoordinate, issueMessage } from "../src/messages.ts";
import { supportsOffscreenWorkerRendering } from "../src/render-worker-client.ts";
import {
  TILE_RASTER_CACHE_BYTE_LIMIT,
  tileRasterBytes,
  tileRasterCacheable,
  tileRasterEdgeDevicePx,
  tileRasterKey,
} from "../src/render-worker-cache.ts";

test("zoom preserves the canonical point under its anchor and clamps scale", () => {
  const viewport = {
    offsetX: 10,
    offsetY: 20,
    cellSize: 20,
    width: 400,
    height: 300,
    devicePixelRatio: 1,
  };
  const zoomed = zoomViewport(viewport, 2, { x: 110, y: 120 });
  assert.equal(zoomed.cellSize, 40);
  assert.equal((110 - zoomed.offsetX) / zoomed.cellSize, 5);
  assert.equal((120 - zoomed.offsetY) / zoomed.cellSize, 5);
  assert.equal(clampCellSize(1), 8);
  assert.equal(clampCellSize(100), 64);
});

test("progress failure restores the committed value and exposes not-saved", () => {
  const progress = new ClientProgressState();
  progress.hydrate([{ stitchId: "s-1", state: "marked" }]);
  progress.begin("s-1", "unmarked");
  assert.deepEqual(progress.getState("s-1"), {
    status: "saving",
    committed: "marked",
    pending: "unmarked",
  });
  progress.fail("s-1");
  assert.deepEqual(progress.getState("s-1"), {
    status: "not-saved",
    committed: "marked",
  });
});

test("canvas backing-store synchronization does not clear unchanged dimensions", () => {
  let writes = 0;
  let width = 800;
  let height = 600;
  const canvas = {
    get width() {
      return width;
    },
    set width(value: number) {
      writes += 1;
      width = value;
    },
    get height() {
      return height;
    },
    set height(value: number) {
      writes += 1;
      height = value;
    },
  };
  assert.equal(syncCanvasBackingStore(canvas, 400, 300, 2), false);
  assert.equal(writes, 0);
  assert.equal(syncCanvasBackingStore(canvas, 420, 300, 2), true);
  assert.equal(writes, 1);
  assert.equal(canvas.width, 840);
});

test("user messages remain bounded and coordinates are one-based", () => {
  assert.equal(countedCoordinate(0, 0), "row 1, column 1");
  assert.match(issueMessage("OXS_XML_INVALID"), /damaged or incomplete/u);
  assert.doesNotMatch(issueMessage("<untrusted>"), /untrusted/u);
});

test("glyph atlas keys include zoom bucket, DPR, glyph, font, and color", () => {
  const base = {
    glyph: "X",
    fontFamily: "sans-serif",
    color: "#000000",
    left: 0,
    top: 0,
    cellSize: 20,
    devicePixelRatio: 2,
  };
  assert.equal(glyphAtlasKey(base), glyphAtlasKey({ ...base, left: 100, top: 50 }));
  assert.notEqual(
    glyphAtlasKey(base),
    glyphAtlasKey({ ...base, devicePixelRatio: 1 }),
  );
  assert.notEqual(
    glyphAtlasKey(base),
    glyphAtlasKey({ ...base, cellSize: 24 }),
  );
  assert.equal(typeof supportsOffscreenWorkerRendering(), "boolean");
  assert.equal(supportsOffscreenWorkerRendering(true), false);
});

test("worker tile-raster cache has deterministic identities and memory ceilings", () => {
  const identity = {
    patternVersionId: "pattern-version:1",
    tileX: 2,
    tileY: 3,
    tileSize: 32,
    cellSize: 28,
    devicePixelRatio: 2,
    readable: true,
  };
  assert.equal(tileRasterKey(identity), tileRasterKey({ ...identity }));
  assert.notEqual(
    tileRasterKey(identity),
    tileRasterKey({ ...identity, tileX: 4 }),
  );
  const edge = tileRasterEdgeDevicePx(32, 28, 2);
  assert.equal(edge, 1_792);
  assert.equal(tileRasterCacheable(edge), true);
  assert.ok(tileRasterBytes(edge) < TILE_RASTER_CACHE_BYTE_LIMIT);
  assert.equal(tileRasterCacheable(4_096), false);
});
