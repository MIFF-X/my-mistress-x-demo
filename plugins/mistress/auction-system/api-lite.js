import { bookingApiRequest, hasBookingApiAuth } from "../../shared/communication/api/booking-api-client.js";

export function hasAuctionApiBase() {
  return hasBookingApiAuth();
}

export function auctionRequest(path, options = {}) {
  return bookingApiRequest(path, options);
}
