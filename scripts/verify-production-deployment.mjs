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

const WORKER_VERSION_HEADER = "x-abris-worker-version";
const SOURCE_COMMIT_HEADER = "x-abris-source-commit";

const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const abortedError = (signal) =>
  signal?.reason instanceof Error
    ? signal.reason
    : new Error("Deployment request was aborted.");

const waitWithSignal = (delayMs, signal) =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortedError(signal));
      return;
    }
    const timeout = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    const onAbort = () => {
      clearTimeout(timeout);
      reject(abortedError(signal));
    };
    signal?.addEventListener("abort", onAbort, { once: true });
  });

const fetchWithRetry = async (url, init, attempts = 5) => {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    if (init.signal?.aborted) throw abortedError(init.signal);
    try {
      const response = await fetch(url, init);
      if (response.ok || response.status === 405) return response;
      lastError = new Error(
        `Deployment request returned status ${response.status}.`,
      );
      lastError.responseStatus = response.status;
      lastError.responseWorkerVersionId =
        response.headers.get(WORKER_VERSION_HEADER);
      lastError.responseSourceCommit =
        response.headers.get(SOURCE_COMMIT_HEADER);
    } catch {
      if (init.signal?.aborted) throw abortedError(init.signal);
      lastError = new Error("Deployment request failed.");
    }
    if (attempt < attempts) {
      await waitWithSignal(attempt * 1_000, init.signal);
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
  expectedWorkerVersionId,
  versionAffinityKey,
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
  assert(
    expectedWorkerVersionId === undefined ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(
        expectedWorkerVersionId,
      ),
    "expectedWorkerVersionId must be a lowercase UUID.",
  );
  assert(
    versionAffinityKey === undefined ||
      (typeof versionAffinityKey === "string" &&
        versionAffinityKey.length > 0 &&
        versionAffinityKey.length <= 128),
    "versionAffinityKey must contain between 1 and 128 characters.",
  );
};

const validateStabilityInput = ({
  priorBaseline,
  priorWorkerVersionId,
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
    priorWorkerVersionId === undefined ||
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u.test(
        priorWorkerVersionId,
      ),
    "priorWorkerVersionId must be a lowercase UUID.",
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

const matchesCandidateSentinel = (observation, previewSmoke) =>
  observation?.status === previewSmoke.root.status &&
  observation?.bodySha256 === previewSmoke.root.bodySha256;

const inspectProductionDeploymentOnce = async ({
  baseUrl,
  expectedCommit,
  expectedWorkerVersionId,
  versionAffinityKey,
  signal,
  requestAttempts,
}) => {
  const requestChecks = [];
  const affinityKey =
    versionAffinityKey ?? `abris-deployment-${expectedCommit}`;
  const request = async (pathname, init = {}) => {
    const method = init.method ?? "GET";
    try {
      const response = await fetchWithRetry(
        `${baseUrl}${pathname}`,
        {
          cache: "no-store",
          redirect: "error",
          signal,
          ...init,
          headers: {
            "Cloudflare-Workers-Version-Key": affinityKey,
            ...init.headers,
          },
        },
        requestAttempts,
      );
      requestChecks.push({
        checkId: `${method} ${pathname}`,
        method,
        pathname,
        status: response.status,
        workerVersionId: response.headers.get(WORKER_VERSION_HEADER),
        sourceCommit: response.headers.get(SOURCE_COMMIT_HEADER),
      });
      return response;
    } catch (error) {
      if (Number.isInteger(error.responseStatus)) {
        requestChecks.push({
          checkId: `${method} ${pathname}`,
          method,
          pathname,
          status: error.responseStatus,
          workerVersionId: error.responseWorkerVersionId ?? null,
          sourceCommit: error.responseSourceCommit ?? null,
        });
      }
      error.deploymentChecks ??= [...requestChecks];
      throw error;
    }
  };

  const assertResponseIdentity = (headers, label, workerVersionId) => {
    const observedWorkerVersionId = headers[WORKER_VERSION_HEADER] ?? null;
    const observedSourceCommit = headers[SOURCE_COMMIT_HEADER] ?? null;
    if (workerVersionId) {
      assert(
        observedWorkerVersionId === workerVersionId,
        `${label} was served by Worker version ${observedWorkerVersionId} instead of ${workerVersionId}.`,
      );
    }
    assert(
      observedSourceCommit === expectedCommit,
      `${label} source commit header does not match ${expectedCommit}.`,
    );
  };

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
    workerVersionId: root.headers[WORKER_VERSION_HEADER] ?? null,
    sourceCommit: root.headers[SOURCE_COMMIT_HEADER] ?? null,
  };
  try {
    assert(root.status === 200, "Deployment root did not return 200.");
    assert(
      root.body.includes("Abris Universe"),
      "Deployment root does not contain the application shell.",
    );
    assertSecurityHeaders(root.headers, "Deployment root");
    assertResponseIdentity(
      root.headers,
      "Deployment root",
      expectedWorkerVersionId,
    );
    assert(head.status === 200, "Deployment HEAD / did not return 200.");
    assertSecurityHeaders(headHeaders, "Deployment HEAD");
    assertResponseIdentity(
      headHeaders,
      "Deployment HEAD",
      expectedWorkerVersionId,
    );
  } catch (error) {
    error.deploymentObservation = rootObservation;
    error.deploymentChecks = [...requestChecks];
    throw error;
  }

  try {
    const runtime = await readResponse(await request("/__deployment"));
    assert(
      runtime.status === 200,
      "Deployment Worker-owned provenance did not return 200.",
    );
    assertSecurityHeaders(
      runtime.headers,
      "Deployment Worker-owned provenance",
    );
    const runtimeProvenance = JSON.parse(runtime.body);
    assert(
      runtimeProvenance.sourceCommit === expectedCommit,
      `Deployment runtime source commit ${runtimeProvenance.sourceCommit} does not match ${expectedCommit}.`,
    );
    assert(
      runtimeProvenance.sourceDirty === false,
      "Deployment runtime provenance is dirty.",
    );
    assert(
      typeof runtimeProvenance.workerVersionId === "string",
      "Deployment runtime provenance is missing its Worker version ID.",
    );
    assert(
      expectedWorkerVersionId === undefined ||
        runtimeProvenance.workerVersionId === expectedWorkerVersionId,
      `Deployment runtime Worker version ${runtimeProvenance.workerVersionId} does not match ${expectedWorkerVersionId}.`,
    );
    assertResponseIdentity(
      runtime.headers,
      "Deployment Worker-owned provenance",
      runtimeProvenance.workerVersionId,
    );

    const version = await readResponse(await request("/version.json"));
    assert(version.status === 200, "Deployment version.json did not return 200.");
    assertSecurityHeaders(version.headers, "Deployment version.json");
    assertResponseIdentity(
      version.headers,
      "Deployment version.json",
      runtimeProvenance.workerVersionId,
    );
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
    assertResponseIdentity(
      fallback.headers,
      "Deployment SPA fallback",
      runtimeProvenance.workerVersionId,
    );

    const post = await readResponse(await request("/", { method: "POST" }));
    assert(post.status === 405, "Deployment POST / did not return 405.");
    assert(post.headers.allow === "GET, HEAD", "Deployment Allow header is wrong.");
    assertSecurityHeaders(post.headers, "Deployment POST rejection");
    assertResponseIdentity(
      post.headers,
      "Deployment POST rejection",
      runtimeProvenance.workerVersionId,
    );

    const assets = [];
    for (const pathname of absoluteAssetPaths(root.body)) {
      const response = await readResponse(await request(pathname));
      assert(response.status === 200, `Deployment asset ${pathname} did not return 200.`);
      assertSecurityHeaders(response.headers, `Deployment asset ${pathname}`);
      assertResponseIdentity(
        response.headers,
        `Deployment asset ${pathname}`,
        runtimeProvenance.workerVersionId,
      );
      const contentType = response.headers["content-type"] ?? "";
      assert(
        pathname.endsWith(".css")
          ? contentType.startsWith("text/css")
          : /(?:java|ecma)script/u.test(contentType),
        `Deployment asset ${pathname} returned an invalid content type.`,
      );
      assert(
        response.bodySha256 !== root.bodySha256,
        `Deployment asset ${pathname} resolved to the SPA shell.`,
      );
      assets.push({
        pathname,
        status: response.status,
        bodySha256: response.bodySha256,
        contentType,
      });
    }
    assert(assets.length >= 2, "Deployment shell does not reference hashed JS and CSS.");

    return {
      baseUrl,
      expectedCommit,
      observedCommit: provenance.sourceCommit,
      runtimeProvenance: {
        sourceCommit: runtimeProvenance.sourceCommit,
        sourceDirty: runtimeProvenance.sourceDirty,
        workerVersionId: runtimeProvenance.workerVersionId,
        workerVersionTag: runtimeProvenance.workerVersionTag ?? null,
        workerVersionCreatedAt:
          runtimeProvenance.workerVersionCreatedAt ?? null,
      },
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
      checks: requestChecks,
    };
  } catch (error) {
    error.deploymentObservation ??= rootObservation;
    error.deploymentChecks ??= [...requestChecks];
    throw error;
  }
};

export const inspectProductionDeployment = async ({
  semanticAttempts = PRODUCTION_SEMANTIC_ATTEMPTS,
  semanticRetryDelayMs = 2_000,
  requestAttempts = 5,
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
  assert(
    Number.isInteger(requestAttempts) && requestAttempts > 0,
    "requestAttempts must be a positive integer.",
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
      const evidence = await inspectProductionDeploymentOnce({
        ...inspection,
        requestAttempts,
      });
      return { ...evidence, semanticAttempt: attempt };
    } catch (error) {
      lastError = error;
      error.semanticAttempt = attempt;
      if (inspection.signal?.aborted) {
        error.semanticAttemptsExhausted = attempt;
        throw error;
      }
      if (attempt < semanticAttempts) {
        await waitWithSignal(
          semanticRetryDelayMs,
          inspection.signal,
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
  priorWorkerVersionId,
  previewSmoke,
  ...inspection
}) => {
  validateInspectionInput(inspection);
  validateStabilityInput({
    priorBaseline,
    priorWorkerVersionId,
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
  const attemptSummaries = [];

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
      error.stabilityAttemptSummaries = attemptSummaries;
      throw error;
    }

    try {
      lastEvidence = await inspectProductionDeployment({
        ...inspection,
        signal: AbortSignal.timeout(remainingMs),
        semanticAttempts: 1,
        semanticRetryDelayMs: 0,
        requestAttempts: 1,
      });
      lastObservation = lastEvidence.root.observation;
      attemptSummaries.push({
        attempt,
        outcome: "candidate-pass",
        observation: lastObservation,
        checks: lastEvidence.checks,
      });
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
            attempts: attemptSummaries,
          },
        };
      }
    } catch (error) {
      lastObservation = error.deploymentObservation ?? null;
      if (matchesPriorBaseline(lastObservation, priorBaseline)) {
        priorBaselineObservations += 1;
        consecutivePasses = 0;
        attemptSummaries.push({
          attempt,
          outcome: "prior-baseline",
          observation: lastObservation,
          checks: error.deploymentChecks ?? [],
        });
      } else {
        const checks = error.deploymentChecks ?? [];
        const observedVersions = new Set(
          checks
            .map((check) => check.workerVersionId)
            .filter((versionId) => typeof versionId === "string"),
        );
        const unknownWorkerVersions = [...observedVersions].filter(
          (versionId) =>
            inspection.expectedWorkerVersionId !== undefined &&
            versionId !== inspection.expectedWorkerVersionId &&
            versionId !== priorWorkerVersionId,
        );
        const nullVersionChecks = checks.filter(
          (check) => check.workerVersionId === null,
        );
        const nullLegacyChecksAreCorrelated =
          nullVersionChecks.length === 0 ||
          nullVersionChecks.every(
            (check) =>
              check.sourceCommit === null &&
              (check.pathname === "/__deployment" ||
                check.pathname === "/version.json" ||
                check.pathname?.startsWith("/assets/")),
          );
        const candidateRoot = matchesCandidateSentinel(
          lastObservation,
          previewSmoke,
        );
        const transitionInconsistency =
          candidateRoot &&
          unknownWorkerVersions.length === 0 &&
          nullLegacyChecksAreCorrelated &&
          (checks.some(
            (check) =>
              inspection.expectedWorkerVersionId !== undefined &&
              check.workerVersionId !==
                inspection.expectedWorkerVersionId,
          ) ||
            observedVersions.size > 1 ||
            checks.some(
              (check) =>
                check.status === 404 &&
                (check.pathname === "/__deployment" ||
                  check.pathname === "/version.json" ||
                  check.pathname.startsWith("/assets/")),
            ));
        if (transitionInconsistency) {
          consecutivePasses = 0;
          attemptSummaries.push({
            attempt,
            outcome: "bounded-version-transition",
            observation: lastObservation,
            checks,
          });
        } else {
          error.stabilityAttempt = attempt;
          error.stabilityWindowMs = stabilityTimeoutMs;
          error.stabilityClassification =
            unknownWorkerVersions.length > 0
              ? "unrecognized"
              : candidateRoot
                ? "candidate-contract"
                : "unrecognized";
          error.stabilityObservation = lastObservation;
          error.stabilityAttemptSummaries = attemptSummaries;
          throw error;
        }
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
      consecutivePasses > 0
        ? "candidate-not-stable"
        : attemptSummaries.some(
              (summary) =>
                summary.outcome === "bounded-version-transition",
            )
          ? "version-transition-timeout"
          : "prior-baseline";
    error.stabilityObservation = lastObservation;
    error.stabilityAttemptSummaries = attemptSummaries;
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

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await runCli();
}
