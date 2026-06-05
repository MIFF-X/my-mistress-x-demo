import { listAfterLiveBookingsFromApi } from "./after-live-bookings-api.js";
import { buildAfterLiveBookingBridgeState } from "./after-live-bridge-session-state.js";

export const AFTER_LIVE_BOOKING_STORAGE_KEY = "mistressXAfterLiveBookingRequests";
export const DEMO_WALLET_STORAGE_KEY = "mistressXDemoWalletBalance";

function normalizeBookingStatus(status) {
  const normalized = String(status || "pending").toLowerCase();
  return normalized === "cancelled" || normalized === "canceled" ? "declined" : normalized;
}

function normalizeStoredBooking(booking) {
  return {
    ...booking,
    status: normalizeBookingStatus(booking?.status)
  };
}

function sortBookingsNewestFirst(bookings) {
  return [...(bookings || [])].sort((a, b) => Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0));
}

export function getAfterLiveBookings() {
  try {
    const bookings = JSON.parse(localStorage.getItem(AFTER_LIVE_BOOKING_STORAGE_KEY) || "[]") || [];
    return sortBookingsNewestFirst(bookings.map(normalizeStoredBooking));
  } catch {
    return [];
  }
}

export function setAfterLiveBookings(bookings) {
  const normalizedBookings = sortBookingsNewestFirst((bookings || []).map(normalizeStoredBooking));
  localStorage.setItem(AFTER_LIVE_BOOKING_STORAGE_KEY, JSON.stringify(normalizedBookings));
  window.dispatchEvent(
    new CustomEvent("mistressx:after-live-bookings-updated", {
      detail: { count: normalizedBookings.length, bookings: normalizedBookings }
    })
  );
}

export function saveAfterLiveBooking(booking) {
  const bookings = getAfterLiveBookings();
  const nextBooking = normalizeStoredBooking({
    id: booking.id || `booking_${Date.now()}`,
    status: booking.status || "pending",
    createdAt: booking.createdAt || Date.now(),
    ...booking
  });

  setAfterLiveBookings([nextBooking, ...bookings]);
  return nextBooking;
}

export function updateAfterLiveBooking(bookingId, updates) {
  const bookings = getAfterLiveBookings().map((booking) =>
    booking.id === bookingId ? normalizeStoredBooking({ ...booking, ...updates, updatedAt: Date.now() }) : booking
  );
  setAfterLiveBookings(bookings);
  return bookings;
}

export function updateAfterLiveBookingBridgeSession(bookingId, result = {}) {
  const bridgeSession = buildAfterLiveBookingBridgeState(result);
  if (!bridgeSession) return getAfterLiveBookings();

  return updateAfterLiveBooking(bookingId, {
    bridgeSession,
    bridgeStatus: bridgeSession.status,
    bridgeSessionUpdatedAt: bridgeSession.updatedAt,
  });
}

function mergeSyncedBookingState(apiBookings, previousBookings) {
  const previousById = new Map((previousBookings || []).map((booking) => [booking.id, booking]));

  return (apiBookings || []).map((booking) => {
    const normalizedBooking = normalizeStoredBooking(booking);
    const previous = previousById.get(normalizedBooking.id);
    if (normalizedBooking.bridgeSession || !previous?.bridgeSession) return normalizedBooking;
    return {
      ...normalizedBooking,
      bridgeSession: previous.bridgeSession,
      bridgeStatus: previous.bridgeStatus || previous.bridgeSession.status,
      bridgeSessionUpdatedAt: previous.bridgeSessionUpdatedAt || previous.bridgeSession.updatedAt || null,
    };
  });
}

export function getBookingsByStatus(status, sourceBookings = getAfterLiveBookings()) {
  const normalizedStatus = normalizeBookingStatus(status);
  return sortBookingsNewestFirst((sourceBookings || []).map(normalizeStoredBooking).filter((booking) => booking.status === normalizedStatus));
}

export function getPendingBookings(sourceBookings = getAfterLiveBookings()) {
  return getBookingsByStatus("pending", sourceBookings);
}

export function getApprovedBookings(sourceBookings = getAfterLiveBookings()) {
  return getBookingsByStatus("approved", sourceBookings);
}

export function getDeclinedBookings(sourceBookings = getAfterLiveBookings()) {
  return getBookingsByStatus("declined", sourceBookings);
}

export function getCompletedBookings(sourceBookings = getAfterLiveBookings()) {
  return getBookingsByStatus("completed", sourceBookings);
}

export function getLatestApprovedBooking(sourceBookings = getAfterLiveBookings()) {
  return getApprovedBookings(sourceBookings)[0] || null;
}

export function getBookingCounts(sourceBookings = getAfterLiveBookings()) {
  const bookings = (sourceBookings || []).map(normalizeStoredBooking);
  return {
    total: bookings.length,
    pending: getPendingBookings(bookings).length,
    approved: getApprovedBookings(bookings).length,
    declined: getDeclinedBookings(bookings).length,
    completed: getCompletedBookings(bookings).length
  };
}

export async function syncAfterLiveBookingsFromApi() {
  const previousBookings = getAfterLiveBookings();
  try {
    const bookings = await listAfterLiveBookingsFromApi();
    const mergedBookings = mergeSyncedBookingState(bookings, previousBookings);
    setAfterLiveBookings(mergedBookings);
    return { ok: true, source: "api", bookings: mergedBookings, counts: getBookingCounts(mergedBookings) };
  } catch (error) {
    const bookings = previousBookings;
    return {
      ok: false,
      source: "local",
      bookings,
      counts: getBookingCounts(bookings),
      error: error instanceof Error ? error.message : "API sync failed"
    };
  }
}

export function getDemoWalletBalance() {
  const stored = Number(localStorage.getItem(DEMO_WALLET_STORAGE_KEY));
  return Number.isFinite(stored) ? stored : 25;
}

export function setDemoWalletBalance(value) {
  localStorage.setItem(DEMO_WALLET_STORAGE_KEY, String(value));
  document.querySelectorAll("[data-wallet-balance]").forEach((node) => {
    node.innerText = `${value} credits`;
  });
}

export function chargeDemoWallet(credits) {
  const balance = getDemoWalletBalance();
  if (balance < credits) return false;
  setDemoWalletBalance(balance - credits);
  return true;
}

export function refundDemoWallet(credits) {
  setDemoWalletBalance(getDemoWalletBalance() + Number(credits || 0));
}
