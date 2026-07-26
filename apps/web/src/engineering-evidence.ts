/**
 * Opt-in local benchmark signal. It emits bounded console records only when
 * `?engineering-evidence=1` is present and never sends data over the network.
 */
export interface EngineeringEvidenceRecord {
  readonly metric:
    | "import-latency"
    | "viewer-tti"
    | "renderer-frame"
    | "mark-to-paint"
    | "autosave-commit";
  readonly durationMs: number;
  readonly stitchCount: number | null;
  readonly timestamp: string;
}

let rendererFrameSamples = 0;

export function engineeringEvidenceEnabled(): boolean {
  return (
    new URLSearchParams(window.location.search).get("engineering-evidence") ===
    "1"
  );
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
    metric,
    durationMs: Math.max(0, Math.round(durationMs * 1_000) / 1_000),
    stitchCount,
    timestamp: new Date().toISOString(),
  };
  console.info(`[AU_EVIDENCE] ${JSON.stringify(record)}`);
}
