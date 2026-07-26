/**
 * Framework-independent viewport and progress state used by the web client.
 */
import type {
  ProgressMark,
  ProgressRenderState,
  ProgressStateProvider,
  Viewport,
} from "@abris-universe/renderer";

export const MIN_CELL_SIZE = 8;
export const MAX_CELL_SIZE = 64;
export const DEFAULT_CELL_SIZE = 28;

export function clampCellSize(value: number): number {
  return Math.min(MAX_CELL_SIZE, Math.max(MIN_CELL_SIZE, value));
}

export function zoomViewport(
  viewport: Viewport,
  factor: number,
  anchor: { readonly x: number; readonly y: number },
): Viewport {
  if (!Number.isFinite(factor) || factor <= 0) {
    throw new TypeError("Zoom factor must be positive.");
  }
  const nextCellSize = clampCellSize(viewport.cellSize * factor);
  const canonicalX = (anchor.x - viewport.offsetX) / viewport.cellSize;
  const canonicalY = (anchor.y - viewport.offsetY) / viewport.cellSize;
  return {
    ...viewport,
    cellSize: nextCellSize,
    offsetX: anchor.x - canonicalX * nextCellSize,
    offsetY: anchor.y - canonicalY * nextCellSize,
  };
}

export class ClientProgressState implements ProgressStateProvider {
  readonly #states = new Map<string, ProgressRenderState>();

  hydrate(records: readonly { readonly stitchId: string; readonly state: ProgressMark }[]): void {
    this.#states.clear();
    for (const record of records) {
      this.#states.set(record.stitchId, {
        status: "committed",
        value: record.state,
      });
    }
  }

  getState(stitchId: string): ProgressRenderState {
    return (
      this.#states.get(stitchId) ?? {
        status: "committed",
        value: "unmarked",
      }
    );
  }

  committedValue(stitchId: string): ProgressMark {
    const state = this.getState(stitchId);
    return state.status === "committed" ? state.value : state.committed;
  }

  begin(stitchId: string, pending: ProgressMark): void {
    this.#states.set(stitchId, {
      status: "saving",
      committed: this.committedValue(stitchId),
      pending,
    });
  }

  commit(stitchId: string, value: ProgressMark): void {
    this.#states.set(stitchId, { status: "committed", value });
  }

  fail(stitchId: string): void {
    this.#states.set(stitchId, {
      status: "not-saved",
      committed: this.committedValue(stitchId),
    });
  }
}
