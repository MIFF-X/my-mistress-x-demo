import { apiRequest } from './apiClient';

export type GiftReviewStatus = 'DISPUTED' | 'REFUND_REQUESTED';

export type GiftItem = {
  id: string;
  name: string;
  icon?: string | null;
  emoji?: string | null;
  price: number | string;
  sortOrder?: number;
  animation?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type UserGiftItem = {
  id: string;
  userId: string;
  giftId: string;
  quantity: number;
  gift?: GiftItem;
};

export type SendGiftResponse = {
  id: string;
  giftName: string;
  giftIcon?: string | null;
  grossAmount: number;
  mistressAmount?: number;
  platformAmount?: number;
  newBalance?: number;
  reviewStatus?: GiftReviewStatus | null;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

type GiftCatalogResponse = GiftItem[] | {
  items?: GiftItem[];
};

function normalizeGift(item: GiftItem): GiftItem {
  return {
    ...item,
    emoji: item.emoji ?? item.icon ?? null,
  };
}

export async function listGifts() {
  const response = await apiRequest<GiftCatalogResponse>('/gifts');
  const items = Array.isArray(response) ? response : response.items || [];
  return items.map(normalizeGift);
}

export function sendGift(targetUserId: string, giftId: string, amount?: number) {
  return apiRequest<SendGiftResponse>('/gifts/send', {
    method: 'POST',
    body: JSON.stringify({ mistressUserId: targetUserId, giftId, amount }),
  });
}

export function listMyGifts() {
  return apiRequest<UserGiftItem[]>('/gifts/mine');
}

export function requestGiftReview(giftTransactionId: string, status: GiftReviewStatus, reason?: string) {
  return apiRequest<{
    giftTransactionId: string;
    reviewStatus: GiftReviewStatus;
    reviewReason?: string | null;
    auditId: string;
    status: string;
    createdAt: string;
  }>(`/gifts/${encodeURIComponent(giftTransactionId)}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}
