export function calculateSitePluginPrice(baseCredits, options = {}) {
  const multiplier = Number.isFinite(Number(options.multiplier)) ? Number(options.multiplier) : 1;
  const minimumCredits = Number.isFinite(Number(options.minimumCredits)) ? Number(options.minimumCredits) : 0;
  return Math.max(minimumCredits, Math.round(Number(baseCredits || 0) * multiplier));
}
