import { createSubscriptionsPanel } from './subscriptions-panel.js';

export function openSubscriptionsPanel({ appElement = document.getElementById('app'), knownPlans = [] } = {}) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createSubscriptionsPanel({ knownPlans }));
}

export function createSubscriptionsButton({
  label = 'Open Subscriptions',
  className = 'button-secondary',
  appElement,
  knownPlans = [],
} = {}) {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openSubscriptionsPanel({
    appElement: appElement || document.getElementById('app'),
    knownPlans,
  });
  return button;
}

export function createSubscriptionsDashboardCard({ appElement, knownPlans = [] } = {}) {
  const card = document.createElement('div');
  card.className = 'panel stat-card subscriptions-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Subscriptions';

  const text = document.createElement('p');
  text.innerText = 'Create VIP plans, subscribe, and manage recurring perks.';

  card.appendChild(title);
  card.appendChild(text);

  card.onclick = () => openSubscriptionsPanel({
    appElement: appElement || document.getElementById('app'),
    knownPlans,
  });

  return card;
}
