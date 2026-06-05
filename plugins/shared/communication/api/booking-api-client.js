const DEFAULT_API_BASE_URL = "/api";

export function getBookingApiBaseUrl() {
  return window.MISTRESS_X_API_BASE_URL || localStorage.getItem("mistressXApiBaseUrl") || DEFAULT_API_BASE_URL;
}

export function getBookingApiAuthToken() {
  return (
    localStorage.getItem("mistressXAuthToken") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token") ||
    ""
  );
}

export function hasBookingApiAuth() {
  return Boolean(getBookingApiAuthToken());
}

export async function bookingApiRequest(path, options = {}) {
  const token = getBookingApiAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${getBookingApiBaseUrl()}${path}`, {
    ...options,
    headers
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(data?.message || data || `Booking API request failed: ${response.status}`);
  }

  return data;
}

export const bookingApiClient = {
  listBookings() {
    return bookingApiRequest("/bookings");
  },

  createAfterLiveBooking({ hostUserId, type, durationMinutes, price, scheduledAt, notes, sourceRoomId }) {
    return bookingApiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify({
        hostUserId,
        type,
        durationMinutes,
        price,
        scheduledAt,
        notes,
        sourceRoomId,
        source: "after_live"
      })
    });
  },

  approveBooking({ bookingId, scheduledAt, approvedSlot, mistressNote, notes }) {
    return bookingApiRequest("/bookings/approve", {
      method: "PATCH",
      body: JSON.stringify({ bookingId, scheduledAt, approvedSlot, mistressNote, notes })
    });
  },

  cancelBooking({ bookingId, refund = false, cancelReason, mistressNote, notes }) {
    return bookingApiRequest("/bookings/cancel", {
      method: "PATCH",
      body: JSON.stringify({ bookingId, refund, cancelReason, mistressNote, notes })
    });
  },

  completeBooking({ bookingId }) {
    return bookingApiRequest("/bookings/complete", {
      method: "PATCH",
      body: JSON.stringify({ bookingId })
    });
  },

  startBooking({ bookingId }) {
    return bookingApiRequest("/bookings/start", {
      method: "PATCH",
      body: JSON.stringify({ bookingId })
    });
  },

  prepareBridge({ bookingId }) {
    return bookingApiRequest("/bookings/bridge/prepare", {
      method: "POST",
      body: JSON.stringify({ bookingId })
    });
  },

  connectBridge({ bookingId }) {
    return bookingApiRequest("/bookings/bridge/connect", {
      method: "POST",
      body: JSON.stringify({ bookingId })
    });
  },

  disconnectBridge({ bookingId }) {
    return bookingApiRequest("/bookings/bridge/disconnect", {
      method: "POST",
      body: JSON.stringify({ bookingId })
    });
  },

  listReceipts({ bookingId }) {
    return bookingApiRequest(`/bookings/${bookingId}/receipts`);
  },

  getReceipt({ receiptId }) {
    return bookingApiRequest(`/bookings/receipts/${receiptId}`);
  },

  downloadReceipt({ receiptId }) {
    return bookingApiRequest(`/bookings/receipts/${receiptId}/download`);
  },

  verifyReceipt({ receiptId, digest }) {
    const query = digest ? `?digest=${encodeURIComponent(digest)}` : "";
    return bookingApiRequest(`/bookings/receipts/${receiptId}/verify${query}`);
  },

  deliverReceipt({ receiptId, delivery = {} }) {
    return bookingApiRequest(`/bookings/receipts/${receiptId}/deliver`, {
      method: "POST",
      body: JSON.stringify(delivery)
    });
  }
};
