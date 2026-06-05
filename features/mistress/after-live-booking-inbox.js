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
  approveAfterLiveBookingInApi,
  cancelAfterLiveBookingInApi,
  completeAfterLiveBookingInApi,
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
  refundDemoWallet,
  saveAfterLiveBooking,
  syncAfterLiveBookingsFromApi,
  updateAfterLiveBookingBridgeSession,
  updateAfterLiveBooking
} from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import {
  formatAfterLiveApprovedSlot,
  toAfterLiveDatetimeLocalValue
} from "../../plugins/shared/communication/after-live-bookings/after-live-booking-slots.js";

function refundBookingCredits(booking) {
  if (booking.refundedAt || booking.status === "completed") return false;
  refundDemoWallet(booking.credits || 0);
  return true;
}

export { getAfterLiveBookings, saveAfterLiveBooking };

function updateBooking(bookingId, updates) {
  return updateAfterLiveBooking(bookingId, updates);
}

function updateBookingStatus(bookingId, status, extra = {}) {
  return updateBooking(bookingId, { status, ...extra });
}

async function runBookingAction({ booking, localAction, apiAction, refresh, statusNode }) {
  localAction();

  if (!booking.backend) {
    refresh();
    return;
  }

  try {
    statusNode.innerText = "Backend API updated.";
    await apiAction();
    await syncAfterLiveBookingsFromApi();
  } catch (error) {
    statusNode.innerText = `Backend update failed; local action kept. ${error instanceof Error ? error.message : ""}`;
  }

  refresh();
}

function formatTime(timestamp) {
  return timestamp ? new Date(timestamp).toLocaleString() : "Not set";
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

function createHostBridgeControls(booking) {
  const wrap = document.createElement("div");
  wrap.className = "booking-host-bridge-controls";

  const status = document.createElement("p");
  status.className = "booking-sync-status";
  const sessionSlot = document.createElement("div");
  sessionSlot.className = "booking-host-bridge-session-slot";

  if (booking.status !== "approved") {
    status.innerText = booking.bridgeSession
      ? "Latest synced bridge session state."
      : "Host bridge controls unlock once the booking is approved.";
    if (booking.bridgeSession) renderBridgeSessionSummary(sessionSlot, { bridgeSession: booking.bridgeSession });
    wrap.appendChild(status);
    wrap.appendChild(sessionSlot);
    return wrap;
  }

  if (!booking.backend) {
    status.innerText = "Local demo booking: sync to backend before using real bridge controls.";
    wrap.appendChild(
      createBridgeButton("Sync Required", "button-secondary", () => {
        status.innerText = "Use Sync Backend Bookings once this booking exists in the API.";
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

  const connectBtn = createBridgeButton(
    booking.type === "video" ? "Connect Video Bridge" : "Connect Phone Bridge",
    "button-primary",
    async () => {
      connectBtn.innerText = "Connecting...";
      try {
        const result = await startAfterLiveBookingBridgeInApi(booking.id);
        updateAfterLiveBookingBridgeSession(booking.id, result);
        const rendered = renderBridgeSessionSummary(sessionSlot, result);
        status.innerText = rendered ? "Bridge session connected." : "Bridge request sent.";
        connectBtn.innerText = "Bridge Connected";
      } catch (error) {
        status.innerText = `Connect failed: ${error instanceof Error ? error.message : "unknown error"}`;
        connectBtn.innerText = "Retry Connect";
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

  status.innerText = "Approved backend booking: host can prepare, connect, or disconnect the bridge.";
  if (booking.bridgeSession) renderBridgeSessionSummary(sessionSlot, { bridgeSession: booking.bridgeSession });
  wrap.appendChild(prepareBtn);
  wrap.appendChild(connectBtn);
  wrap.appendChild(disconnectBtn);
  wrap.appendChild(status);
  wrap.appendChild(sessionSlot);
  return wrap;
}

function getPrimaryReceiptId(booking, receipts = []) {
  return booking.receiptId || booking.raw?.receipt?.id || receipts?.[0]?.id || null;
}

function createReceiptButton(label, action) {
  return createBridgeButton(label, "button-secondary", action);
}

function createHostReceiptControls(booking) {
  const wrap = document.createElement("div");
  wrap.className = "booking-host-receipt-controls";

  const status = document.createElement("p");
  status.className = "booking-sync-status";
  status.innerText = booking.backend
    ? "Booking receipts can be listed, downloaded, verified, or delivered."
    : "Local demo booking: sync to backend before using receipt tools.";

  const receiptsState = { receipts: [] };
  const receiptPanelState = { booking, receipts: receiptsState.receipts, message: status.innerText };
  const receiptPanelSlot = document.createElement("div");
  receiptPanelSlot.className = "after-live-receipt-panel-slot";
  const updateReceiptPanel = (updates = {}) => {
    Object.assign(receiptPanelState, updates);
    renderAfterLiveReceiptPanel(receiptPanelSlot, receiptPanelState);
  };

  const listBtn = createReceiptButton("List Receipts", async () => {
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

  const downloadBtn = createReceiptButton("Download Receipt", async () => {
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

  const verifyBtn = createReceiptButton("Verify Receipt", async () => {
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

  const deliverBtn = createReceiptButton("Deliver Receipt", async () => {
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

function createField(labelText, value = "", placeholder = "", options = {}) {
  const label = document.createElement("label");
  label.className = "booking-approval-field";

  const labelTitle = document.createElement("span");
  labelTitle.innerText = labelText;

  const input = document.createElement("input");
  input.type = options.type || "text";
  input.value = value;
  input.placeholder = placeholder;

  label.appendChild(labelTitle);
  label.appendChild(input);

  return { label, input };
}

function dateTimeInputToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function dateTimeInputToSlotLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function createApprovedSlotPicker(booking) {
  const picker = createField(
    "Approved slot",
    toAfterLiveDatetimeLocalValue(booking.scheduledAt || booking.approvedSlotIso || booking.approvedSlot),
    "",
    { type: "datetime-local" }
  );
  const quickRow = document.createElement("div");
  quickRow.className = "booking-slot-quick-row";

  const quickSlots = [
    { label: "Tonight 9 PM", offsetDays: 0, hour: 21 },
    { label: "Tomorrow 9 PM", offsetDays: 1, hour: 21 },
    { label: "+2 days 8 PM", offsetDays: 2, hour: 20 },
  ];

  quickSlots.forEach((slot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "button-secondary";
    button.innerText = slot.label;
    button.onclick = () => {
      const date = new Date();
      date.setDate(date.getDate() + slot.offsetDays);
      date.setHours(slot.hour, 0, 0, 0);
      picker.input.value = toAfterLiveDatetimeLocalValue(date.toISOString());
    };
    quickRow.appendChild(button);
  });

  picker.label.appendChild(quickRow);

  return {
    label: picker.label,
    input: picker.input,
    approvedSlot() {
      return dateTimeInputToSlotLabel(picker.input.value);
    },
    scheduledAt() {
      return dateTimeInputToIso(picker.input.value);
    },
  };
}

function createBookingCard(booking, refresh) {
  const card = document.createElement("div");
  card.className = `panel after-live-booking-card booking-status-${booking.status}`;

  const title = document.createElement("h3");
  title.innerText = `${booking.type === "video" ? "🎥" : "📞"} ${booking.type || "phone"} after-live booking`;

  const sourceBadge = document.createElement("p");
  sourceBadge.className = "booking-source-badge";
  sourceBadge.innerText = booking.backend ? "Source: backend API" : "Source: local demo store";

  const approvedSlotLabel = formatAfterLiveApprovedSlot(booking);
  const details = document.createElement("p");
  details.innerHTML = `
    <strong>Room:</strong> ${booking.roomId || "Unknown"}<br>
    <strong>Sub:</strong> ${booking.sub || booking.subUserId || "Sub"}<br>
    <strong>Host:</strong> ${booking.host || booking.hostUserId || "Mistress"}<br>
    <strong>Length:</strong> ${booking.minutes || 0} minutes<br>
    <strong>Credits:</strong> ${booking.credits || 0}<br>
    <strong>Receipt:</strong> ${booking.receiptId || booking.raw?.receipt?.id || "Not loaded"}<br>
    <strong>Status:</strong> ${booking.status || "pending"}<br>
    <strong>Requested:</strong> ${formatTime(booking.createdAt)}<br>
    <strong>Approved slot:</strong> ${approvedSlotLabel || "Not scheduled"}<br>
    <strong>Refunded:</strong> ${booking.refundedAt ? formatTime(booking.refundedAt) : "No"}
  `;

  const scheduleRow = document.createElement("div");
  scheduleRow.className = "booking-approval-grid";

  const slotField = createApprovedSlotPicker(booking);
  const noteField = createField("Mistress note", booking.mistressNote || "", "Add instructions or timing note");

  scheduleRow.appendChild(slotField.label);
  scheduleRow.appendChild(noteField.label);

  const refundNote = document.createElement("p");
  refundNote.className = "booking-refund-note";
  refundNote.innerText = booking.refundedAt
    ? `Refund already returned: ${booking.credits || 0} credits.`
    : "Declining can return the booking credits to the demo wallet.";

  const actionStatus = document.createElement("p");
  actionStatus.className = "booking-sync-status";
  actionStatus.innerText = booking.backend ? "Backend actions enabled." : "Local demo actions enabled.";

  const actions = document.createElement("div");
  actions.className = "button-row";

  const approveBtn = document.createElement("button");
  approveBtn.className = "button-primary";
  approveBtn.innerText = "Approve";
  approveBtn.onclick = () =>
    runBookingAction({
      booking,
      refresh,
      statusNode: actionStatus,
      localAction: () => {
        const approvedSlot = slotField.approvedSlot() || "To be confirmed";
        const scheduledAt = slotField.scheduledAt();
        updateBookingStatus(booking.id, "approved", {
          approvedSlot,
          scheduledAt,
          approvedSlotIso: scheduledAt,
          mistressNote: noteField.input.value || "Approved. Please be ready at the agreed time."
        });
      },
      apiAction: () => {
        const approvedSlot = slotField.approvedSlot() || "To be confirmed";
        const scheduledAt = slotField.scheduledAt();
        return approveAfterLiveBookingInApi({
          bookingId: booking.id,
          approvedSlot,
          scheduledAt,
          mistressNote: noteField.input.value || "Approved. Please be ready at the agreed time."
        });
      }
    });

  const declineBtn = document.createElement("button");
  declineBtn.className = "button-secondary";
  declineBtn.innerText = "Decline + Refund";
  declineBtn.onclick = () =>
    runBookingAction({
      booking,
      refresh,
      statusNode: actionStatus,
      localAction: () => {
        const refunded = refundBookingCredits(booking);
        updateBookingStatus(booking.id, "declined", {
          refundedAt: refunded ? Date.now() : booking.refundedAt,
          mistressNote:
            noteField.input.value ||
            (refunded
              ? `Declined by Mistress. ${booking.credits || 0} credits returned to wallet.`
              : "Declined by Mistress. Refund was already handled or not available.")
        });
      },
      apiAction: () =>
        cancelAfterLiveBookingInApi({
          bookingId: booking.id,
          refund: true,
          cancelReason: noteField.input.value || "Declined by Mistress with refund."
        })
    });

  const noRefundDeclineBtn = document.createElement("button");
  noRefundDeclineBtn.className = "button-secondary";
  noRefundDeclineBtn.innerText = "Decline No Refund";
  noRefundDeclineBtn.onclick = () =>
    runBookingAction({
      booking,
      refresh,
      statusNode: actionStatus,
      localAction: () => {
        updateBookingStatus(booking.id, "declined", {
          mistressNote: noteField.input.value || "Declined by Mistress without automatic credit return."
        });
      },
      apiAction: () =>
        cancelAfterLiveBookingInApi({
          bookingId: booking.id,
          refund: false,
          cancelReason: noteField.input.value || "Declined by Mistress without refund."
        })
    });

  const completeBtn = document.createElement("button");
  completeBtn.className = "button-secondary";
  completeBtn.innerText = "Mark Complete";
  completeBtn.onclick = () =>
    runBookingAction({
      booking,
      refresh,
      statusNode: actionStatus,
      localAction: () => {
        updateBookingStatus(booking.id, "completed", {
          mistressNote: noteField.input.value || booking.mistressNote || "Completed."
        });
      },
      apiAction: () => completeAfterLiveBookingInApi(booking.id)
    });

  const saveNoteBtn = document.createElement("button");
  saveNoteBtn.className = "button-secondary";
  saveNoteBtn.innerText = "Save Note";
  saveNoteBtn.onclick = () => {
    const scheduledAt = slotField.scheduledAt();
    updateBooking(booking.id, {
      approvedSlot: slotField.approvedSlot(),
      scheduledAt,
      approvedSlotIso: scheduledAt,
      mistressNote: noteField.input.value
    });
    refresh();
  };

  actions.appendChild(approveBtn);
  actions.appendChild(declineBtn);
  actions.appendChild(noRefundDeclineBtn);
  actions.appendChild(completeBtn);
  actions.appendChild(saveNoteBtn);

  const cancellationSummary = createAfterLiveCancellationSummary(booking);

  card.appendChild(title);
  card.appendChild(sourceBadge);
  card.appendChild(details);
  card.appendChild(scheduleRow);
  if (cancellationSummary) card.appendChild(cancellationSummary);
  card.appendChild(refundNote);
  card.appendChild(actionStatus);
  card.appendChild(actions);
  card.appendChild(createHostBridgeControls(booking));
  card.appendChild(createHostReceiptControls(booking));

  return card;
}

function ensureBookingInboxStyles() {
  if (document.getElementById("after-live-booking-inbox-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-inbox-styles";
  style.textContent = `
    .after-live-booking-list {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }

    .after-live-booking-card {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
    }

    .booking-approval-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin: 12px 0;
    }

    .booking-approval-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 12px;
      font-weight: 800;
      color: rgba(255,255,255,0.72);
    }

    .booking-approval-field input {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }

    .booking-slot-quick-row {
      display: flex;
      gap: 6px;
      flex-wrap: wrap;
    }

    .booking-slot-quick-row button {
      font-size: 11px;
      padding: 7px 9px;
    }

    .booking-host-bridge-controls,
    .booking-host-receipt-controls {
      display: flex;
      gap: 8px;
      align-items: flex-start;
      flex-wrap: wrap;
      margin-top: 12px;
    }

    .booking-host-bridge-session-slot {
      width: 100%;
      flex-basis: 100%;
    }

    .booking-refund-note,
    .booking-source-badge,
    .booking-sync-status {
      color: rgba(255,255,255,0.68);
      font-size: 13px;
    }
  `;

  document.head.appendChild(style);
}

export function createAfterLiveBookingInbox() {
  ensureBookingInboxStyles();
  ensureAfterLiveCancellationSummaryStyles();
  ensureAfterLiveBridgeSessionSummaryStyles();
  ensureAfterLiveHybridModeLegendStyles();
  ensureAfterLiveReceiptPanelStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell after-live-booking-inbox";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "📅 After-Live Booking Inbox";

  const intro = document.createElement("p");
  intro.innerText = "Review after-live phone and video booking requests from live rooms. Approve, decline, refund, schedule, add notes, bridge calls, receipts, or mark complete.";
  const legend = createAfterLiveHybridModeLegend();

  const controls = document.createElement("div");
  controls.className = "button-row";

  const syncStatus = document.createElement("p");
  syncStatus.className = "booking-sync-status";
  syncStatus.innerText = "Using local demo bookings until API sync is run.";

  const list = document.createElement("div");
  list.className = "after-live-booking-list";

  const render = () => {
    list.innerHTML = "";
    const bookings = getAfterLiveBookings();

    if (bookings.length === 0) {
      const empty = document.createElement("div");
      empty.className = "panel";
      empty.innerText = "No after-live booking requests yet.";
      list.appendChild(empty);
      return;
    }

    bookings.forEach((booking) => list.appendChild(createBookingCard(booking, render)));
  };

  const syncBtn = document.createElement("button");
  syncBtn.className = "button-secondary";
  syncBtn.innerText = "Sync Backend Bookings";
  syncBtn.onclick = async () => {
    syncStatus.innerText = "Syncing backend bookings...";
    const result = await syncAfterLiveBookingsFromApi();
    syncStatus.innerText = result.ok
      ? `Synced ${result.bookings.length} booking(s) from backend API.`
      : `API unavailable. Showing local demo bookings. ${result.error || ""}`;
    render();
  };

  controls.appendChild(syncBtn);
  render();

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(legend);
  shell.appendChild(controls);
  shell.appendChild(syncStatus);
  shell.appendChild(list);

  return shell;
}
