import {
  getAfterLiveBookings,
  getApprovedBookings,
  getBookingCounts,
  getPendingBookings
} from "./after-live-bookings-store.js";

function latest(list) {
  return list?.[0] || null;
}

function normalizeRole(role) {
  return String(role || window.currentRole || "sub").toLowerCase();
}

function isHostRole(role) {
  return ["mistress", "headmistress", "admin"].includes(normalizeRole(role));
}

function hostPendingSummary(counts, latestPending) {
  return {
    priority: "attention",
    title: `${counts.pending} pending booking request${counts.pending === 1 ? "" : "s"}`,
    message: latestPending
      ? `${latestPending.type || "booking"} request for ${latestPending.minutes || 0} minutes is waiting for review.`
      : "Booking requests are waiting for review.",
    actionLabel: "Open Booking Inbox",
    actionTarget: "booking-inbox",
    booking: latestPending,
    counts
  };
}

function viewerPendingSummary(counts, latestPending) {
  return {
    priority: "attention",
    title: `${counts.pending} booking request${counts.pending === 1 ? "" : "s"} pending`,
    message: latestPending
      ? `Your ${latestPending.type || "booking"} request is waiting for approval.`
      : "Your booking requests are waiting for approval.",
    actionLabel: "View My Bookings",
    actionTarget: "my-bookings",
    booking: latestPending,
    counts
  };
}

function approvedSummary(counts, latestApproved, role) {
  const host = isHostRole(role);
  return {
    priority: "ready",
    title: `${counts.approved} approved booking${counts.approved === 1 ? "" : "s"}`,
    message: latestApproved
      ? `${latestApproved.type || "booking"} booking is approved and ready for ${host ? "host handoff" : "your next step"}.`
      : "Approved bookings are ready for handoff.",
    actionLabel: host ? "Open Booking Inbox" : "View My Bookings",
    actionTarget: host ? "booking-inbox" : "my-bookings",
    booking: latestApproved,
    counts
  };
}

export function getBookingActionSummary(sourceBookings = getAfterLiveBookings(), options = {}) {
  const role = normalizeRole(options.role);
  const counts = getBookingCounts(sourceBookings);
  const latestPending = latest(getPendingBookings(sourceBookings));
  const latestApproved = latest(getApprovedBookings(sourceBookings));

  if (counts.pending > 0) {
    return isHostRole(role) ? hostPendingSummary(counts, latestPending) : viewerPendingSummary(counts, latestPending);
  }

  if (counts.approved > 0) {
    return approvedSummary(counts, latestApproved, role);
  }

  return {
    priority: "clear",
    title: "No urgent booking actions",
    message: counts.total ? "Bookings are up to date." : "No after-live bookings yet.",
    actionLabel: isHostRole(role) ? "Open Booking Inbox" : "Open My Bookings",
    actionTarget: isHostRole(role) ? "booking-inbox" : "my-bookings",
    booking: latest(sourceBookings),
    counts
  };
}
