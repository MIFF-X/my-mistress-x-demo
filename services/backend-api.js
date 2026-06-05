const DEFAULT_BACKEND_URL = "http://localhost:3000";

export const backendApiConfig = {
  baseUrl: window.MISTRESS_X_API_URL || DEFAULT_BACKEND_URL,
};

async function request(path, { method = "GET", userId, body } = {}) {
  const response = await fetch(`${backendApiConfig.baseUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(userId ? { "x-user-id": userId } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message = data?.message || `Request failed: ${response.status}`;
    throw new Error(Array.isArray(message) ? message.join(", ") : message);
  }

  return data;
}

export const walletApi = {
  getBalance(userId) {
    return request("/wallet", { userId });
  },

  getTransactions(userId) {
    return request("/wallet/transactions", { userId });
  },

  topUp(userId, amount) {
    return request("/top-ups/intents", {
      method: "POST",
      userId,
      body: {
        amountCredits: amount,
        provider: "card",
        purpose: "wallet_top_up",
        metadataJson: {
          source: "legacy_backend_api_wallet_topup",
        },
      },
    });
  },

  sendGift(userId, { targetUserId, amount, giftId }) {
    return request("/wallet/gift", {
      method: "POST",
      userId,
      body: { targetUserId, amount, giftId },
    });
  },

  unlockChat(userId, { targetUserId, amount, roomId }) {
    return request("/chat/unlock", {
      method: "POST",
      userId,
      body: { targetUserId, cost: amount, roomId },
    });
  },
};
