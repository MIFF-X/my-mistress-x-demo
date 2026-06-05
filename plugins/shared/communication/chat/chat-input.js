import { appendConversationMessage, chatStore } from './chat-store.js';
import { renderMessages } from './chat-window.js';

export function createChatInput() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-input-wrapper';

  const input = document.createElement('input');
  input.placeholder = 'Type a message...';
  input.className = 'chat-input';

  const button = document.createElement('button');
  button.innerText = 'Send';
  button.className = 'button-primary';

  function submitMessage() {
    const current = chatStore.currentConversation;
    if (!current) return;

    const value = input.value.trim();
    if (!value) return;

    appendConversationMessage(current, {
      type: 'sent',
      text: value,
    });

    renderMessages(document.getElementById('chat-messages'), current);
    input.value = '';
  }

  button.onclick = submitMessage;
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      submitMessage();
    }
  });

  wrapper.appendChild(input);
  wrapper.appendChild(button);

  return wrapper;
}
