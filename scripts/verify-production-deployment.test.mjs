import assert from "node:assert/strict";
import { createServer } from "node:http";
import test from "node:test";
import { inspectProductionDeployment } from "./verify-production-deployment.mjs";

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

const securityHeaders = {
  "Content-Security-Policy": CSP,
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
};

const createFixtureServer = async ({
  wrongCommit = false,
  staleRootResponses = 0,
} = {}) => {
  let remainingStaleRoots = staleRootResponses;
  const server = createServer((request, response) => {
    if (
      request.method === "GET" &&
      request.url === "/" &&
      remainingStaleRoots > 0
    ) {
      remainingStaleRoots -= 1;
      response.setHeader("Content-Type", "text/html");
      response.end("<!doctype html><title>Abris Universe placeholder</title>");
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
