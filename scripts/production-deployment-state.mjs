export class ProductionDeploymentError extends Error {
  constructor(message, { cause, rollbackCause = null, state }) {
    super(message, { cause });
    this.name = "ProductionDeploymentError";
    this.rollbackCause = rollbackCause;
    this.state = state;
  }
}

const requiredVersionId = (value) => {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("Version upload did not produce a version ID.");
  }
  return value;
};

export const executeProductionDeployment = async ({
  priorVersionId,
  uploadVersion,
  deployPrePromotion,
  smokePrePromotion,
  promote,
  smokeProduction,
  rollback,
  confirmRollbackActive,
  verifyRollbackBaseline,
}) => {
  const state = {
    stage: "upload",
    priorVersionId,
    uploadedVersionId: null,
    prePromotionSmoke: null,
    productionSmoke: null,
    promoted: false,
    failureStage: null,
    rollbackAttempted: false,
    rollbackPerformed: false,
    rollbackFailureStage: null,
    rollbackActive: null,
    rollbackBaseline: null,
  };

  try {
    state.uploadedVersionId = requiredVersionId(await uploadVersion());

    state.stage = "pre-promotion-deploy";
    await deployPrePromotion(state.uploadedVersionId, priorVersionId);

    state.stage = "pre-promotion-smoke";
    state.prePromotionSmoke = await smokePrePromotion(
      state.uploadedVersionId,
    );

    state.stage = "promotion";
    await promote(state.uploadedVersionId);
    state.promoted = true;

    state.stage = "production-smoke";
    state.productionSmoke = await smokeProduction();
    state.stage = "complete";
    return state;
  } catch (cause) {
    state.failureStage = state.stage;
    if (!state.uploadedVersionId) {
      throw new ProductionDeploymentError(
        "Production deployment failed before Cloudflare traffic mutation.",
        { cause, state },
      );
    }

    state.rollbackAttempted = true;
    try {
      state.stage = "rollback";
      await rollback(priorVersionId);
      state.rollbackPerformed = true;

      state.stage = "rollback-active-version";
      state.rollbackActive = await confirmRollbackActive(priorVersionId);

      state.stage = "rollback-baseline";
      state.rollbackBaseline = await verifyRollbackBaseline();
      state.stage = "rolled-back";
    } catch (rollbackCause) {
      state.rollbackFailureStage = state.stage;
      throw new ProductionDeploymentError(
        "Production deployment failed and rollback could not be verified.",
        { cause, rollbackCause, state },
      );
    }

    throw new ProductionDeploymentError(
      "Production deployment failed and the prior version was restored.",
      { cause, state },
    );
  }
};
