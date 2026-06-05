import { notificationsApi } from './notifications-api.js';

export function buildNotificationSummary(notifications = []) {
  const rows = Array.isArray(notifications) ? notifications : [];
  const unread = rows.filter((notification) => !notification.read);
  const unreadByType = unread.reduce((acc, notification) => {
    const type = notification.type || 'SYSTEM';
    acc[type] = (acc[type] || 0) + 1;
    return acc;
  }, {});

  return {
    total: rows.length,
    unread: unread.length,
    chatUnread: unreadByType.CHAT || 0,
    unreadByType,
  };
}

export async function loadNotificationSummary() {
  const notifications = await notificationsApi.list();
  return buildNotificationSummary(notifications);
}

export function formatNotificationSummary(summary) {
  if (!summary) return 'Notifications not loaded.';
  return `${summary.unread} unread · ${summary.chatUnread} chat`;
}

export function formatUnreadByTypeSummary(unreadByType = {}) {
  const parts = Object.entries(unreadByType)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([type, count]) => `${type.replaceAll('_', ' ')}: ${count}`);

  return parts.length ? `Unread by type · ${parts.join(' · ')}` : 'No unread notifications by type.';
}
