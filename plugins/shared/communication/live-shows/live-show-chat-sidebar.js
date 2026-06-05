import { createChatInput } from '../chat/chat-input.js';
import { createChatWindow } from '../chat/chat-window.js';

export function createLiveShowChatSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'live-show-chat-sidebar';

  const title = document.createElement('h3');
  title.innerText = 'Live Interaction Chat';

  const content = document.createElement('div');
  content.className = 'live-show-chat-content';
  content.appendChild(createChatWindow());

  const input = document.createElement('div');
  input.className = 'live-show-chat-input';
  input.appendChild(createChatInput());

  sidebar.appendChild(title);
  sidebar.appendChild(content);
  sidebar.appendChild(input);

  return sidebar;
}
