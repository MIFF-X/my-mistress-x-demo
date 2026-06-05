import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function requestModeration(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/moderation${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Moderation request failed.');
  }

  return data;
}

export const moderationApi = {
  listItems(filters = {}) {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, value);
      }
    });

    const query = params.toString();
    return requestModeration(`/items${query ? `?${query}` : ''}`);
  },

  createItem(payload) {
    return requestModeration('/items', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  assignItem(itemId, assignedToId) {
    return requestModeration(`/items/${itemId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ assignedToId }),
    });
  },

  updateStatus(itemId, status, note) {
    return requestModeration(`/items/${itemId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, note }),
    });
  },

  addAction(itemId, payload) {
    return requestModeration(`/items/${itemId}/actions`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
