import { moderationApi } from './moderation-api.js';
import { createModerationAuditDetail } from './moderation-audit-detail.js';

const FALLBACK_QUEUE_ITEMS = [
  {
    id: 'chat-review',
    title: 'Chat Review Queue',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Admin / Headmistress',
    description: 'Review reported messages, paid-chat disputes, blocked-user appeals, and conversation safety flags.',
  },
  {
    id: 'marketplace-review',
    title: 'Marketplace Review Queue',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Admin',
    description: 'Review reported listings, fulfilment issues, worn-item order disputes, stock problems, and refund requests.',
  },
  {
    id: 'ppv-review',
    title: 'PPV Content Review Queue',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Admin / Headmistress',
    description: 'Review PPV reports, unlock disputes, visibility issues, and creator/content compliance flags.',
  },
  {
    id: 'live-show-review',
    title: 'Live Show Queue',
    priority: 'MEDIUM',
    status: 'PLANNED',
    owner: 'Headmistress',
    description: 'Review live show reports, ticket disputes, tipping issues, session incidents, and schedule problems.',
  },
  {
    id: 'profile-review',
    title: 'Profile & Verification Queue',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Admin',
    description: 'Review account verification, role changes, profile reports, identity flags, and restricted account actions.',
  },
  {
    id: 'payments-review',
    title: 'Payments / Ledger Queue',
    priority: 'HIGH',
    status: 'PLANNED',
    owner: 'Admin / Headmistress',
    description: 'Review wallet adjustments, failed payments, dispute reserves, payout holds, and suspicious ledger activity.',
  },
];

const FILTERS = {
  status: ['OPEN', 'IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED'],
  area: ['CHAT', 'MARKETPLACE', 'PPV', 'LIVE_SHOW', 'PROFILE', 'VERIFICATION', 'PAYMENTS', 'LEDGER', 'SYSTEM'],
  type: ['REPORT', 'DISPUTE', 'VERIFICATION', 'LEDGER_REVIEW', 'SAFETY_FLAG'],
  priority: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
};

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString();
}

function titleCase(value) {
  return String(value || '').replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createMetric(title, value, helper) {
  const card = document.createElement('article');
  card.className = 'panel moderation-metric-card';

  const heading = document.createElement('h3');
  heading.innerText = title;

  const strong = document.createElement('strong');
  strong.innerText = value;

  const text = document.createElement('p');
  text.innerText = helper;

  card.appendChild(heading);
  card.appendChild(strong);
  card.appendChild(text);

  return card;
}

function createSelectFilter(name, label, options) {
  const wrapper = document.createElement('label');
  wrapper.className = 'moderation-filter-control';

  const span = document.createElement('span');
  span.innerText = label;

  const select = document.createElement('select');
  select.name = name;

  const empty = document.createElement('option');
  empty.value = '';
  empty.innerText = `All ${label.toLowerCase()}`;
  select.appendChild(empty);

  options.forEach((optionValue) => {
    const option = document.createElement('option');
    option.value = optionValue;
    option.innerText = titleCase(optionValue);
    select.appendChild(option);
  });

  wrapper.appendChild(span);
  wrapper.appendChild(select);

  return { wrapper, input: select };
}

function createTextFilter(name, label, placeholder) {
  const wrapper = document.createElement('label');
  wrapper.className = 'moderation-filter-control';

  const span = document.createElement('span');
  span.innerText = label;

  const input = document.createElement('input');
  input.name = name;
  input.type = 'text';
  input.placeholder = placeholder;

  wrapper.appendChild(span);
  wrapper.appendChild(input);

  return { wrapper, input };
}

function createFilterBar({ onApply, onReset }) {
  const form = document.createElement('form');
  form.className = 'panel moderation-filter-bar';

  const title = document.createElement('h3');
  title.innerText = 'Queue Filters';

  const controls = document.createElement('div');
  controls.className = 'moderation-filter-controls';

  const status = createSelectFilter('status', 'Status', FILTERS.status);
  const area = createSelectFilter('area', 'Area', FILTERS.area);
  const type = createSelectFilter('type', 'Type', FILTERS.type);
  const priority = createSelectFilter('priority', 'Priority', FILTERS.priority);
  const assignedToId = createTextFilter('assignedToId', 'Assigned user id', 'Optional admin/user id');

  [status, area, type, priority, assignedToId].forEach((control) => controls.appendChild(control.wrapper));

  const actions = document.createElement('div');
  actions.className = 'moderation-filter-actions';

  const applyButton = document.createElement('button');
  applyButton.type = 'submit';
  applyButton.className = 'primary-button';
  applyButton.innerText = 'Apply filters';

  const resetButton = document.createElement('button');
  resetButton.type = 'button';
  resetButton.className = 'secondary-button';
  resetButton.innerText = 'Reset filters';

  actions.appendChild(applyButton);
  actions.appendChild(resetButton);

  function getValues() {
    return {
      status: status.input.value,
      area: area.input.value,
      type: type.input.value,
      priority: priority.input.value,
      assignedToId: assignedToId.input.value.trim(),
    };
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    onApply(getValues());
  });

  resetButton.addEventListener('click', () => {
    [status.input, area.input, type.input, priority.input, assignedToId.input].forEach((input) => {
      input.value = '';
    });
    onReset();
  });

  form.appendChild(title);
  form.appendChild(controls);
  form.appendChild(actions);

  return form;
}

function createStatusButton(item, status, onStatusChange) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button moderation-status-button';
  button.innerText = titleCase(status);
  button.disabled = item.status === status || item.status === 'PLANNED';

  button.addEventListener('click', async () => {
    button.disabled = true;
    button.innerText = 'Saving...';
    await onStatusChange(item.id, status);
  });

  return button;
}

function createAssignmentControl(item, onAssign) {
  const form = document.createElement('form');
  form.className = 'moderation-assign-control';

  const input = document.createElement('input');
  input.type = 'text';
  input.placeholder = item.assignedToId || 'Assign user id';
  input.value = item.assignedToId || '';
  input.setAttribute('aria-label', `Assign ${item.title} to user id`);

  const button = document.createElement('button');
  button.type = 'submit';
  button.className = 'primary-button moderation-assign-button';
  button.innerText = 'Assign';

  const helper = document.createElement('small');
  helper.className = 'muted-text moderation-assign-helper';
  helper.innerText = item.assignedToId ? `Currently assigned: ${item.assignedToId}` : 'Unassigned';

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const assignedToId = input.value.trim();
    if (!assignedToId) {
      helper.innerText = 'Enter an admin/user id before assigning.';
      return;
    }

    button.disabled = true;
    button.innerText = 'Assigning...';
    await onAssign(item.id, assignedToId);
  });

  form.appendChild(input);
  form.appendChild(button);
  form.appendChild(helper);

  return form;
}

function createQueueItem(item, {
  isBackendItem = false,
  onStatusChange = async () => {},
  onAssign = async () => {},
  onViewAudit = () => {},
} = {}) {
  const card = document.createElement('article');
  card.className = 'panel moderation-queue-item';
  card.dataset.queueId = item.id;

  const header = document.createElement('div');
  header.className = 'moderation-queue-header';

  const title = document.createElement('h3');
  title.innerText = item.title;

  const priority = document.createElement('span');
  priority.className = 'status-pill moderation-priority-pill';
  priority.innerText = item.priority || 'MEDIUM';

  const status = document.createElement('p');
  const owner = item.assignedToId || item.owner || 'Unassigned';
  status.innerText = `${item.status || 'OPEN'} · ${owner}`;

  const description = document.createElement('p');
  description.innerText = item.description || 'No description provided.';

  const meta = document.createElement('p');
  meta.className = 'muted-text moderation-item-meta';
  meta.innerText = isBackendItem
    ? `${item.type || 'REPORT'} · ${item.area || 'SYSTEM'}${item.createdAt ? ` · ${formatDate(item.createdAt)}` : ''}`
    : 'Scaffold queue · backend item not created yet';

  header.appendChild(title);
  header.appendChild(priority);
  card.appendChild(header);
  card.appendChild(status);
  card.appendChild(description);
  card.appendChild(meta);

  if (isBackendItem) {
    card.appendChild(createAssignmentControl(item, onAssign));

    const actions = document.createElement('div');
    actions.className = 'moderation-queue-actions';

    const auditButton = document.createElement('button');
    auditButton.type = 'button';
    auditButton.className = 'secondary-button moderation-audit-button';
    auditButton.innerText = 'View audit';
    auditButton.addEventListener('click', () => onViewAudit(item));
    actions.appendChild(auditButton);

    ['IN_REVIEW', 'RESOLVED', 'DISMISSED', 'ESCALATED'].forEach((nextStatus) => {
      actions.appendChild(createStatusButton(item, nextStatus, onStatusChange));
    });
    card.appendChild(actions);
  }

  return card;
}

function renderMetrics(container, items, backendLoaded) {
  container.innerHTML = '';
  const highPriorityCount = items.filter((item) => ['HIGH', 'URGENT'].includes(item.priority)).length;
  const openCount = items.filter((item) => ['OPEN', 'IN_REVIEW', 'ESCALATED'].includes(item.status)).length;

  container.appendChild(createMetric('Queue items', String(items.length), backendLoaded ? 'Live moderation items loaded from backend.' : 'Scaffold queue areas shown until backend data exists.'));
  container.appendChild(createMetric('High priority', String(highPriorityCount), 'High and urgent items need first review.'));
  container.appendChild(createMetric('Open / active', String(openCount), backendLoaded ? 'Open, in-review, and escalated backend items.' : 'Backend status pending.'));
}

function renderList(container, items, backendLoaded, onStatusChange, onAssign, onViewAudit) {
  container.innerHTML = '';
  items.forEach((item) => {
    container.appendChild(createQueueItem(item, {
      isBackendItem: backendLoaded,
      onStatusChange,
      onAssign,
      onViewAudit,
    }));
  });
}

function describeFilters(filters) {
  const activeFilters = Object.entries(filters).filter(([, value]) => value);
  if (!activeFilters.length) return 'No filters applied.';
  return `Filters: ${activeFilters.map(([key, value]) => `${titleCase(key)} = ${titleCase(value)}`).join(' · ')}`;
}

export function createModerationQueuePanel({ role = 'ADMIN' } = {}) {
  const shell = document.createElement('section');
  shell.className = 'moderation-queue-panel';
  shell.dataset.role = role;

  const title = document.createElement('h2');
  title.innerText = 'Moderation & Reporting Queues';

  const helper = document.createElement('p');
  helper.innerText = 'Control-side review queues for reports, disputes, verification, and ledger review. Admin and Headmistress roles can load, assign, triage, escalate, resolve, or dismiss backend queue items.';

  const statusLine = document.createElement('p');
  statusLine.className = 'muted-text moderation-load-status';
  statusLine.innerText = 'Loading moderation queue...';

  const filterStatus = document.createElement('p');
  filterStatus.className = 'muted-text moderation-filter-status';
  filterStatus.innerText = 'No filters applied.';

  const refreshButton = document.createElement('button');
  refreshButton.type = 'button';
  refreshButton.className = 'secondary-button moderation-refresh-button';
  refreshButton.innerText = 'Refresh queue';

  const metrics = document.createElement('div');
  metrics.className = 'dashboard-card-grid moderation-metrics-grid';

  const auditDetail = document.createElement('div');
  auditDetail.className = 'moderation-audit-detail-mount';

  const list = document.createElement('div');
  list.className = 'dashboard-card-grid moderation-queue-grid';

  let activeFilters = {};

  function showAuditDetail(item) {
    auditDetail.innerHTML = '';
    auditDetail.appendChild(createModerationAuditDetail(item, {
      onClose: () => {
        auditDetail.innerHTML = '';
      },
    }));
    statusLine.innerText = `Viewing audit detail for ${item.title || item.id}.`;
  }

  async function loadItems(filters = activeFilters) {
    activeFilters = filters;
    filterStatus.innerText = describeFilters(activeFilters);
    refreshButton.disabled = true;
    refreshButton.innerText = 'Loading...';

    try {
      const items = await moderationApi.listItems(activeFilters);
      const normalizedItems = Array.isArray(items) ? items : [];
      const visibleItems = normalizedItems.length ? normalizedItems : FALLBACK_QUEUE_ITEMS;
      const backendLoaded = normalizedItems.length > 0;

      statusLine.innerText = backendLoaded
        ? `Loaded ${normalizedItems.length} backend moderation item${normalizedItems.length === 1 ? '' : 's'}.`
        : 'No backend moderation items yet. Showing scaffold queue areas.';
      renderMetrics(metrics, visibleItems, backendLoaded);
      renderList(list, visibleItems, backendLoaded, updateItemStatus, assignItem, showAuditDetail);
    } catch (error) {
      statusLine.innerText = `Could not load backend queue: ${error.message}. Showing scaffold queue areas.`;
      renderMetrics(metrics, FALLBACK_QUEUE_ITEMS, false);
      renderList(list, FALLBACK_QUEUE_ITEMS, false, updateItemStatus, assignItem, showAuditDetail);
    } finally {
      refreshButton.disabled = false;
      refreshButton.innerText = 'Refresh queue';
    }
  }

  async function updateItemStatus(itemId, status) {
    try {
      await moderationApi.updateStatus(itemId, status, `Updated from ${role} dashboard.`);
      await loadItems(activeFilters);
    } catch (error) {
      statusLine.innerText = `Could not update item: ${error.message}`;
      await loadItems(activeFilters);
    }
  }

  async function assignItem(itemId, assignedToId) {
    try {
      await moderationApi.assignItem(itemId, assignedToId);
      statusLine.innerText = `Assigned item ${itemId} to ${assignedToId}.`;
      await loadItems(activeFilters);
    } catch (error) {
      statusLine.innerText = `Could not assign item: ${error.message}`;
      await loadItems(activeFilters);
    }
  }

  const filters = createFilterBar({
    onApply: (nextFilters) => loadItems(nextFilters),
    onReset: () => loadItems({}),
  });

  refreshButton.addEventListener('click', () => loadItems(activeFilters));

  shell.appendChild(title);
  shell.appendChild(helper);
  shell.appendChild(filters);
  shell.appendChild(refreshButton);
  shell.appendChild(filterStatus);
  shell.appendChild(statusLine);
  shell.appendChild(metrics);
  shell.appendChild(auditDetail);
  shell.appendChild(list);

  loadItems({});

  return shell;
}
