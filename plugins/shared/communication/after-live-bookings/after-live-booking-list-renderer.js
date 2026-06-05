import { createAfterLiveBookingEmptyState } from "./after-live-booking-empty-state.js";
import { getFilteredAfterLiveBookings } from "./after-live-booking-list-toolbar.js";

export function renderAfterLiveBookingList({
  list,
  bookings = [],
  activeStatus = "all",
  createCard,
  emptyTitle = "No after-live bookings yet",
  emptyMessage = "Booking requests will appear here after a live room follow-up is requested.",
  emptyActionLabel,
  onEmptyAction,
} = {}) {
  if (!list) return [];
  list.innerHTML = "";

  const visibleBookings = getFilteredAfterLiveBookings(bookings, activeStatus);

  if (!visibleBookings.length) {
    list.appendChild(
      createAfterLiveBookingEmptyState({
        title: emptyTitle,
        message: activeStatus === "all" ? emptyMessage : `No ${activeStatus} after-live bookings found.`,
        actionLabel: emptyActionLabel,
        onAction: onEmptyAction,
      })
    );
    return visibleBookings;
  }

  visibleBookings.forEach((booking) => {
    if (createCard) list.appendChild(createCard(booking));
  });

  return visibleBookings;
}

export function ensureAfterLiveBookingListRendererStyles() {
  if (document.getElementById("after-live-booking-list-renderer-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-list-renderer-styles";
  style.textContent = `
    .after-live-booking-list,
    .sub-after-live-booking-list,
    .after-live-booking-list-renderer {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }
  `;
  document.head.appendChild(style);
}
