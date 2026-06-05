import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function giftsRequest(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/gifts${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Gift request failed with status ${response.status}.`);
  }

  return data;
}

export const DEFAULT_GIFTS = [
  { id: 'rose', name: 'Rose', emoji: '🌹', price: 5 },
  { id: 'crown', name: 'Crown', emoji: '👑', price: 25 },
  { id: 'diamond', name: 'Diamond', emoji: '💎', price: 50 },
  { id: 'throne', name: 'Throne Tribute', emoji: '🪑', price: 100 },
  { id: 'gold-heart', name: 'Gold Heart', emoji: '💛', price: 150 },
];

export const giftsApi = {
  async listCatalog() {
    const gifts = await giftsRequest('', { method: 'GET' });
    return gifts.length ? gifts : DEFAULT_GIFTS;
  },

  createGift({ name, emoji, price, animation, metadata = {} }) {
    return giftsRequest('', {
      method: 'POST',
      body: JSON.stringify({ name, emoji, price, animation, metadata }),
    });
  },

  sendGift({ targetUserId, amount, giftId }) {
    return giftsRequest('/send', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, amount, giftId }),
    });
  },

  listMyGifts() {
    return giftsRequest('/mine', { method: 'GET' });
  },
};
