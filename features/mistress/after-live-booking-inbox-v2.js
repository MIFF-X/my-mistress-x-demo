import { createAfterLiveBookingScreenHeader } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-screen-header.js";
import {
  createAfterLiveBookingListToolbar,
  ensureAfterLiveBookingListToolbarStyles,
} from "../../plugins/shared/communication/after-live-bookings/after-live-booking-list-toolbar.js";
import {
  ensureAfterLiveBookingListRendererStyles,
  renderAfterLiveBookingList,
} from "../../plugins/shared/communication/after-live-bookings/after-live-booking-list-renderer.js";
import {
  approveAfterLiveBookingInApi,
  cancelAfterLiveBookingInApi,
  completeAfterLiveBookingInApi,
} from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-api.js";
import {
  getAfterLiveBookings,
  refundDemoWallet,
  syncAfterLiveBookingsFromApi,
  updateAfterLiveBooking,
} from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import { formatAfterLiveApprovedSlot, toAfterLiveDatetimeLocalValue } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-slots.js";

function formatTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function datetimeLocalToIso(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function datetimeLocalToLabel(value) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

function makeButton(label, className, onClick) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = className;
  button.innerText = label;
  button.onclick = onClick;
  return button;
}

function createStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `booking-status-badge booking-status-${status || "pending"}`;
  badge.innerText = status || "pending";
  return badge;
}

function createHostBookingCard(booking, refresh) {
  const card = document.createElement("div");
  card.className = `panel host-after-live-booking-card booking-status-${booking.status || "pending"}`;

  const top = document.createElement("div");
  top.className = "host-booking-card-top";

  const title = document.createElement("h3");
  title.innerText = `${booking.type === "video" ? "Video" : "Phone"} after-live booking`;

  const source = document.createElement("span");
  source.className = "host-booking-source-badge";
  source.innerText = booking.backend ? "Backend" : "Local";

  const badgeRow = document.createElement("div");
  badgeRow.className = "host-booking-badge-row";
  badgeRow.appendChild(createStatusBadge(booking.status));
  badgeRow.appendChild(source);

  top.appendChild(title);
  top.appendChild(badgeRow);

  const approvedSlotLabel = formatAfterLiveApprovedSlot(booking);
  const details = document.createElement("p");
  details.innerHTML = `
    <strong>Room:</strong> ${booking.roomId || "Unknown"}<br>
    <strong>Viewer:</strong> ${booking.sub || booking.subUserId || "Viewer"}<br>
    <strong>Host:</strong> ${booking.host || booking.hostUserId || "Host"}<br>
    <strong>Length:</strong> ${booking.minutes || 0} minutes<br>
    <strong>Credits:</strong> ${booking.credits || 0}<br>
    <strong>Requested:</strong> ${formatTime(booking.createdAt)}<br>
    <strong>Approved slot:</strong> ${approvedSlotLabel || "Not scheduled yet"}
  `;

  const slotInput = document.createElement("input");
  slotInput.type = "datetime-local";
  slotInput.value = toAfterLiveDatetimeLocalValue(booking.scheduledAt || booking.approvedSlotIso || booking.approvedSlot);

  const noteInput = document.createElement("input");
  noteInput.placeholder = "Host note";
  noteInput.value = booking.mistressNote || "";

  const fields = document.createElement("div");
  fields.className = "host-booking-fields";
  fields.appendChild(slotInput);
  fields.appendChild(noteInput);

  const status = document.createElement("p");
  status.className = "host-booking-status-note";
  status.innerText = "Choose an action for this booking.";

  const actions = document.createElement("div");
  actions.className = "host-booking-actions";

  const approveBtn = makeButton("Approve", "button-primary", async () => {
    const updates = {
      status: "approved",
      scheduledAt: datetimeLocalToIso(slotInput.value),
      approvedSlot: datetimeLocalToLabel(slotInput.value) || "To be confirmed",
      approvedSlotIso: datetimeLocalToIso(slotInput.value),
      mistressNote: noteInput.value || "Approved. Please be ready at the agreed time.",
    };
    updateAfterLiveBooking(booking.id, updates);
    status.innerText = "Approved locally.";
    if (booking.backend) {
      try {
        await approveAfterLiveBookingInApi({
          bookingId: booking.id,
          scheduledAt: updates.scheduledAt,
          approvedSlot: updates.approvedSlot,
          mistressNote: updates.mistressNote,
        });
        await syncAfterLiveBookingsFromApi();
        status.innerText = "Approved through backend API.";
      } catch (error) {
        status.innerText = `Backend approve failed; local approval kept. ${error instanceof Error ? error.message : ""}`;
      }
    }
    refresh();
  });

  const declineRefundBtn = makeButton("Decline + Credit Return", "button-secondary", async () => {
    if (!booking.refundedAt && booking.status !== "completed") refundDemoWallet(booking.credits || 0);
    updateAfterLiveBooking(booking.id, {
      status: "declined",
      refundedAt: booking.refundedAt || Date.now(),
      mistressNote: noteInput.value || `Declined. ${booking.credits || 0} credits returned.`,
    });
    status.innerText = "Declined with credit return locally.";
    if (booking.backend) {
      try {
        await cancelAfterLiveBookingInApi({
          bookingId: booking.id,
          refund: true,
          cancelReason: noteInput.value || "Host declined this booking.",
          mistressNote: noteInput.value,
        });
        await syncAfterLiveBookingsFromApi();
        status.innerText = "Declined with backend refund.";
      } catch (error) {
        status.innerText = `Backend decline failed; local action kept. ${error instanceof Error ? error.message : ""}`;
      }
    }
    refresh();
  });

  const declineNoRefundBtn = makeButton("Decline No Credit Return", "button-secondary", async () => {
    updateAfterLiveBooking(booking.id, {
      status: "declined",
      mistressNote: noteInput.value || "Declined without automatic credit return.",
    });
    status.innerText = "Declined locally.";
    if (booking.backend) {
      try {
        await cancelAfterLiveBookingInApi({
          bookingId: booking.id,
          refund: false,
          cancelReason: noteInput.value || "Host declined this booking.",
          mistressNote: noteInput.value,
        });
        await syncAfterLiveBookingsFromApi();
        status.innerText = "Declined through backend API.";
      } catch (error) {
        status.innerText = `Backend decline failed; local action kept. ${error instanceof Error ? error.message : ""}`;
      }
    }
    refresh();
  });

  const completeBtn = makeButton("Mark Complete", "button-secondary", async () => {
    updateAfterLiveBooking(booking.id, {
      status: "completed",
      mistressNote: noteInput.value || booking.mistressNote || "Completed.",
    });
    status.innerText = "Completed locally.";
    if (booking.backend) {
      try {
        await completeAfterLiveBookingInApi(booking.id);
        await syncAfterLiveBookingsFromApi();
        status.innerText = "Completed through backend API.";
      } catch (error) {
        status.innerText = `Backend complete failed; local action kept. ${error instanceof Error ? error.message : ""}`;
      }
    }
    refresh();
  });

  actions.appendChild(approveBtn);
  actions.appendChild(declineRefundBtn);
  actions.appendChild(declineNoRefundBtn);
  actions.appendChild(completeBtn);

  card.appendChild(top);
  card.appendChild(details);
  card.appendChild(fields);
  card.appendChild(actions);
  card.appendChild(status);
  return card;
}

function ensureHostBookingV2Styles() {
  if (document.getElementById("host-after-live-booking-v2-styles")) return;
  const style = document.createElement("style");
  style.id = "host-after-live-booking-v2-styles";
  style.textContent = `
    .host-booking-card-top,
    .host-booking-badge-row,
    .host-booking-actions,
    .host-booking-fields {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
    }

    .host-booking-card-top h3 {
      margin: 0;
    }

    .host-booking-source-badge,
    .booking-status-badge {
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 900;
      text-transform: uppercase;
    }

    .host-booking-source-badge {
      background: rgba(127, 119, 221, 0.14);
      color: #c6c1ff;
      border: 1px solid rgba(127, 119, 221, 0.36);
    }

    .host-booking-fields input {
      min-width: 220px;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }

    .booking-status-pending { color: #ffe08a; border: 1px solid rgba(255,193,7,.35); background: rgba(255,193,7,.12); }
    .booking-status-approved { color: #9ff5d3; border: 1px solid rgba(29,158,117,.36); background: rgba(29,158,117,.14); }
    .booking-status-declined { color: #ff9dbc; border: 1px solid rgba(255,0,85,.36); background: rgba(255,0,85,.12); }
    .booking-status-completed { color: #c6c1ff; border: 1px solid rgba(127,119,221,.36); background: rgba(127,119,221,.14); }
    .host-booking-status-note { color: rgba(255,255,255,.72); font-size: 13px; }
  `;
  document.head.appendChild(style);
}

export function createAfterLiveBookingInboxV2() {
  ensureHostBookingV2Styles();
  ensureAfterLiveBookingListToolbarStyles();
  ensureAfterLiveBookingListRendererStyles();

  let activeStatus = "all";
  const shell = document.createElement("div");
  shell.className = "page-shell after-live-booking-inbox";
  shell.style.padding = "20px";

  const list = document.createElement("div");
  list.className = "after-live-booking-list";
  const toolbarSlot = document.createElement("div");

  const renderList = () => {
    renderAfterLiveBookingList({
      list,
      bookings: getAfterLiveBookings(),
      activeStatus,
      createCard: (booking) => createHostBookingCard(booking, () => {
        renderToolbar();
        renderList();
      }),
      emptyTitle: "No booking requests found",
      emptyMessage: "Booking requests from live rooms will appear here.",
    });
  };

  const renderToolbar = () => {
    toolbarSlot.innerHTML = "";
    toolbarSlot.appendChild(
      createAfterLiveBookingListToolbar({
        bookings: getAfterLiveBookings(),
        activeStatus,
        syncLabel: "Sync Backend Bookings",
        syncIdleMessage: "Showing local bookings until backend sync is run.",
        onStatusChange: (status) => {
          activeStatus = status;
          renderToolbar();
          renderList();
        },
        onSynced: () => {
          renderToolbar();
          renderList();
        },
      })
    );
  };

  shell.appendChild(
    createAfterLiveBookingScreenHeader({
      role: "mistress",
      title: "After-Live Booking Inbox",
      intro: "Review, schedule, decline, credit-return, or complete after-live phone and video requests.",
      onAction: () => renderList(),
    })
  );

  renderToolbar();
  renderList();
  shell.appendChild(toolbarSlot);
  shell.appendChild(list);
  return shell;
}

export { createAfterLiveBookingInboxV2 as createAfterLiveBookingInbox };
