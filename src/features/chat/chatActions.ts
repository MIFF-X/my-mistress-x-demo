import {
  createChatRoom,
  getPaidMessageSettings,
  listPaidMessageHistory,
  listChatRooms,
  listChatMessages,
  markChatRead,
  PaidMessageReviewStatus,
  PaidMessageSettings,
  requestPaidMessageReview,
  sendFreeMessage,
  sendPaidMessage,
  unlockChat,
  updatePaidMessageSettings,
} from '../../api/chatApi';

export async function ensureChatRoom(roomId?: string) {
  if (roomId) return roomId;
  const room = await createChatRoom('Direct chat');
  return room.id;
}

export async function loadChatRooms() {
  return listChatRooms();
}

export async function submitStandardMessage(roomId: string, message: string, receiverUserId?: string, aiRequestId?: string | null) {
  return sendFreeMessage(roomId, message, receiverUserId, aiRequestId);
}

export async function submitPriorityMessage(roomId: string, targetUserId: string, amount: number, message: string, aiRequestId?: string | null) {
  return sendPaidMessage(roomId, targetUserId, amount, message, aiRequestId);
}

export async function loadChatMessages(roomId: string, peerUserId?: string) {
  return listChatMessages(roomId, peerUserId);
}

export async function markChatRoomRead(roomId: string, lastReadMessageId?: string) {
  return markChatRead(roomId, lastReadMessageId);
}

export async function submitUnlock(targetUserId: string, cost: number, roomId?: string) {
  return unlockChat(targetUserId, cost, roomId);
}

export async function loadPaidMessageSettings(userId?: string) {
  return getPaidMessageSettings(userId);
}

export async function loadPaidMessageHistory() {
  return listPaidMessageHistory(20);
}

export async function savePaidMessageSettings(settings: Partial<PaidMessageSettings>) {
  return updatePaidMessageSettings(settings);
}

export async function requestPaidMessageReceiptReview(messageId: string, status: PaidMessageReviewStatus, reason?: string) {
  return requestPaidMessageReview(messageId, status, reason);
}
