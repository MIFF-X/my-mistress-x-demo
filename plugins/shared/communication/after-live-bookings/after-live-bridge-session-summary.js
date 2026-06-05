function normalizeBridgeSummaryStatus(status) {
  const normalized = String(status || "unknown").toLowerCase();
  return normalized === "ready" ? "prepared" : normalized;
}

export function normalizeAfterLiveBridgeSession(result = {}) {
  const session = result.session || result.bridgeSession || result;
  const providerDispatchStatus = session.providerDispatchStatus || result.providerDispatchStatus || null;
  const status = String(providerDispatchStatus || "").toLowerCase() === "failed"
    ? "failed"
    : normalizeBridgeSummaryStatus(session.status || result.status);

  return {
    id: session.id || session.sessionId || session.providerSessionId || null,
    bookingId: session.bookingId || result.bookingId || null,
    status,
    provider: session.providerName || session.provider || result.provider || "bridge provider",
    providerSessionId: session.providerSessionId || null,
    providerCallSid: session.providerCallSid || null,
    providerDispatchStatus,
    providerDispatchError: session.providerDispatchError || result.providerDispatchError || null,
    joinUrl: session.providerJoinUrl || session.providerConnectUrl || session.videoRoomUrl || session.joinUrl || result.providerJoinUrl || result.providerConnectUrl || result.joinUrl || null,
    connectedAt: session.connectedAt || null,
    disconnectedAt: session.disconnectedAt || null,
    autoDisconnectAt: session.autoDisconnectAt || null,
    receiptId: session.receiptId || result.receiptId || null,
    walletTransactionId: session.walletTransactionId || result.walletTransactionId || null,
    bookingCompletion: result.bookingCompletion || null,
    raw: result,
  };
}

export function bridgeSessionStatusText(result = {}) {
  const session = normalizeAfterLiveBridgeSession(result);
  const label = session.status.replace(/_/g, " ");

  if (session.joinUrl) return `${session.provider} bridge ${label}: ${session.joinUrl}`;
  if (session.autoDisconnectAt) return `${session.provider} bridge ${label}. Auto-disconnect: ${session.autoDisconnectAt}`;
  if (session.disconnectedAt) return `${session.provider} bridge ${label}. Disconnected: ${session.disconnectedAt}`;
  if (session.connectedAt) return `${session.provider} bridge ${label}. Connected: ${session.connectedAt}`;
  return `${session.provider} bridge ${label}.`;
}

export function createAfterLiveBridgeSessionSummary(result = {}) {
  const session = normalizeAfterLiveBridgeSession(result);
  const hasSession = session.id || session.status !== "unknown" || session.joinUrl || session.providerSessionId;
  if (!hasSession) return null;

  const summary = document.createElement("div");
  summary.className = `after-live-bridge-session-summary bridge-status-${session.status}`;

  const title = document.createElement("strong");
  title.innerText = "Bridge session";

  const text = document.createElement("p");
  text.innerText = bridgeSessionStatusText(result);

  const meta = document.createElement("small");
  meta.innerText = [
    session.id ? `Session: ${session.id}` : null,
    session.providerSessionId ? `Provider session: ${session.providerSessionId}` : null,
    session.providerCallSid ? `Call SID: ${session.providerCallSid}` : null,
    session.providerDispatchStatus ? `Dispatch: ${session.providerDispatchStatus}` : null,
    session.receiptId ? `Receipt: ${session.receiptId}` : null,
    session.walletTransactionId ? `Wallet TX: ${session.walletTransactionId}` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  summary.appendChild(title);
  summary.appendChild(text);
  if (meta.innerText) summary.appendChild(meta);

  return summary;
}

export function ensureAfterLiveBridgeSessionSummaryStyles() {
  if (document.getElementById("after-live-bridge-session-summary-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-bridge-session-summary-styles";
  style.textContent = `
    .after-live-bridge-session-summary {
      border: 1px solid rgba(127, 119, 221, 0.35);
      border-radius: 14px;
      padding: 10px;
      background: rgba(127, 119, 221, 0.1);
      margin: 10px 0;
    }

    .after-live-bridge-session-summary.bridge-status-connected,
    .after-live-bridge-session-summary.bridge-status-active {
      border-color: rgba(29, 158, 117, 0.35);
      background: rgba(29, 158, 117, 0.1);
    }

    .after-live-bridge-session-summary.bridge-status-failed,
    .after-live-bridge-session-summary.bridge-status-expired {
      border-color: rgba(255, 0, 85, 0.35);
      background: rgba(255, 0, 85, 0.08);
    }

    .after-live-bridge-session-summary p {
      margin: 6px 0;
      color: rgba(255, 255, 255, 0.76);
      font-size: 13px;
    }

    .after-live-bridge-session-summary small {
      display: block;
      color: rgba(255, 255, 255, 0.56);
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}
