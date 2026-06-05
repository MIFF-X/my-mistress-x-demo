import { io } from 'socket.io-client';
import { API_URL } from './api';

let socket;

export function getSocket() {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
    });
  }

  return socket;
}

export function joinChatRoom(roomId, userId) {
  getSocket().emit('chat.joinRoom', { roomId, userId });
}

export function leaveChatRoom(roomId) {
  getSocket().emit('chat.leaveRoom', { roomId });
}

export function sendChatMessage(payload) {
  getSocket().emit('chat.sendMessage', payload);
}

export function onChatMessage(callback) {
  getSocket().on('chat.messageCreated', callback);
}

export function offChatMessage(callback) {
  getSocket().off('chat.messageCreated', callback);
}
