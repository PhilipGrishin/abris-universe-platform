import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

const FULL_SHA = /^[0-9a-f]{40}$/u;
const DEFAULT_REGISTRY_PATH = ".codex/production-deployment-source.json";

const PRODUCT_AND_TRUST_INPUTS = [
  ".github/workflows",
  "apps",
  "package.json",
  "packages",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  "scripts",
  "tests/fixtures/cloudflare",
  "tests/fixtures/oxs",
  "tsconfig.base.json",
];

const DEPLOYMENT_TRUST_INPUTS = [
  ".github/workflows",
  "apps/web/worker",
  "apps/web/test/worker.test.ts",
  "apps/web/wrangler.jsonc",
  "apps/web/wrangler.deployment-lab.jsonc",
  "package.json",
  "scripts",
  "tests/fixtures/cloudflare",
];

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const parsePaths = (output) =>
  output
    .split("\0")
    .filter((pathname) => pathname.length > 0);

const isDeploymentTrustInput = (pathname) =>
  DEPLOYMENT_TRUST_INPUTS.some(
    (trustedPath) =>
      pathname === trustedPath || pathname.startsWith(`${trustedPath}/`),
  );

export const validateProductionSourceChanges = (changedPaths) => {
  assert(Array.isArray(changedPaths), "changedPaths must be an array.");
  assert(
    changedPaths.every(
      (pathname) => typeof pathname === "string" && pathname.length > 0,
    ),
    "changedPaths must contain only non-empty strings.",
  );
  const rejected = changedPaths.filter(
    (pathname) => !isDeploymentTrustInput(pathname),
  );
  assert(
    rejected.length === 0,
    `Production source boundary includes unaccepted product paths: ${rejected.join(", ")}`,
  );
  return {
    changedPaths,
    reviewedDeploymentPaths: changedPaths.filter(isDeploymentTrustInput),
  };
};

export const parseProductionSourceRegistry = (contents) => {
  let registry;
  try {
    registry = JSON.parse(contents);
  } catch {
    throw new Error("Production deployment source registry must be valid JSON.");
  }
  assert(
    registry?.schemaVersion === 1,
    "Production deployment source registry schemaVersion must be 1.",
  );
  assert(
    FULL_SHA.test(registry.acceptedProductSourceCommit ?? ""),
    "Registry acceptedProductSourceCommit must be a full lowercase Git SHA.",
  );
  assert(
    FULL_SHA.test(registry.reviewedDeploymentSourceCommit ?? ""),
    "Registry reviewedDeploymentSourceCommit must be a full lowercase Git SHA.",
  );
  return registry;
};

export const validateProductionSourceRegistryAnchors = ({
  registry,
  acceptedProductSourceAnchor,
  reviewedDeploymentSourceAnchor,
}) => {
  assert(
    FULL_SHA.test(acceptedProductSourceAnchor ?? ""),
    "ACCEPTED_EXECUTABLE_SOURCE_COMMIT external anchor must be a full lowercase Git SHA.",
  );
  assert(
    FULL_SHA.test(reviewedDeploymentSourceAnchor ?? ""),
    "REVIEWED_DEPLOYMENT_SOURCE_COMMIT external anchor must be a full lowercase Git SHA.",
  );
  assert(
    registry.acceptedProductSourceCommit === acceptedProductSourceAnchor,
    "Registered accepted product source does not match the external production anchor.",
  );
  assert(
    registry.reviewedDeploymentSourceCommit ===
      reviewedDeploymentSourceAnchor,
    "Registered reviewed deployment source does not match the external production anchor.",
  );
  return registry;
};

export const productionSourceChanges = ({
  acceptedCommit,
  reviewedDeploymentCommit,
  currentCommit,
  runGit = execFileSync,
}) => {
  assert(
    FULL_SHA.test(acceptedCommit ?? ""),
    "ACCEPTED_EXECUTABLE_SOURCE_COMMIT must be a full lowercase Git SHA.",
  );
  assert(
    FULL_SHA.test(reviewedDeploymentCommit ?? ""),
    "reviewedDeploymentSourceCommit must be a full lowercase Git SHA.",
  );
  assert(
    FULL_SHA.test(currentCommit ?? ""),
    "GITHUB_SHA must be a full lowercase Git SHA.",
  );

  for (const commit of [
    acceptedCommit,
    reviewedDeploymentCommit,
    currentCommit,
  ]) {
    runGit("git", ["cat-file", "-e", `${commit}^{commit}`], {
      stdio: "ignore",
    });
  }
  runGit(
    "git",
    ["merge-base", "--is-ancestor", reviewedDeploymentCommit, currentCommit],
    { stdio: "ignore" },
  );

  const deploymentDrift = runGit(
    "git",
    [
      "diff",
      "--name-only",
      "-z",
      "--no-renames",
      reviewedDeploymentCommit,
      currentCommit,
      "--",
      ...DEPLOYMENT_TRUST_INPUTS,
    ],
    { encoding: "utf8" },
  );
  const driftPaths = parsePaths(deploymentDrift);
  assert(
    driftPaths.length === 0,
    `Production deployment trust inputs differ from independently reviewed source ${reviewedDeploymentCommit}: ${driftPaths.join(", ")}`,
  );

  const output = runGit(
    "git",
    [
      "diff",
      "--name-only",
      "-z",
      "--no-renames",
      acceptedCommit,
      currentCommit,
      "--",
      ...PRODUCT_AND_TRUST_INPUTS,
    ],
    { encoding: "utf8" },
  );
  const result = validateProductionSourceChanges(parsePaths(output));
  return {
    ...result,
    reviewedDeploymentCommit,
  };
};

const runCli = () => {
  const registryPath =
    process.env.PRODUCTION_SOURCE_REGISTRY_PATH ?? DEFAULT_REGISTRY_PATH;
  const registry = parseProductionSourceRegistry(
    readFileSync(registryPath, "utf8"),
  );
  validateProductionSourceRegistryAnchors({
    registry,
    acceptedProductSourceAnchor:
      process.env.ACCEPTED_EXECUTABLE_SOURCE_COMMIT,
    reviewedDeploymentSourceAnchor:
      process.env.REVIEWED_DEPLOYMENT_SOURCE_COMMIT,
  });
  const result = productionSourceChanges({
    acceptedCommit: registry.acceptedProductSourceCommit,
    reviewedDeploymentCommit: registry.reviewedDeploymentSourceCommit,
    currentCommit: process.env.GITHUB_SHA,
  });
  process.stdout.write(
    `Accepted production source boundary passed: ${result.reviewedDeploymentPaths.length} exact reviewed deployment path(s), no product path changes or deployment trust drift.\n`,
  );
};

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  runCli();
}
