function getBrowserApiBaseUrl() {
  if (typeof window === "undefined") return "http://localhost:3000/api";
  const hostname = window.location.hostname || "localhost";
  return `http://${hostname}:3000/api`;
}

export const LIVE_OFFERS_API_BASE_URL =
  window?.MISTRESS_X_API_BASE_URL ||
  window?.EXPO_PUBLIC_API_URL ||
  getBrowserApiBaseUrl();

async function requestLiveOffersApi(path, options = {}) {
  const response = await fetch(`${LIVE_OFFERS_API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || `Live offers request failed: ${response.status}`);
  }

  return response.json();
}

export async function getAfterShowAvailabilityFromApi(showId = "demo-show") {
  return requestLiveOffersApi(`/live-offers/shows/${encodeURIComponent(showId)}/after-show-availability`);
}

export async function listAfterShowMessageRequestsFromApi() {
  return requestLiveOffersApi("/live-offers/after-show-message-requests");
}

export async function createAfterShowMessageRequestInApi(body = {}) {
  return requestLiveOffersApi("/live-offers/private-message-requests", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateAfterShowMessageRequestInApi(requestId, body = {}) {
  if (!requestId) throw new Error("After-show message request id is required.");
  return requestLiveOffersApi(`/live-offers/private-message-requests/${encodeURIComponent(requestId)}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function normalizeAfterShowAvailabilityResponse(response) {
  const offers = response?.offers || [];
  return offers.reduce((summary, offer) => {
    summary[offer.kind] = {
      label: offer.label,
      total: Number(offer.total || 0),
      booked: Number(offer.booked || 0),
      left: Number(offer.left || 0),
      soldOut: Boolean(offer.soldOut),
    };
    return summary;
  }, {});
}
