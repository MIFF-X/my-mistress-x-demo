const MODULE_HEALTH = [
  {
    name: 'Wallet',
    status: 'DTO-backed',
    coverage: ['JWT', 'Prisma', 'Ledger', 'Validation'],
    note: 'Balance, top-up/credit, spend, transactions, and wallet spend DTOs are connected.',
  },
  {
    name: 'Messages / Chat',
    status: 'Presence-enabled',
    coverage: ['JWT', 'Prisma', 'Validation', 'Read receipts', 'Notifications'],
    note: 'Rooms, messages, paid unlock, presence heartbeats, typing pulses, read receipts, unread counts, and normal chat notifications are wired.',
  },
  {
    name: 'PPV Content',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Creator route guarded; unlock flow emits buyer and Mistress notifications.',
  },
  {
    name: 'Subscriptions',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Plan creation guarded; subscription activation emits both-side notifications.',
  },
  {
    name: 'Live Shows',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Shows, tickets, start/end, tips, and purchase notifications are wired.',
  },
  {
    name: 'Digital Gifts',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Gift catalog and ownership are persistent; receiver notifications are wired.',
  },
  {
    name: 'Marketplace',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Product creation, purchases, order records, and sale notifications are wired.',
  },
  {
    name: 'Stickers / Collectibles',
    status: 'Hardened',
    coverage: ['JWT', 'Roles', 'Validation', 'Notifications'],
    note: 'Sticker definitions, collection records, and collector notifications are wired.',
  },
  {
    name: 'Rolodex / Contact Cards',
    status: 'Report-enabled',
    coverage: ['JWT', 'Prisma', 'Validation', 'Moderation'],
    note: 'Persistent contact-card routes and per-card moderation report buttons are wired.',
  },
  {
    name: 'Notifications / Bell',
    status: 'Styled unread-enabled',
    coverage: ['JWT', 'Prisma', 'Event hooks', 'Unread badge', 'Visual polish'],
    note: 'Persistent notifications, helper methods, chat unread metadata, unread-by-type summaries, dashboard badge counts, and notification-specific style injection are wired.',
  },
];

function createMetricCard(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel dashboard-health-metric';

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

function createHealthRow(module) {
  const row = document.createElement('article');
  row.className = 'panel dashboard-health-row';

  const header = document.createElement('div');
  header.className = 'dashboard-health-row-header';

  const title = document.createElement('h3');
  title.innerText = module.name;

  const status = document.createElement('span');
  status.className = 'status-pill dashboard-health-status';
  status.innerText = module.status;

  const coverage = document.createElement('p');
  coverage.innerText = module.coverage.join(' · ');

  const note = document.createElement('p');
  note.innerText = module.note;

  header.appendChild(title);
  header.appendChild(status);
  row.appendChild(header);
  row.appendChild(coverage);
  row.appendChild(note);

  return row;
}

export function createDashboardHealthPanel({ role = 'SUB' } = {}) {
  const shell = document.createElement('section');
  shell.className = 'dashboard-health-panel';
  shell.dataset.role = role;

  const title = document.createElement('h2');
  title.innerText = 'Module Health & Analytics';

  const helper = document.createElement('p');
  helper.innerText = 'Snapshot of connected modules, backend coverage, role guards, validation, notification hooks, read receipts, dashboard badges, and notification visual polish for the current build.';

  const metrics = document.createElement('div');
  metrics.className = 'dashboard-card-grid dashboard-health-metrics';
  metrics.appendChild(createMetricCard('Mounted modules', String(MODULE_HEALTH.length), 'All visible dashboard modules are backend-backed.'));
  metrics.appendChild(createMetricCard('Hardened money flows', '6', 'PPV, subscriptions, live shows, gifts, marketplace, and stickers have validation/guard/event coverage.'));
  metrics.appendChild(createMetricCard('DTO-backed controllers', '10', 'Moderation, marketplace, subscriptions, PPV, live shows, gifts, stickers, wallet, chat, Rolodex, and notifications now use DTO request contracts.'));
  metrics.appendChild(createMetricCard('Chat presence layer', 'On', 'Presence, typing, read receipts, unread counts, and chat notification metadata are wired.'));
  metrics.appendChild(createMetricCard('Notification visual polish', 'On', 'Unread badges, metadata lines, unread-by-type summaries, unread rows, and read rows are styled.'));
  metrics.appendChild(createMetricCard('Final role dashboards', '4/4', 'Headmistress, Admin, Mistress, and Sub dashboards are routed.'));

  const list = document.createElement('div');
  list.className = 'dashboard-health-list';
  MODULE_HEALTH.forEach((module) => list.appendChild(createHealthRow(module)));

  shell.appendChild(title);
  shell.appendChild(helper);
  shell.appendChild(metrics);
  shell.appendChild(list);

  return shell;
}
