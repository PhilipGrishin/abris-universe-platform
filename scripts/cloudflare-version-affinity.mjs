const API_ROOT = "https://api.cloudflare.com/client/v4";
const PHASE = "http_request_late_transform";
export const VERSION_AFFINITY_RULE_REF =
  "abris_universe_worker_version_affinity";
export const VERSION_AFFINITY_HEADER =
  "Cloudflare-Workers-Version-Key";

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const hostnameExpression = (hostname) => `(http.host eq "${hostname}")`;

const apiRequest = async ({ token, pathname, method = "GET", body }) => {
  const response = await fetch(`${API_ROOT}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  const payload = await response.json();
  assert(
    response.ok && payload?.success === true,
    `Cloudflare version-affinity API request failed with status ${response.status}.`,
  );
  return payload.result;
};

export const versionAffinityRuleDefinition = (hostname) => {
  assert(
    /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?$/u.test(hostname),
    "Version-affinity hostname is invalid.",
  );
  return {
    ref: VERSION_AFFINITY_RULE_REF,
    description:
      "Keep each anonymous Abris Universe client on one Worker version during deployment transitions.",
    expression: hostnameExpression(hostname),
    action: "rewrite",
    action_parameters: {
      headers: {
        [VERSION_AFFINITY_HEADER]: {
          operation: "set",
          expression: "to_string(ip.src)",
        },
      },
    },
  };
};

const affinityRule = (ruleset) =>
  ruleset?.rules?.find(
    (rule) => rule?.ref === VERSION_AFFINITY_RULE_REF,
  ) ?? null;

export const validateVersionAffinityRule = ({ ruleset, hostname }) => {
  assert(
    ruleset?.kind === "zone" && ruleset?.phase === PHASE,
    "Cloudflare late-transform zone ruleset is missing.",
  );
  const rule = affinityRule(ruleset);
  assert(rule, "Cloudflare Worker version-affinity rule is missing.");
  const expected = versionAffinityRuleDefinition(hostname);
  const header =
    rule.action_parameters?.headers?.[VERSION_AFFINITY_HEADER] ??
    rule.action_parameters?.headers?.[
      VERSION_AFFINITY_HEADER.toLowerCase()
    ];
  assert(rule.action === expected.action, "Version-affinity action is invalid.");
  assert(
    rule.expression === expected.expression,
    "Version-affinity hostname expression is invalid.",
  );
  assert(
    rule.enabled !== false,
    "Version-affinity rule is disabled.",
  );
  assert(
    header?.operation === "set" &&
      header?.expression === "to_string(ip.src)",
    "Version-affinity header contract is invalid.",
  );
  return {
    rulesetId: ruleset.id,
    ruleId: rule.id,
    ref: rule.ref,
    hostname,
    header: VERSION_AFFINITY_HEADER,
    keyExpression: header.expression,
    enabled: rule.enabled !== false,
  };
};

const readLateTransformRuleset = async ({ zoneId, token }) => {
  const rulesets = await apiRequest({
    token,
    pathname: `/zones/${zoneId}/rulesets`,
  });
  const summary = rulesets.find(
    (ruleset) => ruleset?.kind === "zone" && ruleset?.phase === PHASE,
  );
  if (!summary) return null;
  return apiRequest({
    token,
    pathname: `/zones/${zoneId}/rulesets/${summary.id}`,
  });
};

export const inspectCloudflareVersionAffinity = async ({
  zoneId,
  token,
  hostname,
}) => {
  const ruleset = await readLateTransformRuleset({ zoneId, token });
  return validateVersionAffinityRule({ ruleset, hostname });
};

export const upsertCloudflareVersionAffinity = async ({
  zoneId,
  token,
  hostname,
}) => {
  let ruleset = await readLateTransformRuleset({ zoneId, token });
  const definition = versionAffinityRuleDefinition(hostname);
  if (!ruleset) {
    ruleset = await apiRequest({
      token,
      pathname: `/zones/${zoneId}/rulesets`,
      method: "POST",
      body: {
        name: "Abris Universe request header transforms",
        description:
          "Zone-level request transforms managed for Abris Universe.",
        kind: "zone",
        phase: PHASE,
        rules: [definition],
      },
    });
  } else {
    const existing = affinityRule(ruleset);
    if (existing) {
      await apiRequest({
        token,
        pathname: `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${existing.id}`,
        method: "PATCH",
        body: definition,
      });
    } else {
      await apiRequest({
        token,
        pathname: `/zones/${zoneId}/rulesets/${ruleset.id}/rules`,
        method: "POST",
        body: definition,
      });
    }
    ruleset = await readLateTransformRuleset({ zoneId, token });
  }
  return validateVersionAffinityRule({ ruleset, hostname });
};

export const deleteCloudflareVersionAffinity = async ({
  zoneId,
  token,
}) => {
  const ruleset = await readLateTransformRuleset({ zoneId, token });
  const rule = affinityRule(ruleset);
  if (!rule) return { deleted: false };
  await apiRequest({
    token,
    pathname: `/zones/${zoneId}/rulesets/${ruleset.id}/rules/${rule.id}`,
    method: "DELETE",
  });
  return {
    deleted: true,
    rulesetId: ruleset.id,
    ruleId: rule.id,
  };
};
