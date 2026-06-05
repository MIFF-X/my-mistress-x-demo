export const notificationStore = {
  list: []
};

export function createNotification({ userId, type, message }) {
  const item = {
    id: `notif-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    userId,
    type,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };

  notificationStore.list.unshift(item);
  return item;
}

export function markAsRead(notificationId) {
  const notif = notificationStore.list.find(n => n.id === notificationId);
  if (notif) notif.read = true;
}

export function getUnreadCount(userId) {
  return notificationStore.list.filter(n => n.userId === userId && !n.read).length;
}
