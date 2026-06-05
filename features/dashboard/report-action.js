import { moderationApi } from './moderation-api.js';

const DEFAULT_AREA_BY_TARGET = {
  chat: 'CHAT',
  ppv: 'PPV',
  marketplace: 'MARKETPLACE',
  liveShow: 'LIVE_SHOW',
  profile: 'PROFILE',
  wallet: 'LEDGER',
  ledger: 'LEDGER',
};

function normalizeArea(targetType, area) {
  return area || DEFAULT_AREA_BY_TARGET[targetType] || 'SYSTEM';
}

function buildReportPayload({
  title,
  description,
  targetType,
  targetId,
  targetUserId,
  area,
  priority = 'MEDIUM',
  metadata = {},
}) {
  return {
    type: 'REPORT',
    area: normalizeArea(targetType, area),
    priority,
    title: title || `Report ${targetType || 'item'}`,
    description: description || 'Reported from frontend panel.',
    targetType,
    targetId,
    targetUserId,
    metadata: {
      source: 'frontend_report_button',
      ...metadata,
    },
  };
}

export function createReportButton({
  label = 'Report',
  title,
  description,
  targetType,
  targetId,
  targetUserId,
  area,
  priority,
  metadata,
  onCreated,
  onError,
} = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'secondary-button report-action-button';
  button.innerText = label;

  button.addEventListener('click', async () => {
    const originalText = button.innerText;
    button.disabled = true;
    button.innerText = 'Reporting...';

    try {
      const item = await moderationApi.createItem(buildReportPayload({
        title,
        description,
        targetType,
        targetId,
        targetUserId,
        area,
        priority,
        metadata,
      }));

      button.innerText = 'Reported';
      if (typeof onCreated === 'function') onCreated(item);
    } catch (error) {
      button.disabled = false;
      button.innerText = originalText;
      if (typeof onError === 'function') onError(error);
    }
  });

  return button;
}

export function createReportStatusLine() {
  const status = document.createElement('p');
  status.className = 'muted-text report-action-status';
  status.innerText = '';
  return status;
}

export function attachReportFeedback(button, statusLine) {
  if (!button || !statusLine) return;

  button.addEventListener('report:created', () => {
    statusLine.innerText = 'Report created and sent to moderation.';
  });

  button.addEventListener('report:error', (event) => {
    statusLine.innerText = event.detail?.message || 'Could not create report.';
  });
}
