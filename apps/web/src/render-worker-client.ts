import type { StaticRenderScene } from "@abris-universe/renderer";

export interface WorkerRenderResult {
  readonly bitmap: ImageBitmap;
  readonly durationMs: number;
  readonly drawnStitches: number;
  readonly atlasEntries: number;
}

interface WorkerResultMessage extends Omit<WorkerRenderResult, "bitmap"> {
  readonly type: "rendered";
  readonly requestId: number;
  readonly bitmap: ImageBitmap;
}

interface WorkerFailureMessage {
  readonly type: "failed" | "cancelled";
  readonly requestId: number;
  readonly message?: string;
}

type WorkerMessage = WorkerResultMessage | WorkerFailureMessage;

export function supportsOffscreenWorkerRendering(
  forceMainThread = false,
): boolean {
  return (
    !forceMainThread &&
    typeof Worker !== "undefined" &&
    typeof OffscreenCanvas !== "undefined"
  );
}

export class StaticRenderWorkerClient {
  readonly #worker: Worker;
  readonly #pending = new Map<
    number,
    {
      readonly resolve: (value: WorkerRenderResult) => void;
      readonly reject: (reason: unknown) => void;
    }
  >();
  #nextRequestId = 0;

  constructor() {
    this.#worker = new Worker(new URL("./render.worker.ts", import.meta.url), {
      type: "module",
      name: "abris-static-renderer",
    });
    this.#worker.addEventListener("message", (event: MessageEvent<WorkerMessage>) => {
      const message = event.data;
      const pending = this.#pending.get(message.requestId);
      if (pending === undefined) return;
      this.#pending.delete(message.requestId);
      if (message.type === "rendered") {
        pending.resolve(message);
      } else {
        pending.reject(
          message.type === "cancelled"
            ? new DOMException("Superseded render.", "AbortError")
            : new Error(message.message ?? "Static render Worker failed."),
        );
      }
    });
    this.#worker.addEventListener("error", () => {
      const error = new Error("Static render Worker became unavailable.");
      for (const pending of this.#pending.values()) pending.reject(error);
      this.#pending.clear();
    });
  }

  draw(scene: StaticRenderScene): Promise<WorkerRenderResult> {
    const requestId = ++this.#nextRequestId;
    for (const [pendingId, pending] of this.#pending) {
      pending.reject(new DOMException("Superseded render.", "AbortError"));
      this.#pending.delete(pendingId);
    }
    return new Promise((resolve, reject) => {
      this.#pending.set(requestId, { resolve, reject });
      this.#worker.postMessage({ type: "draw", requestId, scene });
    });
  }

  dispose(): void {
    this.#worker.terminate();
    for (const pending of this.#pending.values()) {
      pending.reject(new DOMException("Renderer disposed.", "AbortError"));
    }
    this.#pending.clear();
  }
}
