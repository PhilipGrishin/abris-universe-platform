import assert from "node:assert/strict";
import test from "node:test";

import worker, {
  getContentSecurityPolicy,
  type Environment,
} from "../worker/index.ts";

test("serves static assets with the reviewed security headers", async () => {
  let requests = 0;
  const environment: Environment = {
    ASSETS: {
      async fetch(request) {
        requests += 1;
        assert.equal(request.url, "https://example.test/project/one");
        return new Response("<!doctype html><title>Abris Universe</title>", {
          headers: { "Content-Type": "text/html;charset=UTF-8" },
        });
      },
    },
  };

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
  assert.match(await response.text(), /Abris Universe/u);
});

test("rejects state-changing methods before the asset binding", async () => {
  let requests = 0;
  const environment: Environment = {
    ASSETS: {
      async fetch() {
        requests += 1;
        return new Response("unexpected");
      },
    },
  };

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
  assert.equal(requests, 0);
});
