import { getConversationMessages } from './chat-store.js';

export function renderMessages(messagesContainer, conversationName) {
  if (!messagesContainer) return;

  messagesContainer.innerHTML = '';

  const messages = getConversationMessages(conversationName);

  if (messages.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'chat-message received';
    empty.innerText = 'No messages yet.';
    messagesContainer.appendChild(empty);
    return;
  }

  messages.forEach((message) => {
    const bubble = document.createElement('div');
    bubble.className = `chat-message ${message.type || 'received'}`;
    bubble.innerText = message.text || message.body || '';
    messagesContainer.appendChild(bubble);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

export function createChatWindow() {
  const windowBox = document.createElement('div');
  windowBox.className = 'chat-window';

  const heading = document.createElement('h3');
  heading.className = 'chat-window-title';
  heading.innerText = 'Select a Conversation';

  const messages = document.createElement('div');
  messages.className = 'chat-messages';
  messages.id = 'chat-messages';

  const welcome = document.createElement('div');
  welcome.className = 'chat-message received';
  welcome.innerText = 'Choose a conversation from the list.';

  messages.appendChild(welcome);
  windowBox.appendChild(heading);
  windowBox.appendChild(messages);

  return windowBox;
}
