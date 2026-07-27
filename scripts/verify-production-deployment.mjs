#!/usr/bin/env node

import { createHash } from "node:crypto";
import { pathToFileURL } from "node:url";

const EXPECTED_CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'none'",
  "worker-src 'self'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

export const PRODUCTION_SEMANTIC_ATTEMPTS = 6;
export const PREVIEW_SEMANTIC_ATTEMPTS = 61;
export const PREVIEW_SEMANTIC_TIMEOUT_MS = 120_000;
export const PRODUCTION_STABILITY_ATTEMPTS = 25;
export const PRODUCTION_STABILITY_REQUIRED_PASSES = 3;
export const PRODUCTION_STABILITY_RETRY_DELAY_MS = 5_000;
export const PRODUCTION_STABILITY_TIMEOUT_MS = 120_000;

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const fetchWithRetry = async (url, init, attempts = 5) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      const response = await fetch(url, init);
      if (response.ok || response.status === 405) return response;
      lastError = new Error(`${url} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, attempt * 1_000));
    }
  }
  throw lastError;
};

const readResponse = async (response) => {
  const body = await response.text();
  return {
    status: response.status,
    body,
    bodySha256: sha256(body),
    headers: Object.fromEntries(response.headers.entries()),
  };
};

const assertSecurityHeaders = (headers, label) => {
  assert(
    headers["content-security-policy"] === EXPECTED_CSP,
    `${label} Content-Security-Policy does not match the reviewed contract.`,
  );
  assert(
    headers["x-content-type-options"] === "nosniff",
    `${label} is missing X-Content-Type-Options: nosniff.`,
  );
  assert(
    headers["referrer-policy"] === "no-referrer",
    `${label} is missing Referrer-Policy: no-referrer.`,
  );
};

const absoluteAssetPaths = (html) => {
  const paths = new Set();
  for (const match of html.matchAll(
    /(?:src|href)="([^"]+\.(?:js|css))"/gu,
  )) {
    paths.add(new URL(match[1], "https://deployment.invalid/").pathname);
  }
  return [...paths].sort();
};

const validateInspectionInput = ({
  baseUrl,
  expectedCommit,
  allowHttpForTest = false,
}) => {
  assert(
    /^https:\/\/[^/]+$/u.test(baseUrl) ||
      (allowHttpForTest && /^http:\/\/127\.0\.0\.1:\d+$/u.test(baseUrl)),
    "baseUrl must be an HTTPS origin.",
  );
  assert(
    /^[0-9a-f]{40}$/u.test(expectedCommit),
    "expectedCommit must be a full lowercase Git SHA.",
  );
};

const validateStabilityInput = ({
  priorBaseline,
  previewSmoke,
  expectedCommit,
}) => {
  assert(
    priorBaseline &&
      Number.isInteger(priorBaseline.status) &&
      Number.isInteger(priorBaseline.headStatus) &&
      /^[0-9a-f]{64}$/u.test(priorBaseline.bodySha256 ?? "") &&
      typeof priorBaseline.contentType === "string" &&
      priorBaseline.contentType.length > 0,
    "priorBaseline must contain the registered status, HEAD status, body SHA-256, and content type.",
  );
  assert(
    previewSmoke?.observedCommit === expectedCommit &&
      Number.isInteger(previewSmoke?.root?.status) &&
      /^[0-9a-f]{64}$/u.test(previewSmoke?.root?.bodySha256 ?? ""),
    "previewSmoke must contain the exact reviewed commit and root sentinel.",
  );
};

const matchesPriorBaseline = (observation, priorBaseline) =>
  observation?.status === priorBaseline.status &&
  observation?.headStatus === priorBaseline.headStatus &&
  observation?.bodySha256 === priorBaseline.bodySha256 &&
  observation?.contentType === priorBaseline.contentType;

const inspectProductionDeploymentOnce = async ({
  baseUrl,
  expectedCommit,
  signal,
}) => {
  const request = (pathname, init = {}) =>
    fetchWithRetry(`${baseUrl}${pathname}`, {
      cache: "no-store",
      redirect: "error",
      signal,
      ...init,
    });

  const root = await readResponse(await request("/"));
  const head = await request("/", { method: "HEAD" });
  const headHeaders = Object.fromEntries(head.headers.entries());
  const rootObservation = {
    status: root.status,
    headStatus: head.status,
    bodySha256: root.bodySha256,
    contentType: root.headers["content-type"] ?? null,
    contentSecurityPolicy:
      root.headers["content-security-policy"] ?? null,
    cfCacheStatus: root.headers["cf-cache-status"] ?? null,
    server: root.headers.server ?? null,
  };
  try {
    assert(root.status === 200, "Deployment root did not return 200.");
    assert(
      root.body.includes("Abris Universe"),
      "Deployment root does not contain the application shell.",
    );
    assertSecurityHeaders(root.headers, "Deployment root");
    assert(head.status === 200, "Deployment HEAD / did not return 200.");
    assertSecurityHeaders(headHeaders, "Deployment HEAD");
  } catch (error) {
    error.deploymentObservation = rootObservation;
    throw error;
  }

  try {
    const version = await readResponse(await request("/version.json"));
    assert(version.status === 200, "Deployment version.json did not return 200.");
    assertSecurityHeaders(version.headers, "Deployment version.json");
    const provenance = JSON.parse(version.body);
    assert(
      provenance.sourceCommit === expectedCommit,
      `Deployment source commit ${provenance.sourceCommit} does not match ${expectedCommit}.`,
    );
    assert(provenance.sourceDirty === false, "Deployment provenance is dirty.");

    const fallback = await readResponse(
      await request("/deployment-smoke/non-root-route"),
    );
    assert(fallback.status === 200, "Deployment SPA fallback did not return 200.");
    assert(
      fallback.bodySha256 === root.bodySha256,
      "Deployment SPA fallback does not match the application shell.",
    );
    assertSecurityHeaders(fallback.headers, "Deployment SPA fallback");

    const post = await readResponse(await request("/", { method: "POST" }));
    assert(post.status === 405, "Deployment POST / did not return 405.");
    assert(post.headers.allow === "GET, HEAD", "Deployment Allow header is wrong.");
    assertSecurityHeaders(post.headers, "Deployment POST rejection");

    const assets = [];
    for (const pathname of absoluteAssetPaths(root.body)) {
      const response = await readResponse(await request(pathname));
      assert(response.status === 200, `Deployment asset ${pathname} did not return 200.`);
      assertSecurityHeaders(response.headers, `Deployment asset ${pathname}`);
      assets.push({
        pathname,
        status: response.status,
        bodySha256: response.bodySha256,
        contentType: response.headers["content-type"] ?? null,
      });
    }
    assert(assets.length >= 2, "Deployment shell does not reference hashed JS and CSS.");

    return {
      baseUrl,
      expectedCommit,
      observedCommit: provenance.sourceCommit,
      root: {
        status: root.status,
        bodySha256: root.bodySha256,
        observation: rootObservation,
      },
      fallback: {
        status: fallback.status,
        bodySha256: fallback.bodySha256,
      },
      methodBoundary: {
        headStatus: head.status,
        postStatus: post.status,
        allow: post.headers.allow,
      },
      securityHeaders: {
        contentSecurityPolicy: root.headers["content-security-policy"],
        xContentTypeOptions: root.headers["x-content-type-options"],
        referrerPolicy: root.headers["referrer-policy"],
      },
      assets,
    };
  } catch (error) {
    error.deploymentObservation ??= rootObservation;
    throw error;
  }
};

export const inspectProductionDeployment = async ({
  semanticAttempts = PRODUCTION_SEMANTIC_ATTEMPTS,
  semanticRetryDelayMs = 2_000,
  ...inspection
}) => {
  validateInspectionInput(inspection);
  assert(
    Number.isInteger(semanticAttempts) && semanticAttempts > 0,
    "semanticAttempts must be a positive integer.",
  );
  assert(
    Number.isInteger(semanticRetryDelayMs) && semanticRetryDelayMs >= 0,
    "semanticRetryDelayMs must be a non-negative integer.",
  );

  let lastError;
  for (let attempt = 1; attempt <= semanticAttempts; attempt += 1) {
    if (inspection.signal?.aborted) {
      const error = new Error("Deployment inspection was aborted.");
      error.semanticAttempt = attempt - 1;
      error.semanticAttemptsExhausted = attempt - 1;
      throw error;
    }
    try {
      const evidence = await inspectProductionDeploymentOnce(inspection);
      return { ...evidence, semanticAttempt: attempt };
    } catch (error) {
      lastError = error;
      error.semanticAttempt = attempt;
      if (inspection.signal?.aborted) {
        error.semanticAttemptsExhausted = attempt;
        throw error;
      }
      if (attempt < semanticAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, semanticRetryDelayMs),
        );
      }
    }
  }
  lastError.semanticAttemptsExhausted = semanticAttempts;
  throw lastError;
};

export const inspectProductionStability = async ({
  stabilityAttempts = PRODUCTION_STABILITY_ATTEMPTS,
  requiredConsecutivePasses = PRODUCTION_STABILITY_REQUIRED_PASSES,
  stabilityRetryDelayMs = PRODUCTION_STABILITY_RETRY_DELAY_MS,
  stabilityTimeoutMs = PRODUCTION_STABILITY_TIMEOUT_MS,
  stabilityNow = Date.now,
  stabilitySleep = (delayMs) =>
    new Promise((resolve) => setTimeout(resolve, delayMs)),
  priorBaseline,
  previewSmoke,
  ...inspection
}) => {
  validateInspectionInput(inspection);
  validateStabilityInput({
    priorBaseline,
    previewSmoke,
    expectedCommit: inspection.expectedCommit,
  });
  assert(
    Number.isInteger(stabilityAttempts) && stabilityAttempts > 0,
    "stabilityAttempts must be a positive integer.",
  );
  assert(
    Number.isInteger(requiredConsecutivePasses) &&
      requiredConsecutivePasses > 0 &&
      requiredConsecutivePasses <= stabilityAttempts,
    "requiredConsecutivePasses must fit within stabilityAttempts.",
  );
  assert(
    Number.isInteger(stabilityRetryDelayMs) &&
      stabilityRetryDelayMs >= 0,
    "stabilityRetryDelayMs must be a non-negative integer.",
  );
  assert(
    Number.isInteger(stabilityTimeoutMs) && stabilityTimeoutMs > 0,
    "stabilityTimeoutMs must be a positive integer.",
  );
  assert(
    typeof stabilityNow === "function" &&
      typeof stabilitySleep === "function",
    "stability clock dependencies must be functions.",
  );

  const startedAt = stabilityNow();
  let consecutivePasses = 0;
  let priorBaselineObservations = 0;
  let lastObservation = null;
  let lastEvidence = null;

  for (let attempt = 1; attempt <= stabilityAttempts; attempt += 1) {
    const remainingMs =
      stabilityTimeoutMs - (stabilityNow() - startedAt);
    if (remainingMs <= 0) {
      const error = new Error(
        "Production did not reach the required consecutive full-contract stability quorum.",
      );
      error.stabilityAttempt = attempt - 1;
      error.stabilityAttemptsExhausted = attempt - 1;
      error.stabilityWindowMs = stabilityTimeoutMs;
      error.stabilityClassification = "timeout";
      error.stabilityObservation = lastObservation;
      throw error;
    }

    try {
      lastEvidence = await inspectProductionDeployment({
        ...inspection,
        signal: AbortSignal.timeout(remainingMs),
        semanticAttempts: 1,
        semanticRetryDelayMs: 0,
      });
      lastObservation = lastEvidence.root.observation;
      consecutivePasses += 1;
      if (consecutivePasses === requiredConsecutivePasses) {
        return {
          ...lastEvidence,
          stability: {
            attempt,
            requiredConsecutivePasses,
            consecutivePasses,
            priorBaselineObservations,
            windowMs: stabilityTimeoutMs,
            observation: lastObservation,
          },
        };
      }
    } catch (error) {
      lastObservation = error.deploymentObservation ?? null;
      if (matchesPriorBaseline(lastObservation, priorBaseline)) {
        priorBaselineObservations += 1;
        consecutivePasses = 0;
      } else {
        error.stabilityAttempt = attempt;
        error.stabilityWindowMs = stabilityTimeoutMs;
        error.stabilityClassification = lastObservation
          ? "candidate-contract"
          : "unrecognized";
        error.stabilityObservation = lastObservation;
        throw error;
      }
    }

    if (attempt < stabilityAttempts) {
      const delayMs = Math.min(
        stabilityRetryDelayMs,
        Math.max(
          0,
          stabilityTimeoutMs - (stabilityNow() - startedAt),
        ),
      );
      await stabilitySleep(delayMs);
      continue;
    }

    const error = new Error(
      "Production did not reach the required consecutive full-contract stability quorum.",
    );
    error.stabilityAttempt = attempt;
    error.stabilityAttemptsExhausted = stabilityAttempts;
    error.stabilityWindowMs = stabilityTimeoutMs;
    error.stabilityClassification =
      consecutivePasses > 0 ? "candidate-not-stable" : "prior-baseline";
    error.stabilityObservation = lastObservation;
    throw error;
  }
};

const runCli = async () => {
  const baseUrl = process.env.PRODUCTION_URL ?? "https://abris.653915.com";
  const expectedCommit = process.env.EXPECTED_SOURCE_COMMIT;
  if (!expectedCommit) {
    throw new Error("EXPECTED_SOURCE_COMMIT is required.");
  }
  const evidence = await inspectProductionDeployment({
    baseUrl,
    expectedCommit,
  });
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
