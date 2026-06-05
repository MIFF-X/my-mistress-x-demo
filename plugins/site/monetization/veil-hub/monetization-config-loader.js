export const DEFAULT_MONETIZATION_CONFIG = {
  id: 'site-monetization',
  status: 'scaffold',
  currency: 'credits',
  revenueSplit: {
    mistressPercent: 70,
    platformPercent: 30,
  },
  enabledModules: ['wallet', 'tributes', 'gifts', 'topups', 'timed-access', 'tip-jar'],
};

export function loadMonetizationConfig(overrides = {}) {
  return {
    ...DEFAULT_MONETIZATION_CONFIG,
    ...overrides,
    revenueSplit: {
      ...DEFAULT_MONETIZATION_CONFIG.revenueSplit,
      ...(overrides.revenueSplit || {}),
    },
    enabledModules: overrides.enabledModules || DEFAULT_MONETIZATION_CONFIG.enabledModules,
  };
}

export function describeMonetizationConfig(config = loadMonetizationConfig()) {
  return `${config.enabledModules.length} modules active with ${config.revenueSplit.mistressPercent}/${config.revenueSplit.platformPercent} split`;
}
