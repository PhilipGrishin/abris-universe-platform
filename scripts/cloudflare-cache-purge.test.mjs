import assert from "node:assert/strict";
import test from "node:test";
import {
  CACHE_PURGE_TIMEOUT_MS,
  purgeCloudflareHostnameCache,
} from "./cloudflare-cache-purge.mjs";

const ZONE_ID = "a".repeat(32);
const TOKEN = "secret-token";
const HOSTNAME = "abris.653915.com";

test("purges only the registered hostname and returns sanitized evidence", async () => {
  let observed;
  const result = await purgeCloudflareHostnameCache({
    zoneId: ZONE_ID,
    token: TOKEN,
    hostname: HOSTNAME,
    request: async (url, init) => {
      observed = { url, init };
      return new Response(JSON.stringify({ success: true, result: { id: "x" } }), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    },
  });

  assert.equal(
    observed.url,
    `https://api.cloudflare.com/client/v4/zones/${ZONE_ID}/purge_cache`,
  );
  assert.equal(observed.init.method, "POST");
  assert.equal(observed.init.signal instanceof AbortSignal, true);
  assert.equal(observed.init.headers.Authorization, `Bearer ${TOKEN}`);
  assert.deepEqual(JSON.parse(observed.init.body), { hosts: [HOSTNAME] });
  assert.deepEqual(result, {
    hostname: HOSTNAME,
    scope: "hostname",
    status: 200,
    success: true,
  });
  assert.equal(JSON.stringify(result).includes(TOKEN), false);
  assert.equal(JSON.stringify(result).includes(ZONE_ID), false);
});

test("bounds a hung cache purge so deployment rollback can continue", async () => {
  assert.equal(CACHE_PURGE_TIMEOUT_MS, 10_000);
  const startedAt = Date.now();
  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: ZONE_ID,
      token: TOKEN,
      hostname: HOSTNAME,
      timeoutMs: 10,
      request: async (_url, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener(
            "abort",
            () => reject(init.signal.reason),
            { once: true },
          );
        }),
    }),
    /cache purge timed out/u,
  );
  assert(Date.now() - startedAt < 500);
});

test("rejects invalid configuration before sending a request", async () => {
  const request = async () => {
    throw new Error("must not be called");
  };

  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: "invalid",
      token: TOKEN,
      hostname: HOSTNAME,
      request,
    }),
    /CLOUDFLARE_ZONE_ID/u,
  );
  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: ZONE_ID,
      token: "",
      hostname: HOSTNAME,
      request,
    }),
    /CACHE_PURGE_TOKEN/u,
  );
  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: ZONE_ID,
      token: TOKEN,
      hostname: "https://abris.653915.com/",
      request,
    }),
    /hostname is invalid/u,
  );
});

test("fails closed on an unsuccessful or malformed Cloudflare response", async () => {
  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: ZONE_ID,
      token: TOKEN,
      hostname: HOSTNAME,
      request: async () =>
        new Response(JSON.stringify({ success: false }), { status: 403 }),
    }),
    /was rejected/u,
  );
  await assert.rejects(
    purgeCloudflareHostnameCache({
      zoneId: ZONE_ID,
      token: TOKEN,
      hostname: HOSTNAME,
      request: async () => new Response("not-json", { status: 200 }),
    }),
    /valid JSON/u,
  );
});
