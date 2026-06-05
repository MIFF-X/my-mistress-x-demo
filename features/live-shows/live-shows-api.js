import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function liveRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/live${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Live show request failed with status ${response.status}.`);
  }

  return data;
}

export const liveShowsApi = {
  createShow({
    title,
    description,
    ticketPrice = 0,
    scheduledAt,
    durationMinutes,
    chatEnabled = true,
    giftsEnabled = true,
  }) {
    return liveRequest('/show', {
      method: 'POST',
      body: JSON.stringify({
        title,
        description,
        ticketPrice,
        scheduledAt,
        durationMinutes,
        chatEnabled,
        giftsEnabled,
      }),
    });
  },

  listShows() {
    return liveRequest('/shows', { method: 'GET' });
  },

  getShow(showId) {
    return liveRequest(`/show/${encodeURIComponent(showId)}`, { method: 'GET' });
  },

  startShow(showId) {
    return liveRequest(`/show/${encodeURIComponent(showId)}/start`, { method: 'POST' });
  },

  endShow(showId) {
    return liveRequest(`/show/${encodeURIComponent(showId)}/end`, { method: 'POST' });
  },

  buyTicket(showId) {
    return liveRequest(`/show/${encodeURIComponent(showId)}/ticket`, { method: 'POST' });
  },

  tip({ targetUserId, amount, showId }) {
    return liveRequest('/tip', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, amount, showId }),
    });
  },
};
