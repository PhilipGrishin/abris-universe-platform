/**
 * Benchmark-build-only accessibility audit entry. The deployable SPA neither
 * imports nor bundles axe-core.
 */
import axe from "axe-core";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App.tsx";
import "./styles.css";

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Accessibility element ${selector} is missing.`);
  }
  return element;
}

async function waitForViewer(): Promise<void> {
  const startedAt = performance.now();
  while (document.querySelector(".viewer-panel") === null) {
    if (performance.now() - startedAt > 10_000) {
      throw new Error("Viewer did not become ready for accessibility audit.");
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

const root = requireElement<HTMLElement>("#root");
const output = requireElement<HTMLOutputElement>("#accessibility-result");

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

void waitForViewer()
  .then(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const result = await axe.run(document, {
      resultTypes: ["violations", "incomplete", "passes"],
    });
    document.documentElement.dataset.engineeringGrayscale = "true";
    document.documentElement.dataset.engineeringReducedMotion = "true";
    await new Promise((resolve) => requestAnimationFrame(resolve));
    output.textContent = JSON.stringify({
      schemaVersion: 1,
      sourceCommit: import.meta.env.AU_SOURCE_COMMIT,
      sourceDirty: import.meta.env.AU_SOURCE_DIRTY === "true",
      capturedAt: new Date().toISOString(),
      tool: {
        name: "axe-core",
        version: axe.version,
      },
      environment: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio,
        },
      },
      auditModes: {
        normalColor: true,
      },
      visualEvidenceModes: {
        grayscale: true,
        reducedMotion: true,
      },
      violations: result.violations.map((violation) => ({
        id: violation.id,
        impact: violation.impact,
        help: violation.help,
        targets: violation.nodes.map((node) => node.target),
      })),
      incomplete: result.incomplete.map((item) => ({
        id: item.id,
        impact: item.impact,
        help: item.help,
        targets: item.nodes.map((node) => node.target),
      })),
      passCount: result.passes.length,
    });
  })
  .catch((error: unknown) => {
    output.textContent = JSON.stringify({
      error: error instanceof Error ? error.message : "Accessibility audit failed.",
    });
  });
