export const environmentForWrangler = (environment) => {
  const sanitized = { ...environment };
  delete sanitized.CLOUDFLARE_CACHE_PURGE_TOKEN;
  delete sanitized.CLOUDFLARE_RULES_TOKEN;
  delete sanitized.CLOUDFLARE_ZONE_ID;
  return sanitized;
};
