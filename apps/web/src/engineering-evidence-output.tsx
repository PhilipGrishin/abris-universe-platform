/**
 * Machine-readable, opt-in runtime evidence surface. It remains hidden from
 * product users and is enabled only by the explicit engineering query flag.
 */
import { useEffect, useState } from "react";

import {
  captureEngineeringEvidence,
  engineeringEvidenceEnabled,
  startEngineeringEvidenceCollection,
  subscribeEngineeringEvidence,
} from "./engineering-evidence.ts";

export function EngineeringEvidenceOutput() {
  const enabled = engineeringEvidenceEnabled();
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!enabled) return;
    const stop = startEngineeringEvidenceCollection();
    const unsubscribe = subscribeEngineeringEvidence(() =>
      setRevision((current) => current + 1),
    );
    const refreshTimer = window.setInterval(
      () => setRevision((current) => current + 1),
      500,
    );
    return () => {
      window.clearInterval(refreshTimer);
      unsubscribe();
      stop();
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <output
      hidden
      id="engineering-evidence-json"
      data-revision={revision}
      aria-hidden="true"
    >
      {JSON.stringify(captureEngineeringEvidence())}
    </output>
  );
}
