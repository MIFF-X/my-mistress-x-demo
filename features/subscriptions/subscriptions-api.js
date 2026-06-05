import { buildAuthHeaders } from '../auth/auth-client.js';

const API_BASE_URL = window.MISTRESS_X_API_BASE_URL || 'http://localhost:3000';

async function subscriptionRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}/subscriptions${path}`, {
    ...options,
    headers: buildAuthHeaders(options.headers || {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || `Subscription request failed with status ${response.status}.`);
  }

  return data;
}

export const subscriptionsApi = {
  createPlan({
    name,
    price,
    tier = 'BRONZE',
    chatIncluded = false,
    ppvIncluded = false,
    ppvDiscountPercent = 0,
    giftDiscountPercent = 0,
    perks = {},
  }) {
    return subscriptionRequest('/plan', {
      method: 'POST',
      body: JSON.stringify({
        name,
        price,
        tier,
        chatIncluded,
        ppvIncluded,
        ppvDiscountPercent,
        giftDiscountPercent,
        perks,
      }),
    });
  },

  listPlans(mistressUserId) {
    const query = mistressUserId ? `?mistressUserId=${encodeURIComponent(mistressUserId)}` : '';
    return subscriptionRequest(`/plans${query}`, { method: 'GET' });
  },

  subscribe(planId) {
    return subscriptionRequest('/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  check(mistressUserId) {
    return subscriptionRequest(`/check?mistressUserId=${encodeURIComponent(mistressUserId)}`, {
      method: 'GET',
    });
  },
};
