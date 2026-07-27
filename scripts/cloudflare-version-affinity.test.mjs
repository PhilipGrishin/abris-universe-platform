import assert from "node:assert/strict";
import test from "node:test";

import {
  validateVersionAffinityRule,
  VERSION_AFFINITY_HEADER,
  VERSION_AFFINITY_RULE_REF,
  versionAffinityRuleDefinition,
} from "./cloudflare-version-affinity.mjs";

const HOSTNAME = "abris.653915.com";
const RULESET_ID = "ruleset-1";
const RULE_ID = "rule-1";

const rulesetWith = (rule) => ({
  id: RULESET_ID,
  kind: "zone",
  phase: "http_request_late_transform",
  rules: [{ id: RULE_ID, enabled: true, ...rule }],
});

test("defines IP-based Worker version affinity for the exact hostname", () => {
  assert.deepEqual(versionAffinityRuleDefinition(HOSTNAME), {
    ref: VERSION_AFFINITY_RULE_REF,
    description:
      "Keep each anonymous Abris Universe client on one Worker version during deployment transitions.",
    expression: '(http.host eq "abris.653915.com")',
    action: "rewrite",
    action_parameters: {
      headers: {
        [VERSION_AFFINITY_HEADER]: {
          operation: "set",
          expression: "to_string(ip.src)",
        },
      },
    },
  });
});

test("validates the exact active affinity rule", () => {
  assert.deepEqual(
    validateVersionAffinityRule({
      ruleset: rulesetWith(versionAffinityRuleDefinition(HOSTNAME)),
      hostname: HOSTNAME,
    }),
    {
      rulesetId: RULESET_ID,
      ruleId: RULE_ID,
      ref: VERSION_AFFINITY_RULE_REF,
      hostname: HOSTNAME,
      header: VERSION_AFFINITY_HEADER,
      keyExpression: "to_string(ip.src)",
      enabled: true,
    },
  );
});

test("rejects a disabled or broadened affinity rule", () => {
  assert.throws(
    () =>
      validateVersionAffinityRule({
        ruleset: rulesetWith({
          ...versionAffinityRuleDefinition(HOSTNAME),
          enabled: false,
        }),
        hostname: HOSTNAME,
      }),
    /disabled/u,
  );
  assert.throws(
    () =>
      validateVersionAffinityRule({
        ruleset: rulesetWith({
          ...versionAffinityRuleDefinition(HOSTNAME),
          expression: "true",
        }),
        hostname: HOSTNAME,
      }),
    /hostname expression/u,
  );
});
