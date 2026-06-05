export const moderationFlagTypes = [
  'profile',
  'message',
  'live-room',
  'marketplace',
  'payment',
  'external-link',
];

export function createModerationFlag({
  targetId,
  type = 'profile',
  reason = 'Review required',
  severity = 'medium',
  status = 'open',
  createdBy = 'system',
  createdAt = new Date().toISOString(),
} = {}) {
  if (!targetId) {
    throw new Error('targetId is required to create a moderation flag');
  }

  return {
    id: `flag-${targetId}-${Date.parse(createdAt) || Date.now()}`,
    targetId,
    type,
    reason,
    severity,
    status,
    createdBy,
    createdAt,
  };
}

export function groupFlagsByStatus(flags = []) {
  return flags.reduce((groups, flag) => {
    const status = flag.status ?? 'open';
    groups[status] = groups[status] ?? [];
    groups[status].push(flag);
    return groups;
  }, {});
}
