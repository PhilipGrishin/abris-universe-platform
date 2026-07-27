import assert from "node:assert/strict";
import test from "node:test";
import { environmentForWrangler } from "./production-deployment-environment.mjs";

test("does not expose cache-purge authority to Wrangler subprocesses", () => {
  const source = {
    CLOUDFLARE_API_TOKEN: "worker-token",
    CLOUDFLARE_ACCOUNT_ID: "account",
    CLOUDFLARE_CACHE_PURGE_TOKEN: "purge-token",
    CLOUDFLARE_ZONE_ID: "zone",
    CI: "true",
  };
  const result = environmentForWrangler(source);

  assert.deepEqual(result, {
    CLOUDFLARE_API_TOKEN: "worker-token",
    CLOUDFLARE_ACCOUNT_ID: "account",
    CI: "true",
  });
  assert.equal(source.CLOUDFLARE_CACHE_PURGE_TOKEN, "purge-token");
});
