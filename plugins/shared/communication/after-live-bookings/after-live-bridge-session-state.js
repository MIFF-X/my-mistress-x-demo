import { normalizeAfterLiveBridgeSession } from "./after-live-bridge-session-summary.js";

export function normalizeAfterLiveBookingBridgeStatus(status) {
  const normalized = String(status || "unknown").toLowerCase();
  return normalized === "ready" ? "prepared" : normalized;
}

export function buildAfterLiveBookingBridgeState(result = {}) {
  const session = normalizeAfterLiveBridgeSession(result);
  const hasSession = session.id || session.providerSessionId || session.status !== "unknown";
  if (!hasSession) return null;
  const providerDispatchStatus = String(session.providerDispatchStatus || "").toLowerCase();

  return {
    ...session,
    status: providerDispatchStatus === "failed" ? "failed" : normalizeAfterLiveBookingBridgeStatus(session.status),
    updatedAt: result.updatedAt || result.session?.updatedAt || result.bridgeSession?.updatedAt || Date.now(),
  };
}
