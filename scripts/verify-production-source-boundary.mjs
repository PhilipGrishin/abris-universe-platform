import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

const FULL_SHA = /^[0-9a-f]{40}$/u;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const allowedDeploymentPath = (pathname) =>
  pathname.startsWith("apps/web/worker/") ||
  [
    "apps/web/test/worker.test.ts",
    "apps/web/wrangler.jsonc",
    "apps/web/wrangler.deployment-lab.jsonc",
  ].includes(pathname);

export const validateProductionSourceChanges = (changedPaths) => {
  assert(Array.isArray(changedPaths), "changedPaths must be an array.");
  const normalized = changedPaths.filter(
    (pathname) => typeof pathname === "string" && pathname.length > 0,
  );
  const rejected = normalized.filter(
    (pathname) => !allowedDeploymentPath(pathname),
  );
  assert(
    rejected.length === 0,
    `Production source boundary includes unaccepted product paths: ${rejected.join(", ")}`,
  );
  return {
    changedPaths: normalized,
    allowedDeploymentPaths: normalized.filter(allowedDeploymentPath),
  };
};

export const productionSourceChanges = ({
  acceptedCommit,
  currentCommit,
  runGit = execFileSync,
}) => {
  assert(
    FULL_SHA.test(acceptedCommit ?? ""),
    "ACCEPTED_EXECUTABLE_SOURCE_COMMIT must be a full lowercase Git SHA.",
  );
  assert(
    FULL_SHA.test(currentCommit ?? ""),
    "GITHUB_SHA must be a full lowercase Git SHA.",
  );
  runGit("git", ["cat-file", "-e", `${acceptedCommit}^{commit}`], {
    stdio: "ignore",
  });
  const output = runGit(
    "git",
    [
      "diff",
      "--name-only",
      "--no-renames",
      acceptedCommit,
      currentCommit,
      "--",
      "apps",
      "packages",
      "tests/fixtures/oxs",
      "pnpm-lock.yaml",
      "pnpm-workspace.yaml",
      "tsconfig.base.json",
    ],
    { encoding: "utf8" },
  );
  return validateProductionSourceChanges(output.split(/\r?\n/u));
};

const runCli = () => {
  const result = productionSourceChanges({
    acceptedCommit: process.env.ACCEPTED_EXECUTABLE_SOURCE_COMMIT,
    currentCommit: process.env.GITHUB_SHA,
  });
  process.stdout.write(
    `Accepted production source boundary passed: ${result.allowedDeploymentPaths.length} deployment-only path(s), no product path changes.\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
