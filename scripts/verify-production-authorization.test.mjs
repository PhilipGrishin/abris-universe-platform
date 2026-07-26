import assert from "node:assert/strict";
import test from "node:test";
import { verifyProductionAuthorization } from "./verify-production-authorization.mjs";

const SHA = "a".repeat(40);

test("accepts the exact main-branch source commit", () => {
  assert.deepEqual(
    verifyProductionAuthorization({
      ref: "refs/heads/main",
      sourceCommit: SHA,
      expectedCommit: SHA,
    }),
    { ref: "refs/heads/main", sourceCommit: SHA },
  );
});

test("fails explicitly for a non-main workflow dispatch", () => {
  assert.throws(
    () =>
      verifyProductionAuthorization({
        ref: "refs/heads/codex/test",
        sourceCommit: SHA,
        expectedCommit: SHA,
      }),
    /requires main/u,
  );
});

test("fails explicitly when the authorized commit differs from the source", () => {
  assert.throws(
    () =>
      verifyProductionAuthorization({
        ref: "refs/heads/main",
        sourceCommit: SHA,
        expectedCommit: "b".repeat(40),
      }),
    /must equal/u,
  );
});
