function shortValue(value, length = 16) {
  const text = String(value || "");
  return text.length > length ? `${text.slice(0, length)}...` : text;
}

function bookingReceiptFallback(booking = {}) {
  const receipt = booking.raw?.receipt || {};
  const id = booking.receiptId || receipt.id;
  if (!id) return null;

  return {
    id,
    amountCredits: receipt.amountCredits ?? booking.credits ?? null,
    durationMinutes: receipt.durationMinutes ?? booking.minutes ?? null,
    walletTransactionId: receipt.walletTransactionId ?? booking.raw?.walletTransactionId ?? null,
    receiptUrl: booking.receiptUrl || receipt.receiptUrl || null,
    status: receipt.status || null,
    purpose: receipt.purpose || null,
  };
}

export function normalizeAfterLiveReceiptPanelState(input = {}) {
  const result = input.result || {};
  const receipts = input.receipts || result.receipts || [];
  const documentPacket = input.document || result.document || null;
  const verification = input.verification || (typeof result.valid === "boolean" ? result : null);
  const delivery = input.delivery || result.delivery || null;
  const receipt =
    input.receipt ||
    documentPacket?.receipt ||
    (Array.isArray(receipts) ? receipts[0] : null) ||
    bookingReceiptFallback(input.booking);

  return {
    booking: input.booking || null,
    receipts: Array.isArray(receipts) ? receipts : [],
    receipt,
    document: documentPacket,
    verification,
    delivery,
    message: input.message || "",
  };
}

export function createAfterLiveReceiptPanel(input = {}) {
  const state = normalizeAfterLiveReceiptPanelState(input);
  const panel = document.createElement("div");
  panel.className = [
    "after-live-receipt-panel",
    state.verification && state.verification.valid === false ? "has-error" : null,
    state.verification?.valid || state.document || state.delivery ? "is-ready" : null,
  ]
    .filter(Boolean)
    .join(" ");

  const title = document.createElement("strong");
  title.innerText = state.receipt ? "Receipt panel" : "Receipt panel";

  const text = document.createElement("p");
  if (state.message) {
    text.innerText = state.message;
  } else if (!state.booking?.backend) {
    text.innerText = "Sync this booking to backend before receipt tools can load receipt details.";
  } else if (!state.receipt) {
    text.innerText = "No receipt loaded yet. List receipts to load the latest receipt details.";
  } else {
    text.innerText = `${state.receipt.amountCredits ?? state.booking?.credits ?? 0} credits receipt is ready for review.`;
  }

  const metadata = document.createElement("small");
  metadata.innerText = [
    state.receipt?.id ? `Receipt: ${state.receipt.id}` : null,
    state.receipts.length ? `Loaded: ${state.receipts.length}` : null,
    state.receipt?.walletTransactionId ? `Wallet TX: ${state.receipt.walletTransactionId}` : null,
    state.receipt?.durationMinutes ? `Duration: ${state.receipt.durationMinutes} min` : null,
    state.document?.fileName ? `Packet: ${state.document.fileName}` : null,
    state.document?.signature?.digest ? `Signature: ${shortValue(state.document.signature.digest)}` : null,
    state.verification ? `Verification: ${state.verification.valid ? "verified" : "failed"}` : null,
    state.delivery ? `Delivery: ${state.delivery.status || "queued"} via ${state.delivery.channel || "IN_APP"}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  panel.appendChild(title);
  panel.appendChild(text);
  if (metadata.innerText) panel.appendChild(metadata);

  return panel;
}

export function renderAfterLiveReceiptPanel(slot, input = {}) {
  ensureAfterLiveReceiptPanelStyles();
  slot.innerHTML = "";
  slot.appendChild(createAfterLiveReceiptPanel(input));
}

export function ensureAfterLiveReceiptPanelStyles() {
  if (document.getElementById("after-live-receipt-panel-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-receipt-panel-styles";
  style.textContent = `
    .after-live-receipt-panel-slot {
      width: 100%;
      flex-basis: 100%;
    }

    .after-live-receipt-panel {
      border: 1px solid rgba(29, 158, 117, 0.32);
      border-radius: 14px;
      padding: 10px;
      background: rgba(29, 158, 117, 0.08);
      margin: 8px 0 0;
    }

    .after-live-receipt-panel.is-ready {
      border-color: rgba(127, 119, 221, 0.38);
      background: rgba(127, 119, 221, 0.1);
    }

    .after-live-receipt-panel.has-error {
      border-color: rgba(255, 0, 85, 0.35);
      background: rgba(255, 0, 85, 0.08);
    }

    .after-live-receipt-panel p {
      margin: 6px 0;
      color: rgba(255, 255, 255, 0.76);
      font-size: 13px;
    }

    .after-live-receipt-panel small {
      display: block;
      color: rgba(255, 255, 255, 0.56);
      font-size: 11px;
    }
  `;
  document.head.appendChild(style);
}
