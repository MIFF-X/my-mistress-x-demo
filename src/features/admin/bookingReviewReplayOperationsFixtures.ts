import { AdminBookingReviewBatchHistory, AdminBookingReviewBatchReplayDetail } from '../../api/adminCommandApi';

export const bookingReplayOperationsBatchHistoryFixture: AdminBookingReviewBatchHistory[] = [
  {
    id: 'audit_batch_1',
    action: 'admin.booking.reviewPacketBatchWorkflow',
    targetId: 'source_batch_1',
    createdAt: '2026-05-18T00:00:00.000Z',
    metadata: {
      batchId: 'source_batch_1',
      failed: 2,
      updated: 3,
      latestAlertStatus: 'ESCALATED',
      latestAlertAssignedToId: 'admin_1',
      latestAlertAt: '2026-05-18T02:00:00.000Z',
      retryReminderDueAt: '2026-05-18T06:00:00.000Z',
      retryReminderOverdue: true,
    },
  },
  {
    id: 'audit_batch_2',
    action: 'admin.booking.reviewPacketBatchWorkflow',
    targetId: 'source_batch_2',
    createdAt: '2026-05-18T01:00:00.000Z',
    metadata: {
      batchId: 'source_batch_2',
      failed: 1,
      updated: 4,
      latestAlertStatus: 'ACKNOWLEDGED',
      latestAlertAssignedToId: 'admin_2',
      latestAlertAt: '2026-05-18T03:00:00.000Z',
      retryReminderDueAt: '2026-05-19T06:00:00.000Z',
    },
  },
  {
    id: 'audit_batch_3',
    action: 'admin.booking.reviewPacketBatchWorkflow',
    targetId: 'source_batch_3',
    createdAt: '2026-05-18T02:00:00.000Z',
    metadata: {
      batchId: 'source_batch_3',
      failed: 0,
      updated: 5,
      latestAlertStatus: 'ACKNOWLEDGED',
      latestAlertAssignedToId: 'admin_3',
      latestAlertAt: '2026-05-18T04:00:00.000Z',
    },
  },
];

export const bookingReplayOperationsReplayDetailFixture: AdminBookingReviewBatchReplayDetail = {
  generatedAt: '2026-05-18T04:00:00.000Z',
  batchId: 'detail_batch_1',
  sourceBatchId: 'source_batch_1',
  sourceAudit: bookingReplayOperationsBatchHistoryFixture[0],
  replayAudits: [
    {
      id: 'replay_audit_1',
      action: 'admin.booking.reviewPacketBatchReplayed',
      targetId: 'replay_batch_1',
      createdAt: '2026-05-18T04:30:00.000Z',
      metadata: { replayBatchId: 'replay_batch_1', updated: 1, failed: 1 },
    },
  ],
  alertAudits: [
    {
      id: 'alert_audit_1',
      action: 'admin.booking.reviewPacketBatchReplayAlertEscalated',
      createdAt: '2026-05-18T02:00:00.000Z',
      metadata: { alertStatus: 'ESCALATED' },
    },
    {
      id: 'alert_audit_2',
      action: 'admin.booking.reviewPacketBatchReplayRetryReminderScheduled',
      createdAt: '2026-05-18T03:00:00.000Z',
      metadata: { alertStatus: 'RETRY_REMINDER_SCHEDULED' },
    },
  ],
  summary: {
    batchId: 'detail_batch_1',
    requested: 5,
    updated: 3,
    failed: 2,
    status: 'IN_REVIEW',
    assignedToId: 'admin_1',
    note: 'Preview replay detail',
    reviewIds: ['review_1', 'review_2', 'review_3', 'review_4', 'review_5'],
    updatedReviewIds: ['review_1', 'review_2', 'review_3'],
    failedReviewIds: ['review_4', 'review_5'],
    replayAction: false,
    sourceBatchId: 'source_batch_1',
    replayBatchId: 'replay_batch_1',
    replayCount: 1,
    replayBatchIds: ['replay_batch_1'],
    unreplayedFailedReviewIds: ['review_5'],
    failedRowAgeHours: 30,
    staleFailedRowThresholdHours: 24,
    hasStaleFailedRows: true,
    latestAlertStatus: 'ESCALATED',
    latestAlertAction: 'ESCALATE',
    latestAlertNote: 'Escalated from preview data',
    latestAlertAt: '2026-05-18T02:00:00.000Z',
    latestAlertAssignedToId: 'admin_1',
    alertEscalated: true,
    alertAcknowledged: false,
  },
};

export function createBookingReplayOperationsEmptyFixture() {
  return {
    batchHistory: [] as AdminBookingReviewBatchHistory[],
    replayDetail: null as AdminBookingReviewBatchReplayDetail | null,
  };
}

export function createBookingReplayOperationsReadyFixture() {
  return {
    batchHistory: bookingReplayOperationsBatchHistoryFixture,
    replayDetail: bookingReplayOperationsReplayDetailFixture,
    alertOwnerId: 'admin_1',
  };
}
