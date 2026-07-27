import assert from "node:assert/strict";
import test from "node:test";
import { waitForRegisteredRollbackBaseline } from "./production-rollback-verification.mjs";

const PRIOR = {
  status: 200,
  headStatus: 200,
  bodySha256: "a".repeat(64),
  contentType: "text/html",
};
const CANDIDATE = {
  status: 200,
  headStatus: 200,
  bodySha256: "b".repeat(64),
  contentType: "text/html",
};

test("waits through the exact candidate and accepts the registered prior baseline", async () => {
  const observations = [CANDIDATE, CANDIDATE, PRIOR];
  const sleeps = [];
  const result = await waitForRegisteredRollbackBaseline({
    priorBaseline: PRIOR,
    candidateObservation: CANDIDATE,
    snapshot: async () => observations.shift(),
    retryDelayMs: 5,
    sleep: async (delay) => sleeps.push(delay),
  });

  assert.deepEqual(result, { ...PRIOR, attempt: 3 });
  assert.deepEqual(sleeps, [5, 5]);
});

test("fails immediately for an unregistered rollback observation", async () => {
  await assert.rejects(
    waitForRegisteredRollbackBaseline({
      priorBaseline: PRIOR,
      candidateObservation: CANDIDATE,
      snapshot: async () => ({ ...CANDIDATE, bodySha256: "c".repeat(64) }),
      sleep: async () => {},
    }),
    /neither the registered prior baseline nor the reviewed candidate/u,
  );
});

test("enforces the observation and wall-clock ceilings", async () => {
  await assert.rejects(
    waitForRegisteredRollbackBaseline({
      priorBaseline: PRIOR,
      candidateObservation: CANDIDATE,
      snapshot: async () => CANDIDATE,
      attempts: 2,
      retryDelayMs: 0,
      sleep: async () => {},
    }),
    (error) => {
      assert.equal(error.rollbackAttemptsExhausted, 2);
      assert.deepEqual(error.rollbackObservation, CANDIDATE);
      return true;
    },
  );

  let clock = 0;
  await assert.rejects(
    waitForRegisteredRollbackBaseline({
      priorBaseline: PRIOR,
      candidateObservation: CANDIDATE,
      snapshot: async () => CANDIDATE,
      attempts: 3,
      retryDelayMs: 5,
      timeoutMs: 5,
      now: () => clock,
      sleep: async (delay) => {
        clock += delay;
      },
    }),
    /approved time window/u,
  );
});
