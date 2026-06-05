import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function marketplaceRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/marketplace${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Marketplace request failed with status ${response.status}.`);
  }

  return data;
}

export const marketplaceApi = {
  createProduct({ title, description, price, type = 'STANDARD', stock = 1 }) {
    return marketplaceRequest('/product', {
      method: 'POST',
      body: JSON.stringify({ title, description, price, type, stock }),
    });
  },

  listProducts() {
    return marketplaceRequest('/products', { method: 'GET' });
  },

  purchase(productId) {
    return marketplaceRequest('/purchase', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    });
  },
};
