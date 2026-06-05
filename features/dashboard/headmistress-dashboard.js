import { createDashboardHealthPanel } from './dashboard-health-panel.js';
import { createDashboardModuleGrid } from './dashboard-module-grid.js';
import { createModerationQueuePanel } from './moderation-queue-panel.js';

function createStatCard(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel stat-card headmistress-stat-card';

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
  hero.className = 'panel headmistress-dashboard-hero';

  const eyebrow = document.createElement('small');
  eyebrow.innerText = 'Headmistress Command Centre';

  const title = document.createElement('h1');
  title.innerText = 'Headmistress Dashboard';

  const text = document.createElement('p');
  text.innerText = 'Oversee the platform stack, review money/action modules, manage catalog foundations, monitor alerts, and prepare admin-grade governance tools from one control screen.';

  hero.appendChild(eyebrow);
  hero.appendChild(title);
  hero.appendChild(text);

  return hero;
}

function createQuickStats() {
  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid headmistress-quick-stats';

  grid.appendChild(createStatCard('Platform Stack', 'Online', 'Wallet, chat, PPV, subscriptions, live shows, gifts, stickers, marketplace, Rolodex, and notifications are mounted.'));
  grid.appendChild(createStatCard('Backend Coverage', 'Complete', 'All currently mounted dashboard modules have backend routes or persistence layers.'));
  grid.appendChild(createStatCard('Governance Queue', 'Ready', 'Next layer: role guards, validation, tests, event hooks, seed docs, and final admin controls.'));

  return grid;
}

function createOpsPanel() {
  const panel = document.createElement('section');
  panel.className = 'panel headmistress-ops-panel';

  const title = document.createElement('h2');
  title.innerText = 'Control Priorities';

  const list = document.createElement('ul');
  [
    'Review module health and dashboard access by role.',
    'Keep seeded gifts, stickers, plans, and demo live shows aligned with product direction.',
    'Prepare role validation and admin-only actions before public launch.',
    'Connect notification event hooks across wallet, gifts, stickers, PPV, marketplace, subscriptions, and live shows.',
  ].forEach((itemText) => {
    const item = document.createElement('li');
    item.innerText = itemText;
    list.appendChild(item);
  });

  panel.appendChild(title);
  panel.appendChild(list);

  return panel;
}

export function createHeadmistressDashboard(appElement = document.getElementById('app')) {
  const shell = document.createElement('section');
  shell.className = 'page-shell headmistress-dashboard final-role-dashboard';
  shell.dataset.role = 'HEADMISTRESS';

  const modulesTitle = document.createElement('h2');
  modulesTitle.innerText = 'Platform Modules';

  shell.appendChild(createHero());
  shell.appendChild(createQuickStats());
  shell.appendChild(createOpsPanel());
  shell.appendChild(createDashboardHealthPanel({ role: 'HEADMISTRESS' }));
  shell.appendChild(createModerationQueuePanel({ role: 'HEADMISTRESS' }));
  shell.appendChild(modulesTitle);
  shell.appendChild(createDashboardModuleGrid({ role: 'HEADMISTRESS', appElement }));

  return shell;
}
