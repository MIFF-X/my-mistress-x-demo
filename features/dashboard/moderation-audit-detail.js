function formatDate(value) {
  if (!value) return 'No timestamp';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString();
}

function formatJson(value) {
  if (!value) return 'None';

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function titleCase(value) {
  return String(value || '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function createField(label, value) {
  const row = document.createElement('div');
  row.className = 'moderation-audit-field';

  const key = document.createElement('strong');
  key.innerText = label;

  const text = document.createElement('span');
  text.innerText = value || 'None';

  row.appendChild(key);
  row.appendChild(text);

  return row;
}

function createActionRow(action) {
  const row = document.createElement('article');
  row.className = 'panel moderation-audit-action-row';

  const title = document.createElement('h4');
  title.innerText = titleCase(action.action || 'Action');

  const meta = document.createElement('p');
  meta.className = 'muted-text';
  meta.innerText = `${formatDate(action.createdAt)}${action.actorId ? ` · Actor: ${action.actorId}` : ''}`;

  const note = document.createElement('p');
  note.innerText = action.note || 'No note attached.';

  const metadata = document.createElement('pre');
  metadata.className = 'moderation-audit-metadata';
  metadata.innerText = formatJson(action.metadata);

  row.appendChild(title);
  row.appendChild(meta);
  row.appendChild(note);
  row.appendChild(metadata);

  return row;
}

export function createModerationAuditDetail(item, { onClose } = {}) {
  const shell = document.createElement('section');
  shell.className = 'panel moderation-audit-detail';

  const header = document.createElement('div');
  header.className = 'moderation-audit-header';

  const title = document.createElement('h3');
  title.innerText = item?.title || 'Moderation Audit Detail';

  const closeButton = document.createElement('button');
  closeButton.type = 'button';
  closeButton.className = 'secondary-button';
  closeButton.innerText = 'Close detail';
  closeButton.addEventListener('click', () => {
    if (typeof onClose === 'function') onClose();
  });

  header.appendChild(title);
  header.appendChild(closeButton);

  const summary = document.createElement('div');
  summary.className = 'moderation-audit-summary';
  summary.appendChild(createField('Status', titleCase(item?.status || 'OPEN')));
  summary.appendChild(createField('Area', titleCase(item?.area || 'SYSTEM')));
  summary.appendChild(createField('Type', titleCase(item?.type || 'REPORT')));
  summary.appendChild(createField('Priority', titleCase(item?.priority || 'MEDIUM')));
  summary.appendChild(createField('Reporter', item?.reporterUserId));
  summary.appendChild(createField('Target user', item?.targetUserId));
  summary.appendChild(createField('Assigned to', item?.assignedToId));
  summary.appendChild(createField('Resolved by', item?.resolvedById));
  summary.appendChild(createField('Created', formatDate(item?.createdAt)));
  summary.appendChild(createField('Updated', formatDate(item?.updatedAt)));

  const description = document.createElement('p');
  description.innerText = item?.description || 'No description provided.';

  const metadataTitle = document.createElement('h4');
  metadataTitle.innerText = 'Target / Metadata';

  const metadata = document.createElement('pre');
  metadata.className = 'moderation-audit-metadata';
  metadata.innerText = formatJson({
    targetType: item?.targetType,
    targetId: item?.targetId,
    metadata: item?.metadata,
    resolutionNote: item?.resolutionNote,
    resolvedAt: item?.resolvedAt,
  });

  const actionsTitle = document.createElement('h4');
  actionsTitle.innerText = 'Action History';

  const actions = document.createElement('div');
  actions.className = 'moderation-audit-actions';

  const actionRows = Array.isArray(item?.actions) ? item.actions : [];
  if (!actionRows.length) {
    const empty = document.createElement('p');
    empty.innerText = 'No audit actions recorded yet.';
    actions.appendChild(empty);
  } else {
    actionRows.forEach((action) => actions.appendChild(createActionRow(action)));
  }

  shell.appendChild(header);
  shell.appendChild(description);
  shell.appendChild(summary);
  shell.appendChild(metadataTitle);
  shell.appendChild(metadata);
  shell.appendChild(actionsTitle);
  shell.appendChild(actions);

  return shell;
}
