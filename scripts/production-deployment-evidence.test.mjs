import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import {
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
        }),
        "",
      ].join("\n"),
      "utf8",
    );
    assert.deepEqual(readVersionUpload(uploadPath), {
      versionId: "uploaded-version",
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
