import { apiRequest } from './apiClient';

export type LiveShow = {
  id: string;
  mistressUserId: string;
  title: string;
  description?: string | null;
  ticketPrice: number | string;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';
  chatEnabled: boolean;
  giftsEnabled: boolean;
  metadata?: Record<string, unknown> | null;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  mistress?: {
    id: string;
    username: string;
    displayName?: string | null;
    avatarUrl?: string | null;
  };
};

export type LiveTipResponse = {
  success?: boolean;
  walletTransactionId?: string | null;
  receipt?: {
    id: string;
    receiptUrl: string;
    walletTransactionId?: string | null;
    [key: string]: unknown;
  };
  transaction?: {
    id?: string;
    [key: string]: unknown;
  };
};

export type CreateLiveShowPayload = {
  title: string;
  description?: string;
  ticketPrice?: number;
  scheduledAt?: string;
  durationMinutes?: number;
  chatEnabled?: boolean;
  giftsEnabled?: boolean;
  metadata?: Record<string, unknown>;
};

export function listLiveShows() {
  return apiRequest<LiveShow[]>('/live/shows');
}

export function createLiveShow(payload: CreateLiveShowPayload) {
  return apiRequest<LiveShow>('/live/show', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getLiveShow(showId: string) {
  return apiRequest<LiveShow>(`/live/show/${encodeURIComponent(showId)}`);
}

export function startLiveShow(showId: string) {
  return apiRequest<LiveShow>(`/live/show/${encodeURIComponent(showId)}/start`, {
    method: 'POST',
  });
}

export function endLiveShow(showId: string) {
  return apiRequest<LiveShow>(`/live/show/${encodeURIComponent(showId)}/end`, {
    method: 'POST',
  });
}

export function buyLiveShowTicket(showId: string) {
  return apiRequest(`/live/show/${encodeURIComponent(showId)}/ticket`, {
    method: 'POST',
  });
}

export function sendLiveTip(targetUserId: string, amount: number, showId?: string) {
  return apiRequest<LiveTipResponse>('/live/tip', {
    method: 'POST',
    body: JSON.stringify({ targetUserId, amount, showId }),
  });
}
