import { bookingApiRequest } from "../../../../plugins/shared/communication/api/booking-api-client.js";

function buildQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : "";
}

export const callSchedulingApiClient = {
  createBooking(booking = {}) {
    return bookingApiRequest("/call-scheduling/book", {
      method: "POST",
      body: JSON.stringify(booking)
    });
  },

  listBookings(filters = {}) {
    return bookingApiRequest(`/call-scheduling${buildQuery(filters)}`);
  },

  getSummary() {
    return bookingApiRequest("/call-scheduling/summary");
  },

  getBooking(id) {
    return bookingApiRequest(`/call-scheduling/${encodeURIComponent(id)}`);
  },

  updateStatus(id, status) {
    return bookingApiRequest(`/call-scheduling/${encodeURIComponent(id)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
  }
};
