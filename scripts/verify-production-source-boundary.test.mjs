import assert from "node:assert/strict";
import test from "node:test";

import {
  productionSourceChanges,
  validateProductionSourceChanges,
} from "./verify-production-source-boundary.mjs";

const ACCEPTED = "a".repeat(40);
const CURRENT = "b".repeat(40);

test("accepts only the reviewed deployment wrapper paths", () => {
  assert.deepEqual(
    validateProductionSourceChanges([
      "apps/web/worker/index.ts",
      "apps/web/worker/runtime.ts",
      "apps/web/test/worker.test.ts",
      "apps/web/wrangler.jsonc",
      "apps/web/wrangler.deployment-lab.jsonc",
    ]),
    {
      changedPaths: [
        "apps/web/worker/index.ts",
        "apps/web/worker/runtime.ts",
        "apps/web/test/worker.test.ts",
        "apps/web/wrangler.jsonc",
        "apps/web/wrangler.deployment-lab.jsonc",
      ],
      allowedDeploymentPaths: [
        "apps/web/worker/index.ts",
        "apps/web/worker/runtime.ts",
        "apps/web/test/worker.test.ts",
        "apps/web/wrangler.jsonc",
        "apps/web/wrangler.deployment-lab.jsonc",
      ],
    },
  );
});

test("rejects product, package, fixture, manifest, and unrelated test changes", () => {
  for (const pathname of [
    "apps/web/src/main.ts",
    "apps/web/test/client.test.ts",
    "packages/domain-core/src/index.ts",
    "tests/fixtures/oxs/minimal.oxs",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "tsconfig.base.json",
  ]) {
    assert.throws(
      () => validateProductionSourceChanges([pathname]),
      new RegExp(pathname.replaceAll(".", "\\."), "u"),
    );
  }
});

test("uses the exact accepted/current commits and protected path scope", () => {
  const calls = [];
  const result = productionSourceChanges({
    acceptedCommit: ACCEPTED,
    currentCommit: CURRENT,
    runGit: (command, args, options) => {
      calls.push({ command, args, options });
      return args[0] === "diff"
        ? [
            "apps/web/worker/index.ts",
            "apps/web/test/worker.test.ts",
            "apps/web/wrangler.deployment-lab.jsonc",
            "apps/web/wrangler.jsonc",
            "",
          ].join("\n")
        : undefined;
    },
  });
  assert.equal(calls.length, 2);
  assert.deepEqual(calls[0].args, [
    "cat-file",
    "-e",
    `${ACCEPTED}^{commit}`,
  ]);
  assert.deepEqual(calls[1].args, [
    "diff",
    "--name-only",
    "--no-renames",
    ACCEPTED,
    CURRENT,
    "--",
    "apps",
    "packages",
    "tests/fixtures/oxs",
    "pnpm-lock.yaml",
    "pnpm-workspace.yaml",
    "tsconfig.base.json",
  ]);
  assert.equal(result.allowedDeploymentPaths.length, 4);
});

test("rejects invalid source identities before invoking Git", () => {
  let invoked = false;
  assert.throws(
    () =>
      productionSourceChanges({
        acceptedCommit: "main",
        currentCommit: CURRENT,
        runGit: () => {
          invoked = true;
        },
      }),
    /ACCEPTED_EXECUTABLE_SOURCE_COMMIT/u,
  );
  assert.equal(invoked, false);
});
