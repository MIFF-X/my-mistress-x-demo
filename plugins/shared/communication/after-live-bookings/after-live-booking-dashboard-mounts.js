import { createBookingDashboardSummaryCard } from "./after-live-booking-dashboard-cards.js";

function appendIfPresent(container, node) {
  if (node) container.appendChild(node);
}

export function mountBookingDashboardCards(container, { role = "sub", onAction, hideWhenClear = true } = {}) {
  appendIfPresent(container, createBookingDashboardSummaryCard({ role, onAction, hideWhenClear }));
  return container;
}

export function mountHostBookingDashboardCards(container, openInbox) {
  return mountBookingDashboardCards(container, {
    role: "mistress",
    onAction: openInbox,
    hideWhenClear: true,
  });
}

export function mountViewerBookingDashboardCards(container, openBookings) {
  return mountBookingDashboardCards(container, {
    role: "sub",
    onAction: openBookings,
    hideWhenClear: true,
  });
}
