import { createAfterLiveBookingScreenHeader } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-screen-header.js";
import {
  createAfterLiveBookingListToolbar,
  ensureAfterLiveBookingListToolbarStyles,
} from "../../plugins/shared/communication/after-live-bookings/after-live-booking-list-toolbar.js";
import {
  ensureAfterLiveBookingListRendererStyles,
  renderAfterLiveBookingList,
} from "../../plugins/shared/communication/after-live-bookings/after-live-booking-list-renderer.js";
import { getAfterLiveBookings } from "../../plugins/shared/communication/after-live-bookings/after-live-bookings-store.js";
import { formatAfterLiveApprovedSlot } from "../../plugins/shared/communication/after-live-bookings/after-live-booking-slots.js";

function formatTime(value) {
  if (!value) return "Not set";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString();
}

function createStatusBadge(status) {
  const badge = document.createElement("span");
  badge.className = `booking-status-badge booking-status-${status || "pending"}`;
  badge.innerText = status || "pending";
  return badge;
}

function createSimpleBookingCard(booking) {
  const card = document.createElement("div");
  card.className = `panel sub-after-live-booking-card booking-status-${booking.status || "pending"}`;

  const top = document.createElement("div");
  top.className = "sub-booking-card-top";

  const title = document.createElement("h3");
  title.innerText = `${booking.type === "video" ? "Video" : "Phone"} booking`;

  const source = document.createElement("span");
  source.className = "sub-booking-source-badge";
  source.innerText = booking.backend ? "Backend" : "Local";

  const badges = document.createElement("div");
  badges.className = "sub-booking-badge-row";
  badges.appendChild(createStatusBadge(booking.status));
  badges.appendChild(source);

  top.appendChild(title);
  top.appendChild(badges);

  const slot = formatAfterLiveApprovedSlot(booking);
  const details = document.createElement("p");
  details.innerHTML = `
    <strong>Room:</strong> ${booking.roomId || "Unknown"}<br>
    <strong>Host:</strong> ${booking.host || booking.hostUserId || "Host"}<br>
    <strong>Length:</strong> ${booking.minutes || 0} minutes<br>
    <strong>Credits:</strong> ${booking.credits || 0}<br>
    <strong>Requested:</strong> ${formatTime(booking.createdAt)}<br>
    <strong>Approved slot:</strong> ${slot || "Not scheduled yet"}<br>
    <strong>Receipt:</strong> ${booking.receiptId || booking.raw?.receipt?.id || "Not loaded"}
  `;

  const note = document.createElement("div");
  note.className = "sub-booking-mistress-note";
  note.innerHTML = `<strong>Host note</strong><p>${booking.mistressNote || "No note yet."}</p>`;

  const next = document.createElement("p");
  next.className = "sub-booking-next-step";
  if (booking.status === "approved") next.innerText = slot ? `Approved. Be ready at: ${slot}.` : "Approved. Wait for the host to start the session.";
  else if (booking.status === "declined") next.innerText = booking.refundedAt ? "Declined. Credits were returned." : "Declined. No automatic refund recorded.";
  else if (booking.status === "completed") next.innerText = "Completed.";
  else next.innerText = "Pending approval.";

  card.appendChild(top);
  card.appendChild(details);
  card.appendChild(note);
  card.appendChild(next);
  return card;
}

function ensureSubBookingV2Styles() {
  if (document.getElementById("sub-after-live-booking-v2-styles")) return;
  const style = document.createElement("style");
  style.id = "sub-after-live-booking-v2-styles";
  style.textContent = `
    .sub-booking-card-top {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
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

    .sub-booking-mistress-note {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 10px;
      background: rgba(0, 0, 0, 0.18);
      margin: 10px 0;
    }

    .sub-booking-mistress-note p,
    .sub-booking-next-step {
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);
}

export function createSubAfterLiveBookingsV2() {
  ensureSubBookingV2Styles();
  ensureAfterLiveBookingListToolbarStyles();
  ensureAfterLiveBookingListRendererStyles();

  let activeStatus = "all";
  const shell = document.createElement("div");
  shell.className = "page-shell sub-after-live-bookings";
  shell.style.padding = "20px";

  const list = document.createElement("div");
  list.className = "sub-after-live-booking-list";

  const render = () => {
    renderAfterLiveBookingList({
      list,
      bookings: getAfterLiveBookings(),
      activeStatus,
      createCard: createSimpleBookingCard,
      emptyTitle: "No bookings found",
      emptyMessage: "After-live booking requests will appear here.",
    });
  };

  const toolbarSlot = document.createElement("div");
  const renderToolbar = () => {
    toolbarSlot.innerHTML = "";
    toolbarSlot.appendChild(
      createAfterLiveBookingListToolbar({
        bookings: getAfterLiveBookings(),
        activeStatus,
        syncLabel: "Sync My Bookings",
        syncIdleMessage: "Showing local bookings until backend sync is run.",
        onStatusChange: (status) => {
          activeStatus = status;
          renderToolbar();
          render();
        },
        onSynced: () => {
          renderToolbar();
          render();
        },
      })
    );
  };

  shell.appendChild(
    createAfterLiveBookingScreenHeader({
      role: "sub",
      title: "My After-Live Bookings",
      intro: "Track phone and video follow-up bookings requested after live sessions.",
      onAction: () => render(),
    })
  );

  renderToolbar();
  render();
  shell.appendChild(toolbarSlot);
  shell.appendChild(list);
  return shell;
}

export { createSubAfterLiveBookingsV2 as createSubAfterLiveBookings };
