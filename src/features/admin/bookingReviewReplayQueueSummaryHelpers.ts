import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';

export type BookingReplayQueueSummary = {
  totalRows: number;
  staleAlerts: number;
  unacknowledgedAlerts: number;
  acknowledgedAlerts: number;
  escalatedAlerts: number;
  assignedAlerts: number;
  retryReminders: number;
  overdueRetryReminders: number;
  failedRows: number;
  latestActivityAt: string | null;
  statusTone: string;
  statusLabel: string;
};

function batchFailures(row: AdminBookingReviewBatchHistory) {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  return Array.isArray(metadata.failures) ? metadata.failures : [];
}

function failedAgeHours(createdAt: string) {
  const createdTime = new Date(createdAt).getTime();
  if (!Number.isFinite(createdTime)) return null;
  return Math.max(0, Math.floor((Date.now() - createdTime) / 36e5));
}

function isStaleFailure(row: AdminBookingReviewBatchHistory) {
  const metadata = (row.metadata || {}) as Record<string, unknown>;
  const failed = Number(metadata.failed || batchFailures(row).length || 0);
  const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
  const ageHours = failedAgeHours(row.createdAt);
  return failed > 0 && !replayed && ageHours !== null && ageHours >= 24;
}

export function buildBookingReplayQueueSummary(rows: AdminBookingReviewBatchHistory[]): BookingReplayQueueSummary {
  const summary = rows.reduce<BookingReplayQueueSummary>((acc, row) => {
    const metadata = (row.metadata || {}) as Record<string, unknown>;
    const alertStatus = String(metadata.latestAlertStatus || (isStaleFailure(row) ? 'UNACKNOWLEDGED' : '')).toUpperCase();
    const failed = Number(metadata.failed || batchFailures(row).length || 0);

    acc.totalRows += 1;
    acc.failedRows += failed;
    if (isStaleFailure(row)) acc.staleAlerts += 1;
    if (alertStatus === 'UNACKNOWLEDGED') acc.unacknowledgedAlerts += 1;
    if (alertStatus === 'ACKNOWLEDGED') acc.acknowledgedAlerts += 1;
    if (alertStatus === 'ESCALATED') acc.escalatedAlerts += 1;
    if (metadata.latestAlertAssignedToId || metadata.assignedToId) acc.assignedAlerts += 1;
    if (metadata.retryReminderDueAt) acc.retryReminders += 1;
    if (metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE') acc.overdueRetryReminders += 1;

    const activityAt = String(metadata.latestAlertAt || row.createdAt || '');
    if (activityAt) {
      const activityTime = new Date(activityAt).getTime();
      const currentLatest = acc.latestActivityAt ? new Date(acc.latestActivityAt).getTime() : 0;
      if (Number.isFinite(activityTime) && activityTime > currentLatest) {
        acc.latestActivityAt = new Date(activityTime).toISOString();
      }
    }

    return acc;
  }, {
    totalRows: 0,
    staleAlerts: 0,
    unacknowledgedAlerts: 0,
    acknowledgedAlerts: 0,
    escalatedAlerts: 0,
    assignedAlerts: 0,
    retryReminders: 0,
    overdueRetryReminders: 0,
    failedRows: 0,
    latestActivityAt: null,
    statusTone: '#1D9E75',
    statusLabel: 'Healthy',
  });

  if (summary.escalatedAlerts || summary.overdueRetryReminders) {
    summary.statusTone = '#ff6b6b';
    summary.statusLabel = 'Escalation needed';
  } else if (summary.staleAlerts || summary.unacknowledgedAlerts) {
    summary.statusTone = '#ff9abf';
    summary.statusLabel = 'Attention needed';
  } else if (summary.retryReminders || summary.acknowledgedAlerts) {
    summary.statusTone = '#d4af37';
    summary.statusLabel = 'Monitoring';
  }

  return summary;
}

export function bookingReplayQueueSummaryCards(summary: BookingReplayQueueSummary) {
  return [
    { label: 'Rows', value: String(summary.totalRows), tone: '#ff9abf', hint: `${summary.failedRows} failed row(s)` },
    { label: 'Stale', value: String(summary.staleAlerts), tone: summary.staleAlerts ? '#ff6b6b' : '#1D9E75', hint: `${summary.unacknowledgedAlerts} unacknowledged` },
    { label: 'Escalated', value: String(summary.escalatedAlerts), tone: summary.escalatedAlerts ? '#ff6b6b' : '#1D9E75', hint: `${summary.assignedAlerts} assigned` },
    { label: 'Reminders', value: String(summary.retryReminders), tone: summary.overdueRetryReminders ? '#ff6b6b' : '#d4af37', hint: `${summary.overdueRetryReminders} overdue` },
  ];
}
