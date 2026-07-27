import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { createServer } from "node:http";
import test from "node:test";
import {
  inspectProductionDeployment,
  inspectProductionTransition,
  PRODUCTION_SEMANTIC_ATTEMPTS,
  PRODUCTION_TRANSITION_ATTEMPTS,
  PRODUCTION_TRANSITION_TIMEOUT_MS,
  ZERO_TRAFFIC_SEMANTIC_ATTEMPTS,
} from "./verify-production-deployment.mjs";

const EXPECTED_COMMIT = "a".repeat(40);
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
const sha256 = (value) =>
  createHash("sha256").update(value).digest("hex");
const PRIOR_BASELINE = {
  status: 200,
  headStatus: 200,
  bodySha256: sha256(PLACEHOLDER),
  contentType: "text/html",
};
const CANDIDATE_SMOKE = {
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

test("keeps generic semantic retry narrow and bounds both propagation windows", () => {
  assert.equal(PRODUCTION_SEMANTIC_ATTEMPTS, 6);
  assert.equal(ZERO_TRAFFIC_SEMANTIC_ATTEMPTS, 61);
  assert.equal(PRODUCTION_TRANSITION_ATTEMPTS, 61);
  assert.equal(PRODUCTION_TRANSITION_TIMEOUT_MS, 120_000);
});

const createFixtureServer = async ({
  wrongCommit = false,
  staleRootResponses = 0,
  staleBody = PLACEHOLDER,
} = {}) => {
  let remainingStaleRoots = staleRootResponses;
  let rootRequests = 0;
  const server = createServer((request, response) => {
    if (request.method === "GET" && request.url === "/") {
      rootRequests += 1;
    }
    if (
      request.method === "GET" &&
      request.url === "/" &&
      remainingStaleRoots > 0
    ) {
      remainingStaleRoots -= 1;
      response.setHeader("Content-Type", "text/html");
      response.end(staleBody);
      return;
    }
    for (const [name, value] of Object.entries(securityHeaders)) {
      response.setHeader(name, value);
    }
    if (request.method === "POST") {
      response.writeHead(405, { Allow: "GET, HEAD" });
      response.end("Method Not Allowed");
      return;
    }
    if (request.url === "/version.json") {
      response.setHeader("Content-Type", "application/json");
      response.end(
        JSON.stringify({
          sourceCommit: wrongCommit ? "b".repeat(40) : EXPECTED_COMMIT,
          sourceDirty: false,
        }),
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
    close: () => new Promise((resolve) => server.close(resolve)),
  };
};

test("accepts the exact production shell, provenance, assets, methods, and headers", async () => {
  const fixture = await createFixtureServer();
  try {
    const result = await inspectProductionDeployment({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
    });
    assert.equal(result.observedCommit, EXPECTED_COMMIT);
    assert.equal(result.methodBoundary.postStatus, 405);
    assert.equal(result.assets.length, 2);
    assert.equal(result.securityHeaders.contentSecurityPolicy, CSP);
    assert.equal(result.semanticAttempt, 1);
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

test("rejects production provenance from a different source commit", async () => {
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

test("retries a semantically stale 200 until the candidate version is visible", async () => {
  const fixture = await createFixtureServer({ staleRootResponses: 1 });
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

test("retains bounded diagnostics when semantic propagation never converges", async () => {
  const fixture = await createFixtureServer({ staleRootResponses: 2 });
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

test("waits only on the exact prior baseline and then verifies the candidate once", async () => {
  const fixture = await createFixtureServer({ staleRootResponses: 2 });
  try {
    const result = await inspectProductionTransition({
      baseUrl: fixture.httpBaseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      candidateSmoke: CANDIDATE_SMOKE,
      transitionAttempts: 4,
      transitionRetryDelayMs: 0,
    });
    assert.equal(result.observedCommit, EXPECTED_COMMIT);
    assert.deepEqual(result.transition, {
      attempt: 3,
      priorBaselineObservations: 2,
      classification: "candidate",
      observation: {
        status: 200,
        headStatus: 200,
        bodySha256: CANDIDATE_SMOKE.root.bodySha256,
        contentType: "text/html",
        contentSecurityPolicy: CSP,
        cfCacheStatus: null,
        server: null,
      },
    });
    assert.equal(fixture.rootRequests(), 4);
  } finally {
    await fixture.close();
  }
});

test("rolls back immediately on an unrecognized transition response", async () => {
  const fixture = await createFixtureServer({
    staleRootResponses: 1,
    staleBody: "<!doctype html><title>Unknown edge response</title>",
  });
  try {
    await assert.rejects(
      inspectProductionTransition({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        candidateSmoke: CANDIDATE_SMOKE,
        transitionAttempts: 4,
        transitionRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.transitionAttempt, 1);
        assert.equal(error.transitionClassification, "unrecognized");
        assert.equal(error.transitionAttemptsExhausted, undefined);
        assert.match(
          error.transitionObservation.bodySha256,
          /^[0-9a-f]{64}$/u,
        );
        assert.equal("body" in error.transitionObservation, false);
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 1);
  } finally {
    await fixture.close();
  }
});

test("fails after the bounded window when every observation is the exact prior baseline", async () => {
  const fixture = await createFixtureServer({ staleRootResponses: 3 });
  try {
    await assert.rejects(
      inspectProductionTransition({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        candidateSmoke: CANDIDATE_SMOKE,
        transitionAttempts: 3,
        transitionRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.transitionAttempt, 3);
        assert.equal(error.transitionAttemptsExhausted, 3);
        assert.equal(error.transitionClassification, "prior-baseline");
        assert.equal(
          error.transitionObservation.bodySha256,
          PRIOR_BASELINE.bodySha256,
        );
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 3);
  } finally {
    await fixture.close();
  }
});

test("enforces the wall-clock transition timeout before the attempt ceiling", async () => {
  const fixture = await createFixtureServer({ staleRootResponses: 10 });
  let elapsedMs = 0;
  try {
    await assert.rejects(
      inspectProductionTransition({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        candidateSmoke: CANDIDATE_SMOKE,
        transitionAttempts: 61,
        transitionRetryDelayMs: 2_000,
        transitionTimeoutMs: 5_000,
        transitionNow: () => elapsedMs,
        transitionSleep: async (delayMs) => {
          elapsedMs += delayMs;
        },
      }),
      (error) => {
        assert.equal(error.transitionAttempt, 3);
        assert.equal(error.transitionAttemptsExhausted, 3);
        assert.equal(error.transitionWindowMs, 5_000);
        assert.equal(error.transitionClassification, "prior-baseline");
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 3);
    assert.equal(elapsedMs, 5_000);
  } finally {
    await fixture.close();
  }
});

test("does not retry a candidate whose complete contract fails", async () => {
  const fixture = await createFixtureServer({ wrongCommit: true });
  try {
    await assert.rejects(
      inspectProductionTransition({
        baseUrl: fixture.httpBaseUrl,
        expectedCommit: EXPECTED_COMMIT,
        allowHttpForTest: true,
        priorBaseline: PRIOR_BASELINE,
        candidateSmoke: CANDIDATE_SMOKE,
        transitionAttempts: 3,
        transitionRetryDelayMs: 0,
      }),
      (error) => {
        assert.equal(error.transitionAttempt, 1);
        assert.equal(error.transitionClassification, "candidate");
        assert.equal(error.semanticAttemptsExhausted, 1);
        return true;
      },
    );
    assert.equal(fixture.rootRequests(), 2);
  } finally {
    await fixture.close();
  }
});

test("treats a transition transport failure as an immediate unrecognized state", async () => {
  const fixture = await createFixtureServer();
  const baseUrl = fixture.httpBaseUrl;
  await fixture.close();
  await assert.rejects(
    inspectProductionTransition({
      baseUrl,
      expectedCommit: EXPECTED_COMMIT,
      allowHttpForTest: true,
      priorBaseline: PRIOR_BASELINE,
      candidateSmoke: CANDIDATE_SMOKE,
      transitionAttempts: 3,
      transitionRetryDelayMs: 0,
    }),
    (error) => {
      assert.equal(error.transitionAttempt, 1);
      assert.equal(error.transitionClassification, "unrecognized");
      assert.equal(error.transitionAttemptsExhausted, undefined);
      return true;
    },
  );
});
