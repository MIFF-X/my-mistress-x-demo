import { chatStore } from './chat-store.js';
import { renderMessages } from './chat-window.js';
import { userStore } from '../../../../features/users/user-store.js';
import { punishmentStore } from '../../../site/integrations/punishment-store.js';
import { createUserProfile } from '../../../site/monetization/users/user-profile.js';

function normalizeRole(role) {
  return String(role || '').toLowerCase();
}

function getVisibleUsers(role) {
  const currentRole = normalizeRole(role);
  const currentUser = userStore.currentUser
    || userStore.users.find((user) => normalizeRole(user.role) === currentRole)
    || { id: null, role: currentRole };

  return userStore.users.filter((user) => {
    const isCurrentUser = user.id === currentUser.id;
    const isBlocked = userStore.blocked.includes(user.id);
    const isDifferentRole = normalizeRole(user.role) !== normalizeRole(currentUser.role);
    const isExtinguished = punishmentStore.active.some(
      (item) => item.userId === user.id && item.presetId === 'extinguish',
    );

    return !isCurrentUser && isDifferentRole && !isBlocked && !isExtinguished;
  });
}

export function createChatList(chatWindow, role = 'mistress') {
  const list = document.createElement('div');
  list.className = 'chat-list';

  const heading = document.createElement('h3');
  heading.innerText = 'Conversations';
  list.appendChild(heading);

  const visibleUsers = getVisibleUsers(role);

  if (visibleUsers.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'chat-empty-state';
    empty.innerText = 'No conversations available.';
    list.appendChild(empty);
    return list;
  }

  visibleUsers.forEach((user) => {
    const userItem = document.createElement('div');
    userItem.className = 'chat-user';
    userItem.innerHTML = `${user.name}<br><small>${user.status || 'offline'}</small>`;

    userItem.onclick = () => {
      chatStore.currentConversation = user.name;

      const chatTitle = chatWindow.querySelector('.chat-window-title');
      const messages = chatWindow.querySelector('#chat-messages');

      if (chatTitle) chatTitle.innerText = user.name;
      renderMessages(messages, user.name);

      list.querySelectorAll('.chat-user').forEach((item) => {
        item.classList.remove('active');
      });
      userItem.classList.add('active');
    };

    userItem.ondblclick = () => {
      const app = document.getElementById('app');
      if (!app) return;

      app.innerHTML = '';
      app.appendChild(createUserProfile(user));
    };

    list.appendChild(userItem);
  });

  return list;
}
