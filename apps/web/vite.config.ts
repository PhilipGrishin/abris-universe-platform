import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { execFileSync } from "node:child_process";

export default defineConfig(({ mode }) => {
  const benchmark = mode === "benchmark";
  const sourceCommit = execFileSync("git", ["rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  const sourceDirty =
    execFileSync("git", ["status", "--short"], { encoding: "utf8" }).trim()
      .length > 0;
  return {
    plugins: [react()],
    ...(benchmark
      ? {
          define: {
            "import.meta.env.AU_SOURCE_COMMIT": JSON.stringify(sourceCommit),
            "import.meta.env.AU_SOURCE_DIRTY": JSON.stringify(
              String(sourceDirty),
            ),
          },
        }
      : {}),
    build: {
      sourcemap: true,
      target: "es2022",
      ...(benchmark
        ? {
            outDir: "dist-benchmark",
            rollupOptions: {
              input: {
                accessibility: "accessibility.html",
                app: "index.html",
                benchmark: "benchmark.html",
                browserFailure: "browser-failure.html",
              },
            },
          }
        : {}),
    },
    server: {
      strictPort: true,
    },
  };
});
