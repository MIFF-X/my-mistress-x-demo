import { createPpvPanel } from './ppv-panel.js';

export function openPpvPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createPpvPanel());
}

export function createPpvButton({ label = 'Open PPV', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openPpvPanel(appElement || document.getElementById('app'));
  return button;
}

export function createPpvDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card ppv-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'PPV Content';

  const text = document.createElement('p');
  text.innerText = 'Create, browse, price, and unlock pay-per-view content.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openPpvPanel(appElement || document.getElementById('app'));

  return card;
}
