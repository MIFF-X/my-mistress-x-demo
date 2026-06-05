import { apiFetch } from './api';

export const chatApi = {
  getRoomMessages(roomId) {
    return apiFetch(`/chat/room/${roomId}`);
  },

  sendMessage(payload) {
    return apiFetch('/chat/message', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};
