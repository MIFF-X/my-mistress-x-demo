import { createStickersPanel } from './stickers-panel.js';

export function openStickersPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createStickersPanel());
}

export function createStickersButton({ label = 'Open Sticker Book', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openStickersPanel(appElement || document.getElementById('app'));
  return button;
}

export function createStickersDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card stickers-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Sticker Book / Collectibles';

  const text = document.createElement('p');
  text.innerText = 'Create, collect, and sell digital stickers tied to gifts, items, and collector moments.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openStickersPanel(appElement || document.getElementById('app'));

  return card;
}
