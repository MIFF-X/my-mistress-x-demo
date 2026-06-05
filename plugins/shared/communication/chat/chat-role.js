import { isAdmin, isMistress, isSub } from '../../../../features/auth/role-client.js';

export function getChatCapabilities() {
  if (isAdmin()) {
    return {
      canViewAllRooms: true,
      canModerate: true,
      canGroupChats: true,
      canAddPrivateNotes: true,
      canSendPaidRequests: false,
      canPurchasePPV: false,
    };
  }

  if (isMistress()) {
    return {
      canViewAllRooms: false,
      canModerate: false,
      canGroupChats: true,
      canAddPrivateNotes: true,
      canSendPaidRequests: false,
      canPurchasePPV: false,
    };
  }

  if (isSub()) {
    return {
      canViewAllRooms: false,
      canModerate: false,
      canGroupChats: false,
      canAddPrivateNotes: false,
      canSendPaidRequests: true,
      canPurchasePPV: true,
    };
  }

  return {
    canViewAllRooms: false,
    canModerate: false,
    canGroupChats: false,
    canAddPrivateNotes: false,
    canSendPaidRequests: false,
    canPurchasePPV: false,
  };
}

export function applyChatRoleClasses(root) {
  const capabilities = getChatCapabilities();

  root.classList.toggle('chat-can-group', capabilities.canGroupChats);
  root.classList.toggle('chat-can-note', capabilities.canAddPrivateNotes);
  root.classList.toggle('chat-can-purchase-ppv', capabilities.canPurchasePPV);
  root.classList.toggle('chat-can-moderate', capabilities.canModerate);

  return capabilities;
}
