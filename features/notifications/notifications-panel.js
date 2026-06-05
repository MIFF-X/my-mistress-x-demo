import { notificationsApi, NOTIFICATION_TYPES } from './notifications-api.js';
import { buildNotificationSummary, formatUnreadByTypeSummary } from './notification-summary.js';
import { ensureNotificationStyles } from './notification-styles.js';

function createButton(label, className = 'button-secondary') {
  const button = document.createElement('button');
  button.className = className;
  button.innerText = label;
  return button;
}

function createTypeSelect() {
  const select = document.createElement('select');
  select.className = 'input-field';

  NOTIFICATION_TYPES.forEach((type) => {
    const option = document.createElement('option');
    option.value = type;
    option.innerText = type.replaceAll('_', ' ');
    select.appendChild(option);
  });

  return select;
}

function getMetadata(notification) {
  return notification?.metadata && typeof notification.metadata === 'object'
    ? notification.metadata
    : {};
}

function createNotificationMetaLine(notification) {
  const metadata = getMetadata(notification);
  const parts = [];

  if (notification.type === 'CHAT') {
    if (metadata.roomId) parts.push(`Room: ${metadata.roomId}`);
    if (metadata.senderUserId) parts.push(`From: ${metadata.senderUserId}`);
    if (metadata.unreadCount !== undefined) parts.push(`Chat unread: ${metadata.unreadCount}`);
  }

  if (metadata.source) parts.push(`Source: ${metadata.source}`);
  if (!parts.length) return null;

  const line = document.createElement('small');
  line.className = 'notification-metadata-line';
  line.innerText = parts.join(' · ');
  return line;
}

function createNotificationRow(notification, onRefresh) {
  const row = document.createElement('article');
  row.className = `panel notification-row ${notification.read ? 'is-read' : 'is-unread'}`;

  const heading = document.createElement('h3');
  heading.innerText = notification.title || notification.type || 'Notification';

  const meta = document.createElement('small');
  meta.innerText = `${notification.type || 'SYSTEM'} · ${notification.read ? 'Read' : 'Unread'} · ${notification.createdAt || ''}`;

  const message = document.createElement('p');
  message.innerText = notification.message || '';

  const metadataLine = createNotificationMetaLine(notification);

  const markReadBtn = createButton('Mark Read');
  markReadBtn.disabled = Boolean(notification.read);
  markReadBtn.onclick = async () => {
    await notificationsApi.markRead(notification.id);
    await onRefresh?.();
  };

  row.appendChild(heading);
  row.appendChild(meta);
  row.appendChild(message);
  if (metadataLine) row.appendChild(metadataLine);
  row.appendChild(markReadBtn);

  return row;
}

function createTestNotificationForm(onCreated) {
  const form = document.createElement('div');
  form.className = 'panel notification-test-form';

  const title = document.createElement('h3');
  title.innerText = 'Create Test Notification';

  const typeSelect = createTypeSelect();

  const titleInput = document.createElement('input');
  titleInput.className = 'input-field';
  titleInput.placeholder = 'Notification title';

  const messageInput = document.createElement('input');
  messageInput.className = 'input-field';
  messageInput.placeholder = 'Notification message';

  const submit = createButton('Add Notification', 'button-primary');
  submit.onclick = async () => {
    const notification = await notificationsApi.create({
      type: typeSelect.value,
      title: titleInput.value || `${typeSelect.value.replaceAll('_', ' ')} Alert`,
      message: messageInput.value || 'Test notification created from the frontend scaffold.',
      metadata: { source: 'notifications_panel_test_form' },
    });

    titleInput.value = '';
    messageInput.value = '';
    await onCreated?.(notification);
  };

  form.appendChild(title);
  form.appendChild(typeSelect);
  form.appendChild(titleInput);
  form.appendChild(messageInput);
  form.appendChild(submit);

  return form;
}

export function createNotificationsPanel() {
  ensureNotificationStyles();

  const shell = document.createElement('section');
  shell.className = 'page-shell notifications-panel';

  const title = document.createElement('h2');
  title.innerText = 'Notifications';

  const summary = document.createElement('p');
  summary.className = 'notification-summary';

  const typeSummary = document.createElement('p');
  typeSummary.className = 'notification-type-summary muted-text';

  const actions = document.createElement('div');
  actions.className = 'button-row';

  const refreshBtn = createButton('Refresh');
  const markAllReadBtn = createButton('Mark All Read');
  const clearBtn = createButton('Clear All');

  actions.appendChild(refreshBtn);
  actions.appendChild(markAllReadBtn);
  actions.appendChild(clearBtn);

  const list = document.createElement('div');
  list.className = 'notification-list';

  async function loadNotifications() {
    list.innerHTML = '';

    const notifications = await notificationsApi.list();
    const notificationSummary = buildNotificationSummary(notifications);

    summary.innerText = `${notificationSummary.total} total · ${notificationSummary.unread} unread · ${notificationSummary.chatUnread} chat unread`;
    typeSummary.innerText = formatUnreadByTypeSummary(notificationSummary.unreadByType);

    if (!notifications.length) {
      const empty = document.createElement('p');
      empty.innerText = 'No notifications yet.';
      list.appendChild(empty);
      return;
    }

    notifications.forEach((notification) => {
      list.appendChild(createNotificationRow(notification, loadNotifications));
    });
  }

  refreshBtn.onclick = loadNotifications;

  markAllReadBtn.onclick = async () => {
    await notificationsApi.markAllRead();
    await loadNotifications();
  };

  clearBtn.onclick = async () => {
    await notificationsApi.clear();
    await loadNotifications();
  };

  shell.appendChild(title);
  shell.appendChild(summary);
  shell.appendChild(typeSummary);
  shell.appendChild(actions);
  shell.appendChild(createTestNotificationForm(loadNotifications));
  shell.appendChild(list);

  loadNotifications();

  return shell;
}
