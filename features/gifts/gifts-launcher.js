import { createGiftsPanel } from './gifts-panel.js';

export function openGiftsPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createGiftsPanel());
}

export function createGiftsButton({ label = 'Open Gifts', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openGiftsPanel(appElement || document.getElementById('app'));
  return button;
}

export function createGiftsDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card gifts-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Digital Gifts';

  const text = document.createElement('p');
  text.innerText = 'Send wallet-backed gifts, tips, crowns, diamonds, and tribute items.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openGiftsPanel(appElement || document.getElementById('app'));

  return card;
}
