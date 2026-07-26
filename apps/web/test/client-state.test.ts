import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ClientProgressState,
  clampCellSize,
  syncCanvasBackingStore,
  zoomViewport,
} from "../src/client-state.ts";
import { countedCoordinate, issueMessage } from "../src/messages.ts";

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
