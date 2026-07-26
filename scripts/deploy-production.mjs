#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  currentVersion,
  deploymentList,
  readVersionUpload,
  validateProductionPreflight,
  writeJsonEvidence,
} from "./production-deployment-evidence.mjs";
import { executeProductionDeployment } from "./production-deployment-state.mjs";
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

const publicSnapshot = async () => {
  const request = (method) =>
    fetch(`${productionUrl}/`, {
      method,
      cache: "no-store",
      redirect: "error",
    });
  const response = await request("GET");
  const body = await response.text();
  const head = await request("HEAD");
  assert(response.status === 200, "Current production root is not recoverable.");
  assert(head.status === 200, "Current production HEAD baseline is not healthy.");
  return {
    status: response.status,
    headStatus: head.status,
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
const { prior } = validateProductionPreflight({
  deployments: parseJsonOutput(
    rawDeployments,
    "Cloudflare deployments list",
  ),
  publicSnapshot: preDeploySnapshot,
});
writeJsonEvidence(
  resolve(evidenceRoot, "production-preflight-evidence.json"),
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
);

const uploadOutput = resolve(evidenceRoot, "wrangler-version-upload.ndjson");
let lifecycle;
let failure;
try {
  lifecycle = await executeProductionDeployment({
    priorVersionId: prior.versionId,
    uploadVersion: async () => {
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
      return readVersionUpload(uploadOutput).versionId;
    },
    deployPrePromotion: async (uploadedVersionId, priorVersionId) => {
      runWrangler([
        "versions",
        "deploy",
        `${uploadedVersionId}@0%`,
        `${priorVersionId}@100%`,
        "--name",
        workerName,
        "--message",
        `Pre-promotion smoke for ${sourceCommit}`,
        "--yes",
      ]);
    },
    smokePrePromotion: async (uploadedVersionId) =>
      inspectProductionDeployment({
        baseUrl: productionUrl,
        expectedCommit: sourceCommit,
        versionId: uploadedVersionId,
      }),
    promote: async (uploadedVersionId) => {
      runWrangler([
        "versions",
        "deploy",
        `${uploadedVersionId}@100%`,
        "--name",
        workerName,
        "--message",
        `Promote ${sourceCommit}`,
        "--yes",
      ]);
    },
    smokeProduction: async () =>
      inspectProductionDeployment({
        baseUrl: productionUrl,
        expectedCommit: sourceCommit,
      }),
    rollback: async (priorVersionId) => {
      runWrangler([
        "rollback",
        priorVersionId,
        "--name",
        workerName,
        "--message",
        `Automatic rollback after failed deployment of ${sourceCommit}`,
        "--yes",
      ]);
    },
    confirmRollbackActive: async (priorVersionId) => {
      const currentDeployments = runWrangler(
        ["deployments", "list", "--name", workerName, "--json"],
        { capture: true },
      );
      const restored = currentVersion(
        deploymentList(
          parseJsonOutput(
            currentDeployments,
            "Post-rollback Cloudflare deployments list",
          ),
        ),
      );
      assert(
        restored.versionId === priorVersionId && restored.percentage === 100,
        "Rollback did not restore the prior version at 100% traffic.",
      );
      return restored;
    },
    verifyRollbackBaseline: async () => {
      const restored = await publicSnapshot();
      assert(
        restored.status === preDeploySnapshot.status &&
          restored.headStatus === preDeploySnapshot.headStatus &&
          restored.bodySha256 === preDeploySnapshot.bodySha256 &&
          restored.contentType === preDeploySnapshot.contentType,
        "Rollback did not restore the recorded public baseline.",
      );
      return restored;
    },
  });
} catch (error) {
  lifecycle = error.state ?? null;
  failure = {
    name: error.name,
    failureStage: error.state?.failureStage ?? null,
    rollbackFailureStage: error.state?.rollbackFailureStage ?? null,
  };
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
    preDeploySnapshot,
    lifecycle: lifecycle ?? null,
    failure: failure ?? null,
  };
  writeJsonEvidence(
    resolve(evidenceRoot, "production-deployment-evidence.json"),
    evidence,
  );
}

process.stdout.write(
  `Production deployment completed for ${sourceCommit}; previous version ${prior.versionId}, current version ${lifecycle.uploadedVersionId}.\n`,
);
