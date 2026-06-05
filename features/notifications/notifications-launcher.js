import { createNotificationsPanel } from './notifications-panel.js';
import { formatNotificationSummary, loadNotificationSummary } from './notification-summary.js';
import { ensureNotificationStyles } from './notification-styles.js';

export function openNotificationsPanel(appElement = document.getElementById('app')) {
  ensureNotificationStyles();

  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = '';
  appElement.appendChild(createNotificationsPanel());
}

export function createNotificationsButton({ label = 'Open Notifications', className = 'button-secondary', appElement } = {}) {
  ensureNotificationStyles();

  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  button.onclick = () => openNotificationsPanel(appElement || document.getElementById('app'));
  return button;
}

export function createNotificationsDashboardCard({ appElement } = {}) {
  ensureNotificationStyles();

  const card = document.createElement('div');
  card.className = 'panel stat-card notifications-dashboard-card';
  card.style.cursor = 'pointer';

  const title = document.createElement('h3');
  title.innerText = 'Notifications / Bell';

  const text = document.createElement('p');
  text.innerText = 'View wallet, chat, PPV, live show, gift, marketplace, sticker, Rolodex, and draw reminders.';

  const badge = document.createElement('strong');
  badge.className = 'notification-dashboard-badge';
  badge.innerText = 'Loading unread...';

  card.appendChild(title);
  card.appendChild(text);
  card.appendChild(badge);

  loadNotificationSummary()
    .then((summary) => {
      badge.innerText = formatNotificationSummary(summary);
      card.dataset.unreadCount = String(summary.unread);
      card.dataset.chatUnreadCount = String(summary.chatUnread);
    })
    .catch(() => {
      badge.innerText = 'Unread unavailable';
    });

  card.onclick = () => openNotificationsPanel(appElement || document.getElementById('app'));

  return card;
}
