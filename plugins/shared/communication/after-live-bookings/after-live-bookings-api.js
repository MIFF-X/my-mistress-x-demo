import {
  normalizeAfterLiveBookingBridgeStatus,
  buildAfterLiveBookingBridgeState
} from "./after-live-bridge-session-state.js";
import { formatAfterLiveApprovedSlot } from "./after-live-booking-slots.js";
import { bookingApiClient } from "../api/booking-api-client.js";

function toBackendBookingType(type) {
  return String(type || "phone").toLowerCase() === "video" ? "VIDEO" : "PHONE";
}

function extractBookingPayload(response) {
  return response?.booking || response;
}

function normalizeCancellationMetadata(response) {
  if (!response?.cancellationDecision) return {};

  const decision = response.cancellationDecision;
  return {
    cancellationDecision: decision,
    refundTransactionId: response.refundTransactionId || null,
    refundApplied: Boolean(response.refundApplied),
    cancellationMessages: response.messages || null,
    refundedAt: response.refundApplied ? Date.now() : null,
    cancellationReason: decision.reason || response.messages?.requesterMessage || null,
    refundAmountCredits: decision.refundAmountCredits || 0,
    cancelledBy: decision.cancelledBy || null
  };
}

export function normalizeAfterLiveBookingStatus(status) {
  const normalized = String(status || "pending").toLowerCase();
  return normalized === "cancelled" || normalized === "canceled" ? "declined" : normalized;
}

function normalizeBooking(response) {
  const booking = extractBookingPayload(response) || {};
  const cancellation = normalizeCancellationMetadata(response);
  const bridgeSession = buildAfterLiveBookingBridgeState(
    booking.bridgeSession || response?.bridgeSession
      ? { bridgeSession: booking.bridgeSession || response.bridgeSession, status: booking.bridgeStatus || response?.bridgeStatus }
      : {}
  );
  const bridgeStatus = bridgeSession?.status || normalizeAfterLiveBookingBridgeStatus(booking.bridgeStatus || response?.bridgeStatus);

  return {
    id: booking.id,
    roomId: booking.sourceRoomId || booking.roomId || booking.metadata?.sourceRoomId || "backend-booking",
    host: booking.hostDisplayName || booking.host || booking.hostUsername || booking.hostUserId || "Mistress",
    hostDisplayName: booking.hostDisplayName || null,
    hostUsername: booking.hostUsername || null,
    hostUserId: booking.hostUserId,
    sub: booking.subDisplayName || booking.sub || booking.subUsername || booking.subUserId || "Sub",
    subDisplayName: booking.subDisplayName || null,
    subUsername: booking.subUsername || null,
    subUserId: booking.subUserId,
    type: String(booking.type || "PHONE").toLowerCase(),
    status: normalizeAfterLiveBookingStatus(booking.status),
    minutes: booking.durationMinutes,
    credits: Number(booking.price || booking.credits || 0),
    scheduledAt: booking.scheduledAt || null,
    approvedSlotIso: booking.scheduledAt || null,
    approvedSlot: booking.approvedSlot || formatAfterLiveApprovedSlot(booking.scheduledAt) || null,
    mistressNote: booking.mistressNote || booking.notes || cancellation.cancellationReason || "",
    refundedAt: booking.refundedAt || cancellation.refundedAt || null,
    receiptId: booking.receiptId || booking.receipt?.id || null,
    receiptUrl: booking.receiptUrl || booking.receipt?.receiptUrl || null,
    refundApplied: cancellation.refundApplied || false,
    refundTransactionId: cancellation.refundTransactionId || null,
    refundAmountCredits: cancellation.refundAmountCredits || 0,
    cancellationDecision: cancellation.cancellationDecision || null,
    cancellationMessages: cancellation.cancellationMessages || null,
    cancelledBy: cancellation.cancelledBy || null,
    bridgeSession,
    bridgeStatus: bridgeSession ? bridgeStatus : null,
    bridgeSessionUpdatedAt: bridgeSession?.updatedAt || null,
    createdAt: booking.createdAt ? new Date(booking.createdAt).getTime() : Date.now(),
    updatedAt: booking.updatedAt ? new Date(booking.updatedAt).getTime() : null,
    backend: true,
    raw: response
  };
}

export async function listAfterLiveBookingsFromApi() {
  const bookings = await bookingApiClient.listBookings();
  return Array.isArray(bookings) ? bookings.map(normalizeBooking) : [];
}

export async function createAfterLiveBookingInApi({ hostUserId, type, minutes, credits, scheduledAt, notes, roomId }) {
  const booking = await bookingApiClient.createAfterLiveBooking({
    hostUserId,
    type: toBackendBookingType(type),
    durationMinutes: minutes,
    price: credits,
    scheduledAt,
    notes,
    sourceRoomId: roomId
  });

  return normalizeBooking(booking);
}

export async function approveAfterLiveBookingInApi({ bookingId, approvedSlot, scheduledAt, mistressNote }) {
  const booking = await bookingApiClient.approveBooking({ bookingId, approvedSlot, scheduledAt, mistressNote });
  return normalizeBooking(booking);
}

export async function cancelAfterLiveBookingInApi({ bookingId, refund = false, cancelReason, mistressNote }) {
  const booking = await bookingApiClient.cancelBooking({ bookingId, refund, cancelReason, mistressNote });
  return normalizeBooking(booking);
}

export async function completeAfterLiveBookingInApi(bookingId) {
  const booking = await bookingApiClient.completeBooking({ bookingId });
  return normalizeBooking(booking);
}

export async function prepareAfterLiveBookingBridgeInApi(bookingId) {
  return bookingApiClient.prepareBridge({ bookingId });
}

export async function startAfterLiveBookingBridgeInApi(bookingId) {
  return bookingApiClient.connectBridge({ bookingId });
}

export async function disconnectAfterLiveBookingBridgeInApi(bookingId) {
  return bookingApiClient.disconnectBridge({ bookingId });
}

export async function listAfterLiveBookingReceiptsInApi(bookingId) {
  return bookingApiClient.listReceipts({ bookingId });
}

export async function getAfterLiveBookingReceiptInApi(receiptId) {
  return bookingApiClient.getReceipt({ receiptId });
}

export async function downloadAfterLiveBookingReceiptInApi(receiptId) {
  return bookingApiClient.downloadReceipt({ receiptId });
}

export async function verifyAfterLiveBookingReceiptInApi(receiptId, digest) {
  return bookingApiClient.verifyReceipt({ receiptId, digest });
}

export async function deliverAfterLiveBookingReceiptInApi(receiptId, delivery = {}) {
  return bookingApiClient.deliverReceipt({ receiptId, delivery });
}
