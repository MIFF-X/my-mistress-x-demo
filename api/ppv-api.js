import { requireAccessToken } from './session.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000/api';

async function request(path, options = {}) {
  const token = requireAccessToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    ...options
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const ppvApi = {
  create(item) {
    return request('/ppv/create', {
      method: 'POST',
      body: JSON.stringify(item)
    });
  },

  feed() {
    return request('/ppv/feed');
  },

  unlock(ppvItemId) {
    return request('/ppv/unlock', {
      method: 'POST',
      body: JSON.stringify({ ppvItemId })
    });
  },

  access(ppvItemId) {
    return request(`/ppv/${encodeURIComponent(ppvItemId)}/access`);
  }
};
