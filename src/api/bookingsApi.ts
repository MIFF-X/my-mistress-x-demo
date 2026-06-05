import { apiRequest } from './apiClient';

export type BookingType = 'PHONE' | 'VIDEO';
export type BookingStatus = 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type BookingReceipt = {
  id: string;
  bookingId: string;
  subUserId: string;
  hostUserId: string;
  bookingType: BookingType;
  purpose: 'call_booking' | 'call_booking_extension';
  status: 'CONFIRMED';
  amountCredits: number;
  durationMinutes: number;
  walletTransactionId?: string | null;
  receiptUrl: string;
  scheduledAt?: string | null;
  createdAt: string;
  metadata?: Record<string, unknown>;
};

export type BookingReceiptDocument = {
  fileName: string;
  contentType: 'application/json';
  downloadUrl: string;
  generatedAt: string;
  receipt: BookingReceipt;
  booking?: Record<string, unknown> | null;
  summary: {
    title: string;
    description: string;
    status: string;
    amountCredits: number;
    durationMinutes: number;
  };
  lineItems: Array<{
    label: string;
    quantity: number;
    unit: string;
    amountCredits: number;
  }>;
  totals: {
    grossCredits: number;
    hostCredits: number;
    platformCredits: number;
  };
  evidenceRefs: {
    bookingId: string;
    receiptId: string;
    walletTransactionId?: string | null;
  };
  signature: {
    algorithm: 'HMAC-SHA256';
    keyId: string;
    digest: string;
    signedAt: string;
    verifyUrl: string;
  };
};

export type BookingReceiptDelivery = {
  id: string;
  receiptId: string;
  bookingId: string;
  deliveredToUserId: string;
  channel: 'IN_APP' | 'EMAIL' | 'EXPORT';
  status: 'QUEUED';
  downloadUrl: string;
  createdAt: string;
  note?: string | null;
};

export type BookingReceiptVerification = {
  receiptId: string;
  bookingId: string;
  valid: boolean;
  expectedDigest: string;
  providedDigest?: string | null;
  verifiedAt: string;
  signature: BookingReceiptDocument['signature'];
};

export type BookingRecord = {
  id: string;
  subUserId: string;
  hostUserId: string;
  type: BookingType;
  status: BookingStatus;
  durationMinutes: number;
  price: number;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  walletTransactionId?: string | null;
  receipt?: BookingReceipt;
};

export type CreateBookingInput = {
  hostUserId: string;
  type: BookingType;
  durationMinutes: number;
  price: number;
  scheduledAt?: string;
  notes?: string;
};

export type BookingActionInput = {
  bookingId: string;
};

export type ExtendBookingInput = {
  bookingId: string;
  extraMinutes: number;
  extraPrice: number;
};

export function listBookings() {
  return apiRequest<BookingRecord[]>('/bookings');
}

export function createBooking(input: CreateBookingInput) {
  return apiRequest<BookingRecord>('/bookings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function approveBooking(bookingId: string) {
  return apiRequest<BookingRecord>('/bookings/approve', {
    method: 'PATCH',
    body: JSON.stringify({ bookingId }),
  });
}

export function startBooking(bookingId: string) {
  return apiRequest<BookingRecord>('/bookings/start', {
    method: 'PATCH',
    body: JSON.stringify({ bookingId }),
  });
}

export function completeBooking(bookingId: string) {
  return apiRequest<BookingRecord>('/bookings/complete', {
    method: 'PATCH',
    body: JSON.stringify({ bookingId }),
  });
}

export function cancelBooking(bookingId: string) {
  return apiRequest<BookingRecord>('/bookings/cancel', {
    method: 'PATCH',
    body: JSON.stringify({ bookingId }),
  });
}

export function extendBooking(input: ExtendBookingInput) {
  return apiRequest<BookingRecord>('/bookings/extend', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getBookingReceipt(receiptId: string) {
  return apiRequest<{ receipt: BookingReceipt }>(`/bookings/receipts/${encodeURIComponent(receiptId)}`);
}

export function listBookingReceipts(bookingId: string) {
  return apiRequest<{ bookingId: string; receipts: BookingReceipt[] }>(
    `/bookings/${encodeURIComponent(bookingId)}/receipts`,
  );
}

export function downloadBookingReceipt(receiptId: string) {
  return apiRequest<{ document: BookingReceiptDocument }>(
    `/bookings/receipts/${encodeURIComponent(receiptId)}/download`,
  );
}

export function verifyBookingReceipt(receiptId: string, digest?: string) {
  const query = digest ? `?digest=${encodeURIComponent(digest)}` : '';
  return apiRequest<BookingReceiptVerification>(
    `/bookings/receipts/${encodeURIComponent(receiptId)}/verify${query}`,
  );
}

export function deliverBookingReceipt(receiptId: string, input: { recipientUserId?: string; channel?: 'IN_APP' | 'EMAIL' | 'EXPORT'; note?: string } = {}) {
  return apiRequest<{ delivery: BookingReceiptDelivery; document: BookingReceiptDocument }>(
    `/bookings/receipts/${encodeURIComponent(receiptId)}/deliver`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}
