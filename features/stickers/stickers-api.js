import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

export const DEFAULT_STICKERS = [
  {
    id: 'gold-crown-mx',
    title: 'Gold Crown MX',
    imageUrl: '',
    price: 15,
    rarity: 'RARE',
    source: 'platform',
  },
  {
    id: 'rose-devotion',
    title: 'Rose Devotion',
    imageUrl: '',
    price: 8,
    rarity: 'COMMON',
    source: 'platform',
  },
  {
    id: 'diamond-tribute',
    title: 'Diamond Tribute',
    imageUrl: '',
    price: 35,
    rarity: 'EPIC',
    source: 'platform',
  },
  {
    id: 'worn-item-collector',
    title: 'Worn Item Collector Sticker',
    imageUrl: '',
    price: 20,
    rarity: 'LIMITED',
    source: 'purchase_tie_in',
  },
];

async function stickersRequest(path = '', options = {}) {
  const response = await fetch(`${API_BASE_URL}/stickers${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Stickers request failed with status ${response.status}.`);
  }

  return data;
}

export const stickersApi = {
  async listCatalog() {
    const backendStickers = await stickersRequest('', { method: 'GET' });
    return backendStickers.length ? backendStickers : DEFAULT_STICKERS;
  },

  createStickerProduct({ title, description, price, stock = 1, imageUrl = '', metadata = {} }) {
    return stickersRequest('', {
      method: 'POST',
      body: JSON.stringify({
        title,
        imageUrl,
        price,
        metadata: {
          ...metadata,
          description,
          stock,
        },
      }),
    });
  },

  purchaseStickerProduct(stickerId) {
    return stickersRequest(`/${encodeURIComponent(stickerId)}/collect`, {
      method: 'POST',
    });
  },

  listMyStickers() {
    return stickersRequest('/mine', { method: 'GET' });
  },
};
