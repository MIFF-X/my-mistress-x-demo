import { saveAfterLiveBooking } from "../after-live-bookings/after-live-bookings-store.js";
import { formatAfterShowAvailability, getAfterShowAvailability } from "./live-show-after-show-availability.js";

const BOOKING_KIND_TO_TYPE = {
  privateMessage: "message",
  voiceCall: "phone",
  videoCall: "video",
};

const BOOKING_KIND_TO_LABEL = {
  privateMessage: "Private Message",
  voiceCall: "Voice Call",
  videoCall: "1-on-1 Video Call",
};

function getDefaultMinutes(kind, settings) {
  if (kind === "videoCall") return Number(settings.videoBookingMinutes?.[0] || 10);
  if (kind === "voiceCall") return Number(settings.phoneBookingMinutes?.[0] || 10);
  return 15;
}

function getRate(kind, settings) {
  if (kind === "videoCall") return Number(settings.videoCallRate || 0);
  if (kind === "voiceCall") return Number(settings.voiceCallRate || 0);
  return Number(settings.privateMessageRate || 5);
}

export function createAfterShowBookingRequest(kind, settings = {}) {
  const availability = getAfterShowAvailability(kind);
  if (availability.soldOut) {
    return {
      ok: false,
      reason: "sold-out",
      message: `${BOOKING_KIND_TO_LABEL[kind] || "After-show access"} is sold out for this show.`,
    };
  }

  const durationMinutes = getDefaultMinutes(kind, settings);
  const rate = getRate(kind, settings);
  const totalCredits = Number((durationMinutes * rate).toFixed(2));
  const booking = saveAfterLiveBooking({
    source: "live-show-after-show-offer",
    serviceType: BOOKING_KIND_TO_TYPE[kind] || "custom",
    serviceLabel: BOOKING_KIND_TO_LABEL[kind] || "After-show access",
    durationMinutes,
    rateCreditsPerMinute: rate,
    priceCredits: totalCredits,
    status: "pending",
    hostUserId: "demo-mistress",
    subUserId: "demo-sub",
    requestedSlot: "After this live show",
    availabilitySnapshot: formatAfterShowAvailability(kind),
    notes: `${BOOKING_KIND_TO_LABEL[kind] || "After-show access"} requested from live show offer tray.`,
  });

  return {
    ok: true,
    booking,
    message: `${booking.serviceLabel} requested · ${durationMinutes} min · ${totalCredits} credits · ${formatAfterShowAvailability(kind)}.`,
  };
}
