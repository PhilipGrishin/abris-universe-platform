import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
  deploymentFailureEvidence,
  deploymentLifecycleEvidence,
  deploymentList,
  readVersionUpload,
  validateProductionDomain,
  validateProductionPreflight,
  writeJsonEvidence,
} from "./production-deployment-evidence.mjs";

test("accepts registered Cloudflare deployment output shapes", () => {
  const deployment = {
    id: "deployment",
    versions: [{ version_id: "prior", percentage: 100 }],
  };
  assert.deepEqual(deploymentList([deployment]), [deployment]);
  assert.deepEqual(deploymentList({ result: [deployment] }), [deployment]);
  assert.throws(() => deploymentList({ unknown: [] }), /unknown shape/u);
});

test("requires a healthy public baseline and one 100-percent prior version", () => {
  assert.deepEqual(
    validateProductionPreflight({
      deployments: [
        {
          deployment_id: "deployment",
          version_traffic: [
            { version: { id: "prior" }, traffic_percentage: 100 },
          ],
        },
      ],
      publicSnapshot: {
        status: 200,
        headStatus: 200,
        bodySha256: "baseline",
      },
    }).prior,
    {
      deploymentId: "deployment",
      createdOn: null,
      versionId: "prior",
      percentage: 100,
    },
  );
  assert.throws(
    () =>
      validateProductionPreflight({
        deployments: [
          {
            versions: [
              { version_id: "prior", percentage: 90 },
              { version_id: "candidate", percentage: 10 },
            ],
          },
        ],
        publicSnapshot: { status: 200, headStatus: 200 },
      }),
    /100% traffic/u,
  );
});

test("records only the exact production hostname-to-worker assignment", () => {
  const domain = validateProductionDomain({
    response: {
      success: true,
      result: [
        {
          id: "domain-id",
          hostname: "abris.653915.com",
          service: "abris-universe",
          environment: "production",
          zone_name: "653915.com",
        },
      ],
    },
    expectedHostname: "abris.653915.com",
    expectedService: "abris-universe",
  });
  assert.deepEqual(domain, {
    id: "domain-id",
    hostname: "abris.653915.com",
    service: "abris-universe",
    environment: "production",
    zoneName: "653915.com",
  });
});

test("rejects a domain assigned to a different Worker", () => {
  assert.throws(
    () =>
      validateProductionDomain({
        response: {
          success: true,
          result: [
            {
              hostname: "abris.653915.com",
              service: "other-worker",
            },
          ],
        },
        expectedHostname: "abris.653915.com",
        expectedService: "abris-universe",
      }),
    /not uniquely assigned/u,
  );
});

test("parses upload provenance and persists failure-safe JSON evidence", async () => {
  const directory = await mkdtemp(join(tmpdir(), "abris-deploy-evidence-"));
  const uploadPath = join(directory, "wrangler.ndjson");
  const evidencePath = join(directory, "evidence.json");
  try {
    await writeFile(
      uploadPath,
      [
        JSON.stringify({ type: "wrangler-session", version: 1 }),
        JSON.stringify({
          type: "version-upload",
          version_id: "uploaded-version",
          preview_url:
            "https://uploaded-version-abris-universe.example.workers.dev",
        }),
        "",
      ].join("\n"),
      "utf8",
    );
    assert.deepEqual(readVersionUpload(uploadPath), {
      versionId: "uploaded-version",
      previewUrl:
        "https://uploaded-version-abris-universe.example.workers.dev",
    });

    const evidence = {
      schemaVersion: 1,
      lifecycle: {
        failureStage: "production-smoke",
        rollbackPerformed: true,
        rollbackActive: { versionId: "prior", percentage: 100 },
      },
      failure: {
        name: "ProductionDeploymentError",
        failureStage: "production-smoke",
        rollbackFailureStage: null,
      },
    };
    writeJsonEvidence(evidencePath, evidence);
    assert.deepEqual(
      JSON.parse(await readFile(evidencePath, "utf8")),
      evidence,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects missing or non-Cloudflare preview URLs", async () => {
  const directory = await mkdtemp(join(tmpdir(), "abris-preview-evidence-"));
  const outputPath = join(directory, "wrangler.ndjson");
  try {
    await writeFile(
      outputPath,
      `${JSON.stringify({
        type: "version-upload",
        version_id: "uploaded-version",
        preview_url: "https://example.invalid/preview",
      })}\n`,
      "utf8",
    );
    assert.throws(
      () => readVersionUpload(outputPath),
      /invalid immutable preview URL/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("retains version and smoke evidence without the public preview capability URL", () => {
  const lifecycle = deploymentLifecycleEvidence({
    stage: "complete",
    candidate: {
      versionId: "candidate-version",
      previewUrl: "https://capability.example.workers.dev",
    },
    previewSmoke: {
      baseUrl: "https://capability.example.workers.dev",
      observedCommit: "a".repeat(40),
      root: { status: 200, bodySha256: "b".repeat(64) },
    },
    productionSmoke: {
      baseUrl: "https://abris.653915.com",
      observedCommit: "a".repeat(40),
    },
  });

  assert.deepEqual(lifecycle, {
    stage: "complete",
    candidate: { versionId: "candidate-version" },
    previewSmoke: {
      observedCommit: "a".repeat(40),
      root: { status: 200, bodySha256: "b".repeat(64) },
    },
    productionSmoke: {
      observedCommit: "a".repeat(40),
    },
  });
  assert.equal(JSON.stringify(lifecycle).includes("workers.dev"), false);
  assert.equal(JSON.stringify(lifecycle).includes("abris.653915.com"), false);
});

test("allowlists semantic and transition failure evidence", () => {
  const failure = deploymentFailureEvidence({
    name: "ProductionDeploymentError",
    state: {
      failureStage: "production-smoke",
      rollbackFailureStage: null,
    },
    cause: {
      semanticAttempt: 1,
      semanticAttemptsExhausted: 1,
      transitionAttempt: 3,
      transitionAttemptsExhausted: 61,
      transitionWindowMs: 120_000,
      transitionClassification: "prior-baseline",
      stabilityAttempt: 4,
      stabilityAttemptsExhausted: 25,
      stabilityWindowMs: 120_000,
      stabilityClassification: "candidate-not-stable",
      deploymentObservation: {
        status: 200,
        bodySha256: "a".repeat(64),
        contentSecurityPolicy: null,
        body: "<html>must not be retained</html>",
        authorization: "authorization-value-must-not-be-retained",
      },
      transitionObservation: {
        status: 200,
        headStatus: 200,
        bodySha256: "b".repeat(64),
        contentType: "text/html",
        cfCacheStatus: "HIT",
        requestHeaders: { authorization: "must-not-be-retained" },
        token: "must-not-be-retained",
      },
      stabilityObservation: {
        status: 200,
        headStatus: 200,
        bodySha256: "c".repeat(64),
        contentType: "text/html",
        authorization: "must-not-be-retained",
      },
    },
    rollbackCause: {
      rollbackAttemptsExhausted: 25,
      rollbackObservation: {
        status: 200,
        headStatus: 200,
        bodySha256: "d".repeat(64),
        contentType: "text/html",
        token: "must-not-be-retained",
      },
    },
  });

  assert.deepEqual(failure, {
    name: "ProductionDeploymentError",
    failureStage: "production-smoke",
    rollbackFailureStage: null,
    semanticAttempt: 1,
    semanticAttemptsExhausted: 1,
    deploymentObservation: {
      status: 200,
      bodySha256: "a".repeat(64),
      contentSecurityPolicy: null,
    },
    transitionAttempt: 3,
    transitionAttemptsExhausted: 61,
    transitionWindowMs: 120_000,
    transitionClassification: "prior-baseline",
    transitionObservation: {
      status: 200,
      headStatus: 200,
      bodySha256: "b".repeat(64),
      contentType: "text/html",
      cfCacheStatus: "HIT",
    },
    stabilityAttempt: 4,
    stabilityAttemptsExhausted: 25,
    stabilityWindowMs: 120_000,
    stabilityClassification: "candidate-not-stable",
    stabilityObservation: {
      status: 200,
      headStatus: 200,
      bodySha256: "c".repeat(64),
      contentType: "text/html",
    },
    rollbackAttemptsExhausted: 25,
    rollbackObservation: {
      status: 200,
      headStatus: 200,
      bodySha256: "d".repeat(64),
      contentType: "text/html",
    },
  });
  assert.equal(JSON.stringify(failure).includes("must-not-be-retained"), false);
});
