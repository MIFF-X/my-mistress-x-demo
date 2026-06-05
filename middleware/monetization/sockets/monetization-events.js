export const MONETIZATION_SOCKET_EVENTS = Object.freeze({
  TIP_CREATED: "monetization.tip.created",
  PPV_UNLOCKED: "monetization.ppv.unlocked",
  SUBSCRIPTION_UPDATED: "monetization.subscription.updated",
  PROVIDER_STATUS_UPDATED: "monetization.provider.status.updated",
  WALLET_LEDGER_UPDATED: "monetization.wallet.ledger.updated"
});

export function isMonetizationSocketEvent(type) {
  return Object.values(MONETIZATION_SOCKET_EVENTS).includes(type);
}

export function createMonetizationEventPayload(type, payload = {}, meta = {}) {
  if (!isMonetizationSocketEvent(type)) {
    throw new Error(`Unknown monetization socket event: ${type}`);
  }

  return {
    id: meta.id || `monetization-${Date.now()}`,
    type,
    payload,
    source: meta.source || "frontend-middleware",
    createdAt: meta.createdAt || new Date().toISOString()
  };
}

export function publishMonetizationSocketEvent(socket, type, payload = {}, meta = {}) {
  const event = createMonetizationEventPayload(type, payload, meta);

  if (socket && typeof socket.emit === "function") {
    socket.emit(type, event);
  }

  return event;
}
