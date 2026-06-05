import { createDashboardHealthPanel } from './dashboard-health-panel.js';
import { createDashboardModuleGrid } from './dashboard-module-grid.js';

function createStatCard(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel stat-card sub-stat-card';

  const heading = document.createElement('h3');
  heading.innerText = title;

  const number = document.createElement('strong');
  number.innerText = value;

  const text = document.createElement('p');
  text.innerText = helper;

  card.appendChild(heading);
  card.appendChild(number);
  card.appendChild(text);

  return card;
}

function createHero() {
  const hero = document.createElement('section');
  hero.className = 'panel sub-dashboard-hero';

  const eyebrow = document.createElement('small');
  eyebrow.innerText = 'Sub Control Panel';

  const title = document.createElement('h1');
  title.innerText = 'Sub Dashboard';

  const text = document.createElement('p');
  text.innerText = 'Track wallet balance, messages, subscriptions, live show tickets, gifts, marketplace purchases, stickers, contact cards, and alerts from one devotion dashboard.';

  hero.appendChild(eyebrow);
  hero.appendChild(title);
  hero.appendChild(text);

  return hero;
}

function createQuickStats() {
  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid sub-quick-stats';

  grid.appendChild(createStatCard('Wallet Ready', 'Active', 'Top up, spend credits, send gifts, unlock PPV, buy tickets, and purchase items.'));
  grid.appendChild(createStatCard('Collector Path', 'Open', 'Collect stickers, gifts, Rolodex cards, live tickets, and marketplace items.'));
  grid.appendChild(createStatCard('Devotion Loop', 'Connected', 'Follow messages, subscriptions, live shows, notifications, and Mistress activity.'));

  return grid;
}

export function createSubDashboard(appElement = document.getElementById('app')) {
  const shell = document.createElement('section');
  shell.className = 'page-shell sub-dashboard final-role-dashboard';
  shell.dataset.role = 'SUB';

  const modulesTitle = document.createElement('h2');
  modulesTitle.innerText = 'Sub Tools';

  shell.appendChild(createHero());
  shell.appendChild(createQuickStats());
  shell.appendChild(createDashboardHealthPanel({ role: 'SUB' }));
  shell.appendChild(modulesTitle);
  shell.appendChild(createDashboardModuleGrid({ role: 'SUB', appElement }));

  return shell;
}
