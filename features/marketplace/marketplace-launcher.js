import { createMarketplacePanel } from './marketplace-panel.js';

export function openMarketplacePanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createMarketplacePanel());
}

export function createMarketplaceButton({ label = 'Open Marketplace', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openMarketplacePanel(appElement || document.getElementById('app'));
  return button;
}

export function createMarketplaceDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card marketplace-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Marketplace / Inventory';

  const text = document.createElement('p');
  text.innerText = 'Create products, browse listings, purchase inventory, and manage stock-based offers.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openMarketplacePanel(appElement || document.getElementById('app'));

  return card;
}
