#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { inspectProductionDeployment } from "./verify-production-deployment.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const webRoot = resolve(repositoryRoot, "apps/web");
const evidenceRoot = resolve(
  repositoryRoot,
  process.env.DEPLOY_EVIDENCE_DIR ?? ".production-deployment",
);
const productionUrl = "https://abris.653915.com";
const workerName = "abris-universe";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const runWrangler = (args, options = {}) =>
  execFileSync("pnpm", ["exec", "wrangler", ...args], {
    cwd: webRoot,
    encoding: "utf8",
    stdio: options.capture ? ["ignore", "pipe", "pipe"] : "inherit",
    env: {
      ...process.env,
      WRANGLER_SEND_METRICS: "false",
      WRANGLER_WRITE_LOGS: "false",
      ...options.env,
    },
  });

const parseJsonOutput = (value, label) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} did not return valid JSON.`);
  }
};

const deploymentList = (value) => {
  if (Array.isArray(value)) return value;
  for (const key of ["deployments", "result", "items"]) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  throw new Error("Cloudflare deployments output has an unknown shape.");
};

const deploymentVersions = (deployment) => {
  const candidates = deployment?.versions ?? deployment?.version_traffic;
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((entry) => ({
      versionId:
        entry.version_id ?? entry.versionId ?? entry.id ?? entry.version?.id,
      percentage: Number(
        entry.percentage ?? entry.traffic_percentage ?? entry.weight ?? 0,
      ),
    }))
    .filter(
      (entry) =>
        typeof entry.versionId === "string" &&
        Number.isFinite(entry.percentage),
    );
};

const currentVersion = (deployments) => {
  for (const deployment of deployments) {
    const versions = deploymentVersions(deployment).sort(
      (left, right) => right.percentage - left.percentage,
    );
    if (versions.length > 0) {
      return {
        deploymentId: deployment.id ?? deployment.deployment_id ?? null,
        createdOn: deployment.created_on ?? deployment.createdAt ?? null,
        ...versions[0],
      };
    }
  }
  throw new Error("No recoverable active Cloudflare Worker version was found.");
};

const readVersionUpload = (outputPath) => {
  const entries = readFileSync(outputPath, "utf8")
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const upload = [...entries]
    .reverse()
    .find((entry) => entry.type === "version-upload");
  const versionId = upload?.version_id ?? upload?.versionId;
  assert(typeof versionId === "string", "Wrangler did not report a version ID.");
  return { versionId };
};

const publicSnapshot = async () => {
  const response = await fetch(`${productionUrl}/`, {
    cache: "no-store",
    redirect: "error",
  });
  const body = await response.text();
  assert(response.status === 200, "Current production root is not recoverable.");
  return {
    status: response.status,
    bodySha256: sha256(body),
    contentType: response.headers.get("content-type"),
    server: response.headers.get("server"),
  };
};

const sourceCommit = process.env.GITHUB_SHA;
const expectedCommit = process.env.EXPECTED_SOURCE_COMMIT;
assert(process.env.GITHUB_REF_NAME === "main", "Production deploys require main.");
assert(
  /^[0-9a-f]{40}$/u.test(sourceCommit ?? ""),
  "GITHUB_SHA must be a full lowercase Git SHA.",
);
assert(
  sourceCommit === expectedCommit,
  "EXPECTED_SOURCE_COMMIT must equal the checked-out GitHub source.",
);
assert(
  process.env.CLOUDFLARE_API_TOKEN,
  "CLOUDFLARE_API_TOKEN is not configured.",
);
assert(
  process.env.CLOUDFLARE_ACCOUNT_ID,
  "CLOUDFLARE_ACCOUNT_ID is not configured.",
);

mkdirSync(evidenceRoot, { recursive: true });
const startedAt = new Date().toISOString();
const preDeploySnapshot = await publicSnapshot();
const rawDeployments = runWrangler(
  ["deployments", "list", "--name", workerName, "--json"],
  { capture: true },
);
const prior = currentVersion(
  deploymentList(parseJsonOutput(rawDeployments, "Cloudflare deployments list")),
);
assert(
  prior.percentage === 100,
  "First production promotion requires one prior version at 100% traffic.",
);
writeFileSync(
  resolve(evidenceRoot, "production-preflight-evidence.json"),
  `${JSON.stringify(
    {
      schemaVersion: 1,
      workerName,
      productionUrl,
      sourceCommit,
      workflowRunId: process.env.GITHUB_RUN_ID ?? null,
      workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
      actor: process.env.GITHUB_ACTOR ?? null,
      capturedAt: new Date().toISOString(),
      prior,
      preDeploySnapshot,
    },
    null,
    2,
  )}\n`,
  "utf8",
);

const uploadOutput = resolve(evidenceRoot, "wrangler-version-upload.ndjson");
runWrangler(
  [
    "versions",
    "upload",
    "--name",
    workerName,
    "--strict",
    "--tag",
    `git-${sourceCommit.slice(0, 12)}`,
    "--message",
    `Abris Universe ${sourceCommit}`,
  ],
  {
    env: { WRANGLER_OUTPUT_FILE_PATH: uploadOutput },
  },
);
const uploaded = readVersionUpload(uploadOutput);

let promoted = false;
let rollbackPerformed = false;
let prePromotionSmoke;
let productionSmoke;
try {
  runWrangler([
    "versions",
    "deploy",
    `${uploaded.versionId}@0%`,
    `${prior.versionId}@100%`,
    "--name",
    workerName,
    "--message",
    `Pre-promotion smoke for ${sourceCommit}`,
    "--yes",
  ]);
  prePromotionSmoke = await inspectProductionDeployment({
    baseUrl: productionUrl,
    expectedCommit: sourceCommit,
    versionId: uploaded.versionId,
  });

  runWrangler([
    "versions",
    "deploy",
    `${uploaded.versionId}@100%`,
    "--name",
    workerName,
    "--message",
    `Promote ${sourceCommit}`,
    "--yes",
  ]);
  promoted = true;
  productionSmoke = await inspectProductionDeployment({
    baseUrl: productionUrl,
    expectedCommit: sourceCommit,
  });
} catch (error) {
  runWrangler([
    "rollback",
    prior.versionId,
    "--name",
    workerName,
    "--message",
    `Automatic rollback after failed deployment of ${sourceCommit}`,
    "--yes",
  ]);
  rollbackPerformed = true;
  const restored = await publicSnapshot();
  assert(
    restored.bodySha256 === preDeploySnapshot.bodySha256,
    "Rollback completed but the placeholder body hash was not restored.",
  );
  throw error;
} finally {
  const evidence = {
    schemaVersion: 1,
    workerName,
    productionUrl,
    sourceCommit,
    workflowRunId: process.env.GITHUB_RUN_ID ?? null,
    workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    actor: process.env.GITHUB_ACTOR ?? null,
    startedAt,
    completedAt: new Date().toISOString(),
    prior,
    uploadedVersionId: uploaded.versionId,
    promoted,
    rollbackPerformed,
    preDeploySnapshot,
    prePromotionSmoke: prePromotionSmoke ?? null,
    productionSmoke: productionSmoke ?? null,
  };
  writeFileSync(
    resolve(evidenceRoot, "production-deployment-evidence.json"),
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );
}

process.stdout.write(
  `Production deployment completed for ${sourceCommit}; previous version ${prior.versionId}, current version ${uploaded.versionId}.\n`,
);
