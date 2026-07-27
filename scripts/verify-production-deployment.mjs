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

const inspectProductionDeploymentOnce = async ({
  baseUrl,
  expectedCommit,
  versionId,
}) => {
  const requestHeaders = versionId
    ? {
        "Cloudflare-Workers-Version-Overrides":
          `abris-universe="${versionId}"`,
      }
    : {};
  const request = (pathname, init = {}) =>
    fetchWithRetry(`${baseUrl}${pathname}`, {
      cache: "no-store",
      redirect: "error",
      ...init,
      headers: {
        ...requestHeaders,
        ...init.headers,
      },
    });

  const root = await readResponse(await request("/"));
  assert(root.status === 200, "Production root did not return 200.");
  assert(
    root.body.includes("Abris Universe"),
    "Production root does not contain the application shell.",
  );
  assertSecurityHeaders(root.headers, "Production root");

  const version = await readResponse(await request("/version.json"));
  assert(version.status === 200, "Production version.json did not return 200.");
  assertSecurityHeaders(version.headers, "Production version.json");
  const provenance = JSON.parse(version.body);
  assert(
    provenance.sourceCommit === expectedCommit,
    `Production source commit ${provenance.sourceCommit} does not match ${expectedCommit}.`,
  );
  assert(provenance.sourceDirty === false, "Production provenance is dirty.");

  const fallback = await readResponse(
    await request("/deployment-smoke/non-root-route"),
  );
  assert(fallback.status === 200, "Production SPA fallback did not return 200.");
  assert(
    fallback.bodySha256 === root.bodySha256,
    "Production SPA fallback does not match the application shell.",
  );
  assertSecurityHeaders(fallback.headers, "Production SPA fallback");

  const head = await request("/", { method: "HEAD" });
  assert(head.status === 200, "Production HEAD / did not return 200.");
  assertSecurityHeaders(
    Object.fromEntries(head.headers.entries()),
    "Production HEAD",
  );

  const post = await readResponse(await request("/", { method: "POST" }));
  assert(post.status === 405, "Production POST / did not return 405.");
  assert(post.headers.allow === "GET, HEAD", "Production Allow header is wrong.");
  assertSecurityHeaders(post.headers, "Production POST rejection");

  const assets = [];
  for (const pathname of absoluteAssetPaths(root.body)) {
    const response = await readResponse(await request(pathname));
    assert(response.status === 200, `Production asset ${pathname} did not return 200.`);
    assertSecurityHeaders(response.headers, `Production asset ${pathname}`);
    assets.push({
      pathname,
      status: response.status,
      bodySha256: response.bodySha256,
      contentType: response.headers["content-type"] ?? null,
    });
  }
  assert(assets.length >= 2, "Production shell does not reference hashed JS and CSS.");

  return {
    baseUrl,
    versionOverride: versionId ?? null,
    expectedCommit,
    observedCommit: provenance.sourceCommit,
    root: {
      status: root.status,
      bodySha256: root.bodySha256,
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
};

export const inspectProductionDeployment = async ({
  semanticAttempts = 6,
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
    try {
      const evidence = await inspectProductionDeploymentOnce(inspection);
      return { ...evidence, semanticAttempt: attempt };
    } catch (error) {
      lastError = error;
      if (attempt < semanticAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, semanticRetryDelayMs),
        );
      }
    }
  }
  throw lastError;
};

const runCli = async () => {
  const baseUrl = process.env.PRODUCTION_URL ?? "https://abris.653915.com";
  const expectedCommit = process.env.EXPECTED_SOURCE_COMMIT;
  const versionId = process.env.CLOUDFLARE_VERSION_ID;
  if (!expectedCommit) {
    throw new Error("EXPECTED_SOURCE_COMMIT is required.");
  }
  const evidence = await inspectProductionDeployment({
    baseUrl,
    expectedCommit,
    versionId,
  });
  process.stdout.write(`${JSON.stringify(evidence, null, 2)}\n`);
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runCli();
}
