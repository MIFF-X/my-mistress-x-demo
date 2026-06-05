import { bookingApiRequest } from "./booking-api-client.js";

function normalizeEntitlementResponse(response) {
  return response?.entitlement || response || null;
}

export function buildLiveRoomEntitlementPayload(room, overrides = {}) {
  const mode =
    overrides.mode ||
    (room.accessType === "code" ? "access_code" : room.accessType === "locked" ? "paid_entry" : "open");

  return {
    roomId: room.id,
    roomKind: room.roomKind || "watch",
    mode,
    priceCredits: overrides.priceCredits ?? room.priceCredits ?? 25,
    accessCode: overrides.accessCode,
    inviteCode: overrides.inviteCode,
    subscriptionTier: overrides.subscriptionTier || room.subscriptionTier || "VIP",
    confirmSpend: overrides.confirmSpend,
    metadataJson: {
      hostUserId: room.hostUserId || null,
      roomTitle: room.title,
      hostDisplayName: room.host,
      priceSource: overrides.priceSource || "live_room_card",
      clientSource: overrides.clientSource || "live_rooms_lobby",
      title: room.title,
      host: room.host,
      accessType: room.accessType,
      expectedCode: room.accessCode,
      source: "live_rooms_lobby",
      ...(overrides.metadataJson || {})
    }
  };
}

export async function checkRoomEntitlement(payload) {
  const response = await bookingApiRequest("/room-entitlements/check", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return normalizeEntitlementResponse(response);
}

export async function unlockRoomEntitlement(payload) {
  const response = await bookingApiRequest("/room-entitlements/unlock", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return normalizeEntitlementResponse(response);
}
