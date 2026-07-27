const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

export const purgeCloudflareHostnameCache = async ({
  zoneId,
  token,
  hostname,
  request = fetch,
}) => {
  assert(
    /^[0-9a-f]{32}$/u.test(zoneId ?? ""),
    "CLOUDFLARE_ZONE_ID must be a 32-character lowercase hexadecimal ID.",
  );
  assert(
    typeof token === "string" && token.length > 0,
    "CLOUDFLARE_CACHE_PURGE_TOKEN is not configured.",
  );
  assert(
    /^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z]{2,}$/u.test(
      hostname ?? "",
    ),
    "The cache-purge hostname is invalid.",
  );
  assert(typeof request === "function", "request must be a function.");

  const response = await request(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ hosts: [hostname] }),
      redirect: "error",
    },
  );

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Cloudflare cache purge did not return valid JSON.");
  }
  assert(
    response.status === 200 && payload?.success === true,
    "Cloudflare hostname cache purge was rejected.",
  );

  return {
    hostname,
    scope: "hostname",
    status: response.status,
    success: true,
  };
};
