export function createNotificationCenter(input = {}) {
  return {
    id: input.id || 'notification-center',
    title: input.title || 'Notification Center',
    notifications: Array.isArray(input.notifications) ? [...input.notifications] : [],
  };
}

export function addNotificationToCenter(center, notification) {
  return {
    ...center,
    notifications: [notification, ...center.notifications],
  };
}

export function clearReadNotifications(center) {
  return {
    ...center,
    notifications: center.notifications.filter((notification) => !notification.read),
  };
}
