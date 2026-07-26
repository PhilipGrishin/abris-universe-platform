/**
 * Accessible Canvas2D viewer integration for the approved Phase 0 flow.
 */
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type WheelEvent,
} from "react";
import {
  READABLE_CELL_SIZE_CSS_PX,
  TiledPatternRenderer,
  type Canvas2DLike,
  type RenderMetrics,
  type StitchHit,
  type Viewport,
} from "@abris-universe/renderer";

import {
  ClientProgressState,
  DEFAULT_CELL_SIZE,
  syncCanvasBackingStore,
  zoomViewport,
} from "./client-state.ts";
import { emitEngineeringEvidence } from "./engineering-evidence.ts";
import { countedCoordinate } from "./messages.ts";
import {
  ProjectService,
  type LoadedProject,
  type StitchDescription,
} from "./project-service.ts";

type SaveStatus = "saved" | "saving" | "not-saved" | "read-only";

interface ViewerProps {
  readonly loaded: LoadedProject;
  readonly service: ProjectService;
}

interface PointerGesture {
  readonly pointerId: number;
  readonly startX: number;
  readonly startY: number;
  readonly lastX: number;
  readonly lastY: number;
  readonly moved: boolean;
}

function errorCode(error: unknown): string | null {
  if (
    error !== null &&
    typeof error === "object" &&
    "code" in error &&
    typeof error.code === "string"
  ) {
    return error.code;
  }
  return null;
}

export function PatternViewer({ loaded, service }: ViewerProps) {
  const staticCanvas = useRef<HTMLCanvasElement>(null);
  const progressCanvas = useRef<HTMLCanvasElement>(null);
  const canvasShell = useRef<HTMLDivElement>(null);
  const gesture = useRef<PointerGesture | null>(null);
  const loadAbort = useRef<AbortController | null>(null);
  const animationFrame = useRef<number | null>(null);
  const commandQueue = useRef<Promise<void>>(Promise.resolve());
  const viewerStartedAt = useRef(performance.now());
  const viewerInteractiveReported = useRef(false);
  const pendingPaintStartedAt = useRef<number | null>(null);
  const progressState = useMemo(() => {
    const state = new ClientProgressState();
    state.hydrate(loaded.progress);
    return state;
  }, [loaded]);
  const renderer = useMemo(
    () => new TiledPatternRenderer(loaded.tileProvider, progressState),
    [loaded, progressState],
  );
  const [viewport, setViewport] = useState<Viewport>({
    offsetX: 24,
    offsetY: 24,
    cellSize: DEFAULT_CELL_SIZE,
    width: 1,
    height: 1,
    devicePixelRatio: window.devicePixelRatio || 1,
  });
  const [metrics, setMetrics] = useState<RenderMetrics | null>(null);
  const [selected, setSelected] = useState<{
    readonly hit: StitchHit;
    readonly description: StitchDescription | null;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>(
    navigator.locks === undefined ? "read-only" : "saved",
  );

  const renderUntilComplete = useCallback(() => {
    if (animationFrame.current !== null) {
      cancelAnimationFrame(animationFrame.current);
    }
    const draw = () => {
      const staticContext = staticCanvas.current?.getContext("2d");
      const progressContext = progressCanvas.current?.getContext("2d");
      if (staticContext === undefined || staticContext === null) return;
      if (progressContext === undefined || progressContext === null) return;
      const result = renderer.render({
        // The renderer intentionally accepts only the string-style subset used
        // by Canvas2D; the browser context is the concrete implementation.
        staticContext: staticContext as unknown as Canvas2DLike,
        progressContext: progressContext as unknown as Canvas2DLike,
        budgetMs: 8,
      });
      emitEngineeringEvidence(
        "renderer-frame",
        result.elapsedMs,
        loaded.summary.stitchCount,
      );
      if (
        !viewerInteractiveReported.current &&
        result.complete &&
        result.visibleStitches > 0
      ) {
        viewerInteractiveReported.current = true;
        emitEngineeringEvidence(
          "viewer-tti",
          performance.now() - viewerStartedAt.current,
          loaded.summary.stitchCount,
        );
      }
      if (
        pendingPaintStartedAt.current !== null &&
        result.drawnProgressStitches > 0
      ) {
        emitEngineeringEvidence(
          "mark-to-paint",
          performance.now() - pendingPaintStartedAt.current,
          loaded.summary.stitchCount,
        );
        pendingPaintStartedAt.current = null;
      }
      setMetrics(result);
      animationFrame.current = result.complete
        ? null
        : requestAnimationFrame(draw);
    };
    animationFrame.current = requestAnimationFrame(draw);
  }, [renderer]);

  useEffect(() => {
    renderer.setPattern(loaded.summary);
    return () => {
      loadAbort.current?.abort();
      if (animationFrame.current !== null) {
        cancelAnimationFrame(animationFrame.current);
      }
      renderer.dispose();
    };
  }, [loaded, renderer]);

  useEffect(() => {
    const shell = canvasShell.current;
    if (shell === null) return;
    const updateSize = () => {
      const bounds = shell.getBoundingClientRect();
      const width = Math.max(1, Math.floor(bounds.width));
      const height = Math.max(1, Math.floor(bounds.height));
      const devicePixelRatio = window.devicePixelRatio || 1;
      for (const canvas of [staticCanvas.current, progressCanvas.current]) {
        if (canvas === null) continue;
        // Assigning an unchanged Canvas dimension clears its bitmap. Guard the
        // assignment so duplicate ResizeObserver notifications cannot erase a
        // completed frame without a corresponding viewport change.
        syncCanvasBackingStore(canvas, width, height, devicePixelRatio);
      }
      setViewport((current) => ({
        ...current,
        width,
        height,
        devicePixelRatio,
      }));
    };
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(shell);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    renderer.setViewport(viewport);
    loadAbort.current?.abort();
    const controller = new AbortController();
    loadAbort.current = controller;
    void renderer
      .loadVisibleTiles(controller.signal)
      .then((current) => {
        if (current) renderUntilComplete();
      })
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          setSaveStatus("not-saved");
        }
      });
    return () => controller.abort();
  }, [renderer, renderUntilComplete, viewport]);

  const selectStitch = useCallback(
    (hit: StitchHit) => {
      setSelected({ hit, description: null });
      void service
        .describeStitch(loaded, hit)
        .then((description) => setSelected({ hit, description }))
        .catch(() => setSelected({ hit, description: null }));
    },
    [loaded, service],
  );

  const queueToggle = useCallback(
    (hit: StitchHit) => {
      if (
        viewport.cellSize < READABLE_CELL_SIZE_CSS_PX ||
        navigator.locks === undefined
      ) {
        return;
      }
      commandQueue.current = commandQueue.current.then(async () => {
        const committed = progressState.committedValue(hit.stitchId);
        const pending = committed === "marked" ? "unmarked" : "marked";
        progressState.begin(hit.stitchId, pending);
        pendingPaintStartedAt.current = performance.now();
        renderer.setProgress([hit.stitchId]);
        setSaveStatus("saving");
        renderUntilComplete();
        const saveStartedAt = performance.now();
        try {
          await service.toggleProgress(loaded, hit, pending === "marked" ? "mark" : "unmark");
          emitEngineeringEvidence(
            "autosave-commit",
            performance.now() - saveStartedAt,
            loaded.summary.stitchCount,
          );
          progressState.commit(hit.stitchId, pending);
          setSaveStatus("saved");
        } catch (error) {
          progressState.fail(hit.stitchId);
          setSaveStatus(
            errorCode(error) === "PERSISTENCE_PROGRESS_LOCK_UNAVAILABLE"
              ? "read-only"
              : "not-saved",
          );
        }
        renderer.setProgress([hit.stitchId]);
        renderUntilComplete();
      });
    },
    [
      loaded,
      progressState,
      renderer,
      renderUntilComplete,
      service,
      viewport.cellSize,
    ],
  );

  const changeZoom = useCallback((factor: number) => {
    setViewport((current) =>
      zoomViewport(current, factor, {
        x: current.width / 2,
        y: current.height / 2,
      }),
    );
  }, []);

  const pan = useCallback((x: number, y: number) => {
    setViewport((current) => ({
      ...current,
      offsetX: current.offsetX + x,
      offsetY: current.offsetY + y,
    }));
  }, []);

  const pointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    gesture.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      lastX: event.clientX,
      lastY: event.clientY,
      moved: false,
    };
  };

  const pointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    const current = gesture.current;
    if (current === null || current.pointerId !== event.pointerId) return;
    const total = Math.hypot(
      event.clientX - current.startX,
      event.clientY - current.startY,
    );
    const moved = current.moved || total > 6;
    if (moved) {
      pan(event.clientX - current.lastX, event.clientY - current.lastY);
    }
    gesture.current = {
      ...current,
      lastX: event.clientX,
      lastY: event.clientY,
      moved,
    };
  };

  const pointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    const current = gesture.current;
    gesture.current = null;
    if (current === null || current.pointerId !== event.pointerId || current.moved) {
      return;
    }
    const bounds = event.currentTarget.getBoundingClientRect();
    const hit = renderer.hitTest({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
    if (hit !== null) {
      selectStitch(hit);
      queueToggle(hit);
    }
  };

  const wheel = (event: WheelEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const bounds = event.currentTarget.getBoundingClientRect();
    setViewport((current) =>
      zoomViewport(current, event.deltaY < 0 ? 1.12 : 1 / 1.12, {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      }),
    );
  };

  const keyDown = (event: KeyboardEvent<HTMLCanvasElement>) => {
    const steps: Readonly<Record<string, readonly [number, number]>> = {
      ArrowLeft: [48, 0],
      ArrowRight: [-48, 0],
      ArrowUp: [0, 48],
      ArrowDown: [0, -48],
    };
    const step = steps[event.key];
    if (step !== undefined) {
      event.preventDefault();
      pan(step[0], step[1]);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(1.2);
    } else if (event.key === "-") {
      event.preventDefault();
      changeZoom(1 / 1.2);
    } else if (
      (event.key === "Enter" || event.key === " ") &&
      selected !== null
    ) {
      event.preventDefault();
      queueToggle(selected.hit);
    }
  };

  const readable = viewport.cellSize >= READABLE_CELL_SIZE_CSS_PX;
  const selectedText =
    selected === null
      ? "No stitch selected."
      : selected.description === null
        ? `${countedCoordinate(selected.hit.x, selected.hit.y)} selected, ${progressState.committedValue(selected.hit.stitchId)}.`
        : `${countedCoordinate(selected.description.coordinate.x, selected.description.coordinate.y)}, symbol ${selected.description.symbol}, color ${selected.description.color}${selected.description.brandCode === null ? "" : `, thread ${selected.description.brandCode}`}, ${progressState.committedValue(selected.hit.stitchId)}.`;

  return (
    <section className="viewer-panel" aria-labelledby="viewer-title">
      <div className="viewer-heading">
        <div>
          <p className="eyebrow">Local pattern viewer</p>
          <h2 id="viewer-title">{loaded.pattern.metadata.name ?? "Untitled pattern"}</h2>
        </div>
        <div className={`save-badge save-${saveStatus}`} role="status" aria-live="polite">
          {saveStatus === "saved"
            ? "Saved locally"
            : saveStatus === "saving"
              ? "Saving…"
              : saveStatus === "read-only"
                ? "Read-only"
                : "Not saved"}
        </div>
      </div>

      <div className="viewer-toolbar" aria-label="Pattern view controls">
        <button type="button" onClick={() => changeZoom(1 / 1.2)} aria-label="Zoom out">
          −
        </button>
        <output aria-label="Zoom level">{Math.round(viewport.cellSize * 4)}%</output>
        <button type="button" onClick={() => changeZoom(1.2)} aria-label="Zoom in">
          +
        </button>
        <span className="toolbar-divider" aria-hidden="true" />
        <button type="button" onClick={() => pan(48, 0)} aria-label="Pan left">←</button>
        <button type="button" onClick={() => pan(0, 48)} aria-label="Pan up">↑</button>
        <button type="button" onClick={() => pan(0, -48)} aria-label="Pan down">↓</button>
        <button type="button" onClick={() => pan(-48, 0)} aria-label="Pan right">→</button>
      </div>

      {!readable && (
        <p className="viewer-notice" role="status">
          Zoom in to read symbols and mark stitches.
        </p>
      )}

      <div ref={canvasShell} className="canvas-shell">
        <canvas ref={staticCanvas} aria-hidden="true" />
        <canvas
          ref={progressCanvas}
          className="interactive-canvas"
          role="img"
          tabIndex={0}
          aria-label={`${loaded.pattern.metadata.name ?? "Embroidery pattern"}, ${loaded.summary.grid.width} columns by ${loaded.summary.grid.height} rows, ${loaded.summary.stitchCount} stitches. Use arrow keys to pan and plus or minus to zoom.`}
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={() => {
            gesture.current = null;
          }}
          onWheel={wheel}
          onKeyDown={keyDown}
        />
      </div>

      <div className="viewer-status-grid">
        <p role="status" aria-live="polite">{selectedText}</p>
        <p>
          {metrics === null
            ? "Preparing visible tiles…"
            : `${metrics.visibleStitches} visible stitches · ${metrics.visibleTiles} loaded tiles`}
        </p>
      </div>
      <p className="keyboard-hint">
        Drag to pan. Use +/− or the toolbar to zoom. After selecting a stitch,
        press Enter or Space to toggle it.
      </p>
    </section>
  );
}
