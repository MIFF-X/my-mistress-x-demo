export type BookingReplayBatchHistoryLike = {
  id?: string;
  action?: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: unknown;
};

export type BookingReplayAlertDetailLike = {
  summary?: {
    [key: string]: unknown;
    unreplayedFailedReviewIds?: unknown[];
    hasStaleFailedRows?: boolean;
    alertAcknowledged?: boolean;
    alertEscalated?: boolean;
    latestAlertStatus?: string | null;
    latestAlertAction?: string | null;
    latestAlertAssignedToId?: string | null;
    failedRowAgeHours?: number | null;
  } | null;
  [key: string]: unknown;
};

export type BookingReplayAlertState = {
  hasAlert: boolean;
  isStale: boolean;
  isAcknowledged: boolean;
  isEscalated: boolean;
  statusLabel: string;
  actionLabel: string;
  tone: string;
  summary: string;
  recommendedAction: 'NONE' | 'ACKNOWLEDGE' | 'ESCALATE' | 'RETRY_FAILED_ROWS';
};

export type BookingReplayReminderOwnerDrilldown = {
  ownerId: string;
  reminders: number;
  overdueReminders: number;
  staleAlerts: number;
  unacknowledged: number;
  escalated: number;
  nextReminderDueAt: string | null;
  oldestOverdueReminderDueAt: string | null;
};

export type BookingReplayReminderSlaSummary = {
  reminders: number;
  overdueReminders: number;
  dueSoonReminders: number;
  staleOwners: number;
  nextReminderDueAt: string | null;
  oldestOverdueReminderDueAt: string | null;
  ownerDrilldowns: BookingReplayReminderOwnerDrilldown[];
};

const REMINDER_DUE_SOON_MS = 24 * 60 * 60 * 1000;

function bookingReviewBatchFailedReviewIds(metadata: Record<string, unknown>) {
  if (Array.isArray(metadata.failedReviewIds)) return metadata.failedReviewIds;
  if (Array.isArray(metadata.failures)) {
    return metadata.failures
      .map((failure) => {
        if (!failure || typeof failure !== 'object') return null;
        return String((failure as Record<string, unknown>).reviewId || '').trim() || null;
      })
      .filter(Boolean);
  }
  return [];
}

function bookingReviewBatchFailedAgeHours(row: BookingReplayBatchHistoryLike, nowMs: number) {
  const createdAt = row.createdAt ? new Date(row.createdAt).getTime() : Number.NaN;
  if (!Number.isFinite(createdAt)) return null;
  return Math.max(0, Math.floor((nowMs - createdAt) / 36e5));
}

function bookingReviewBatchAlertStatus(
  row: BookingReplayBatchHistoryLike,
  metadata: Record<string, unknown>,
  nowMs: number,
) {
  if (metadata.latestAlertStatus) return String(metadata.latestAlertStatus).trim().toUpperCase();
  const failures = bookingReviewBatchFailedReviewIds(metadata);
  const failed = Number(metadata.failed || failures.length || 0);
  const replayed = metadata.replayAction === true || Boolean(metadata.sourceBatchId);
  const failedAgeHours = bookingReviewBatchFailedAgeHours(row, nowMs);
  if (failed > 0 && !replayed && failedAgeHours !== null && failedAgeHours >= 24) return 'UNACKNOWLEDGED';
  return '';
}

function replaceIfEarlier(current: string | null, candidate: string) {
  const candidateTime = new Date(candidate).getTime();
  if (!Number.isFinite(candidateTime)) return current;
  if (!current) return candidate;
  const currentTime = new Date(current).getTime();
  if (!Number.isFinite(currentTime)) return candidate;
  return candidateTime < currentTime ? candidate : current;
}

export function getBookingReplayReminderSlaSummary(
  rows: BookingReplayBatchHistoryLike[],
  now: Date = new Date(),
): BookingReplayReminderSlaSummary {
  const nowMs = now.getTime();
  const ownerMap = new Map<string, BookingReplayReminderOwnerDrilldown>();
  const summary: BookingReplayReminderSlaSummary = {
    reminders: 0,
    overdueReminders: 0,
    dueSoonReminders: 0,
    staleOwners: 0,
    nextReminderDueAt: null,
    oldestOverdueReminderDueAt: null,
    ownerDrilldowns: [],
  };

  rows.forEach((row) => {
    const metadata = (row.metadata || {}) as Record<string, unknown>;
    const alertStatus = bookingReviewBatchAlertStatus(row, metadata, nowMs);
    const ownerId = String(metadata.latestAlertAssignedToId || 'UNASSIGNED').trim() || 'UNASSIGNED';
    const reminderDueAt = metadata.retryReminderDueAt ? String(metadata.retryReminderDueAt) : null;
    const dueAtMs = reminderDueAt ? new Date(reminderDueAt).getTime() : Number.NaN;
    const overdue = metadata.retryReminderOverdue === true || alertStatus === 'RETRY_REMINDER_OVERDUE';
    const staleAlert = alertStatus === 'UNACKNOWLEDGED' || alertStatus === 'ESCALATED' || overdue;

    if (!staleAlert && !reminderDueAt) return;

    if (!ownerMap.has(ownerId)) {
      ownerMap.set(ownerId, {
        ownerId,
        reminders: 0,
        overdueReminders: 0,
        staleAlerts: 0,
        unacknowledged: 0,
        escalated: 0,
        nextReminderDueAt: null,
        oldestOverdueReminderDueAt: null,
      });
    }

    const owner = ownerMap.get(ownerId)!;
    if (staleAlert) owner.staleAlerts += 1;
    if (alertStatus === 'UNACKNOWLEDGED') owner.unacknowledged += 1;
    if (alertStatus === 'ESCALATED') owner.escalated += 1;

    if (reminderDueAt) {
      summary.reminders += 1;
      owner.reminders += 1;
      summary.nextReminderDueAt = replaceIfEarlier(summary.nextReminderDueAt, reminderDueAt);
      owner.nextReminderDueAt = replaceIfEarlier(owner.nextReminderDueAt, reminderDueAt);
      if (Number.isFinite(dueAtMs) && !overdue && dueAtMs >= nowMs && dueAtMs <= nowMs + REMINDER_DUE_SOON_MS) {
        summary.dueSoonReminders += 1;
      }
    }

    if (overdue) {
      summary.overdueReminders += 1;
      owner.overdueReminders += 1;
      if (reminderDueAt) {
        summary.oldestOverdueReminderDueAt = replaceIfEarlier(summary.oldestOverdueReminderDueAt, reminderDueAt);
        owner.oldestOverdueReminderDueAt = replaceIfEarlier(owner.oldestOverdueReminderDueAt, reminderDueAt);
      } else {
        summary.oldestOverdueReminderDueAt = replaceIfEarlier(summary.oldestOverdueReminderDueAt, row.createdAt);
        owner.oldestOverdueReminderDueAt = replaceIfEarlier(owner.oldestOverdueReminderDueAt, row.createdAt);
      }
    }
  });

  summary.ownerDrilldowns = Array.from(ownerMap.values()).sort(
    (a, b) => b.overdueReminders - a.overdueReminders
      || b.staleAlerts - a.staleAlerts
      || b.reminders - a.reminders
      || a.ownerId.localeCompare(b.ownerId),
  );
  summary.staleOwners = summary.ownerDrilldowns.filter((owner) => owner.staleAlerts || owner.overdueReminders).length;
  return summary;
}

export type BookingReplayAlertAction =
  | 'ACKNOWLEDGE'
  | 'ESCALATE'
  | 'SCHEDULE_RETRY_REMINDER'
  | 'SNOOZE_RETRY_REMINDER'
  | 'CLEAR_RETRY_REMINDER';

export type BookingReplayAlertActionRequest = {
  batchId: string;
  body: {
    action: BookingReplayAlertAction;
    note?: string;
    assignedToId?: string;
    notifyOwner?: boolean;
    deliveryChannel?: string;
    reminderDueAt?: string;
    reminderOverdueThresholdHours?: number;
  };
};

export type BookingReplayFailedRowsRetryRequest = {
  batchId: string;
  body: {
    note?: string;
  };
};

export function getBookingReplayAlertState(detail?: BookingReplayAlertDetailLike | null): BookingReplayAlertState {
  const summary = detail?.summary;
  const failedRows = summary?.unreplayedFailedReviewIds?.length || 0;
  const isStale = Boolean(summary?.hasStaleFailedRows);
  const isAcknowledged = Boolean(summary?.alertAcknowledged);
  const isEscalated = Boolean(summary?.alertEscalated);
  const latestStatus = summary?.latestAlertStatus || null;
  const latestAction = summary?.latestAlertAction || null;
  const failedAge = summary?.failedRowAgeHours;

  if (!summary || failedRows === 0) {
    return {
      hasAlert: false,
      isStale: false,
      isAcknowledged: false,
      isEscalated: false,
      statusLabel: 'No replay alert',
      actionLabel: 'No action needed',
      tone: '#1D9E75',
      summary: 'There are no unreplayed failed rows for this batch.',
      recommendedAction: 'NONE',
    };
  }

  if (isEscalated) {
    return {
      hasAlert: true,
      isStale,
      isAcknowledged,
      isEscalated,
      statusLabel: latestStatus || 'Escalated',
      actionLabel: latestAction || 'Escalated',
      tone: '#ff6b6b',
      summary: `${failedRows} failed row(s) have been escalated for admin review${failedAge === null || failedAge === undefined ? '.' : ` after ${failedAge}h.`}`,
      recommendedAction: 'RETRY_FAILED_ROWS',
    };
  }

  if (isAcknowledged) {
    return {
      hasAlert: true,
      isStale,
      isAcknowledged,
      isEscalated,
      statusLabel: latestStatus || 'Acknowledged',
      actionLabel: latestAction || 'Acknowledged',
      tone: '#d4af37',
      summary: `${failedRows} failed row(s) have been acknowledged and are waiting for retry or resolution.`,
      recommendedAction: 'RETRY_FAILED_ROWS',
    };
  }

  if (isStale) {
    return {
      hasAlert: true,
      isStale,
      isAcknowledged,
      isEscalated,
      statusLabel: 'Stale failed rows',
      actionLabel: 'Escalate or acknowledge',
      tone: '#ff6b6b',
      summary: `${failedRows} unreplayed failed row(s) are stale${failedAge === null || failedAge === undefined ? '.' : ` after ${failedAge}h.`}`,
      recommendedAction: 'ESCALATE',
    };
  }

  return {
    hasAlert: true,
    isStale,
    isAcknowledged,
    isEscalated,
    statusLabel: 'Failed rows pending',
    actionLabel: 'Acknowledge',
    tone: '#ff9abf',
    summary: `${failedRows} failed row(s) need replay acknowledgement before they become stale.`,
    recommendedAction: 'ACKNOWLEDGE',
  };
}

export function bookingReplayAlertDefaultNote(state: BookingReplayAlertState) {
  if (state.recommendedAction === 'ESCALATE') return 'Escalating stale failed booking review rows for priority admin follow-up.';
  if (state.recommendedAction === 'ACKNOWLEDGE') return 'Acknowledging failed booking review replay rows and monitoring for retry.';
  if (state.recommendedAction === 'RETRY_FAILED_ROWS') return 'Retrying unresolved failed booking review rows after replay alert review.';
  return 'No replay alert action needed.';
}

export function bookingReplaySourceBatchId(detail: BookingReplayAlertDetailLike) {
  return String(detail.sourceBatchId || detail.batchId || '');
}

export function bookingReplayAlertOwnerId(detail: BookingReplayAlertDetailLike, assignedToId?: string) {
  return (assignedToId || String(detail.summary?.latestAlertAssignedToId || '')).trim();
}

export function buildBookingReplayAlertActionRequest(
  detail: BookingReplayAlertDetailLike,
  action: BookingReplayAlertAction,
  note: string | undefined,
  assignedToId: string | undefined,
  nowMs = Date.now(),
): BookingReplayAlertActionRequest {
  const alertState = getBookingReplayAlertState(detail);
  const sourceBatchId = bookingReplaySourceBatchId(detail);
  const ownerId = bookingReplayAlertOwnerId(detail, assignedToId);
  const reminderDueAt = action === 'SCHEDULE_RETRY_REMINDER'
    ? new Date(nowMs + 4 * 60 * 60 * 1000).toISOString()
    : action === 'SNOOZE_RETRY_REMINDER'
    ? new Date(nowMs + 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  return {
    batchId: sourceBatchId,
    body: {
      action,
      note: note || bookingReplayAlertDefaultNote(alertState),
      ...(reminderDueAt ? { reminderDueAt } : {}),
      ...(action === 'SCHEDULE_RETRY_REMINDER' ? { reminderOverdueThresholdHours: 4 } : {}),
      ...(ownerId && action !== 'CLEAR_RETRY_REMINDER' ? {
        assignedToId: ownerId,
        notifyOwner: true,
        deliveryChannel: 'command_centre',
      } : {}),
    },
  };
}

export function buildBookingReplayFailedRowsRetryRequest(
  detail: BookingReplayAlertDetailLike,
  note: string | undefined,
): BookingReplayFailedRowsRetryRequest {
  return {
    batchId: bookingReplaySourceBatchId(detail),
    body: {
      note: note || bookingReplayAlertDefaultNote(getBookingReplayAlertState(detail)),
    },
  };
}
