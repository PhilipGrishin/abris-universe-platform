import assert from "node:assert/strict";
import test from "node:test";

import worker, {
  getContentSecurityPolicy,
  type Environment,
} from "../worker/index.ts";

const SOURCE_COMMIT = "a".repeat(40);
const WORKER_VERSION_ID = "11111111-1111-4111-8111-111111111111";

const environmentWithAssets = (
  assets: Environment["ASSETS"],
): Environment => ({
  ASSETS: assets,
  CF_VERSION_METADATA: {
    id: WORKER_VERSION_ID,
    tag: "deployment-test",
    timestamp: "2026-07-27T00:00:00.000Z",
  },
  SOURCE_COMMIT,
  SOURCE_DIRTY: "false",
});

test("serves static assets with the reviewed security headers", async () => {
  let requests = 0;
  const environment = environmentWithAssets({
    async fetch(request) {
      requests += 1;
      assert.equal(request.url, "https://example.test/project/one");
      return new Response("<!doctype html><title>Abris Universe</title>", {
        headers: { "Content-Type": "text/html;charset=UTF-8" },
      });
    },
  });

  const response = await worker.fetch(
    new Request("https://example.test/project/one"),
    environment,
  );

  assert.equal(response.status, 200);
  assert.equal(requests, 1);
  assert.equal(
    response.headers.get("Content-Security-Policy"),
    getContentSecurityPolicy(),
  );
  assert.equal(response.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(response.headers.get("Referrer-Policy"), "no-referrer");
  assert.equal(
    response.headers.get("X-Abris-Worker-Version"),
    WORKER_VERSION_ID,
  );
  assert.equal(response.headers.get("X-Abris-Source-Commit"), SOURCE_COMMIT);
  assert.match(await response.text(), /Abris Universe/u);
});

test("rejects state-changing methods before the asset binding", async () => {
  let requests = 0;
  const environment = environmentWithAssets({
    async fetch() {
      requests += 1;
      return new Response("unexpected");
    },
  });

  const response = await worker.fetch(
    new Request("https://example.test/", { method: "POST" }),
    environment,
  );

  assert.equal(response.status, 405);
  assert.equal(response.headers.get("Allow"), "GET, HEAD");
  assert.equal(
    response.headers.get("Content-Security-Policy"),
    getContentSecurityPolicy(),
  );
  assert.equal(
    response.headers.get("X-Abris-Worker-Version"),
    WORKER_VERSION_ID,
  );
  assert.equal(requests, 0);
});

test("serves Worker-owned deployment provenance without using static assets", async () => {
  let requests = 0;
  const environment = environmentWithAssets({
    async fetch() {
      requests += 1;
      return new Response("unexpected");
    },
  });

  const response = await worker.fetch(
    new Request("https://example.test/__deployment"),
    environment,
  );

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "no-store");
  assert.equal(
    response.headers.get("Content-Type"),
    "application/json;charset=UTF-8",
  );
  assert.deepEqual(await response.json(), {
    sourceCommit: SOURCE_COMMIT,
    sourceDirty: false,
    workerVersionId: WORKER_VERSION_ID,
    workerVersionTag: "deployment-test",
    workerVersionCreatedAt: "2026-07-27T00:00:00.000Z",
  });
  assert.equal(requests, 0);
});

test("serves deployment provenance HEAD without a body", async () => {
  const environment = environmentWithAssets({
    async fetch() {
      return new Response("unexpected");
    },
  });

  const response = await worker.fetch(
    new Request("https://example.test/__deployment", { method: "HEAD" }),
    environment,
  );

  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  assert.equal(
    response.headers.get("X-Abris-Worker-Version"),
    WORKER_VERSION_ID,
  );
});
