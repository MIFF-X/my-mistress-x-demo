import {
  getAfterShowAvailabilityFromApi,
  normalizeAfterShowAvailabilityResponse,
} from "./live-show-offers-api.js";

export const AFTER_SHOW_AVAILABILITY = {
  privateMessage: { label: "Private Message", total: 8, booked: 3 },
  voiceCall: { label: "Voice Call", total: 5, booked: 2 },
  videoCall: { label: "1-on-1 Video Call", total: 5, booked: 5 },
};

let availabilitySource = "local-demo";
let apiAvailability = null;

function getAvailabilityMap() {
  return apiAvailability || AFTER_SHOW_AVAILABILITY;
}

export function getAfterShowAvailabilitySource() {
  return availabilitySource;
}

export function setAfterShowAvailabilityFromApiResponse(response) {
  const normalized = normalizeAfterShowAvailabilityResponse(response);
  if (!normalized || Object.keys(normalized).length === 0) return null;
  apiAvailability = normalized;
  availabilitySource = response?.source || "api";
  window.dispatchEvent(
    new CustomEvent("mistressx:after-show-availability-updated", {
      detail: { source: availabilitySource, availability: apiAvailability, response },
    })
  );
  return apiAvailability;
}

export async function syncAfterShowAvailabilityFromApi(showId = "demo-show") {
  try {
    const response = await getAfterShowAvailabilityFromApi(showId);
    const availability = setAfterShowAvailabilityFromApiResponse(response);
    return { ok: true, source: availabilitySource, availability, response };
  } catch (error) {
    availabilitySource = "local-demo";
    return {
      ok: false,
      source: availabilitySource,
      availability: AFTER_SHOW_AVAILABILITY,
      error: error instanceof Error ? error.message : "After-show availability API unavailable",
    };
  }
}

export function getAfterShowAvailability(kind) {
  const item = getAvailabilityMap()[kind] || { total: 0, booked: 0 };
  const left = Math.max(0, Number(item.total || 0) - Number(item.booked || 0));
  return {
    ...item,
    left,
    soldOut: Number(item.total || 0) > 0 && left === 0,
    label: item.label || kind,
    source: availabilitySource,
  };
}

export function formatAfterShowAvailability(kind) {
  const item = getAfterShowAvailability(kind);
  if (item.soldOut) return "Sold out";
  if (!item.total) return "Limited spots available";
  return `${item.booked}/${item.total} booked · ${item.left} left`;
}
