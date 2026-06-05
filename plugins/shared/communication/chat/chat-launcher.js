import { createChatPanel } from './chat-panel.js';

export function openChatPanel({ appElement = document.getElementById('app'), initialRoomId = null, receiverUserId = null, unlockCost = 10 } = {}) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createChatPanel({ initialRoomId, receiverUserId, unlockCost }));
}

export function createChatButton({
  label = 'Open Messages',
  className = 'button-secondary',
  appElement,
  initialRoomId = null,
  receiverUserId = null,
  unlockCost = 10,
} = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openChatPanel({
    appElement: appElement || document.getElementById('app'),
    initialRoomId,
    receiverUserId,
    unlockCost,
  });
  return button;
}

export function createChatDashboardCard({
  appElement,
  initialRoomId = null,
  receiverUserId = null,
  unlockCost = 10,
} = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card chat-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Messages';

  const text = document.createElement('p');
  text.innerText = receiverUserId
    ? 'Open private chat, unlock access, and send messages.'
    : 'Open chat rooms, view messages, and continue conversations.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openChatPanel({
    appElement: appElement || document.getElementById('app'),
    initialRoomId,
    receiverUserId,
    unlockCost,
  });

  return card;
}
