const defaultConversations = {
  'Sub 1': [
    { type: 'received', text: 'Hello Mistress, this is Sub 1.' },
  ],
  'Sub 2': [
    { type: 'received', text: 'Hello Mistress, this is Sub 2.' },
  ],
  'Mistress 1': [
    { type: 'received', text: 'Mistress 1 has entered the chat.' },
  ],
  'Mistress 2': [
    { type: 'received', text: 'Mistress 2 has entered the chat.' },
  ],
  'Mistress Support': [
    { type: 'received', text: 'Support is here to help you.' },
  ],
};

export const chatStore = {
  currentConversation: null,
  conversations: { ...defaultConversations },
  unlockedRooms: {},
};

export function getConversationMessages(conversationName) {
  const conversation = chatStore.conversations[conversationName];

  if (Array.isArray(conversation)) {
    return conversation;
  }

  return conversation?.messages || [];
}

export function ensureConversation(conversationName) {
  if (!chatStore.conversations[conversationName]) {
    chatStore.conversations[conversationName] = [];
  }

  if (!Array.isArray(chatStore.conversations[conversationName])) {
    chatStore.conversations[conversationName].messages ||= [];
    return chatStore.conversations[conversationName].messages;
  }

  return chatStore.conversations[conversationName];
}

export function appendConversationMessage(conversationName, message) {
  const messages = ensureConversation(conversationName);
  const nextMessage = {
    type: message.type || 'sent',
    text: message.text || '',
    createdAt: message.createdAt || new Date().toISOString(),
    ...message,
  };

  messages.push(nextMessage);
  return nextMessage;
}

export function unlockChat({ subId, mistressId, price = 0, spendCredits, notify } = {}) {
  if (!subId || !mistressId) {
    throw new Error('subId and mistressId are required to unlock chat.');
  }

  const roomId = `${subId}-${mistressId}`;
  const transaction = typeof spendCredits === 'function'
    ? spendCredits({
        amount: price,
        source: 'chat_unlock',
        subId,
        mistressId,
        label: 'Chat Unlock',
      })
    : null;

  const existingMessages = getConversationMessages(roomId);
  const conversation = {
    id: roomId,
    subId,
    mistressId,
    isUnlocked: true,
    messages: existingMessages,
  };

  chatStore.conversations[roomId] = conversation;
  chatStore.unlockedRooms[roomId] = {
    price,
    unlockedAt: new Date().toISOString(),
    transactionId: transaction?.id || null,
  };

  if (typeof notify === 'function') {
    notify({
      userId: mistressId,
      type: 'chat_unlock',
      message: 'Chat unlocked',
    });
  }

  return { conversation, transaction };
}

export function sendMessage({ subId, mistressId, text, notify } = {}) {
  if (!subId || !mistressId) {
    throw new Error('subId and mistressId are required to send a message.');
  }

  const roomId = `${subId}-${mistressId}`;
  const conversation = chatStore.conversations[roomId];

  if (!conversation?.isUnlocked) {
    throw new Error('Chat not unlocked');
  }

  const message = {
    id: `msg-${Date.now()}`,
    senderId: subId,
    type: 'sent',
    text: text || '',
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(message);

  if (typeof notify === 'function') {
    notify({
      userId: mistressId,
      type: 'message',
      message: text || '',
    });
  }

  return message;
}
