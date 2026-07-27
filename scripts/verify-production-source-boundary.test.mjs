import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  mkdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

import {
  parseProductionSourceRegistry,
  productionSourceChanges,
  validateProductionSourceChanges,
} from "./verify-production-source-boundary.mjs";

const ACCEPTED = "a".repeat(40);
const REVIEWED = "b".repeat(40);
const CURRENT = "c".repeat(40);

const git = (cwd, args, options = {}) =>
  execFileSync("git", args, {
    cwd,
    encoding: "utf8",
    ...options,
  });

const write = (cwd, pathname, contents) => {
  const target = join(cwd, pathname);
  mkdirSync(join(target, ".."), { recursive: true });
  writeFileSync(target, contents);
};

const commit = (cwd, message) => {
  git(cwd, ["add", "."]);
  git(cwd, ["commit", "-m", message]);
  return git(cwd, ["rev-parse", "HEAD"]).trim();
};

const createBoundaryRepository = () => {
  const cwd = mkdtempSync(join(tmpdir(), "production-source-boundary-"));
  git(cwd, ["init", "-q"]);
  git(cwd, ["config", "user.name", "Boundary Test"]);
  git(cwd, ["config", "user.email", "boundary@example.invalid"]);
  write(cwd, "apps/web/src/main.ts", "accepted product\n");
  write(cwd, "apps/web/worker/index.ts", "accepted worker\n");
  write(cwd, "apps/web/test/worker.test.ts", "accepted worker test\n");
  write(cwd, "apps/web/wrangler.jsonc", "{}\n");
  write(cwd, "package.json", '{"scripts":{"test":"node --test"}}\n');
  write(cwd, "packages/domain/src.ts", "accepted domain\n");
  write(cwd, "pnpm-lock.yaml", "lockfileVersion: '9.0'\n");
  write(cwd, "pnpm-workspace.yaml", "packages: []\n");
  write(cwd, "scripts/deploy-production.mjs", "accepted deploy\n");
  write(cwd, "tests/fixtures/oxs/minimal.oxs", "<accepted />\n");
  write(cwd, "tsconfig.base.json", "{}\n");
  const acceptedCommit = commit(cwd, "accepted");

  write(cwd, "apps/web/worker/index.ts", "reviewed worker\n");
  write(cwd, "apps/web/test/worker.test.ts", "reviewed worker test\n");
  write(cwd, "apps/web/wrangler.deployment-lab.jsonc", "{}\n");
  write(cwd, "package.json", '{"scripts":{"deploy":"node scripts/deploy-production.mjs"}}\n');
  write(cwd, "scripts/deploy-production.mjs", "reviewed deploy\n");
  write(cwd, "tests/fixtures/cloudflare/baseline/index.html", "reviewed lab\n");
  write(cwd, ".github/workflows/deploy-production.yml", "name: reviewed\n");
  const reviewedDeploymentCommit = commit(cwd, "reviewed deployment");

  write(cwd, "docs/status.md", "documentation only\n");
  const currentCommit = commit(cwd, "documentation");
  return {
    acceptedCommit,
    currentCommit,
    cwd,
    reviewedDeploymentCommit,
  };
};

const validateRepository = (repository, currentCommit) =>
  productionSourceChanges({
    acceptedCommit: repository.acceptedCommit,
    reviewedDeploymentCommit: repository.reviewedDeploymentCommit,
    currentCommit,
    runGit: (command, args, options) =>
      git(repository.cwd, args, options),
  });

test("accepts only exact reviewed deployment trust inputs", () => {
  assert.deepEqual(
    validateProductionSourceChanges([
      ".github/workflows/deploy-production.yml",
      "apps/web/worker/index.ts",
      "apps/web/test/worker.test.ts",
      "apps/web/wrangler.jsonc",
      "apps/web/wrangler.deployment-lab.jsonc",
      "package.json",
      "scripts/deploy-production.mjs",
      "tests/fixtures/cloudflare/baseline/index.html",
    ]).reviewedDeploymentPaths.length,
    8,
  );
});

test("rejects product, package, OXS fixture, lockfile, and workspace changes", () => {
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

test("validates the registered accepted and independently reviewed commits", () => {
  assert.deepEqual(
    parseProductionSourceRegistry(
      JSON.stringify({
        schemaVersion: 1,
        acceptedProductSourceCommit: ACCEPTED,
        reviewedDeploymentSourceCommit: REVIEWED,
      }),
    ),
    {
      schemaVersion: 1,
      acceptedProductSourceCommit: ACCEPTED,
      reviewedDeploymentSourceCommit: REVIEWED,
    },
  );
  assert.throws(
    () => parseProductionSourceRegistry('{"schemaVersion":1}'),
    /acceptedProductSourceCommit/u,
  );
});

test("uses NUL-delimited no-rename diffs and exact trust scopes", () => {
  const calls = [];
  const result = productionSourceChanges({
    acceptedCommit: ACCEPTED,
    reviewedDeploymentCommit: REVIEWED,
    currentCommit: CURRENT,
    runGit: (command, args, options) => {
      calls.push({ command, args, options });
      if (args[0] !== "diff") return "";
      if (args.includes(REVIEWED)) return "";
      return [
        "apps/web/worker/index.ts",
        "package.json",
        "scripts/deploy-production.mjs",
        "",
      ].join("\0");
    },
  });
  assert.equal(calls.length, 6);
  assert.deepEqual(calls[3].args, [
    "merge-base",
    "--is-ancestor",
    REVIEWED,
    CURRENT,
  ]);
  assert.deepEqual(calls[4].args.slice(0, 7), [
    "diff",
    "--name-only",
    "-z",
    "--no-renames",
    REVIEWED,
    CURRENT,
    "--",
  ]);
  assert.deepEqual(calls[5].args.slice(0, 7), [
    "diff",
    "--name-only",
    "-z",
    "--no-renames",
    ACCEPTED,
    CURRENT,
    "--",
  ]);
  assert.equal(result.reviewedDeploymentPaths.length, 3);
});

test("passes a real docs-only descendant of exact reviewed deployment source", () => {
  const repository = createBoundaryRepository();
  try {
    const result = validateRepository(repository, repository.currentCommit);
    assert.equal(result.reviewedDeploymentPaths.length, 7);
  } finally {
    rmSync(repository.cwd, { recursive: true, force: true });
  }
});

test("fails closed for real product modification and addition", () => {
  const repository = createBoundaryRepository();
  try {
    write(repository.cwd, "apps/web/src/main.ts", "changed product\n");
    write(repository.cwd, "packages/domain/new.ts", "added product\n");
    const currentCommit = commit(repository.cwd, "unaccepted product");
    assert.throws(
      () => validateRepository(repository, currentCommit),
      /apps\/web\/src\/main\.ts.*packages\/domain\/new\.ts/u,
    );
  } finally {
    rmSync(repository.cwd, { recursive: true, force: true });
  }
});

test("fails closed for real trust-input modification, addition, and deletion", () => {
  const repository = createBoundaryRepository();
  try {
    write(repository.cwd, "scripts/deploy-production.mjs", "changed deploy\n");
    write(repository.cwd, "scripts/new-deploy-helper.mjs", "added helper\n");
    rmSync(join(repository.cwd, "apps/web/worker/index.ts"));
    const currentCommit = commit(repository.cwd, "unreviewed deployment");
    assert.throws(
      () => validateRepository(repository, currentCommit),
      /deployment trust inputs differ.*worker\/index\.ts.*deploy-production\.mjs.*new-deploy-helper\.mjs/u,
    );
  } finally {
    rmSync(repository.cwd, { recursive: true, force: true });
  }
});

test("fails closed for a real cross-boundary rename", () => {
  const repository = createBoundaryRepository();
  try {
    git(repository.cwd, [
      "mv",
      "apps/web/src/main.ts",
      "apps/web/worker/renamed-product.ts",
    ]);
    const currentCommit = commit(repository.cwd, "cross-boundary rename");
    assert.throws(
      () => validateRepository(repository, currentCommit),
      /deployment trust inputs differ.*renamed-product\.ts/u,
    );
  } finally {
    rmSync(repository.cwd, { recursive: true, force: true });
  }
});

test("rejects invalid or missing commit identities", () => {
  let invoked = false;
  assert.throws(
    () =>
      productionSourceChanges({
        acceptedCommit: "main",
        reviewedDeploymentCommit: REVIEWED,
        currentCommit: CURRENT,
        runGit: () => {
          invoked = true;
        },
      }),
    /ACCEPTED_EXECUTABLE_SOURCE_COMMIT/u,
  );
  assert.equal(invoked, false);

  const repository = createBoundaryRepository();
  try {
    assert.throws(() =>
      productionSourceChanges({
        acceptedCommit: repository.acceptedCommit,
        reviewedDeploymentCommit: "f".repeat(40),
        currentCommit: repository.currentCommit,
        runGit: (command, args, options) =>
          git(repository.cwd, args, options),
      }),
    );
  } finally {
    rmSync(repository.cwd, { recursive: true, force: true });
  }
});
