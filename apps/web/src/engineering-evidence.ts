/**
 * Opt-in local benchmark signal. It emits bounded console records only when
 * `?engineering-evidence=1` is present and never sends data over the network.
 */
export interface EngineeringEvidenceRecord {
  readonly sequence: number;
  readonly metric:
    | "import-latency"
    | "viewer-tti"
    | "renderer-frame"
    | "mark-to-paint"
    | "autosave-commit"
    | "long-task";
  readonly durationMs: number;
  readonly stitchCount: number | null;
  readonly timestamp: string;
}

export interface EngineeringEvidenceEnvironment {
  readonly userAgent: string;
  readonly platform: string;
  readonly hardwareConcurrency: number;
  readonly deviceMemoryGiB: number | null;
  readonly viewport: {
    readonly width: number;
    readonly height: number;
    readonly devicePixelRatio: number;
  };
  readonly capabilities: {
    readonly offscreenCanvas: boolean;
    readonly moduleWorker: boolean;
    readonly webLocks: boolean;
    readonly indexedDb: boolean;
  };
}

export interface EngineeringResourceRecord {
  readonly initiatorType: string;
  readonly name: string;
}

export interface EngineeringEvidenceSnapshot {
  readonly schemaVersion: 1;
  readonly runId: string;
  readonly capturedAt: string;
  readonly environment: EngineeringEvidenceEnvironment;
  readonly executionPath: string | null;
  readonly glyphAtlas: string | null;
  readonly peakUsedJsHeapBytes: number | null;
  readonly resources: readonly EngineeringResourceRecord[];
  readonly records: readonly EngineeringEvidenceRecord[];
}

const STORAGE_KEY_PREFIX = "abris-universe:engineering-evidence:v1:";
const CHANGE_EVENT = "abris-universe:engineering-evidence";
const MAX_RECORDS = 4_096;
let rendererFrameSamples = 0;
let sequence = 0;
let peakUsedJsHeapBytes: number | null = null;
let longTaskObserver: PerformanceObserver | null = null;

interface ChromePerformance extends Performance {
  readonly memory?: {
    readonly usedJSHeapSize: number;
  };
}

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

function evidenceRunId(): string {
  const candidate =
    new URLSearchParams(window.location.search).get("evidence-run") ?? "default";
  return /^[a-zA-Z0-9._-]{1,80}$/u.test(candidate) ? candidate : "invalid";
}

function evidenceStorageKey(): string {
  return `${STORAGE_KEY_PREFIX}${evidenceRunId()}`;
}

export function engineeringEvidenceEnabled(): boolean {
  return (
    new URLSearchParams(window.location.search).get("engineering-evidence") ===
    "1"
  );
}

function readStoredRecords(): EngineeringEvidenceRecord[] {
  if (!engineeringEvidenceEnabled()) return [];
  try {
    const parsed = JSON.parse(
      sessionStorage.getItem(evidenceStorageKey()) ?? "[]",
    );
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (record): record is EngineeringEvidenceRecord =>
        record !== null &&
        typeof record === "object" &&
        typeof record.sequence === "number" &&
        typeof record.metric === "string" &&
        typeof record.durationMs === "number" &&
        typeof record.timestamp === "string",
    );
  } catch {
    return [];
  }
}

function writeRecord(record: EngineeringEvidenceRecord): void {
  const records = [...readStoredRecords(), record].slice(-MAX_RECORDS);
  try {
    sessionStorage.setItem(evidenceStorageKey(), JSON.stringify(records));
  } catch {
    // Evidence is optional and must never affect product behavior.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function sampleHeap(): void {
  const used = (performance as ChromePerformance).memory?.usedJSHeapSize;
  if (typeof used === "number" && Number.isFinite(used)) {
    peakUsedJsHeapBytes = Math.max(peakUsedJsHeapBytes ?? 0, used);
  }
}

export function startEngineeringEvidenceCollection(): () => void {
  if (!engineeringEvidenceEnabled()) return () => undefined;
  const existing = readStoredRecords();
  sequence = existing.reduce(
    (maximum, record) => Math.max(maximum, record.sequence),
    0,
  );
  sampleHeap();
  const memoryTimer = window.setInterval(sampleHeap, 250);
  if (
    typeof PerformanceObserver !== "undefined" &&
    PerformanceObserver.supportedEntryTypes.includes("longtask")
  ) {
    longTaskObserver = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        emitEngineeringEvidence("long-task", entry.duration, null);
      }
    });
    longTaskObserver.observe({ type: "longtask", buffered: true });
  }
  return () => {
    window.clearInterval(memoryTimer);
    longTaskObserver?.disconnect();
    longTaskObserver = null;
  };
}

export function subscribeEngineeringEvidence(
  listener: () => void,
): () => void {
  window.addEventListener(CHANGE_EVENT, listener);
  return () => window.removeEventListener(CHANGE_EVENT, listener);
}

export function clearEngineeringEvidence(): void {
  rendererFrameSamples = 0;
  sequence = 0;
  peakUsedJsHeapBytes = null;
  try {
    sessionStorage.removeItem(evidenceStorageKey());
  } catch {
    // Evidence is optional and must never affect product behavior.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function captureEngineeringEvidence(): EngineeringEvidenceSnapshot {
  const navigatorWithMemory = navigator as NavigatorWithDeviceMemory;
  sampleHeap();
  const resources = performance
    .getEntriesByType("resource")
    .map((entry) => entry as PerformanceResourceTiming)
    .map((entry) => ({
      initiatorType: entry.initiatorType,
      name: entry.name,
    }))
    .sort((left, right) =>
      `${left.initiatorType}:${left.name}`.localeCompare(
        `${right.initiatorType}:${right.name}`,
      ),
    );
  const panel = document.querySelector<HTMLElement>(".viewer-panel");
  return {
    schemaVersion: 1,
    runId: evidenceRunId(),
    capturedAt: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGiB: navigatorWithMemory.deviceMemory ?? null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
      capabilities: {
        offscreenCanvas: typeof OffscreenCanvas !== "undefined",
        moduleWorker: typeof Worker !== "undefined",
        webLocks: navigator.locks !== undefined,
        indexedDb: typeof indexedDB !== "undefined",
      },
    },
    executionPath: panel?.dataset.rendererPath ?? null,
    glyphAtlas: panel?.dataset.glyphAtlas ?? null,
    peakUsedJsHeapBytes,
    resources,
    records: readStoredRecords(),
  };
}

export function emitEngineeringEvidence(
  metric: EngineeringEvidenceRecord["metric"],
  durationMs: number,
  stitchCount: number | null,
): void {
  if (!engineeringEvidenceEnabled()) return;
  if (metric === "renderer-frame") {
    if (rendererFrameSamples >= 240) return;
    rendererFrameSamples += 1;
  }
  const record: EngineeringEvidenceRecord = {
    sequence: ++sequence,
    metric,
    durationMs: Math.max(0, Math.round(durationMs * 1_000) / 1_000),
    stitchCount,
    timestamp: new Date().toISOString(),
  };
  writeRecord(record);
  console.info(`[AU_EVIDENCE] ${JSON.stringify(record)}`);
}
