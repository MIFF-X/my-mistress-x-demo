import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';
import {
  bookingReplayOwnerDrilldownCsv,
  buildBookingReplayOwnerDrilldowns,
} from './bookingReviewReplayOwnerDrilldownHelpers';

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

describe('bookingReviewReplayOwnerDrilldownHelpers', () => {
  it('groups replay alert rows by assigned owner', () => {
    const rows = buildBookingReplayOwnerDrilldowns([
      makeBatch('batch_1', {
        batchId: 'source_1',
        failed: 2,
        latestAlertAssignedToId: 'admin_1',
        latestAlertStatus: 'ESCALATED',
        latestAlertAt: '2026-05-18T02:00:00.000Z',
      }),
      makeBatch('batch_2', {
        batchId: 'source_2',
        failed: 1,
        latestAlertAssignedToId: 'admin_1',
        latestAlertStatus: 'ACKNOWLEDGED',
        retryReminderOverdue: true,
        latestAlertAt: '2026-05-18T03:00:00.000Z',
      }),
      makeBatch('batch_3', {
        batchId: 'source_3',
        failed: 0,
        latestAlertAssignedToId: 'admin_2',
        latestAlertStatus: 'ACKNOWLEDGED',
      }),
    ]);

    expect(rows[0]).toMatchObject({
      ownerId: 'admin_1',
      label: 'admin_1',
      totalBatches: 2,
      overdueReminders: 1,
      acknowledged: 1,
      escalated: 1,
      tone: '#ff6b6b',
    });
    expect(rows[0].batchIds).toEqual(['source_1', 'source_2']);
    expect(rows[1]).toMatchObject({ ownerId: 'admin_2', totalBatches: 1, acknowledged: 1 });
  });

  it('groups missing owners into an Unassigned row', () => {
    const [row] = buildBookingReplayOwnerDrilldowns([
      makeBatch('batch_1', { batchId: 'source_1', failed: 0 }),
    ]);

    expect(row).toMatchObject({
      ownerId: 'UNASSIGNED',
      label: 'Unassigned',
      totalBatches: 1,
      tone: '#1D9E75',
    });
  });

  it('builds CSV export text for owner drilldowns', () => {
    const rows = buildBookingReplayOwnerDrilldowns([
      makeBatch('batch_1', {
        batchId: 'source_1',
        failed: 1,
        latestAlertAssignedToId: 'admin_1',
        latestAlertStatus: 'ESCALATED',
      }),
    ]);
    const csv = bookingReplayOwnerDrilldownCsv(rows);

    expect(csv).toContain('ownerId,label,totalBatches');
    expect(csv).toContain('admin_1');
    expect(csv).toContain('source_1');
  });
});
