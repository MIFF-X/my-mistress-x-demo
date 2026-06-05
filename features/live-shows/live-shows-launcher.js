import { createLiveShowsPanel } from './live-shows-panel.js';

export function openLiveShowsPanel(appElement = document.getElementById('app')) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createLiveShowsPanel());
}

export function createLiveShowsButton({ label = 'Open Live Shows', className = 'button-secondary', appElement } = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openLiveShowsPanel(appElement || document.getElementById('app'));
  return button;
}

export function createLiveShowsDashboardCard({ appElement } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card live-shows-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Live Shows';

  const text = document.createElement('p');
  text.innerText = 'Schedule live sessions, start/end shows, and send wallet-backed tips.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openLiveShowsPanel(appElement || document.getElementById('app'));

  return card;
}
