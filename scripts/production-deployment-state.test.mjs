import assert from "node:assert/strict";
import test from "node:test";
import {
  executeProductionDeployment,
  ProductionDeploymentError,
} from "./production-deployment-state.mjs";

const PRIOR = "prior-version";
const NEXT = "next-version";

const lifecycle = (overrides = {}) => {
  const calls = [];
  const operations = {
    priorVersionId: PRIOR,
    uploadVersion: async () => {
      calls.push("upload");
      return NEXT;
    },
    deployPrePromotion: async (next, prior) => {
      calls.push(`deploy:${next}@0:${prior}@100`);
    },
    smokePrePromotion: async (next) => {
      calls.push(`smoke-candidate:${next}`);
      return { observedCommit: "accepted" };
    },
    promote: async (next) => {
      calls.push(`promote:${next}@100`);
    },
    smokeProduction: async () => {
      calls.push("smoke-production");
      return { observedCommit: "accepted" };
    },
    rollback: async (prior) => {
      calls.push(`rollback:${prior}`);
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

test("executes upload, zero-traffic smoke, promotion, and production smoke in order", async () => {
  const fixture = lifecycle();
  const state = await executeProductionDeployment(fixture.operations);

  assert.deepEqual(fixture.calls, [
    "upload",
    `deploy:${NEXT}@0:${PRIOR}@100`,
    `smoke-candidate:${NEXT}`,
    `promote:${NEXT}@100`,
    "smoke-production",
  ]);
  assert.equal(state.stage, "complete");
  assert.equal(state.promoted, true);
  assert.equal(state.rollbackAttempted, false);
});

test("passes the exact candidate smoke into the post-promotion transition", async () => {
  let transitionInput;
  const fixture = lifecycle({
    smokeProduction: async (input) => {
      fixture.calls.push("smoke-production");
      transitionInput = input;
      return { observedCommit: "accepted" };
    },
  });
  await executeProductionDeployment(fixture.operations);

  assert.deepEqual(transitionInput, {
    priorVersionId: PRIOR,
    uploadedVersionId: NEXT,
    prePromotionSmoke: { observedCommit: "accepted" },
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

test("restores and verifies the prior version when candidate smoke fails", async () => {
  const fixture = lifecycle({
    smokePrePromotion: async () => {
      fixture.calls.push("smoke-candidate:failed");
      throw new Error("candidate rejected");
    },
  });

  await assert.rejects(
    executeProductionDeployment(fixture.operations),
    (error) => {
      assert(error instanceof ProductionDeploymentError);
      assert.equal(error.state.failureStage, "pre-promotion-smoke");
      assert.equal(error.state.rollbackPerformed, true);
      assert.deepEqual(error.state.rollbackActive, {
        versionId: PRIOR,
        percentage: 100,
      });
      assert.deepEqual(error.state.rollbackBaseline, {
        bodySha256: "baseline",
      });
      return true;
    },
  );
  assert.deepEqual(fixture.calls.slice(-3), [
    `rollback:${PRIOR}`,
    `confirm-active:${PRIOR}`,
    "verify-baseline",
  ]);
});

test("restores the prior version after a failed post-promotion smoke", async () => {
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
  assert.deepEqual(fixture.calls.slice(-3), [
    `rollback:${PRIOR}`,
    `confirm-active:${PRIOR}`,
    "verify-baseline",
  ]);
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
