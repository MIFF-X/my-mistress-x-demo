export function createPrivacyControlsState(seed = {}) {
  return {
    blockedUsers: Array.isArray(seed.blockedUsers) ? [...seed.blockedUsers] : [],
    contentVisibility: Array.isArray(seed.contentVisibility) ? [...seed.contentVisibility] : [],
  };
}

export function blockUser(state, blockerId, blockedId) {
  if (!blockerId || !blockedId) {
    throw new Error('blockerId and blockedId are required');
  }

  const blockedUsers = Array.isArray(state.blockedUsers) ? state.blockedUsers : [];
  const exists = blockedUsers.some(
    (entry) => entry.blockerId === blockerId && entry.blockedId === blockedId,
  );

  return {
    ...state,
    blockedUsers: exists
      ? blockedUsers
      : [...blockedUsers, { blockerId, blockedId }],
  };
}

export function unblockUser(state, blockerId, blockedId) {
  const blockedUsers = Array.isArray(state.blockedUsers) ? state.blockedUsers : [];

  return {
    ...state,
    blockedUsers: blockedUsers.filter(
      (entry) => !(entry.blockerId === blockerId && entry.blockedId === blockedId),
    ),
  };
}

export function isUserBlocked(state, userId, otherUserId) {
  const blockedUsers = Array.isArray(state.blockedUsers) ? state.blockedUsers : [];

  return blockedUsers.some(
    (entry) => entry.blockerId === userId && entry.blockedId === otherUserId,
  );
}

export function setContentVisibility(state, contentId, visibleToUserIds = []) {
  if (!contentId || !Array.isArray(visibleToUserIds)) {
    throw new Error('contentId and visibleToUserIds[] are required');
  }

  const contentVisibility = Array.isArray(state.contentVisibility)
    ? state.contentVisibility
    : [];
  const nextEntry = { contentId, visibleToUserIds: [...visibleToUserIds] };
  const existing = contentVisibility.some((entry) => entry.contentId === contentId);

  return {
    ...state,
    contentVisibility: existing
      ? contentVisibility.map((entry) => (
        entry.contentId === contentId ? nextEntry : entry
      ))
      : [...contentVisibility, nextEntry],
  };
}

export function canViewContent(state, contentId, userId) {
  const contentVisibility = Array.isArray(state.contentVisibility)
    ? state.contentVisibility
    : [];
  const entry = contentVisibility.find((item) => item.contentId === contentId);

  return entry ? entry.visibleToUserIds.includes(userId) : false;
}

export function summarizePrivacyControls(state) {
  const blockedUsers = Array.isArray(state.blockedUsers) ? state.blockedUsers : [];
  const contentVisibility = Array.isArray(state.contentVisibility)
    ? state.contentVisibility
    : [];

  return {
    blockedPairCount: blockedUsers.length,
    protectedContentCount: contentVisibility.length,
  };
}
