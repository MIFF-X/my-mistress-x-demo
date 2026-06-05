import type {
  BookingReplayAlertDetailLike,
  BookingReplayBatchHistoryLike,
} from './bookingReviewReplayAlertHelpers';
import {
  buildBookingReplayAlertActionRequest,
  buildBookingReplayFailedRowsRetryRequest,
  bookingReplayAlertDefaultNote,
  getBookingReplayReminderSlaSummary,
  getBookingReplayAlertState,
} from './bookingReviewReplayAlertHelpers';

declare const describe: (name: string, fn: () => void) => void;
declare const it: (name: string, fn: () => void) => void;
declare const expect: (value: unknown) => {
  toBe: (expected: unknown) => void;
  toContain: (expected: string) => void;
  toMatchObject: (expected: Record<string, unknown>) => void;
};

type BookingReplayAlertSummaryLike = NonNullable<BookingReplayAlertDetailLike['summary']>;

function makeDetail(overrides: Partial<BookingReplayAlertSummaryLike> = {}): BookingReplayAlertDetailLike {
  return {
    generatedAt: '2026-05-18T00:00:00.000Z',
    batchId: 'batch_1',
    sourceBatchId: 'source_batch_1',
    sourceAudit: {
      id: 'audit_source',
      action: 'BOOKING_REVIEW_BATCH_WORKFLOW',
      createdAt: '2026-05-17T00:00:00.000Z',
    },
    replayAudits: [],
    alertAudits: [],
    summary: {
      batchId: 'batch_1',
      requested: 3,
      updated: 2,
      failed: 1,
      status: 'IN_REVIEW',
      assignedToId: null,
      note: null,
      reviewIds: ['review_1', 'review_2', 'review_3'],
      updatedReviewIds: ['review_1', 'review_2'],
      failedReviewIds: ['review_3'],
      replayAction: false,
      sourceBatchId: null,
      replayBatchId: null,
      replayCount: 0,
      replayBatchIds: [],
      unreplayedFailedReviewIds: ['review_3'],
      failedRowAgeHours: 30,
      staleFailedRowThresholdHours: 24,
      hasStaleFailedRows: true,
      latestAlertStatus: null,
      latestAlertAction: null,
      latestAlertNote: null,
      latestAlertAt: null,
      latestAlertAssignedToId: null,
      alertEscalated: false,
      alertAcknowledged: false,
      ...overrides,
    },
  };
}

function makeHistory(
  metadata: Record<string, unknown>,
  overrides: Partial<BookingReplayBatchHistoryLike> = {},
): BookingReplayBatchHistoryLike {
  return {
    id: String(overrides.id || metadata.batchId || 'audit-batch-1'),
    action: 'admin.booking.reviewPacketBatchUpdated',
    targetId: String(metadata.batchId || 'booking_review_batch_1'),
    createdAt: String(overrides.createdAt || '2026-05-17T00:00:00.000Z'),
    metadata,
    actor: null,
    ...overrides,
  };
}

describe('bookingReviewReplayAlertHelpers', () => {
  it('returns no-alert state when there are no unreplayed failed rows', () => {
    const state = getBookingReplayAlertState(makeDetail({
      failed: 0,
      failedReviewIds: [],
      unreplayedFailedReviewIds: [],
      hasStaleFailedRows: false,
      failedRowAgeHours: null,
    }));

    expect(state).toMatchObject({
      hasAlert: false,
      recommendedAction: 'NONE',
      tone: '#1D9E75',
    });
  });

  it('recommends escalation for stale failed rows', () => {
    const state = getBookingReplayAlertState(makeDetail());

    expect(state).toMatchObject({
      hasAlert: true,
      isStale: true,
      statusLabel: 'Stale failed rows',
      recommendedAction: 'ESCALATE',
    });
    expect(bookingReplayAlertDefaultNote(state)).toContain('Escalating stale failed booking review rows');
  });

  it('recommends acknowledgement for fresh failed rows', () => {
    const state = getBookingReplayAlertState(makeDetail({
      failedRowAgeHours: 2,
      hasStaleFailedRows: false,
    }));

    expect(state).toMatchObject({
      hasAlert: true,
      isStale: false,
      recommendedAction: 'ACKNOWLEDGE',
    });
    expect(bookingReplayAlertDefaultNote(state)).toContain('Acknowledging failed booking review replay rows');
  });

  it('marks acknowledged alerts as retry-ready', () => {
    const state = getBookingReplayAlertState(makeDetail({
      latestAlertStatus: 'ACKNOWLEDGED',
      latestAlertAction: 'ACKNOWLEDGE',
      alertAcknowledged: true,
    }));

    expect(state).toMatchObject({
      isAcknowledged: true,
      recommendedAction: 'RETRY_FAILED_ROWS',
    });
  });

  it('marks escalated alerts as retry-ready and urgent', () => {
    const state = getBookingReplayAlertState(makeDetail({
      latestAlertStatus: 'ESCALATED',
      latestAlertAction: 'ESCALATE',
      alertEscalated: true,
    }));

    expect(state).toMatchObject({
      isEscalated: true,
      recommendedAction: 'RETRY_FAILED_ROWS',
      tone: '#ff6b6b',
    });
  });

  it('summarizes reminder SLA pressure and stale owner drilldowns', () => {
    const summary = getBookingReplayReminderSlaSummary([
      makeHistory({
        batchId: 'booking_review_batch_1',
        failed: 1,
        latestAlertStatus: 'RETRY_REMINDER_OVERDUE',
        latestAlertAssignedToId: 'admin-2',
        retryReminderDueAt: '2026-05-17T06:00:00.000Z',
        retryReminderOverdue: true,
      }),
      makeHistory({
        batchId: 'booking_review_batch_2',
        failed: 1,
        latestAlertStatus: 'ESCALATED',
        latestAlertAssignedToId: 'admin-2',
        retryReminderDueAt: '2026-05-18T10:00:00.000Z',
        retryReminderOverdue: false,
      }, { id: 'audit-batch-2', targetId: 'booking_review_batch_2' }),
      makeHistory({
        batchId: 'booking_review_batch_3',
        failed: 1,
        latestAlertStatus: 'ACKNOWLEDGED',
        latestAlertAssignedToId: 'admin-3',
        retryReminderDueAt: '2026-05-20T10:00:00.000Z',
        retryReminderOverdue: false,
      }, { id: 'audit-batch-3', targetId: 'booking_review_batch_3' }),
    ], new Date('2026-05-18T00:00:00.000Z'));

    expect(summary).toMatchObject({
      reminders: 3,
      overdueReminders: 1,
      dueSoonReminders: 1,
      staleOwners: 1,
      nextReminderDueAt: '2026-05-17T06:00:00.000Z',
      oldestOverdueReminderDueAt: '2026-05-17T06:00:00.000Z',
      ownerDrilldowns: [
        {
          ownerId: 'admin-2',
          reminders: 2,
          overdueReminders: 1,
          staleAlerts: 2,
          escalated: 1,
        },
      ],
    });
  });

  it('builds schedule reminder requests against the source batch and selected owner', () => {
    const request = buildBookingReplayAlertActionRequest(
      makeDetail(),
      'SCHEDULE_RETRY_REMINDER',
      'Schedule the retry check.',
      'owner_7',
      Date.parse('2026-05-18T01:00:00.000Z'),
    );

    expect(request.batchId).toBe('source_batch_1');
    expect(request.body).toMatchObject({
      action: 'SCHEDULE_RETRY_REMINDER',
      note: 'Schedule the retry check.',
      assignedToId: 'owner_7',
      notifyOwner: true,
      deliveryChannel: 'command_centre',
      reminderDueAt: '2026-05-18T05:00:00.000Z',
      reminderOverdueThresholdHours: 4,
    });
  });

  it('uses latest alert owner fallback for snooze reminder requests', () => {
    const request = buildBookingReplayAlertActionRequest(
      makeDetail({
        latestAlertAssignedToId: 'owner_from_alert',
        retryReminderDueAt: '2026-05-18T03:00:00.000Z',
      }),
      'SNOOZE_RETRY_REMINDER',
      undefined,
      '',
      Date.parse('2026-05-18T01:00:00.000Z'),
    );

    expect(request.batchId).toBe('source_batch_1');
    expect(request.body).toMatchObject({
      action: 'SNOOZE_RETRY_REMINDER',
      assignedToId: 'owner_from_alert',
      notifyOwner: true,
      deliveryChannel: 'command_centre',
      reminderDueAt: '2026-05-19T01:00:00.000Z',
    });
  });

  it('does not notify owners when clearing retry reminders', () => {
    const request = buildBookingReplayAlertActionRequest(
      makeDetail({ latestAlertAssignedToId: 'owner_from_alert' }),
      'CLEAR_RETRY_REMINDER',
      'Clear it.',
      'owner_7',
      Date.parse('2026-05-18T01:00:00.000Z'),
    );

    expect(request.body).toMatchObject({
      action: 'CLEAR_RETRY_REMINDER',
      note: 'Clear it.',
    });
    expect(Object.prototype.hasOwnProperty.call(request.body, 'assignedToId')).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(request.body, 'notifyOwner')).toBe(false);
  });

  it('uses the source batch for failed-row retry callbacks', () => {
    const request = buildBookingReplayFailedRowsRetryRequest(makeDetail(), 'Retry from detail panel.');

    expect(request).toMatchObject({
      batchId: 'source_batch_1',
      body: {
        note: 'Retry from detail panel.',
      },
    });
  });
});
