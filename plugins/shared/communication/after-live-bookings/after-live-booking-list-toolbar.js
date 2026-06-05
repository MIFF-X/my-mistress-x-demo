import {
  createAfterLiveBookingStatusFilter,
  filterAfterLiveBookings,
} from "./after-live-booking-status-filter.js";
import {
  createAfterLiveBookingSyncControls,
  ensureAfterLiveBookingSyncControlStyles,
} from "./after-live-booking-sync-controls.js";

export function createAfterLiveBookingListToolbar({
  bookings = [],
  activeStatus = "all",
  syncLabel = "Sync Bookings",
  syncIdleMessage = "Showing local booking records until backend sync is run.",
  onStatusChange,
  onSynced,
} = {}) {
  ensureAfterLiveBookingListToolbarStyles();
  ensureAfterLiveBookingSyncControlStyles();

  const wrap = document.createElement("div");
  wrap.className = "after-live-booking-list-toolbar";

  const filter = createAfterLiveBookingStatusFilter({
    bookings,
    activeStatus,
    onChange: onStatusChange,
  });

  const sync = createAfterLiveBookingSyncControls({
    buttonLabel: syncLabel,
    idleMessage: syncIdleMessage,
    onSynced,
  });

  wrap.appendChild(filter);
  wrap.appendChild(sync);
  return wrap;
}

export function getFilteredAfterLiveBookings(bookings = [], activeStatus = "all") {
  return filterAfterLiveBookings(bookings, activeStatus);
}

export function ensureAfterLiveBookingListToolbarStyles() {
  if (document.getElementById("after-live-booking-list-toolbar-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-list-toolbar-styles";
  style.textContent = `
    .after-live-booking-list-toolbar {
      display: grid;
      gap: 10px;
      margin: 12px 0 16px;
    }
  `;
  document.head.appendChild(style);
}
