import {
  createAfterLiveCancellationSummary,
  ensureAfterLiveCancellationSummaryStyles
} from "../../plugins/shared/communication/after-live-bookings/after-live-cancellation-summary.js";
import {
  createAfterLiveBridgeSessionSummary,
  ensureAfterLiveBridgeSessionSummaryStyles
} from "../../plugins/shared/communication/after-live-bookings/after-live-bridge-session-summary.js";
import {
  createAfterLiveHybridModeLegend,
  ensureAfterLiveHybridModeLegendStyles
} from "../../plugins/shared/communication/after-live-bookings/after-live-hybrid-mode-legend.js";
import {
  ensureAfterLiveReceiptPanelStyles,
  renderAfterLiveReceiptPanel
} from "../../plugins/shared/communication/after-live-bookings/after-live-receipt-panel.js";
import {
  deliverAfterLiveBookingReceiptInApi,
  disconnectAfterLiveBookingBridgeInApi,
  downloadAfterLiveBookingReceiptInApi,
  listAfterLiveBookingReceiptsInApi,
  prepareAfterLiveBookingBridgeInApi,
  startAfterLiveBookingBridgeInApi,
  verifyAfterLiveBookingReceiptInApi
} from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-api.js";
import {
  getAfterLiveBookings,
  syncAfterLiveBookingsFromApi,
  updateAfterLiveBookingBridgeSession
} from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import { formatAfterLiveApprovedSlot } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-slots.js";

function formatTime(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleString() : "Not set";
}

function createStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `booking-status-badge booking-status-${status || "pending"}`;
  badge.innerText = status || "pending";
  return badge;
}

function createRefundNotice(booking) {
  const notice = document.createElement("div");
  notice.className = booking.refundedAt ? "sub-booking-refund-notice is-refunded" : "sub-booking-refund-notice";

  if (booking.refundedAt) {
    notice.innerHTML = `<strong>Refund returned</strong><p>${booking.credits || 0} credits were returned to your demo wallet on ${formatTime(booking.refundedAt)}.</p>`;
  } else if (booking.status === "declined") {
    notice.innerHTML = `<strong>No automatic refund recorded</strong><p>This request was declined without a recorded credit return.</p>`;
  } else {
    notice.innerHTML = `<strong>Refund status</strong><p>No refund needed while the request is ${booking.status || "pending"}.</p>`;
  }

  return notice;
}

function renderBridgeSessionSummary(slot, result) {
  slot.innerHTML = "";
  const summary = createAfterLiveBridgeSessionSummary(result);
  if (!summary) return false;
  slot.appendChild(summary);
  return true;
}

function createBridgeButton(label, className, action) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.innerText = label;
  button.onclick = action;
  return button;
}

function createBridgeActions(booking) {
  const wrap = document.createElement("div");
  wrap.className = "sub-booking-bridge-actions";

  const status = document.createElement("p");
  status.className = "sub-booking-sync-status";
  const sessionSlot = document.createElement("div");
  sessionSlot.className = "sub-booking-bridge-session-slot";

  if (booking.status !== "approved") {
    status.innerText = booking.bridgeSession
      ? "Latest synced bridge session state."
      : "Call bridge unlocks once this booking is approved.";
    if (booking.bridgeSession) renderBridgeSessionSummary(sessionSlot, { bridgeSession: booking.bridgeSession });
    wrap.appendChild(status);
    wrap.appendChild(sessionSlot);
    return wrap;
  }

  if (!booking.backend) {
    status.innerText = "Approved local booking: sync before starting a real bridge.";
    wrap.appendChild(
      createBridgeButton("Sync Required", "button-secondary", () => {
        status.innerText = "Local demo booking: backend bridge will connect once this booking is synced to API.";
      })
    );
    wrap.appendChild(status);
    return wrap;
  }

  const prepareBtn = createBridgeButton("Prepare Bridge", "button-secondary", async () => {
    prepareBtn.innerText = "Preparing...";
    try {
      const result = await prepareAfterLiveBookingBridgeInApi(booking.id);
      updateAfterLiveBookingBridgeSession(booking.id, result);
      const rendered = renderBridgeSessionSummary(sessionSlot, result);
      status.innerText = rendered ? "Bridge session prepared." : "Bridge request sent.";
      prepareBtn.innerText = "Prepared";
    } catch (error) {
      status.innerText = `Prepare failed: ${error instanceof Error ? error.message : "unknown error"}`;
      prepareBtn.innerText = "Retry Prepare";
    }
  });

  const startBtn = createBridgeButton(
    booking.type === "video" ? "Start Video Bridge" : "Start Phone Bridge",
    "button-primary",
    async () => {
      startBtn.innerText = "Connecting...";
      try {
        const result = await startAfterLiveBookingBridgeInApi(booking.id);
        updateAfterLiveBookingBridgeSession(booking.id, result);
        const rendered = renderBridgeSessionSummary(sessionSlot, result);
        status.innerText = rendered ? "Bridge session connected." : "Bridge request sent.";
        startBtn.innerText = "Bridge Connected";
      } catch (error) {
        status.innerText = `Bridge failed: ${error instanceof Error ? error.message : "unknown error"}`;
        startBtn.innerText = "Retry Bridge";
      }
    }
  );

  const disconnectBtn = createBridgeButton("Disconnect Bridge", "button-secondary", async () => {
    disconnectBtn.innerText = "Disconnecting...";
    try {
      const result = await disconnectAfterLiveBookingBridgeInApi(booking.id);
      updateAfterLiveBookingBridgeSession(booking.id, result);
      const rendered = renderBridgeSessionSummary(sessionSlot, result);
      status.innerText = rendered ? "Bridge session disconnected." : "Bridge request sent.";
      disconnectBtn.innerText = "Disconnected";
      await syncAfterLiveBookingsFromApi();
    } catch (error) {
      status.innerText = `Disconnect failed: ${error instanceof Error ? error.message : "unknown error"}`;
      disconnectBtn.innerText = "Retry Disconnect";
    }
  });

  status.innerText = "Approved backend booking: prepare, connect, or disconnect the bridge.";
  if (booking.bridgeSession) renderBridgeSessionSummary(sessionSlot, { bridgeSession: booking.bridgeSession });
  wrap.appendChild(prepareBtn);
  wrap.appendChild(startBtn);
  wrap.appendChild(disconnectBtn);
  wrap.appendChild(status);
  wrap.appendChild(sessionSlot);
  return wrap;
}

function getPrimaryReceiptId(booking, receipts = []) {
  return booking.receiptId || booking.raw?.receipt?.id || receipts?.[0]?.id || null;
}

function createReceiptActions(booking) {
  const wrap = document.createElement("div");
  wrap.className = "sub-booking-receipt-actions";

  const status = document.createElement("p");
  status.className = "sub-booking-sync-status";
  status.innerText = booking.backend
    ? "Receipts are available after backend booking creation."
    : "Local demo booking: receipt tools activate after API sync.";

  const receiptsState = { receipts: [] };
  const receiptPanelState = { booking, receipts: receiptsState.receipts, message: status.innerText };
  const receiptPanelSlot = document.createElement("div");
  receiptPanelSlot.className = "after-live-receipt-panel-slot";
  const updateReceiptPanel = (updates = {}) => {
    Object.assign(receiptPanelState, updates);
    renderAfterLiveReceiptPanel(receiptPanelSlot, receiptPanelState);
  };

  const listBtn = createBridgeButton("List Receipts", "button-secondary", async () => {
    if (!booking.backend) {
      status.innerText = "Sync this local booking to backend before listing receipts.";
      updateReceiptPanel({ message: status.innerText });
      return;
    }

    listBtn.innerText = "Loading...";
    try {
      const result = await listAfterLiveBookingReceiptsInApi(booking.id);
      receiptsState.receipts = result?.receipts || [];
      status.innerText = receiptsState.receipts.length
        ? `Found ${receiptsState.receipts.length} receipt(s). Latest: ${receiptsState.receipts[0].id}`
        : "No receipts found yet.";
      updateReceiptPanel({
        receipts: receiptsState.receipts,
        receipt: receiptsState.receipts[0] || null,
        document: null,
        verification: null,
        delivery: null,
        message: status.innerText,
      });
      listBtn.innerText = "Receipts Loaded";
    } catch (error) {
      status.innerText = `Receipt list failed: ${error instanceof Error ? error.message : "unknown error"}`;
      updateReceiptPanel({ message: status.innerText });
      listBtn.innerText = "Retry Receipts";
    }
  });

  const downloadBtn = createBridgeButton("Download Receipt", "button-secondary", async () => {
    const receiptId = getPrimaryReceiptId(booking, receiptsState.receipts);
    if (!receiptId) {
      status.innerText = "No receipt id available yet. Try List Receipts first.";
      updateReceiptPanel({ message: status.innerText });
      return;
    }

    downloadBtn.innerText = "Downloading...";
    try {
      const result = await downloadAfterLiveBookingReceiptInApi(receiptId);
      const digest = result?.document?.signature?.digest;
      status.innerText = digest ? `Receipt downloaded. Signature: ${digest.slice(0, 12)}...` : "Receipt downloaded.";
      updateReceiptPanel({
        receipt: result?.document?.receipt || receiptPanelState.receipt,
        document: result?.document || null,
        message: status.innerText,
      });
      downloadBtn.innerText = "Downloaded";
    } catch (error) {
      status.innerText = `Download failed: ${error instanceof Error ? error.message : "unknown error"}`;
      updateReceiptPanel({ message: status.innerText });
      downloadBtn.innerText = "Retry Download";
    }
  });

  const verifyBtn = createBridgeButton("Verify Receipt", "button-secondary", async () => {
    const receiptId = getPrimaryReceiptId(booking, receiptsState.receipts);
    if (!receiptId) {
      status.innerText = "No receipt id available yet. Try List Receipts first.";
      updateReceiptPanel({ message: status.innerText });
      return;
    }

    verifyBtn.innerText = "Verifying...";
    try {
      const result = await verifyAfterLiveBookingReceiptInApi(receiptId);
      status.innerText = result?.valid ? "Receipt signature verified." : "Receipt verification returned not valid.";
      updateReceiptPanel({
        verification: result || null,
        message: status.innerText,
      });
      verifyBtn.innerText = "Verified";
    } catch (error) {
      status.innerText = `Verify failed: ${error instanceof Error ? error.message : "unknown error"}`;
      updateReceiptPanel({ message: status.innerText });
      verifyBtn.innerText = "Retry Verify";
    }
  });

  const deliverBtn = createBridgeButton("Deliver Receipt", "button-secondary", async () => {
    const receiptId = getPrimaryReceiptId(booking, receiptsState.receipts);
    if (!receiptId) {
      status.innerText = "No receipt id available yet. Try List Receipts first.";
      updateReceiptPanel({ message: status.innerText });
      return;
    }

    deliverBtn.innerText = "Delivering...";
    try {
      const result = await deliverAfterLiveBookingReceiptInApi(receiptId, { channel: "IN_APP" });
      status.innerText = result?.delivery?.id ? `Receipt delivery queued: ${result.delivery.id}` : "Receipt delivery queued.";
      updateReceiptPanel({
        receipt: result?.document?.receipt || receiptPanelState.receipt,
        document: result?.document || receiptPanelState.document || null,
        delivery: result?.delivery || null,
        message: status.innerText,
      });
      deliverBtn.innerText = "Delivered";
    } catch (error) {
      status.innerText = `Deliver failed: ${error instanceof Error ? error.message : "unknown error"}`;
      updateReceiptPanel({ message: status.innerText });
      deliverBtn.innerText = "Retry Deliver";
    }
  });

  wrap.appendChild(listBtn);
  wrap.appendChild(downloadBtn);
  wrap.appendChild(verifyBtn);
  wrap.appendChild(deliverBtn);
  wrap.appendChild(status);
  updateReceiptPanel();
  wrap.appendChild(receiptPanelSlot);
  return wrap;
}

function createBookingCard(booking) {
  const card = document.createElement("div");
  card.className = `panel sub-after-live-booking-card booking-status-${booking.status || "pending"}`;

  const top = document.createElement("div");
  top.className = "sub-booking-card-top";

  const title = document.createElement("h3");
  title.innerText = `${booking.type === "video" ? "🎥" : "📞"} ${booking.type || "phone"} booking`;

  const sourceBadge = document.createElement("span");
  sourceBadge.className = "sub-booking-source-badge";
  sourceBadge.innerText = booking.backend ? "Backend" : "Local";

  const badgeRow = document.createElement("div");
  badgeRow.className = "sub-booking-badge-row";
  badgeRow.appendChild(createStatusBadge(booking.status));
  badgeRow.appendChild(sourceBadge);

  top.appendChild(title);
  top.appendChild(badgeRow);

  const approvedSlotLabel = formatAfterLiveApprovedSlot(booking);
  const details = document.createElement("p");
  details.innerHTML = `
    <strong>Room:</strong> ${booking.roomId || "Unknown"}<br>
    <strong>Mistress:</strong> ${booking.host || "Mistress"}<br>
    <strong>Length:</strong> ${booking.minutes || 0} minutes<br>
    <strong>Credits paid:</strong> ${booking.credits || 0}<br>
    <strong>Receipt:</strong> ${booking.receiptId || booking.raw?.receipt?.id || "Not loaded"}<br>
    <strong>Requested:</strong> ${formatTime(booking.createdAt)}<br>
    <strong>Approved slot:</strong> ${approvedSlotLabel || "Not scheduled yet"}<br>
    <strong>Updated:</strong> ${formatTime(booking.updatedAt)}
  `;

  const note = document.createElement("div");
  note.className = "sub-booking-mistress-note";
  note.innerHTML = `<strong>Mistress note</strong><p>${booking.mistressNote || "No note from Mistress yet."}</p>`;

  const next = document.createElement("p");
  next.className = "sub-booking-next-step";

  if (booking.status === "approved") {
    next.innerText = approvedSlotLabel
      ? `Approved. Be ready at: ${approvedSlotLabel}. Open messages or use the bridge actions when Mistress starts the call.`
      : "Approved. Open messages at the agreed time or use the bridge actions when Mistress starts the call.";
  } else if (booking.status === "declined") {
    next.innerText = booking.refundedAt
      ? "Declined. Your booking credits have been returned to your demo wallet."
      : "Declined. No automatic refund has been recorded yet.";
  } else if (booking.status === "completed") {
    next.innerText = "Completed. Session has been marked complete.";
  } else {
    next.innerText = "Pending Mistress approval.";
  }

  const cancellationSummary = createAfterLiveCancellationSummary(booking);

  card.appendChild(top);
  card.appendChild(details);
  card.appendChild(note);
  if (cancellationSummary) card.appendChild(cancellationSummary);
  card.appendChild(createRefundNotice(booking));
  card.appendChild(createBridgeActions(booking));
  card.appendChild(createReceiptActions(booking));
  card.appendChild(next);

  return card;
}

function ensureSubBookingStyles() {
  if (document.getElementById("sub-after-live-booking-styles")) return;

  const style = document.createElement("style");
  style.id = "sub-after-live-booking-styles";
  style.textContent = `
    .sub-after-live-booking-list {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }

    .sub-booking-card-top,
    .sub-booking-controls,
    .sub-booking-bridge-actions,
    .sub-booking-receipt-actions {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .sub-booking-bridge-session-slot {
      width: 100%;
      flex-basis: 100%;
    }

    .sub-booking-card-top h3 {
      margin: 0;
    }

    .sub-booking-badge-row {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .booking-status-badge,
    .sub-booking-source-badge {
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .sub-booking-source-badge {
      background: rgba(127, 119, 221, 0.14);
      color: #c6c1ff;
      border: 1px solid rgba(127, 119, 221, 0.36);
    }

    .booking-status-pending {
      background: rgba(255, 193, 7, 0.12);
      color: #ffe08a;
      border: 1px solid rgba(255, 193, 7, 0.35);
    }

    .booking-status-approved {
      background: rgba(29, 158, 117, 0.14);
      color: #9ff5d3;
      border: 1px solid rgba(29, 158, 117, 0.36);
    }

    .booking-status-declined {
      background: rgba(255, 0, 85, 0.12);
      color: #ff9dbc;
      border: 1px solid rgba(255, 0, 85, 0.36);
    }

    .booking-status-completed {
      background: rgba(127, 119, 221, 0.14);
      color: #c6c1ff;
      border: 1px solid rgba(127, 119, 221, 0.36);
    }

    .sub-booking-mistress-note,
    .sub-booking-refund-notice {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.18);
      margin: 10px 0;
    }

    .sub-booking-refund-notice.is-refunded {
      border-color: rgba(29, 158, 117, 0.35);
      background: rgba(29, 158, 117, 0.1);
    }

    .sub-booking-mistress-note p,
    .sub-booking-refund-notice p {
      margin: 6px 0 0;
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
    }

    .sub-booking-next-step,
    .sub-booking-sync-status {
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
    }
  `;

  document.head.appendChild(style);
}

function renderBookingList(list) {
  list.innerHTML = "";
  const bookings = getAfterLiveBookings();

  if (bookings.length === 0) {
    const empty = document.createElement("div");
    empty.className = "panel";
    empty.innerText = "No after-live booking requests yet.";
    list.appendChild(empty);
  } else {
    bookings.forEach((booking) => list.appendChild(createBookingCard(booking)));
  }
}

export function createSubAfterLiveBookings() {
  ensureSubBookingStyles();
  ensureAfterLiveCancellationSummaryStyles();
  ensureAfterLiveBridgeSessionSummaryStyles();
  ensureAfterLiveHybridModeLegendStyles();
  ensureAfterLiveReceiptPanelStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell sub-after-live-bookings";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "📅 My After-Live Bookings";

  const intro = document.createElement("p");
  intro.innerText = "Track phone and video follow-up bookings requested after live sessions.";
  const legend = createAfterLiveHybridModeLegend();

  const controls = document.createElement("div");
  controls.className = "sub-booking-controls";

  const syncStatus = document.createElement("p");
  syncStatus.className = "sub-booking-sync-status";
  syncStatus.innerText = "Showing local demo bookings until backend sync is run.";

  const syncBtn = document.createElement("button");
  syncBtn.className = "button-secondary";
  syncBtn.innerText = "Sync My Bookings";

  const list = document.createElement("div");
  list.className = "sub-after-live-booking-list";

  syncBtn.onclick = async () => {
    syncBtn.innerText = "Syncing...";
    const result = await syncAfterLiveBookingsFromApi();
    syncStatus.innerText = result.ok
      ? `Synced ${result.bookings.length} booking(s) from backend API.`
      : `Backend unavailable. Showing local demo bookings. ${result.error || ""}`;
    syncBtn.innerText = result.ok ? "Synced" : "Retry Sync";
    renderBookingList(list);
  };

  controls.appendChild(syncBtn);
  controls.appendChild(syncStatus);
  renderBookingList(list);

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(legend);
  shell.appendChild(controls);
  shell.appendChild(list);

  return shell;
}
