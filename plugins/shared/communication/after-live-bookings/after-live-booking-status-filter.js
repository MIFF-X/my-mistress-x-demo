import { getBookingCounts } from "./after-live-bookings-store.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "declined", label: "Declined" },
  { key: "completed", label: "Completed" }
];

export function filterAfterLiveBookings(bookings = [], status = "all") {
  if (status === "all") return bookings;
  return bookings.filter((booking) => booking.status === status);
}

export function createAfterLiveBookingStatusFilter({
  bookings = [],
  activeStatus = "all",
  onChange,
} = {}) {
  ensureAfterLiveBookingStatusFilterStyles();
  const counts = getBookingCounts(bookings);
  const row = document.createElement("div");
  row.className = "after-live-booking-status-filter";

  FILTERS.forEach((filter) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = filter.key === activeStatus ? "button-primary" : "button-secondary";
    const count = filter.key === "all" ? counts.total : counts[filter.key] || 0;
    button.innerText = `${filter.label} (${count})`;
    button.onclick = () => {
      if (onChange) onChange(filter.key);
    };
    row.appendChild(button);
  });

  return row;
}

export function ensureAfterLiveBookingStatusFilterStyles() {
  if (document.getElementById("after-live-booking-status-filter-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-status-filter-styles";
  style.textContent = `
    .after-live-booking-status-filter {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin: 12px 0;
    }
  `;
  document.head.appendChild(style);
}
