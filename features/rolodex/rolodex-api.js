import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

export const ROLODEX_CARD_TYPES = [
  'MISTRESS_PROFILE',
  'SUB_PROFILE',
  'CONTRACT_CARD',
  'MX_AWARD',
  'COLLECTOR_CARD',
];

async function rolodexRequest(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/rolodex${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Rolodex request failed with status ${response.status}.`);
  }

  return data;
}

export const rolodexApi = {
  listCards() {
    return rolodexRequest('', { method: 'GET' });
  },

  createCard({
    title,
    displayName,
    type = 'MISTRESS_PROFILE',
    notes = '',
    tags = [],
    style = {},
    ownerUserId,
  }) {
    return rolodexRequest('', {
      method: 'POST',
      body: JSON.stringify({
        title,
        displayName,
        notes,
        tags,
        style: {
          ...style,
          type,
        },
        ownerUserId,
      }),
    });
  },

  deleteCard(cardId) {
    return rolodexRequest(`/${encodeURIComponent(cardId)}`, {
      method: 'DELETE',
    });
  },
};
