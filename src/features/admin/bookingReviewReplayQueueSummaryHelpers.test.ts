import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';
import {
  bookingReplayQueueSummaryCards,
  buildBookingReplayQueueSummary,
} from './bookingReviewReplayQueueSummaryHelpers';

function makeBatch(
  id: string,
  metadata: Record<string, unknown>,
  createdAt = '2026-05-17T00:00:00.000Z',
): AdminBookingReviewBatchHistory {
  return {
    id,
    action: 'admin.booking.reviewPacketBatchWorkflow',
    targetId: id,
    createdAt,
    metadata,
  };
}

describe('bookingReviewReplayQueueSummaryHelpers', () => {
  it('builds a healthy summary for empty replay rows', () => {
    const summary = buildBookingReplayQueueSummary([]);

    expect(summary).toMatchObject({
      totalRows: 0,
      failedRows: 0,
      statusLabel: 'Healthy',
      statusTone: '#1D9E75',
    });
  });

  it('marks queue as escalation needed when escalated alerts or overdue reminders exist', () => {
    const summary = buildBookingReplayQueueSummary([
      makeBatch('batch_1', {
        failed: 2,
        latestAlertStatus: 'ESCALATED',
        latestAlertAssignedToId: 'admin_1',
        latestAlertAt: '2026-05-18T01:00:00.000Z',
      }),
      makeBatch('batch_2', {
        failed: 1,
        retryReminderDueAt: '2026-05-18T02:00:00.000Z',
        retryReminderOverdue: true,
      }),
    ]);

    expect(summary).toMatchObject({
      totalRows: 2,
      failedRows: 3,
      escalatedAlerts: 1,
      overdueRetryReminders: 1,
      assignedAlerts: 1,
      statusLabel: 'Escalation needed',
      statusTone: '#ff6b6b',
    });
    expect(summary.latestActivityAt).toBe('2026-05-18T01:00:00.000Z');
  });

  it('marks queue as attention needed when stale or unacknowledged alerts exist', () => {
    const summary = buildBookingReplayQueueSummary([
      makeBatch('batch_1', {
        failed: 1,
        latestAlertStatus: 'UNACKNOWLEDGED',
      }),
    ]);

    expect(summary.unacknowledgedAlerts).toBe(1);
    expect(summary.statusLabel).toBe('Attention needed');
    expect(summary.statusTone).toBe('#ff9abf');
  });

  it('marks queue as monitoring when acknowledged alerts or reminders exist', () => {
    const summary = buildBookingReplayQueueSummary([
      makeBatch('batch_1', {
        failed: 1,
        latestAlertStatus: 'ACKNOWLEDGED',
        retryReminderDueAt: '2026-05-18T04:00:00.000Z',
      }),
    ]);

    expect(summary.acknowledgedAlerts).toBe(1);
    expect(summary.retryReminders).toBe(1);
    expect(summary.statusLabel).toBe('Monitoring');
    expect(summary.statusTone).toBe('#d4af37');
  });

  it('builds compact summary cards', () => {
    const summary = buildBookingReplayQueueSummary([
      makeBatch('batch_1', {
        failed: 1,
        latestAlertStatus: 'ESCALATED',
        latestAlertAssignedToId: 'admin_1',
        retryReminderDueAt: '2026-05-18T04:00:00.000Z',
        retryReminderOverdue: true,
      }),
    ]);
    const cards = bookingReplayQueueSummaryCards(summary);

    expect(cards).toEqual([
      { label: 'Rows', value: '1', tone: '#ff9abf', hint: '1 failed row(s)' },
      { label: 'Stale', value: '1', tone: '#ff6b6b', hint: '0 unacknowledged' },
      { label: 'Escalated', value: '1', tone: '#ff6b6b', hint: '1 assigned' },
      { label: 'Reminders', value: '1', tone: '#ff6b6b', hint: '1 overdue' },
    ]);
  });
});
