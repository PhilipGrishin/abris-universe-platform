#!/usr/bin/env node

import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import {
  currentVersion,
  deploymentFailureEvidence,
  deploymentLifecycleEvidence,
  deploymentList,
  readVersionUpload,
  validateProductionDomain,
  validateProductionPreflight,
  validateWorkerSubdomainResponse,
  writeJsonEvidence,
} from "./production-deployment-evidence.mjs";
import { environmentForWrangler } from "./production-deployment-environment.mjs";
import { inspectCloudflareVersionAffinity } from "./cloudflare-version-affinity.mjs";
import { purgeCloudflareHostnameCache } from "./cloudflare-cache-purge.mjs";
import { executeProductionDeployment } from "./production-deployment-state.mjs";
import { waitForRegisteredRollbackBaseline } from "./production-rollback-verification.mjs";
import {
  inspectProductionDeployment,
  inspectProductionStability,
  PREVIEW_SEMANTIC_ATTEMPTS,
  PREVIEW_SEMANTIC_TIMEOUT_MS,
} from "./verify-production-deployment.mjs";

const repositoryRoot = resolve(import.meta.dirname, "..");
const webRoot = resolve(repositoryRoot, "apps/web");
const evidenceRoot = resolve(
  repositoryRoot,
  process.env.DEPLOY_EVIDENCE_DIR ?? ".production-deployment",
);
const productionUrl = "https://abris.653915.com";
const productionHostname = "abris.653915.com";
const workerName = "abris-universe";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const runWrangler = (args, options = {}) => {
  try {
    return execFileSync("pnpm", ["exec", "wrangler", ...args], {
      cwd: webRoot,
      encoding: "utf8",
      stdio:
        options.capture || options.redactOutput
          ? ["ignore", "pipe", "pipe"]
          : "inherit",
      env: {
        ...environmentForWrangler(process.env),
        WRANGLER_SEND_METRICS: "false",
        WRANGLER_WRITE_LOGS: "false",
        ...options.env,
      },
    });
  } catch (error) {
    if (options.redactOutput) {
      throw new Error("Wrangler version upload failed with output redacted.");
    }
    throw error;
  }
};

const parseJsonOutput = (value, label) => {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} did not return valid JSON.`);
  }
};

const publicSnapshot = async ({ timeoutMs = 10_000 } = {}) => {
  const signal = AbortSignal.timeout(Math.max(1, timeoutMs));
  const request = (method) =>
    fetch(`${productionUrl}/`, {
      method,
      cache: "no-store",
      redirect: "error",
      signal,
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

const productionDomain = async () => {
  const query = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/domains`,
  );
  query.searchParams.set("hostname", productionHostname);
  query.searchParams.set("service", workerName);
  const response = await fetch(query, {
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  assert(response.status === 200, "Cloudflare domain query did not return 200.");
  return validateProductionDomain({
    response: await response.json(),
    expectedHostname: productionHostname,
    expectedService: workerName,
  });
};

const productionWorkerSubdomain = async () => {
  const query = new URL(
    `https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/workers/scripts/${workerName}/subdomain`,
  );
  const response = await fetch(query, {
    headers: {
      Authorization: `Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,
    },
    redirect: "error",
    signal: AbortSignal.timeout(10_000),
  });
  return validateWorkerSubdomainResponse({
    status: response.status,
    response: await response.json(),
  });
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
assert(
  process.env.CLOUDFLARE_CACHE_PURGE_TOKEN,
  "CLOUDFLARE_CACHE_PURGE_TOKEN is not configured.",
);
assert(
  process.env.CLOUDFLARE_RULES_TOKEN,
  "CLOUDFLARE_RULES_TOKEN is not configured.",
);
assert(
  /^[0-9a-f]{32}$/u.test(process.env.CLOUDFLARE_ZONE_ID ?? ""),
  "CLOUDFLARE_ZONE_ID must be a 32-character lowercase hexadecimal ID.",
);

mkdirSync(evidenceRoot, { recursive: true });
const startedAt = new Date().toISOString();
const preDeploySnapshot = await publicSnapshot();
const preDeployDomain = await productionDomain();
const versionAffinity = await inspectCloudflareVersionAffinity({
  zoneId: process.env.CLOUDFLARE_ZONE_ID,
  token: process.env.CLOUDFLARE_RULES_TOKEN,
  hostname: productionHostname,
});
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
    schemaVersion: 2,
    workerName,
    productionUrl,
    sourceCommit,
    workflowRunId: process.env.GITHUB_RUN_ID ?? null,
    workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    actor: process.env.GITHUB_ACTOR ?? null,
    capturedAt: new Date().toISOString(),
    prior,
    productionDomain: preDeployDomain,
    versionAffinity,
    preDeploySnapshot,
  },
);

const uploadOutput = resolve(evidenceRoot, "wrangler-version-upload.ndjson");
let lifecycle;
let failure;
try {
  lifecycle = await executeProductionDeployment({
    priorVersionId: prior.versionId,
    verifyRemotePreviewState: productionWorkerSubdomain,
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
          "--var",
          `SOURCE_COMMIT:${sourceCommit}`,
          "--var",
          "SOURCE_DIRTY:false",
        ],
        {
          env: { WRANGLER_OUTPUT_FILE_PATH: uploadOutput },
          redactOutput: true,
        },
      );
      return readVersionUpload(uploadOutput);
    },
    smokePreview: async (candidate) =>
      inspectProductionDeployment({
        baseUrl: candidate.previewUrl,
        expectedCommit: sourceCommit,
        expectedWorkerVersionId: candidate.versionId,
        semanticAttempts: PREVIEW_SEMANTIC_ATTEMPTS,
        signal: AbortSignal.timeout(PREVIEW_SEMANTIC_TIMEOUT_MS),
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
    purgeProductionCache: async () =>
      purgeCloudflareHostnameCache({
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        token: process.env.CLOUDFLARE_CACHE_PURGE_TOKEN,
        hostname: productionHostname,
      }),
    smokeProduction: async ({ candidate, previewSmoke }) =>
      inspectProductionStability({
        baseUrl: productionUrl,
        expectedCommit: sourceCommit,
        expectedWorkerVersionId: candidate.versionId,
        priorBaseline: preDeploySnapshot,
        priorWorkerVersionId: prior.versionId,
        previewSmoke,
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
    purgeRollbackCache: async () =>
      purgeCloudflareHostnameCache({
        zoneId: process.env.CLOUDFLARE_ZONE_ID,
        token: process.env.CLOUDFLARE_CACHE_PURGE_TOKEN,
        hostname: productionHostname,
      }),
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
    verifyRollbackBaseline: async ({ previewSmoke }) =>
      waitForRegisteredRollbackBaseline({
        priorBaseline: preDeploySnapshot,
        candidateObservation: previewSmoke.root.observation,
        snapshot: ({ remainingMs }) =>
          publicSnapshot({ timeoutMs: Math.min(10_000, remainingMs) }),
      }),
  });
} catch (error) {
  lifecycle = error.state ?? null;
  failure = deploymentFailureEvidence(error);
  throw error;
} finally {
  const evidence = {
    schemaVersion: 4,
    workerName,
    productionUrl,
    sourceCommit,
    workflowRunId: process.env.GITHUB_RUN_ID ?? null,
    workflowRunAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null,
    actor: process.env.GITHUB_ACTOR ?? null,
    startedAt,
    completedAt: new Date().toISOString(),
    prior,
    productionDomain: preDeployDomain,
    versionAffinity,
    preDeploySnapshot,
    lifecycle: deploymentLifecycleEvidence(lifecycle),
    failure: failure ?? null,
  };
  writeJsonEvidence(
    resolve(evidenceRoot, "production-deployment-evidence.json"),
    evidence,
  );
}

process.stdout.write(
  `Production deployment completed for ${sourceCommit}; previous version ${prior.versionId}, current version ${lifecycle.candidate.versionId}.\n`,
);
