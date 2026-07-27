const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const matches = (observation, expected) =>
  observation?.status === expected?.status &&
  observation?.headStatus === expected?.headStatus &&
  observation?.bodySha256 === expected?.bodySha256 &&
  observation?.contentType === expected?.contentType;

export const waitForRegisteredRollbackBaseline = async ({
  priorBaseline,
  candidateObservation,
  snapshot,
  attempts = 25,
  retryDelayMs = 5_000,
  timeoutMs = 120_000,
  now = Date.now,
  sleep = (delayMs) =>
    new Promise((resolve) => setTimeout(resolve, delayMs)),
}) => {
  assert(typeof snapshot === "function", "snapshot must be a function.");
  assert(
    typeof now === "function" && typeof sleep === "function",
    "Rollback clock dependencies must be functions.",
  );
  assert(
    Number.isInteger(attempts) && attempts > 0,
    "attempts must be a positive integer.",
  );
  assert(
    Number.isInteger(retryDelayMs) && retryDelayMs >= 0,
    "retryDelayMs must be a non-negative integer.",
  );
  assert(
    Number.isInteger(timeoutMs) && timeoutMs > 0,
    "timeoutMs must be a positive integer.",
  );

  const startedAt = now();
  let lastObservation = null;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    assert(
      now() - startedAt < timeoutMs,
      "Rollback did not restore the registered prior baseline within the approved time window.",
    );
    lastObservation = await snapshot();
    if (matches(lastObservation, priorBaseline)) {
      return { ...lastObservation, attempt };
    }
    assert(
      matches(lastObservation, candidateObservation),
      "Rollback produced neither the registered prior baseline nor the reviewed candidate.",
    );
    if (attempt < attempts) {
      const remainingMs = timeoutMs - (now() - startedAt);
      assert(
        remainingMs > 0,
        "Rollback did not restore the registered prior baseline within the approved time window.",
      );
      await sleep(Math.min(retryDelayMs, remainingMs));
    }
  }

  const error = new Error(
    "Rollback did not restore the registered prior baseline within the approved observation ceiling.",
  );
  error.rollbackAttemptsExhausted = attempts;
  error.rollbackObservation = lastObservation;
  throw error;
};
