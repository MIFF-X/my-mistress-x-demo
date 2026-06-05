import { createWalletPanel } from './wallet-panel.js';

export function openWalletPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createWalletPanel());
}

export function createWalletButton({ label = 'Open Wallet', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openWalletPanel(appElement || document.getElementById('app'));
  return button;
}

export function createWalletDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card wallet-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Wallet';

  const text = document.createElement('p');
  text.innerText = 'View balance, test top-ups, and recent ledger activity.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openWalletPanel(appElement || document.getElementById('app'));

  return card;
}
