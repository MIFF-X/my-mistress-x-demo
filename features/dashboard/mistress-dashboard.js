import { createDashboardHealthPanel } from './dashboard-health-panel.js';
import { createDashboardModuleGrid } from './dashboard-module-grid.js';

function createStatCard(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel stat-card mistress-stat-card';

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
  hero.className = 'panel mistress-dashboard-hero';

  const eyebrow = document.createElement('small');
  eyebrow.innerText = 'Mistress Command Suite';

  const title = document.createElement('h1');
  title.innerText = 'Mistress Dashboard';

  const text = document.createElement('p');
  text.innerText = 'Manage earnings, followers, chats, PPV content, subscriptions, live shows, gifts, marketplace inventory, stickers, and contact cards from one command screen.';

  hero.appendChild(eyebrow);
  hero.appendChild(title);
  hero.appendChild(text);

  return hero;
}

function createQuickStats() {
  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid mistress-quick-stats';

  grid.appendChild(createStatCard('Earnings Vault', 'Live', 'Wallet, gifts, PPV, subscriptions, marketplace, and live tips feed into earnings.'));
  grid.appendChild(createStatCard('Content Engine', 'Ready', 'Create PPV, stickers, products, and live shows from connected modules.'));
  grid.appendChild(createStatCard('Audience Control', 'Active', 'Use chat, Rolodex, notifications, and subscriptions to manage your circle.'));

  return grid;
}

export function createMistressDashboard(appElement = document.getElementById('app')) {
  const shell = document.createElement('section');
  shell.className = 'page-shell mistress-dashboard final-role-dashboard';
  shell.dataset.role = 'MISTRESS';

  const modulesTitle = document.createElement('h2');
  modulesTitle.innerText = 'Mistress Tools';

  shell.appendChild(createHero());
  shell.appendChild(createQuickStats());
  shell.appendChild(createDashboardHealthPanel({ role: 'MISTRESS' }));
  shell.appendChild(modulesTitle);
  shell.appendChild(createDashboardModuleGrid({ role: 'MISTRESS', appElement }));

  return shell;
}
