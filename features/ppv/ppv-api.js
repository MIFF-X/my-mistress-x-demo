import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function ppvRequest(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/ppv${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `PPV request failed with status ${response.status}.`);
  }

  return data;
}

export const ppvApi = {
  createItem({ title, description, price, mediaUrl, previewUrl }) {
    return ppvRequest('', {
      method: 'POST',
      body: JSON.stringify({ title, description, price, mediaUrl, previewUrl }),
    });
  },

  listItems() {
    return ppvRequest('', { method: 'GET' });
  },

  unlockItem(itemId) {
    return ppvRequest('/unlock', {
      method: 'POST',
      body: JSON.stringify({ itemId }),
    });
  },
};
