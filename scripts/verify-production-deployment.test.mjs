import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import test from "node:test";
import {
  inspectProductionDeployment,
  inspectProductionStability,
  PREVIEW_SEMANTIC_ATTEMPTS,
  PREVIEW_SEMANTIC_TIMEOUT_MS,
  PRODUCTION_SEMANTIC_ATTEMPTS,
  PRODUCTION_STABILITY_ATTEMPTS,
  PRODUCTION_STABILITY_REQUIRED_PASSES,
  PRODUCTION_STABILITY_RETRY_DELAY_MS,
  PRODUCTION_STABILITY_TIMEOUT_MS,
} from "./verify-production-deployment.mjs";

const EXPECTED_COMMIT = "a".repeat(40);
const WORKER_VERSION_ID = "11111111-1111-4111-8111-111111111111";
const CSP = [
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
const SHELL =
  '<!doctype html><title>Abris Universe</title><script src="/assets/app-12345678.js"></script><link rel="stylesheet" href="/assets/app-12345678.css">';
const PLACEHOLDER =
  "<!doctype html><title>Abris Universe placeholder</title>";
const UNKNOWN =
  "<!doctype html><title>Unknown edge response</title>";
const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
const PRIOR_BASELINE = {
  status: 200,
  headStatus: 200,
  bodySha256: sha256(PLACEHOLDER),
  contentType: "text/html",
};
const PREVIEW_SMOKE = {
  observedCommit: EXPECTED_COMMIT,
  root: {
    status: 200,
    bodySha256: sha256(SHELL),
  },
};

const securityHeaders = {
  "Content-Security-Policy": CSP,
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

test("bounds preview propagation and production stability quorum", () => {
  assert.equal(PRODUCTION_SEMANTIC_ATTEMPTS, 6);
  assert.equal(PREVIEW_SEMANTIC_ATTEMPTS, 61);
  assert.equal(PREVIEW_SEMANTIC_TIMEOUT_MS, 120_000);
  assert.equal(PRODUCTION_STABILITY_ATTEMPTS, 25);
  assert.equal(PRODUCTION_STABILITY_REQUIRED_PASSES, 3);
  assert.equal(PRODUCTION_STABILITY_RETRY_DELAY_MS, 5_000);
  assert.equal(PRODUCTION_STABILITY_TIMEOUT_MS, 120_000);
});

test("stops preview semantic retry when its total signal is aborted", async () => {
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(
    inspectProductionDeployment({
      baseUrl: "https://preview.example.workers.dev",
      expectedCommit: EXPECTED_COMMIT,
      semanticAttempts: PREVIEW_SEMANTIC_ATTEMPTS,
      semanticRetryDelayMs: 0,
      signal: controller.signal,
    }),
    /inspection was aborted/u,
  );
});

const createFixtureServer = async ({
  wrongCommit = false,
  rootSequence = [],
  rootStatus = null,
  holdRoot = false,
  versionStatus = 200,
  versionStatusSequence = [],
  runtimeStatus = 200,
} = {}) => {
  const remainingRootResponses = [...rootSequence];
  const remainingVersionStatuses = [...versionStatusSequence];
  let rootRequests = 0;
  let notifyFirstRootRequest;
  const firstRootRequest = new Promise((resolve) => {
    notifyFirstRootRequest = resolve;
  });
  const server = createServer((request, response) => {
    if (request.method === "GET" && request.url === "/") {
      rootRequests += 1;
      notifyFirstRootRequest();
      if (holdRoot) return;
      if (rootStatus !== null) {
        response.writeHead(rootStatus);
        response.end("unavailable");
        return;
      }
      const body = remainingRootResponses.shift();
      if (body) {
        if (body === SHELL) {
          for (const [name, value] of Object.entries(securityHeaders)) {
            response.setHeader(name, value);
          }
          response.setHeader("X-Abris-Worker-Version", WORKER_VERSION_ID);
          response.setHeader("X-Abris-Source-Commit", EXPECTED_COMMIT);
        }
        response.setHeader("Content-Type", "text/html");
        response.end(body);
        return;
      }
    }
    for (const [name, value] of Object.entries(securityHeaders)) {
      response.setHeader(name, value);
    }
    response.setHeader("X-Abris-Worker-Version", WORKER_VERSION_ID);
    response.setHeader("X-Abris-Source-Commit", EXPECTED_COMMIT);
    if (request.method === "POST") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }
    if (request.url === "/__deployment") {
      response.statusCode = runtimeStatus;
      response.setHeader("Content-Type", "application/json");
      response.end(
        runtimeStatus === 200
          ? JSON.stringify({
              sourceCommit: wrongCommit
                ? "b".repeat(40)
                : EXPECTED_COMMIT,
              sourceDirty: false,
              workerVersionId: WORKER_VERSION_ID,
              workerVersionTag: "test",
              workerVersionCreatedAt: "2026-07-27T00:00:00.000Z",
            })
          : "missing",
      );
      return;
    }
    if (request.url === "/version.json") {
      const observedVersionStatus =
        remainingVersionStatuses.shift() ?? versionStatus;
      response.statusCode = observedVersionStatus;
      response.setHeader("Content-Type", "application/json");
      response.end(
        observedVersionStatus === 200
          ? JSON.stringify({
              sourceCommit: wrongCommit
                ? "b".repeat(40)
                : EXPECTED_COMMIT,
              sourceDirty: false,
            })
          : "missing",
      );
      return;
    }
    if (request.url?.startsWith("/assets/")) {
      response.setHeader(
        "Content-Type",
        request.url.endsWith(".css")
          ? "text/css"
          : "application/javascript",
      );
      response.end("asset");
      return;
    }
    response.setHeader("Content-Type", "text/html");
    response.end(request.method === "HEAD" ? undefined : SHELL);
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  assert(address && typeof address !== "string");
  return {
    httpBaseUrl: `http://127.0.0.1:${address.port}`,
    rootRequests: () => rootRequests,
    waitForFirstRootRequest: () => firstRootRequest,
    close: () =>
      new Promise((resolve) => {
        server.closeAllConnections?.();
        server.close(resolve);
      }),
  };
};

test("aborts during a non-OK retry backoff without exceeding the deadline", async () => {
  const fixture = await createFixtureServer({ rootStatus: 503 });
  const controller = new AbortController();
  const startedAt = Date.now();
  try {
    const inspection = inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        semanticAttempts: 1,
        requestAttempts: 5,
        signal: controller.signal,
      });
    await fixture.waitForFirstRootRequest();
    controller.abort(new Error("preview deadline"));
    await assert.rejects(
      inspection,
      /preview deadline/u,
    );
    assert(Date.now() - startedAt < 500);
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("aborts during a semantic retry backoff without exceeding the deadline", async () => {
  const fixture = await createFixtureServer({ wrongCommit: true });
  const controller = new AbortController();
  const startedAt = Date.now();
  try {
    const inspection = inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        semanticAttempts: 5,
        semanticRetryDelayMs: 1_000,
        requestAttempts: 1,
        signal: controller.signal,
      });
    await fixture.waitForFirstRootRequest();
    controller.abort(new Error("semantic deadline"));
    await assert.rejects(
      inspection,
      /semantic deadline/u,
    );
    assert(Date.now() - startedAt < 500);
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("aborts a hung request without retrying past the deadline", async () => {
  const fixture = await createFixtureServer({ holdRoot: true });
  const controller = new AbortController();
  const startedAt = Date.now();
  try {
    const inspection = inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        semanticAttempts: 1,
        requestAttempts: 5,
        signal: controller.signal,
      });
    await fixture.waitForFirstRootRequest();
    controller.abort(new Error("request deadline"));
    await assert.rejects(
      inspection,
      /request deadline/u,
    );
    assert(Date.now() - startedAt < 500);
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("accepts the exact shell, provenance, assets, methods, and headers", async () => {
  const fixture = await createFixtureServer();
  try {
    const result = await inspectProductionDeployment({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      expectedWorkerVersionId: WORKER_VERSION_ID,
      allowHttpForTest: true,
    });
    assert.equal(result.observedCommit, EXPECTED_COMMIT);
    assert.equal(result.methodBoundary.postStatus, 405);
    assert.equal(result.assets.length, 2);
    assert.equal(result.securityHeaders.contentSecurityPolicy, CSP);
    assert.equal(result.semanticAttempt, 1);
    assert.equal(result.root.observation.headStatus, 200);
    assert.equal(
      result.runtimeProvenance.workerVersionId,
      WORKER_VERSION_ID,
    );
    assert.equal(result.checks.at(-1).status, 200);
  } finally {
    await fixture.close();
  }
});

test("rejects a non-HTTPS production origin before making a request", async () => {
  const fixture = await createFixtureServer();
  try {
    await assert.rejects(
      inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
      }),
      /HTTPS origin/u,
    );
  } finally {
    await fixture.close();
  }
});

test("rejects provenance from a different source commit", async () => {
  const fixture = await createFixtureServer({ wrongCommit: true });
  try {
    await assert.rejects(
      inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        semanticAttempts: 1,
      }),
      /does not match/u,
    );
  } finally {
    await fixture.close();
  }
});

test("retries a semantically stale 200 while immutable preview propagates", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [PLACEHOLDER],
  });
  try {
    const result = await inspectProductionDeployment({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      semanticAttempts: 3,
      semanticRetryDelayMs: 0,
    });
    assert.equal(result.observedCommit, EXPECTED_COMMIT);
    assert.equal(result.semanticAttempt, 2);
  } finally {
    await fixture.close();
  }
});

test("retains bounded diagnostics when preview propagation never converges", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [PLACEHOLDER, PLACEHOLDER],
  });
  try {
    await assert.rejects(
      inspectProductionDeployment({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        semanticAttempts: 2,
        semanticRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.semanticAttempt, 2);
        assert.equal(error.semanticAttemptsExhausted, 2);
        assert.equal(error.deploymentObservation.status, 200);
        assert.equal(error.deploymentObservation.headStatus, 200);
        assert.equal(
          error.deploymentObservation.contentSecurityPolicy,
          null,
        );
        assert.match(
          error.deploymentObservation.bodySha256,
          /^[0-9a-f]{64}$/u,
        );
        assert.equal("body" in error.deploymentObservation, false);
        return true;
      },
    );
  } finally {
    await fixture.close();
  }
});

test("requires three consecutive full contracts after prior baseline observations", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [PLACEHOLDER, PLACEHOLDER],
  });
  try {
    const result = await inspectProductionStability({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      previewSmoke: PREVIEW_SMOKE,
      stabilityAttempts: 6,
      requiredConsecutivePasses: 3,
      stabilityRetryDelayMs: 0,
    });
    assert.equal(result.observedCommit, EXPECTED_COMMIT);
    assert.equal(result.stability.attempt, 5);
    assert.equal(result.stability.requiredConsecutivePasses, 3);
    assert.equal(result.stability.consecutivePasses, 3);
    assert.equal(result.stability.priorBaselineObservations, 2);
    assert.equal(result.stability.windowMs, 120_000);
    assert.deepEqual(result.stability.observation, result.root.observation);
    assert.equal(result.stability.attempts.length, 5);
    assert.equal(fixture.rootRequests(), 5);
  } finally {
    await fixture.close();
  }
});

test("resets the stability quorum when the exact prior baseline reappears", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [undefined, PLACEHOLDER],
  });
  try {
    const result = await inspectProductionStability({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      previewSmoke: PREVIEW_SMOKE,
      stabilityAttempts: 6,
      requiredConsecutivePasses: 3,
      stabilityRetryDelayMs: 0,
    });
    assert.equal(result.stability.attempt, 5);
    assert.equal(result.stability.priorBaselineObservations, 1);
    assert.equal(fixture.rootRequests(), 5);
  } finally {
    await fixture.close();
  }
});

test("fails immediately on an unrecognized root response", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [UNKNOWN],
  });
  try {
    await assert.rejects(
      inspectProductionStability({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        previewSmoke: PREVIEW_SMOKE,
        stabilityAttempts: 4,
        requiredConsecutivePasses: 3,
        stabilityRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.stabilityAttempt, 1);
        assert.equal(error.stabilityClassification, "unrecognized");
        assert.match(
          error.stabilityObservation.bodySha256,
          /^[0-9a-f]{64}$/u,
        );
        assert.equal("body" in error.stabilityObservation, false);
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("fails immediately when a candidate full contract is internally inconsistent", async () => {
  const fixture = await createFixtureServer({ wrongCommit: true });
  try {
    await assert.rejects(
      inspectProductionStability({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        previewSmoke: PREVIEW_SMOKE,
        stabilityAttempts: 4,
        requiredConsecutivePasses: 3,
        stabilityRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.stabilityAttempt, 1);
        assert.equal(error.stabilityClassification, "candidate-contract");
        assert.equal(error.semanticAttemptsExhausted, 1);
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("retries a bounded candidate transition when a proven static asset briefly returns 404", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [SHELL],
    versionStatusSequence: [404],
  });
  try {
    const result = await inspectProductionStability({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      expectedWorkerVersionId: WORKER_VERSION_ID,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      previewSmoke: PREVIEW_SMOKE,
      stabilityAttempts: 4,
      requiredConsecutivePasses: 3,
      stabilityRetryDelayMs: 0,
    });
    assert.equal(result.stability.attempt, 4);
    assert.equal(
      result.stability.attempts[0].outcome,
      "bounded-version-transition",
    );
    assert.deepEqual(
      result.stability.attempts.slice(1).map((attempt) => attempt.outcome),
      ["candidate-pass", "candidate-pass", "candidate-pass"],
    );
    assert.equal(
      result.stability.attempts[0].checks.at(-1).checkId,
      "GET /version.json",
    );
    assert.equal(result.stability.attempts[0].checks.at(-1).status, 404);
  } finally {
    await fixture.close();
  }
});

test("fails when the attempt ceiling cannot satisfy the consecutive quorum", async () => {
  const fixture = await createFixtureServer({
    rootSequence: [undefined, PLACEHOLDER],
  });
  try {
    await assert.rejects(
      inspectProductionStability({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        previewSmoke: PREVIEW_SMOKE,
        stabilityAttempts: 3,
        requiredConsecutivePasses: 3,
        stabilityRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.stabilityAttempt, 3);
        assert.equal(error.stabilityAttemptsExhausted, 3);
        assert.equal(error.stabilityClassification, "candidate-not-stable");
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 3);
  } finally {
    await fixture.close();
  }
});

test("enforces the wall-clock stability timeout before the attempt ceiling", async () => {
  const fixture = await createFixtureServer({
    rootSequence: Array(10).fill(PLACEHOLDER),
  });
  let elapsedMs = 0;
  try {
    await assert.rejects(
      inspectProductionStability({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        previewSmoke: PREVIEW_SMOKE,
        stabilityAttempts: 25,
        requiredConsecutivePasses: 3,
        stabilityRetryDelayMs: 2_000,
        stabilityTimeoutMs: 5_000,
        stabilityNow: () => elapsedMs,
        stabilitySleep: async (delayMs) => {
          elapsedMs += delayMs;
        },
      }),
      (error) => {
        assert.equal(error.stabilityAttempt, 3);
        assert.equal(error.stabilityAttemptsExhausted, 3);
        assert.equal(error.stabilityWindowMs, 5_000);
        assert.equal(error.stabilityClassification, "timeout");
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 3);
    assert.equal(elapsedMs, 5_000);
  } finally {
    await fixture.close();
  }
});

test("treats a transport failure as an immediate unrecognized state", async () => {
  const fixture = await createFixtureServer();
  const baseUrl = fixture.httpBaseUrl;
  await fixture.close();
  const startedAt = Date.now();
  await assert.rejects(
    inspectProductionStability({
      baseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      previewSmoke: PREVIEW_SMOKE,
      stabilityAttempts: 3,
      requiredConsecutivePasses: 3,
      stabilityRetryDelayMs: 0,
    }),
    (error) => {
      assert.equal(error.stabilityAttempt, 1);
      assert.equal(error.stabilityClassification, "unrecognized");
      assert.equal(error.stabilityAttemptsExhausted, undefined);
      return true;
    },
  );
  assert(Date.now() - startedAt < 500);
});
