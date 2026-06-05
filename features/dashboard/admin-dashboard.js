import { createDashboardHealthPanel } from './dashboard-health-panel.js';
import { createDashboardModuleGrid } from './dashboard-module-grid.js';
import { createModerationQueuePanel } from './moderation-queue-panel.js';

function createStatCard(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel stat-card admin-stat-card';

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
  hero.className = 'panel admin-dashboard-hero';

  const eyebrow = document.createElement('small');
  eyebrow.innerText = 'Admin Operations Panel';

  const title = document.createElement('h1');
  title.innerText = 'Admin Dashboard';

  const text = document.createElement('p');
  text.innerText = 'Manage day-to-day platform operations, review connected modules, monitor transaction-heavy areas, and prepare moderation, validation, and support workflows.';

  hero.appendChild(eyebrow);
  hero.appendChild(title);
  hero.appendChild(text);

  return hero;
}

function createQuickStats() {
  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid admin-quick-stats';

  grid.appendChild(createStatCard('Operations', 'Ready', 'Use connected modules to inspect wallet, chat, PPV, subscriptions, live shows, gifts, stickers, marketplace, Rolodex, and alerts.'));
  grid.appendChild(createStatCard('Support Queue', 'Pending', 'Reports, disputes, verification, moderation, and account review panels are scaffolded for backend wiring.'));
  grid.appendChild(createStatCard('System Control', 'Active', 'Backend-backed modules are mounted and ready for validation, testing, and role guard hardening.'));

  return grid;
}

function createAdminChecklist() {
  const panel = document.createElement('section');
  panel.className = 'panel admin-checklist-panel';

  const title = document.createElement('h2');
  title.innerText = 'Admin Build Priorities';

  const list = document.createElement('ul');
  [
    'Connect moderation queues to report and dispute APIs.',
    'Add payment dispute, refund, payout, and ledger review panels.',
    'Add verification and account review workflows.',
    'Expand service/controller tests for money and ownership routes.',
  ].forEach((itemText) => {
    const item = document.createElement('li');
    item.innerText = itemText;
    list.appendChild(item);
  });

  panel.appendChild(title);
  panel.appendChild(list);

  return panel;
}

export function createAdminDashboard(appElement = document.getElementById('app')) {
  const shell = document.createElement('section');
  shell.className = 'page-shell admin-dashboard final-role-dashboard';
  shell.dataset.role = 'ADMIN';

  const modulesTitle = document.createElement('h2');
  modulesTitle.innerText = 'Admin Modules';

  shell.appendChild(createHero());
  shell.appendChild(createQuickStats());
  shell.appendChild(createAdminChecklist());
  shell.appendChild(createDashboardHealthPanel({ role: 'ADMIN' }));
  shell.appendChild(createModerationQueuePanel({ role: 'ADMIN' }));
  shell.appendChild(modulesTitle);
  shell.appendChild(createDashboardModuleGrid({ role: 'ADMIN', appElement }));

  return shell;
}
