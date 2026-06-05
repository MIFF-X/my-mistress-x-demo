export const defaultBanScopes = ['platform', 'chat', 'live', 'marketplace'];

export function createBanRecord({
  userId,
  reason = 'Policy review',
  scope = 'platform',
  createdBy = 'system',
  createdAt = new Date().toISOString(),
  expiresAt = null,
} = {}) {
  if (!userId) {
    throw new Error('userId is required to create a ban record');
  }

  return {
    id: `ban-${userId}-${Date.parse(createdAt) || Date.now()}`,
    userId,
    reason,
    scope,
    createdBy,
    createdAt,
    expiresAt,
    status: 'active',
  };
}

export function isBanActive(ban, now = new Date()) {
  if (!ban || ban.status === 'revoked') {
    return false;
  }

  if (!ban.expiresAt) {
    return true;
  }

  const currentTime = now instanceof Date ? now.getTime() : new Date(now).getTime();
  return new Date(ban.expiresAt).getTime() > currentTime;
}
