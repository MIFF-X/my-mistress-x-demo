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

export const walletApi = {
  getBalance() {
    return request('/wallet');
  },

  credit(amount, reason = 'manual-credit') {
    return request('/top-ups/intents', {
      method: 'POST',
      body: JSON.stringify({
        amountCredits: amount,
        provider: 'manual_bank',
        purpose: 'manual_adjustment',
        metadataJson: {
          source: 'legacy_wallet_credit_api',
          reason
        }
      })
    });
  },

  spend(amount, targetUserId, reason = 'spend') {
    return request('/wallet/spend', {
      method: 'POST',
      body: JSON.stringify({ amount, targetUserId, reason })
    });
  },

  getTransactions() {
    return request('/wallet/transactions');
  }
};

export const chatApi = {
  send(message) {
    return request('/chat/send', {
      method: 'POST',
      body: JSON.stringify({ message })
    });
  },

  sendPaid(targetUserId, amount, message) {
    return request('/chat/send-paid', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, amount, message })
    });
  },

  unlock(targetUserId, cost) {
    return request('/chat/unlock', {
      method: 'POST',
      body: JSON.stringify({ targetUserId, cost })
    });
  }
};
