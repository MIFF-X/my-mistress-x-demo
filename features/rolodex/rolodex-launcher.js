import { createRolodexPanel } from './rolodex-panel.js';

export function openRolodexPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createRolodexPanel());
}

export function createRolodexButton({ label = 'Open Rolodex', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openRolodexPanel(appElement || document.getElementById('app'));
  return button;
}

export function createRolodexDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card rolodex-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Rolodex / Contact Cards';

  const text = document.createElement('p');
  text.innerText = 'Create profile cards, contract cards, MX awards, and collector cards.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openRolodexPanel(appElement || document.getElementById('app'));

  return card;
}
