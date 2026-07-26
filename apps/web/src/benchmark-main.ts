/**
 * Benchmark-only production entry point. Vite includes it only in the
 * explicitly selected benchmark build; the deployable SPA never contains this
 * harness or its embedded project-original fixtures.
 */
import { ABRIS_DATABASE_NAME } from "@abris-universe/persistence";

import mediumOxs from "../../../tests/fixtures/oxs/generated/medium-full-cross.oxs?raw";
import minimalOxs from "../../../tests/fixtures/oxs/generated/minimal-full-cross.oxs?raw";
import { ProjectService, type LoadedProject } from "./project-service.ts";

interface BenchmarkSample {
  readonly iteration: number;
  readonly durationMs: number;
}

interface BenchmarkResult {
  readonly schemaVersion: 1;
  readonly sourceCommit: string;
  readonly sourceDirty: boolean;
  readonly capturedAt: string;
  readonly environment: {
    readonly userAgent: string;
    readonly platform: string;
    readonly hardwareConcurrency: number;
    readonly deviceMemoryGiB: number | null;
    readonly viewport: {
      readonly width: number;
      readonly height: number;
      readonly devicePixelRatio: number;
    };
  };
  readonly method: {
    readonly build: "production-benchmark";
    readonly coldImportIterations: 30;
    readonly historyEventCount: 10_000;
    readonly historyReloadIterations: 30;
    readonly storageResetBetweenColdImports: true;
  };
  readonly coldImport: {
    readonly minimal: readonly BenchmarkSample[];
    readonly medium: readonly BenchmarkSample[];
  };
  readonly historyReload: readonly BenchmarkSample[];
}

interface NavigatorWithDeviceMemory extends Navigator {
  readonly deviceMemory?: number;
}

function requireElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (element === null) {
    throw new Error(`Benchmark element ${selector} is missing.`);
  }
  return element;
}

const status = requireElement<HTMLElement>("#benchmark-status");
const output = requireElement<HTMLOutputElement>("#benchmark-result");

function roundedDuration(startedAt: number): number {
  return Math.max(
    0,
    Math.round((performance.now() - startedAt) * 1_000) / 1_000,
  );
}

async function deleteTaskStorage(): Promise<void> {
  localStorage.clear();
  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.deleteDatabase(ABRIS_DATABASE_NAME);
    request.onsuccess = () => resolve();
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB deletion failed."));
    request.onblocked = () =>
      reject(new Error("IndexedDB deletion was blocked by an open connection."));
  });
}

async function coldImportSamples(
  label: string,
  source: string,
): Promise<BenchmarkSample[]> {
  const samples: BenchmarkSample[] = [];
  for (let iteration = 1; iteration <= 30; iteration += 1) {
    status.textContent = `${label} cold import ${iteration} of 30.`;
    await deleteTaskStorage();
    const service = await ProjectService.open();
    const file = new File([source], `${label}.oxs`, {
      type: "application/xml",
    });
    const startedAt = performance.now();
    try {
      const loaded = await service.importFile(file);
      if (loaded.summary.stitchCount <= 0) {
        throw new Error(`${label} imported without stitches.`);
      }
      samples.push({ iteration, durationMs: roundedDuration(startedAt) });
    } finally {
      service.close();
    }
  }
  return samples;
}

async function seedProgressHistory(): Promise<LoadedProject> {
  await deleteTaskStorage();
  const service = await ProjectService.open();
  const loaded = await service.importFile(
    new File([minimalOxs], "progress-history-10k.oxs", {
      type: "application/xml",
    }),
  );
  const tiles = await loaded.tileProvider.getTiles(
    loaded.patternVersion.id,
    {
      minTileX: 0,
      maxTileX: 0,
      minTileY: 0,
      maxTileY: 0,
    },
    new AbortController().signal,
  );
  const stitch = tiles[0]?.stitches[0];
  if (stitch === undefined) {
    service.close();
    throw new Error("Progress-history fixture has no target stitch.");
  }
  const hit = { stitchId: stitch.id, x: stitch.x, y: stitch.y };
  for (let index = 0; index < 10_000; index += 1) {
    if (index % 100 === 0) {
      status.textContent = `Seeding progress history ${index} of 10,000.`;
    }
    await service.toggleProgress(
      loaded,
      hit,
      index % 2 === 0 ? "mark" : "unmark",
    );
  }
  service.close();
  return loaded;
}

async function historyReloadSamples(): Promise<BenchmarkSample[]> {
  const seeded = await seedProgressHistory();
  const samples: BenchmarkSample[] = [];
  for (let iteration = 1; iteration <= 30; iteration += 1) {
    status.textContent = `10,000-event reload ${iteration} of 30.`;
    const startedAt = performance.now();
    const service = await ProjectService.open();
    try {
      const loaded = await service.loadActiveProject();
      if (
        loaded === null ||
        loaded.project.id !== seeded.project.id ||
        loaded.progress.length !== 1
      ) {
        throw new Error("Progress-history projection verification failed.");
      }
      samples.push({ iteration, durationMs: roundedDuration(startedAt) });
    } finally {
      service.close();
    }
  }
  return samples;
}

async function run(): Promise<void> {
  const minimal = await coldImportSamples("minimal-full-cross", minimalOxs);
  const medium = await coldImportSamples("medium-full-cross", mediumOxs);
  const historyReload = await historyReloadSamples();
  const runtime = navigator as NavigatorWithDeviceMemory;
  const result: BenchmarkResult = {
    schemaVersion: 1,
    sourceCommit: import.meta.env.AU_SOURCE_COMMIT,
    sourceDirty: import.meta.env.AU_SOURCE_DIRTY === "true",
    capturedAt: new Date().toISOString(),
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemoryGiB: runtime.deviceMemory ?? null,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio,
      },
    },
    method: {
      build: "production-benchmark",
      coldImportIterations: 30,
      historyEventCount: 10_000,
      historyReloadIterations: 30,
      storageResetBetweenColdImports: true,
    },
    coldImport: { minimal, medium },
    historyReload,
  };
  output.textContent = JSON.stringify(result);
  status.textContent = "Benchmark complete.";
}

void run().catch((error: unknown) => {
  status.textContent = "Benchmark failed.";
  output.textContent = JSON.stringify({
    error: error instanceof Error ? error.message : "Unknown benchmark error.",
  });
});
