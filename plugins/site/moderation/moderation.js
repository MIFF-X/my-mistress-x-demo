import { isBanActive } from './bans.js';
import { groupFlagsByStatus } from './flags.js';

export function createModerationSummary({ flags = [], bans = [] } = {}) {
  const groupedFlags = groupFlagsByStatus(flags);
  const activeBans = bans.filter((ban) => isBanActive(ban));

  return {
    openFlags: groupedFlags.open ?? [],
    resolvedFlags: groupedFlags.resolved ?? [],
    activeBans,
    counts: {
      flags: flags.length,
      openFlags: (groupedFlags.open ?? []).length,
      activeBans: activeBans.length,
    },
  };
}

export function hasOpenModerationWork(summary) {
  return Boolean(summary?.counts?.openFlags || summary?.counts?.activeBans);
}
