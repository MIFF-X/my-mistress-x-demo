import { apiRequest } from './apiClient';

export type ChatMessageResponse = {
  id?: string;
  roomId?: string;
  conversationId?: string;
  senderUserId?: string;
  receiverUserId?: string;
  body?: string;
  text?: string;
  type?: 'FREE' | 'PAID_MESSAGE' | 'CHAT_UNLOCK' | 'GIFT' | 'STICKER' | 'SYSTEM';
  aiRequestId?: string | null;
  amount?: number | string;
  cost?: number | string;
  unlocked?: boolean;
  alreadyUnlocked?: boolean;
  createdAt?: string;
};

export type ChatReadReceiptResponse = {
  roomId?: string;
  userId?: string;
  lastReadMessageId?: string;
  lastReadAt?: string;
};

export type ChatRoomSummaryResponse = {
  id: string;
  title?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  peerUserIds?: string[];
  canViewLatest?: boolean;
  unreadCount?: number;
  hasUnread?: boolean;
  latestMessageAt?: string;
  latestMessage?: (ChatMessageResponse & { locked?: boolean }) | null;
};

export type PaidMessageChargeMode = 'PER_INITIATED_MESSAGE' | 'PER_RESPONSE' | 'ON_MISTRESS_OPEN';
export type PaidMessageReviewStatus = 'REFUND_REQUESTED' | 'DISPUTED';

export type PaidMessageSettings = {
  enabled: boolean;
  chargeMode: PaidMessageChargeMode;
  initiatedMessageRate: number;
  responseRate: number;
  openMessageRate: number;
  currency: 'credits';
};

export type PaidMessageSettingsResponse = {
  userId: string;
  profileId?: string | null;
  settings: PaidMessageSettings;
};

export type PaidMessageHistoryItem = {
  id: string;
  conversationId: string;
  messageId: string;
  transactionId?: string | null;
  senderUserId: string;
  otherUser?: {
    id: string;
    username?: string | null;
    displayName?: string | null;
    role?: string | null;
  } | null;
  messageText: string;
  messageType: string;
  chargeMode: PaidMessageChargeMode | string;
  amount: number;
  direction: 'IN' | 'OUT' | 'PENDING';
  status: string;
  reviewStatus?: PaidMessageReviewStatus | null;
  reviewReason?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  paidAt?: string | null;
};

export type PaidMessageHistoryResponse = {
  items: PaidMessageHistoryItem[];
  total: number;
};

export function createChatRoom(title?: string) {
  return apiRequest<{ id: string; title?: string }>('/chat/room', {
    method: 'POST',
    body: JSON.stringify({ title }),
  });
}

export function listChatRooms() {
  return apiRequest<ChatRoomSummaryResponse[]>('/chat/rooms');
}

export function sendFreeMessage(roomId: string, text: string, receiverUserId?: string, aiRequestId?: string | null) {
  return apiRequest<ChatMessageResponse>('/chat/message', {
    method: 'POST',
    body: JSON.stringify({ roomId, text, receiverUserId, aiRequestId }),
  });
}

export function listChatMessages(roomId: string, peerUserId?: string) {
  const query = peerUserId ? `?peerUserId=${encodeURIComponent(peerUserId)}` : '';
  return apiRequest<ChatMessageResponse[]>(`/chat/messages/${encodeURIComponent(roomId)}${query}`);
}

export function markChatRead(roomId: string, lastReadMessageId?: string) {
  return apiRequest<ChatReadReceiptResponse>('/chat/read', {
    method: 'POST',
    body: JSON.stringify({ roomId, lastReadMessageId }),
  });
}

export async function sendPaidMessage(
  roomId: string,
  targetUserId: string,
  amount: number,
  text: string,
  aiRequestId?: string | null,
) {
  return apiRequest<ChatMessageResponse>('/chat/paid-message', {
    method: 'POST',
    body: JSON.stringify({ roomId, targetUserId, amount, text, aiRequestId }),
  });
}

export function unlockChat(targetUserId: string, cost: number, roomId?: string) {
  return apiRequest<ChatMessageResponse>('/chat/unlock', {
    method: 'POST',
    body: JSON.stringify({ targetUserId, cost, roomId }),
  });
}

export function getPaidMessageSettings(userId?: string) {
  const path = userId
    ? `/chat/paid-message/settings/${encodeURIComponent(userId)}`
    : '/chat/paid-message/settings';

  return apiRequest<PaidMessageSettingsResponse>(path);
}

export function updatePaidMessageSettings(settings: Partial<PaidMessageSettings>) {
  return apiRequest<PaidMessageSettingsResponse>('/chat/paid-message/settings', {
    method: 'PATCH',
    body: JSON.stringify(settings),
  });
}

export function listPaidMessageHistory(limit = 20) {
  return apiRequest<PaidMessageHistoryResponse>(`/chat/paid-message/history?limit=${encodeURIComponent(String(limit))}`);
}

export function requestPaidMessageReview(messageId: string, status: PaidMessageReviewStatus, reason?: string) {
  return apiRequest<{
    messageId: string;
    conversationId: string;
    reviewStatus: PaidMessageReviewStatus;
    reviewReason?: string | null;
    auditId: string;
    status: string;
    createdAt: string;
  }>(`/chat/paid-message/history/${encodeURIComponent(messageId)}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  });
}
