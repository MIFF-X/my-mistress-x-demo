export const NOTIFICATION_TYPES = {
  INFO: 'info',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
};

export function createNotification(input = {}) {
  return {
    id: input.id || `notification-${Date.now()}`,
    type: input.type || NOTIFICATION_TYPES.INFO,
    title: input.title || 'Notification',
    message: input.message || '',
    userId: input.userId || null,
    read: Boolean(input.read),
    route: input.route || null,
    createdAt: input.createdAt || new Date().toISOString(),
  };
}

export function listUnreadNotifications(notifications = []) {
  return notifications.filter((notification) => !notification.read);
}

export function markNotificationRead(notification, readAt = new Date().toISOString()) {
  return {
    ...notification,
    read: true,
    readAt,
  };
}

export function buildNotificationSummary(notifications = []) {
  const unread = listUnreadNotifications(notifications);

  return {
    total: notifications.length,
    unread: unread.length,
    byType: notifications.reduce((summary, notification) => ({
      ...summary,
      [notification.type]: (summary[notification.type] || 0) + 1,
    }), {}),
  };
}
