import { apiRequest } from './apiClient';

export type LiveShowRequestStatus = 'QUEUED' | 'ACCEPTED' | 'DECLINED' | 'FULFILLED' | 'CANCELLED';
export type LiveShowRequestChargeMode = 'FREE_QUEUE' | 'PAID_ON_ACCEPTANCE' | 'PAID_UPFRONT';

export type LiveShowRequest = {
  id: string;
  showId: string;
  requesterUserId: string;
  hostUserId: string;
  message: string;
  requestedAmount: number;
  chargeMode: LiveShowRequestChargeMode;
  status: LiveShowRequestStatus;
  metadata?: Record<string, unknown>;
  reviewReason?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateLiveShowRequestPayload = {
  showId: string;
  hostUserId: string;
  message: string;
  requestedAmount?: number;
  chargeMode?: LiveShowRequestChargeMode;
  metadata?: Record<string, unknown>;
};

export function createLiveShowRequest(payload: CreateLiveShowRequestPayload) {
  return apiRequest<LiveShowRequest>('/live-show-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function listLiveShowRequests(showId: string, scope?: 'mine' | 'all') {
  const query = scope ? `?scope=${encodeURIComponent(scope)}` : '';
  return apiRequest<LiveShowRequest[]>(`/live-show-requests/show/${encodeURIComponent(showId)}${query}`);
}

export function acceptLiveShowRequest(requestId: string, reason?: string) {
  return apiRequest<LiveShowRequest>(`/live-show-requests/${encodeURIComponent(requestId)}/accept`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export function declineLiveShowRequest(requestId: string, reason?: string) {
  return apiRequest<LiveShowRequest>(`/live-show-requests/${encodeURIComponent(requestId)}/decline`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export function fulfilLiveShowRequest(requestId: string, reason?: string) {
  return apiRequest<LiveShowRequest>(`/live-show-requests/${encodeURIComponent(requestId)}/fulfil`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}

export function cancelLiveShowRequest(requestId: string, reason?: string) {
  return apiRequest<LiveShowRequest>(`/live-show-requests/${encodeURIComponent(requestId)}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  });
}
