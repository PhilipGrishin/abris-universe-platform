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

const rewriteRule = ({
  id,
  header = VERSION_AFFINITY_HEADER,
  operation = "set",
  expression = '"other-key"',
  enabled = true,
}) => ({
  id,
  ref: id,
  enabled,
  expression: "true",
  action: "rewrite",
  action_parameters: {
    headers: {
      [header]: {
        operation,
        ...(operation === "set" ? { expression } : {}),
      },
    },
  },
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

test("rejects a later enabled rule that sets or removes the affinity header", () => {
  for (const operation of ["set", "remove"]) {
    assert.throws(
      () =>
        validateVersionAffinityRule({
          ruleset: {
            ...rulesetWith(versionAffinityRuleDefinition(HOSTNAME)),
            rules: [
              ...rulesetWith(
                versionAffinityRuleDefinition(HOSTNAME),
              ).rules,
              rewriteRule({
                id: `later-${operation}`,
                operation,
              }),
            ],
          },
          hostname: HOSTNAME,
        }),
      /later enabled Transform Rule overrides/u,
    );
  }
});

test("accepts disabled, unrelated, or earlier header modifications when the managed rule is final", () => {
  const managed = rulesetWith(
    versionAffinityRuleDefinition(HOSTNAME),
  ).rules[0];
  assert.doesNotThrow(() =>
    validateVersionAffinityRule({
      ruleset: {
        ...rulesetWith(versionAffinityRuleDefinition(HOSTNAME)),
        rules: [
          rewriteRule({ id: "earlier-affinity" }),
          managed,
          rewriteRule({
            id: "disabled-later-affinity",
            enabled: false,
          }),
          rewriteRule({
            id: "unrelated-later-header",
            header: "X-Unrelated-Header",
          }),
        ],
      },
      hostname: HOSTNAME,
    }),
  );
});

test("rejects duplicate managed affinity rules", () => {
  const managed = rulesetWith(
    versionAffinityRuleDefinition(HOSTNAME),
  ).rules[0];
  assert.throws(
    () =>
      validateVersionAffinityRule({
        ruleset: {
          ...rulesetWith(versionAffinityRuleDefinition(HOSTNAME)),
          rules: [managed, { ...managed, id: "rule-2" }],
        },
        hostname: HOSTNAME,
      }),
    /duplicated/u,
  );
});
