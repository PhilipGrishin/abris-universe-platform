import { readFileSync, writeFileSync } from "node:fs";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const deploymentList = (value) => {
  if (Array.isArray(value)) return value;
  for (const key of ["deployments", "result", "items"]) {
    if (Array.isArray(value?.[key])) return value[key];
  }
  throw new Error("Cloudflare deployments output has an unknown shape.");
};

const deploymentVersions = (deployment) => {
  const candidates = deployment?.versions ?? deployment?.version_traffic;
  if (!Array.isArray(candidates)) return [];
  return candidates
    .map((entry) => ({
      versionId:
        entry.version_id ?? entry.versionId ?? entry.id ?? entry.version?.id,
      percentage: Number(
        entry.percentage ?? entry.traffic_percentage ?? entry.weight ?? 0,
      ),
    }))
    .filter(
      (entry) =>
        typeof entry.versionId === "string" &&
        Number.isFinite(entry.percentage),
    );
};

export const currentVersion = (deployments) => {
  for (const deployment of deployments) {
    const versions = deploymentVersions(deployment).sort(
      (left, right) => right.percentage - left.percentage,
    );
    if (versions.length > 0) {
      return {
        deploymentId: deployment.id ?? deployment.deployment_id ?? null,
        createdOn: deployment.created_on ?? deployment.createdAt ?? null,
        ...versions[0],
      };
    }
  }
  throw new Error("No recoverable active Cloudflare Worker version was found.");
};

export const validateProductionPreflight = ({
  deployments,
  publicSnapshot,
}) => {
  assert(
    publicSnapshot?.status === 200 && publicSnapshot?.headStatus === 200,
    "Current production public baseline is not healthy.",
  );
  const prior = currentVersion(deploymentList(deployments));
  assert(
    prior.percentage === 100,
    "First production promotion requires one prior version at 100% traffic.",
  );
  return { prior, publicSnapshot };
};

export const validateProductionDomain = ({
  response,
  expectedHostname,
  expectedService,
}) => {
  assert(response?.success === true, "Cloudflare domain query was not successful.");
  assert(Array.isArray(response.result), "Cloudflare domain result is invalid.");
  const matches = response.result.filter(
    (domain) =>
      domain?.hostname === expectedHostname &&
      domain?.service === expectedService,
  );
  assert(
    matches.length === 1,
    "The production hostname is not uniquely assigned to the expected Worker.",
  );
  const [domain] = matches;
  return {
    id: domain.id ?? null,
    hostname: domain.hostname,
    service: domain.service,
    environment: domain.environment ?? null,
    zoneName: domain.zone_name ?? null,
  };
};

export const readVersionUpload = (outputPath) => {
  const entries = readFileSync(outputPath, "utf8")
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const upload = [...entries]
    .reverse()
    .find((entry) => entry.type === "version-upload");
  const versionId = upload?.version_id ?? upload?.versionId;
  assert(typeof versionId === "string", "Wrangler did not report a version ID.");
  return { versionId };
};

export const writeJsonEvidence = (outputPath, evidence) => {
  writeFileSync(
    outputPath,
    `${JSON.stringify(evidence, null, 2)}\n`,
    "utf8",
  );
};

const observationFields = [
  "status",
  "headStatus",
  "bodySha256",
  "contentType",
  "contentSecurityPolicy",
  "cfCacheStatus",
  "server",
];

const sanitizeObservation = (value) => {
  if (!value || typeof value !== "object") return null;
  return Object.fromEntries(
    observationFields
      .filter((field) => Object.hasOwn(value, field))
      .map((field) => [field, value[field]]),
  );
};

const optionalInteger = (value) =>
  Number.isInteger(value) && value > 0 ? value : null;

export const deploymentFailureEvidence = (error) => {
  const cause = error?.cause ?? null;
  return {
    name: typeof error?.name === "string" ? error.name : "Error",
    failureStage:
      typeof error?.state?.failureStage === "string"
        ? error.state.failureStage
        : null,
    rollbackFailureStage:
      typeof error?.state?.rollbackFailureStage === "string"
        ? error.state.rollbackFailureStage
        : null,
    semanticAttempt: optionalInteger(cause?.semanticAttempt),
    semanticAttemptsExhausted:
      optionalInteger(cause?.semanticAttemptsExhausted),
    deploymentObservation:
      sanitizeObservation(cause?.deploymentObservation),
    transitionAttempt: optionalInteger(cause?.transitionAttempt),
    transitionAttemptsExhausted:
      optionalInteger(cause?.transitionAttemptsExhausted),
    transitionWindowMs:
      optionalInteger(cause?.transitionWindowMs),
    transitionClassification:
      ["candidate", "prior-baseline", "unrecognized"].includes(
        cause?.transitionClassification,
      )
        ? cause.transitionClassification
        : null,
    transitionObservation:
      sanitizeObservation(cause?.transitionObservation),
  };
};
