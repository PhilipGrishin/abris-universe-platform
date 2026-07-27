import assert from "node:assert/strict";
import test from "node:test";
import {
  executeProductionDeployment,
  ProductionDeploymentError,
} from "./production-deployment-state.mjs";

const PRIOR = "prior-version";
const NEXT = "next-version";
const CANDIDATE = {
  versionId: NEXT,
  previewUrl: "https://next-version-abris.workers.dev",
};
const PREVIEW_SMOKE = {
  baseUrl: CANDIDATE.previewUrl,
  observedCommit: "accepted",
};

const lifecycle = (overrides = {}) => {
  const calls = [];
  const operations = {
    priorVersionId: PRIOR,
    uploadVersion: async () => {
      calls.push("upload");
      return CANDIDATE;
    },
    smokePreview: async (candidate) => {
      calls.push(`smoke-preview:${candidate.versionId}`);
      return PREVIEW_SMOKE;
    },
    promote: async (next) => {
      calls.push(`promote:${next}@100`);
    },
    purgeProductionCache: async () => {
      calls.push("purge-production-cache");
      return { success: true };
    },
    smokeProduction: async () => {
      calls.push("smoke-production");
      return { observedCommit: "accepted" };
    },
    rollback: async (prior) => {
      calls.push(`rollback:${prior}`);
    },
    purgeRollbackCache: async () => {
      calls.push("purge-rollback-cache");
      return { success: true };
    },
    confirmRollbackActive: async (prior) => {
      calls.push(`confirm-active:${prior}`);
      return { versionId: prior, percentage: 100 };
    },
    verifyRollbackBaseline: async () => {
      calls.push("verify-baseline");
      return { bodySha256: "baseline" };
    },
    ...overrides,
  };
  return { calls, operations };
};

test("executes immutable preview, exact promotion, purge, and stability smoke in order", async () => {
  const fixture = lifecycle();
  const state = await executeProductionDeployment(fixture.operations);

  assert.deepEqual(fixture.calls, [
    "upload",
    `smoke-preview:${NEXT}`,
    `promote:${NEXT}@100`,
    "purge-production-cache",
    "smoke-production",
  ]);
  assert.equal(state.stage, "complete");
  assert.equal(state.promoted, true);
  assert.equal(state.rollbackAttempted, false);
  assert.deepEqual(state.candidate, { versionId: NEXT });
  assert.equal(JSON.stringify(state).includes(CANDIDATE.previewUrl), false);
});

test("passes the exact preview evidence into production stability verification", async () => {
  let stabilityInput;
  const fixture = lifecycle({
    smokeProduction: async (input) => {
      fixture.calls.push("smoke-production");
      stabilityInput = input;
      return { observedCommit: "accepted" };
    },
  });
  await executeProductionDeployment(fixture.operations);

  assert.deepEqual(stabilityInput, {
    priorVersionId: PRIOR,
    candidate: { versionId: NEXT },
    previewSmoke: { observedCommit: "accepted" },
  });
});

test("does not roll back when immutable upload fails before traffic mutation", async () => {
  const fixture = lifecycle({
    uploadVersion: async () => {
      fixture.calls.push("upload");
      throw new Error("upload rejected");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "upload");
      assert.equal(error.state.rollbackAttempted, false);
      return true;
    },
  );
  assert.deepEqual(fixture.calls, ["upload"]);
});

test("does not roll back when immutable preview smoke fails before promotion", async () => {
  const fixture = lifecycle({
    smokePreview: async () => {
      fixture.calls.push("smoke-preview:failed");
      throw new Error("candidate rejected");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "preview-smoke");
      assert.equal(error.state.rollbackAttempted, false);
      assert.equal(error.state.productionMutationAttempted, false);
      assert.equal(JSON.stringify(error.state).includes(CANDIDATE.previewUrl), false);
      return true;
    },
  );
  assert.deepEqual(fixture.calls, ["upload", "smoke-preview:failed"]);
});

test("rolls back when exact-version promotion may have partially mutated traffic", async () => {
  const fixture = lifecycle({
    promote: async () => {
      fixture.calls.push("promote:failed");
      throw new Error("promotion failed");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "promotion");
      assert.equal(error.state.productionMutationAttempted, true);
      assert.equal(error.state.rollbackPerformed, true);
      return true;
    },
  );
  assert.deepEqual(fixture.calls.slice(-4), [
    `rollback:${PRIOR}`,
    "purge-rollback-cache",
    `confirm-active:${PRIOR}`,
    "verify-baseline",
  ]);
});

test("restores and purges the prior version after production cache purge fails", async () => {
  const fixture = lifecycle({
    purgeProductionCache: async () => {
      fixture.calls.push("purge-production-cache:failed");
      throw new Error("cache purge rejected");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "production-cache-purge");
      assert.equal(error.state.promoted, true);
      assert.equal(error.state.rollbackPerformed, true);
      return true;
    },
  );
  assert.deepEqual(fixture.calls.slice(-4), [
    `rollback:${PRIOR}`,
    "purge-rollback-cache",
    `confirm-active:${PRIOR}`,
    "verify-baseline",
  ]);
});

test("restores and purges the prior version after failed production stability smoke", async () => {
  const fixture = lifecycle({
    smokeProduction: async () => {
      fixture.calls.push("smoke-production:failed");
      throw new Error("production rejected");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "production-smoke");
      assert.equal(error.state.promoted, true);
      assert.equal(error.state.stage, "rolled-back");
      return true;
    },
  );
  assert.deepEqual(fixture.calls.slice(-4), [
    `rollback:${PRIOR}`,
    "purge-rollback-cache",
    `confirm-active:${PRIOR}`,
    "verify-baseline",
  ]);
});

test("preserves the original stage when rollback cache purge fails", async () => {
  const fixture = lifecycle({
    smokeProduction: async () => {
      fixture.calls.push("smoke-production:failed");
      throw new Error("production rejected");
    },
    purgeRollbackCache: async () => {
      fixture.calls.push("purge-rollback-cache:failed");
      throw new Error("rollback purge failed");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "production-smoke");
      assert.equal(error.state.rollbackFailureStage, "rollback-cache-purge");
      assert.equal(error.state.rollbackPerformed, true);
      assert.equal(error.cause.message, "production rejected");
      assert.equal(error.rollbackCause.message, "rollback purge failed");
      return true;
    },
  );
});

test("preserves the original stage and reports rollback verification failure", async () => {
  const fixture = lifecycle({
    smokeProduction: async () => {
      fixture.calls.push("smoke-production:failed");
      throw new Error("production rejected");
    },
    confirmRollbackActive: async () => {
      fixture.calls.push("confirm-active:failed");
      throw new Error("prior version is not active");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "production-smoke");
      assert.equal(error.state.rollbackFailureStage, "rollback-active-version");
      assert.equal(error.state.rollbackPerformed, true);
      assert.equal(error.cause.message, "production rejected");
      assert.equal(error.rollbackCause.message, "prior version is not active");
      return true;
    },
  );
});
