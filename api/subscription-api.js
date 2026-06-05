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

export const subscriptionApi = {
  createPlan(plan) {
    return request('/subscription/plan', {
      method: 'POST',
      body: JSON.stringify(plan)
    });
  },

  listPlans(mistressUserId) {
    const query = mistressUserId ? `?mistressUserId=${encodeURIComponent(mistressUserId)}` : '';
    return request(`/subscription/plans${query}`);
  },

  subscribe(planId) {
    return request('/subscription/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  },

  status(mistressUserId) {
    const query = mistressUserId ? `?mistressUserId=${encodeURIComponent(mistressUserId)}` : '';
    return request(`/subscription/status${query}`);
  },

  perks(mistressUserId) {
    return request(`/subscription/perks?mistressUserId=${encodeURIComponent(mistressUserId)}`);
  },

  cancel(planId) {
    return request('/subscription/cancel', {
      method: 'POST',
      body: JSON.stringify({ planId })
    });
  }
};
