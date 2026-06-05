import { AdminBookingReviewBatchHistory, AdminBookingReviewBatchReplayDetail } from '../../api/adminCommandApi';
import {
  bookingReplayOperationsOwnerFilterPayload,
  bookingReplayOperationsStatusLine,
  getBookingReplayOperationsPanelState,
} from './bookingReviewReplayOperationsPanelHelpers';

function makeBatch(id = 'batch_1'): AdminBookingReviewBatchHistory {
  return {
    id,
    action: 'admin.booking.reviewPacketBatchWorkflow',
    targetId: id,
    createdAt: '2026-05-18T00:00:00.000Z',
    metadata: { batchId: id, failed: 1 },
  };
}

function makeReplayDetail(): AdminBookingReviewBatchReplayDetail {
  return {
    generatedAt: '2026-05-18T01:00:00.000Z',
    batchId: 'detail_batch_1',
    sourceBatchId: 'source_batch_1',
    sourceAudit: makeBatch('source_batch_1'),
    replayAudits: [],
    alertAudits: [],
    summary: {
      batchId: 'detail_batch_1',
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
      sourceBatchId: 'source_batch_1',
      replayBatchId: null,
      replayCount: 0,
      replayBatchIds: [],
      unreplayedFailedReviewIds: ['review_3'],
      failedRowAgeHours: 26,
      staleFailedRowThresholdHours: 24,
      hasStaleFailedRows: true,
      latestAlertStatus: null,
      latestAlertAction: null,
      latestAlertNote: null,
      latestAlertAt: null,
      latestAlertAssignedToId: null,
      alertEscalated: false,
      alertAcknowledged: false,
    },
  };
}

describe('bookingReviewReplayOperationsPanelHelpers', () => {
  it('returns empty state when no batch rows or replay detail are loaded', () => {
    const state = getBookingReplayOperationsPanelState({ batchHistory: [] });

    expect(state).toMatchObject({
      kind: 'empty',
      title: 'Replay Operations',
      message: 'No replay batch history rows are loaded for the current filters.',
      tone: '#777',
    });
    expect(bookingReplayOperationsStatusLine(state)).toContain('No replay batch history rows');
  });

  it('returns ready state for loaded batch rows without replay detail', () => {
    const state = getBookingReplayOperationsPanelState({
      batchHistory: [makeBatch('batch_1'), makeBatch('batch_2')],
      activeOwnerFilter: 'admin_1',
    });

    expect(state).toMatchObject({
      kind: 'ready',
      title: 'Replay Operations',
      batchCount: 2,
      hasReplayDetail: false,
      activeOwnerFilter: 'admin_1',
      replayDetailBatchId: null,
    });
    expect(bookingReplayOperationsStatusLine(state)).toContain('2 batch row(s) loaded');
    expect(bookingReplayOperationsStatusLine(state)).toContain('No replay detail selected yet');
  });

  it('returns ready state with replay detail source batch id', () => {
    const state = getBookingReplayOperationsPanelState({
      batchHistory: [makeBatch('batch_1')],
      replayDetail: makeReplayDetail(),
      activeOwnerFilter: '',
    });

    expect(state).toMatchObject({
      kind: 'ready',
      batchCount: 1,
      hasReplayDetail: true,
      activeOwnerFilter: 'ALL',
      replayDetailBatchId: 'source_batch_1',
    });
    expect(bookingReplayOperationsStatusLine(state)).toContain('Replay detail loaded for source_batch_1');
  });

  it('normalizes owner filter payloads', () => {
    expect(bookingReplayOperationsOwnerFilterPayload('admin_1')).toEqual({
      ownerId: 'admin_1',
      filterValue: 'admin_1',
      isUnassigned: false,
    });
    expect(bookingReplayOperationsOwnerFilterPayload('UNASSIGNED')).toEqual({
      ownerId: 'UNASSIGNED',
      filterValue: '',
      isUnassigned: true,
    });
    expect(bookingReplayOperationsOwnerFilterPayload('')).toEqual({
      ownerId: '',
      filterValue: '',
      isUnassigned: true,
    });
  });
});
