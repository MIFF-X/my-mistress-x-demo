import type { BookingReplayDetailLike } from './bookingReviewReplayDetailHelpers';
import {
  bookingReplayAlertHistoryLabel,
  bookingReplayAuditRowLabel,
  bookingReplayBatchListLabel,
  bookingReplayDetailHeadline,
  bookingReplayDownloadBatchId,
  buildBookingReplaySummaryCards,
  getBookingReplayDetailPanelState,
} from './bookingReviewReplayDetailHelpers';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (value: unknown) => {
  toBe: (expected: unknown) => void;
  toEqual: (expected: unknown) => void;
  toContain: (expected: string) => void;
};

function makeDetail(overrides: Partial<BookingReplayDetailLike> = {}): BookingReplayDetailLike {
  return {
    sourceBatchId: 'booking_review_batch_1',
    replayAudits: [],
    alertAudits: [],
    summary: {
      requested: 4,
      updated: 3,
      failed: 1,
      replayCount: 2,
      replayBatchIds: ['replay_batch_1', 'replay_batch_2'],
      unreplayedFailedReviewIds: ['review_4'],
      failedRowAgeHours: 28,
      staleFailedRowThresholdHours: 24,
      hasStaleFailedRows: true,
    },
    ...overrides,
  };
}

describe('bookingReviewReplayDetailHelpers', () => {
  it('builds stable replay summary card labels and tones', () => {
    const cards = buildBookingReplaySummaryCards(makeDetail());

    expect(cards).toEqual([
      { label: 'Requested', value: '4', tone: '#ff9abf', hint: '3 updated on source' },
      { label: 'Replay Audits', value: '2', tone: '#1D9E75', hint: '2 replay batch id(s)' },
      { label: 'Open Failed Rows', value: '1', tone: '#ff6b6b', hint: '1 failed on source' },
      { label: 'Failed Row Age', value: '28h', tone: '#ff6b6b', hint: '24h stale threshold' },
    ]);
  });

  it('uses calm labels when there are no failed rows or replay batches', () => {
    const detail = makeDetail({
      summary: {
        requested: 2,
        updated: 2,
        failed: 0,
        replayCount: 0,
        replayBatchIds: [],
        unreplayedFailedReviewIds: [],
        failedRowAgeHours: null,
        staleFailedRowThresholdHours: 24,
        hasStaleFailedRows: false,
      },
    });

    expect(buildBookingReplaySummaryCards(detail)[2]).toEqual({
      label: 'Open Failed Rows',
      value: '0',
      tone: '#1D9E75',
      hint: '0 failed on source',
    });
    expect(buildBookingReplaySummaryCards(detail)[3]).toEqual({
      label: 'Failed Row Age',
      value: 'n/a',
      tone: '#d4af37',
      hint: '24h stale threshold',
    });
    expect(bookingReplayBatchListLabel(detail)).toBe('None yet');
  });

  it('formats headline, replay batches, and alert history for the detail panel', () => {
    const detail = makeDetail({
      alertAudits: [
        {
          id: 'alert_1',
          action: 'admin.booking.reviewPacketBatchReplayAlertEscalated',
          createdAt: '2026-05-18T01:00:00.000Z',
          metadata: { alertStatus: 'ESCALATED' },
        },
        {
          id: 'alert_2',
          action: 'admin.booking.reviewPacketBatchReplayRetryReminderScheduled',
          createdAt: '2026-05-18T02:00:00.000Z',
          metadata: { alertStatus: 'RETRY_REMINDER_SCHEDULED' },
        },
        {
          id: 'alert_3',
          action: 'admin.booking.reviewPacketBatchReplayRetryReminderSnoozed',
          createdAt: '2026-05-18T03:00:00.000Z',
          metadata: {},
        },
        {
          id: 'alert_4',
          action: 'admin.booking.reviewPacketBatchReplayRetryReminderCleared',
          createdAt: '2026-05-18T04:00:00.000Z',
          metadata: { alertStatus: 'CLEARED' },
        },
      ],
    });
    const alertHistory = bookingReplayAlertHistoryLabel(detail);

    expect(bookingReplayDetailHeadline(detail)).toBe('booking_review_batch_1: 2 replay audit row(s), 1 failed on source batch.');
    expect(bookingReplayBatchListLabel(detail)).toBe('replay_batch_1, replay_batch_2');
    expect(alertHistory).toContain('ESCALATED');
    expect(alertHistory).toContain('RETRY_REMINDER_SCHEDULED');
    expect(alertHistory).toContain('admin.booking.reviewPacketBatchReplayRetryReminderSnoozed');
    expect(alertHistory.includes('CLEARED')).toBe(false);
  });

  it('formats replay audit row labels with stable fallback ids', () => {
    expect(bookingReplayAuditRowLabel({
      id: 'audit_1',
      action: 'admin.booking.reviewPacketBatchReplayed',
      targetId: 'target_batch_1',
      createdAt: '2026-05-18T05:00:00.000Z',
      metadata: { replayBatchId: 'replay_batch_9', updated: 3, failed: 1 },
    })).toContain('replay_batch_9: 3 updated / 1 failed');

    expect(bookingReplayAuditRowLabel({
      id: 'audit_2',
      action: 'admin.booking.reviewPacketBatchReplayed',
      targetId: 'target_batch_2',
      createdAt: '2026-05-18T05:00:00.000Z',
      metadata: {},
    })).toContain('target_batch_2: 0 updated / 0 failed');
  });

  it('uses the source batch id for replay CSV downloads', () => {
    expect(bookingReplayDownloadBatchId(makeDetail())).toBe('booking_review_batch_1');
  });

  it('returns empty, loading, error, and ready panel states', () => {
    expect(getBookingReplayDetailPanelState(null)).toEqual({
      kind: 'empty',
      title: 'Replay Audit Detail',
      message: 'No replay detail selected.',
      tone: '#777',
    });
    expect(getBookingReplayDetailPanelState(null, { emptyMessage: 'Select a replay row.' })).toEqual({
      kind: 'empty',
      title: 'Replay Audit Detail',
      message: 'Select a replay row.',
      tone: '#777',
    });
    expect(getBookingReplayDetailPanelState(null, { isLoading: true })).toEqual({
      kind: 'loading',
      title: 'Replay Audit Detail',
      message: 'Loading replay detail...',
      tone: '#d4af37',
    });
    expect(getBookingReplayDetailPanelState(null, { errorMessage: 'Replay detail failed to load.' })).toEqual({
      kind: 'error',
      title: 'Replay Audit Detail',
      message: 'Replay detail failed to load.',
      tone: '#ff6b6b',
    });
    const detail = makeDetail();
    expect(getBookingReplayDetailPanelState(detail)).toEqual({
      kind: 'ready',
      title: 'Replay Audit Detail',
      detail,
    });
  });
});
