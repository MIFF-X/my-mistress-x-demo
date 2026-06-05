export type BookingReplayAuditLike = {
  id: string;
  action: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type BookingReplayDetailLike = {
  sourceBatchId: string;
  replayAudits: BookingReplayAuditLike[];
  alertAudits: BookingReplayAuditLike[];
  summary: {
    requested: number;
    updated: number;
    failed: number;
    replayCount: number;
    replayBatchIds: string[];
    unreplayedFailedReviewIds: string[];
    failedRowAgeHours: number | null;
    staleFailedRowThresholdHours: number;
    hasStaleFailedRows: boolean;
  };
};

export type BookingReplaySummaryCard = {
  label: string;
  value: string;
  tone: string;
  hint: string;
};

export type BookingReplayDetailPanelState =
  | { kind: 'loading'; title: string; message: string; tone: string }
  | { kind: 'error'; title: string; message: string; tone: string }
  | { kind: 'empty'; title: string; message: string; tone: string }
  | { kind: 'ready'; title: string; detail: BookingReplayDetailLike };

export type BookingReplayDetailPanelStateOptions = {
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
};

export function getBookingReplayDetailPanelState(
  detail?: BookingReplayDetailLike | null,
  options: BookingReplayDetailPanelStateOptions = {},
): BookingReplayDetailPanelState {
  if (options.isLoading) {
    return {
      kind: 'loading',
      title: 'Replay Audit Detail',
      message: 'Loading replay detail...',
      tone: '#d4af37',
    };
  }

  const errorMessage = String(options.errorMessage || '').trim();
  if (errorMessage) {
    return {
      kind: 'error',
      title: 'Replay Audit Detail',
      message: errorMessage,
      tone: '#ff6b6b',
    };
  }

  if (!detail) {
    return {
      kind: 'empty',
      title: 'Replay Audit Detail',
      message: options.emptyMessage || 'No replay detail selected.',
      tone: '#777',
    };
  }

  return {
    kind: 'ready',
    title: 'Replay Audit Detail',
    detail,
  };
}

export function buildBookingReplaySummaryCards(detail: BookingReplayDetailLike): BookingReplaySummaryCard[] {
  return [
    {
      label: 'Requested',
      value: String(detail.summary.requested),
      tone: '#ff9abf',
      hint: `${detail.summary.updated} updated on source`,
    },
    {
      label: 'Replay Audits',
      value: String(detail.summary.replayCount),
      tone: '#1D9E75',
      hint: `${detail.summary.replayBatchIds.length} replay batch id(s)`,
    },
    {
      label: 'Open Failed Rows',
      value: String(detail.summary.unreplayedFailedReviewIds.length),
      tone: detail.summary.unreplayedFailedReviewIds.length ? '#ff6b6b' : '#1D9E75',
      hint: `${detail.summary.failed} failed on source`,
    },
    {
      label: 'Failed Row Age',
      value: detail.summary.failedRowAgeHours === null ? 'n/a' : `${detail.summary.failedRowAgeHours}h`,
      tone: detail.summary.hasStaleFailedRows ? '#ff6b6b' : '#d4af37',
      hint: `${detail.summary.staleFailedRowThresholdHours}h stale threshold`,
    },
  ];
}

export function bookingReplayDetailHeadline(detail: BookingReplayDetailLike) {
  return `${detail.sourceBatchId}: ${detail.summary.replayCount} replay audit row(s), ${detail.summary.failed} failed on source batch.`;
}

export function bookingReplayBatchListLabel(detail: BookingReplayDetailLike) {
  return detail.summary.replayBatchIds.length ? detail.summary.replayBatchIds.join(', ') : 'None yet';
}

export function bookingReplayAlertHistoryLabel(detail: BookingReplayDetailLike) {
  if (!detail.alertAudits.length) return '';
  return detail.alertAudits.slice(0, 3).map((audit) => {
    const metadata = (audit.metadata || {}) as Record<string, unknown>;
    return `${String(metadata.alertStatus || audit.action)} ${new Date(audit.createdAt).toLocaleString()}`;
  }).join(' | ');
}

export function bookingReplayAuditRowLabel(audit: BookingReplayAuditLike) {
  const metadata = (audit.metadata || {}) as Record<string, unknown>;
  return `${String(metadata.replayBatchId || audit.targetId || audit.id)}: ${String(metadata.updated || 0)} updated / ${String(metadata.failed || 0)} failed - ${new Date(audit.createdAt).toLocaleString()}`;
}

export function bookingReplayDownloadBatchId(detail: BookingReplayDetailLike) {
  return detail.sourceBatchId || '';
}
