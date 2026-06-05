import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

export const NOTIFICATION_TYPES = [
  'WALLET',
  'CHAT',
  'PPV',
  'SUBSCRIPTION',
  'LIVE_SHOW',
  'GIFT',
  'MARKETPLACE',
  'STICKER',
  'ROLODEX',
  'DRAW_REMINDER',
  'SYSTEM',
];

async function notificationsRequest(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/notifications${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Notifications request failed with status ${response.status}.`);
  }

  return data;
}

export const notificationsApi = {
  list() {
    return notificationsRequest('', { method: 'GET' });
  },

  create({ type = 'SYSTEM', title, message, metadata = {} }) {
    return notificationsRequest('', {
      method: 'POST',
      body: JSON.stringify({ type, title, message, metadata }),
    });
  },

  markRead(notificationId) {
    return notificationsRequest(`/${encodeURIComponent(notificationId)}/read`, {
      method: 'PATCH',
    });
  },

  markAllRead() {
    return notificationsRequest('/read-all', {
      method: 'PATCH',
    });
  },

  clear() {
    return notificationsRequest('', {
      method: 'DELETE',
    });
  },
};
