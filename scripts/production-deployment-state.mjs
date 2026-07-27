export class ProductionDeploymentError extends Error {
  constructor(message, { cause, rollbackCause = null, state }) {
    super(message, { cause });
    this.name = "ProductionDeploymentError";
    this.rollbackCause = rollbackCause;
    this.state = state;
  }
}

const requiredCandidate = (value) => {
  if (
    typeof value?.versionId !== "string" ||
    value.versionId.length === 0 ||
    typeof value?.previewUrl !== "string" ||
    !value.previewUrl.startsWith("https://")
  ) {
    throw new Error(
      "Version upload did not produce an immutable preview candidate.",
    );
  }
  return {
    versionId: value.versionId,
    previewUrl: value.previewUrl,
  };
};

export const executeProductionDeployment = async ({
  priorVersionId,
  uploadVersion,
  smokePreview,
  promote,
  purgeProductionCache,
  smokeProduction,
  rollback,
  purgeRollbackCache,
  confirmRollbackActive,
  verifyRollbackBaseline,
}) => {
  const state = {
    stage: "upload",
    priorVersionId,
    candidate: null,
    previewSmoke: null,
    productionMutationAttempted: false,
    productionCachePurge: null,
    productionSmoke: null,
    promoted: false,
    failureStage: null,
    rollbackAttempted: false,
    rollbackPerformed: false,
    rollbackCachePurge: null,
    rollbackFailureStage: null,
    rollbackActive: null,
    rollbackBaseline: null,
  };

  try {
    state.candidate = requiredCandidate(await uploadVersion());

    state.stage = "preview-smoke";
    state.previewSmoke = await smokePreview(state.candidate);

    state.productionMutationAttempted = true;
    state.stage = "promotion";
    await promote(state.candidate.versionId);
    state.promoted = true;

    state.stage = "production-cache-purge";
    state.productionCachePurge = await purgeProductionCache();

    state.stage = "production-smoke";
    state.productionSmoke = await smokeProduction({
      priorVersionId,
      candidate: state.candidate,
      previewSmoke: state.previewSmoke,
    });
    state.stage = "complete";
    return state;
  } catch (cause) {
    state.failureStage = state.stage;
    if (!state.productionMutationAttempted) {
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

      state.stage = "rollback-cache-purge";
      state.rollbackCachePurge = await purgeRollbackCache();

      state.stage = "rollback-active-version";
      state.rollbackActive = await confirmRollbackActive(priorVersionId);

      state.stage = "rollback-baseline";
      state.rollbackBaseline = await verifyRollbackBaseline({
        candidate: state.candidate,
        previewSmoke: state.previewSmoke,
      });
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
