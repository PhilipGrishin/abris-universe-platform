#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const expectedPackages = new Map([
  ["apps/web", "@abris-universe/web"],
  ["packages/domain-core", "@abris-universe/domain-core"],
  ["packages/importers/oxs", "@abris-universe/oxs-importer"],
  ["packages/renderer", "@abris-universe/renderer"],
  ["packages/persistence", "@abris-universe/persistence"],
]);

for (const [directory, expectedName] of expectedPackages) {
  const packagePath = join(directory, "package.json");
  if (!existsSync(packagePath)) throw new Error(`Missing ${packagePath}`);
  const manifest = JSON.parse(readFileSync(packagePath, "utf8"));
  if (manifest.name !== expectedName) {
    throw new Error(`${packagePath} has unexpected package name`);
  }
  if (manifest.private !== true || manifest.type !== "module") {
    throw new Error(`${packagePath} must remain private ESM scaffolding`);
  }
  const allowedEntries =
    [
      "packages/domain-core",
      "packages/importers/oxs",
      "packages/persistence",
      "packages/renderer",
    ].includes(directory)
      ? [
          "README.md",
          "node_modules",
          "package.json",
          ...(directory === "packages/renderer" ? ["scripts"] : []),
          "src",
          "test",
          "tsconfig.json",
        ]
      : ["README.md", "package.json"];
  const unexpectedRuntimeFiles = readdirSync(directory).filter(
    (entry) => !allowedEntries.includes(entry)
  );
  if (unexpectedRuntimeFiles.length > 0) {
    throw new Error(
      `${directory} contains files outside its current approved stage: ${unexpectedRuntimeFiles.join(", ")}`
    );
  }
}

for (const requiredPath of [
  "packages/domain-core/src/index.ts",
  "packages/domain-core/src/model.ts",
  "packages/domain-core/src/validation.ts",
  "packages/domain-core/test/domain-core.test.ts",
  "packages/domain-core/tsconfig.json",
  "packages/importers/oxs/src/contracts.ts",
  "packages/importers/oxs/src/import-oxs.ts",
  "packages/importers/oxs/src/index.ts",
  "packages/importers/oxs/src/limits.ts",
  "packages/importers/oxs/src/parser.ts",
  "packages/importers/oxs/src/report-validation.ts",
  "packages/importers/oxs/test/oxs-importer.test.ts",
  "packages/importers/oxs/tsconfig.json",
  "packages/persistence/src/capability.ts",
  "packages/persistence/src/contracts.ts",
  "packages/persistence/src/database.ts",
  "packages/persistence/src/import-repository.ts",
  "packages/persistence/src/index.ts",
  "packages/persistence/src/progress-repository.ts",
  "packages/persistence/test/persistence.test.ts",
  "packages/persistence/tsconfig.json",
  "packages/renderer/src/contracts.ts",
  "packages/renderer/src/contrast.ts",
  "packages/renderer/src/index.ts",
  "packages/renderer/src/renderer.ts",
  "packages/renderer/src/tiles.ts",
  "packages/renderer/src/viewport.ts",
  "packages/renderer/scripts/measure-medium.ts",
  "packages/renderer/test/renderer.test.ts",
  "packages/renderer/tsconfig.json",
]) {
  if (!existsSync(requiredPath)) {
    throw new Error(`Approved workspace implementation is missing ${requiredPath}`);
  }
}

const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
for (const pattern of ["apps/*", "packages/*", "packages/*/*"]) {
  if (!workspace.includes(pattern)) {
    throw new Error(`Workspace does not include ${pattern}`);
  }
}

process.stdout.write(
  "Workspace boundary verification passed: package identities, privacy, ESM mode, domain/importer/persistence/renderer scope, and scaffold-only client package.\n"
);
