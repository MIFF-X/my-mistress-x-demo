import { buildAuthHeaders } from '../../../../features/auth/auth-client.js';

const API_BASE_URL = globalThis.window?.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function chatRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/chat${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Chat request failed with status ${response.status}.`);
  }

  return data;
}

export const chatApi = {
  createRoom({ title, metadata = {} } = {}) {
    return chatRequest('/room', {
      method: 'POST',
      body: JSON.stringify({ title, metadata }),
    });
  },

  getRoom(roomId) {
    return chatRequest(`/room/${encodeURIComponent(roomId)}`, { method: 'GET' });
  },

  listMessages(roomId) {
    return chatRequest(`/messages/${encodeURIComponent(roomId)}`, { method: 'GET' });
  },

  sendMessage({ roomId, text, receiverUserId }) {
    return chatRequest('/message', {
      method: 'POST',
      body: JSON.stringify({ roomId, text, receiverUserId }),
    });
  },

  unlockChat({ targetUserId, cost, roomId }) {
    return chatRequest('/unlock', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, cost, roomId }),
    });
  },

  heartbeat({ roomId, isTyping = false }) {
    return chatRequest('/presence', {
      method: 'POST',
      body: JSON.stringify({ roomId, isTyping }),
    });
  },

  getPresence(roomId) {
    return chatRequest(`/presence/${encodeURIComponent(roomId)}`, { method: 'GET' });
  },

  markRead({ roomId, lastReadMessageId }) {
    return chatRequest('/read', {
      method: 'POST',
      body: JSON.stringify({ roomId, lastReadMessageId }),
    });
  },

  getUnreadCount(roomId) {
    const query = new URLSearchParams({ roomId }).toString();
    return chatRequest(`/unread?${query}`, { method: 'GET' });
  },
};
