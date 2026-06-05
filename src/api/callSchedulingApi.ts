import { apiRequest } from './apiClient';

export type CallSessionType = 'voice' | 'video';
export type CallBookingStatus = 'draft' | 'booked' | 'paid' | 'cancelled' | 'completed' | 'expired';

export type CallSchedulingBooking = {
  id: string;
  subId: string;
  mistressId: string;
  mistressName: string;
  sessionType: CallSessionType;
  startsAt: string;
  durationMinutes: number;
  priceCents: number;
  currency: string;
  status: CallBookingStatus;
  walletTransactionId?: string;
  calendarEventId?: string;
  notificationIds?: string[];
  createdAt: string;
  updatedAt: string;
};

export type CallSchedulingSummary = {
  totalBookings: number;
  booked: number;
  paid: number;
  cancelled: number;
  completed: number;
  totalRevenueCents: number;
  currency: string;
};

export type CreateCallSchedulingBookingInput = Partial<
  Pick<
    CallSchedulingBooking,
    | 'subId'
    | 'mistressId'
    | 'mistressName'
    | 'sessionType'
    | 'startsAt'
    | 'durationMinutes'
    | 'priceCents'
    | 'currency'
    | 'status'
    | 'walletTransactionId'
    | 'calendarEventId'
    | 'notificationIds'
  >
>;

export type CallSchedulingFilters = {
  subId?: string;
  mistressId?: string;
  status?: CallBookingStatus;
};

function buildQuery(filters: CallSchedulingFilters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export function listCallSchedulingBookings(filters: CallSchedulingFilters = {}) {
  return apiRequest<CallSchedulingBooking[]>(`/call-scheduling${buildQuery(filters)}`);
}

export function getCallSchedulingSummary() {
  return apiRequest<CallSchedulingSummary>('/call-scheduling/summary');
}

export function createCallSchedulingBooking(input: CreateCallSchedulingBookingInput) {
  return apiRequest<CallSchedulingBooking>('/call-scheduling/book', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateCallSchedulingStatus(id: string, status: CallBookingStatus) {
  return apiRequest<CallSchedulingBooking>(`/call-scheduling/${encodeURIComponent(id)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}
