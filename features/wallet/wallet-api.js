import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Request failed with status ${response.status}.`);
  }

  return data;
}

async function walletRequest(path, options = {}) {
  return request(`/wallet${path}`, options);
}

async function topUpsRequest(path, options = {}) {
  return request(`/top-ups${path}`, options);
}

async function ppvRequest(path, options = {}) {
  return request(`/ppv${path}`, options);
}

export const walletApi = {
  getBalance() {
    return walletRequest('', { method: 'GET' });
  },

  credit({ amount, reason = 'manual-credit' }) {
    return topUpsRequest('/intents', {
      method: 'POST',
      body: JSON.stringify({
        amountCredits: amount,
        provider: 'manual_bank',
        purpose: 'manual_adjustment',
        metadataJson: {
          source: 'legacy_wallet_credit_api',
          reason,
        },
      }),
    });
  },

  spend({ amount, targetUserId, reason = 'spend' }) {
    return walletRequest('/spend', {
      method: 'POST',
      body: JSON.stringify({ amount, targetUserId, reason }),
    });
  },

  getTransactions() {
    return walletRequest('/transactions', { method: 'GET' });
  },
};

export const ppvApi = {
  list(params = {}) {
    const query = new URLSearchParams(params).toString();
    return ppvRequest(`${query ? `?${query}` : ''}`, { method: 'GET' });
  },

  purchase(contentId) {
    return ppvRequest('/purchase', {
      method: 'POST',
      body: JSON.stringify({ contentId }),
    });
  },

  history() {
    return ppvRequest('/history', { method: 'GET' });
  },
};

export function fetchWalletBalance() {
  return walletApi.getBalance();
}

export function fetchPPVContent(params = {}) {
  return ppvApi.list(params);
}

export function purchasePPV(contentId) {
  return ppvApi.purchase(contentId);
}

export function fetchPPVHistory() {
  return ppvApi.history();
}
