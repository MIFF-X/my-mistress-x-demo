import { AdminBookingReviewBatchHistory, AdminBookingReviewBatchReplayDetail } from '../../api/adminCommandApi';

export type BookingReplayOperationsPanelState =
  | {
      kind: 'empty';
      title: string;
      message: string;
      tone: string;
    }
  | {
      kind: 'ready';
      title: string;
      batchCount: number;
      hasReplayDetail: boolean;
      activeOwnerFilter: string;
      replayDetailBatchId: string | null;
    };

export function getBookingReplayOperationsPanelState({
  batchHistory,
  replayDetail,
  activeOwnerFilter = '',
}: {
  batchHistory: AdminBookingReviewBatchHistory[];
  replayDetail?: AdminBookingReviewBatchReplayDetail | null;
  activeOwnerFilter?: string;
}): BookingReplayOperationsPanelState {
  if (!batchHistory.length && !replayDetail) {
    return {
      kind: 'empty',
      title: 'Replay Operations',
      message: 'No replay batch history rows are loaded for the current filters.',
      tone: '#777',
    };
  }

  return {
    kind: 'ready',
    title: 'Replay Operations',
    batchCount: batchHistory.length,
    hasReplayDetail: Boolean(replayDetail),
    activeOwnerFilter: activeOwnerFilter.trim() || 'ALL',
    replayDetailBatchId: replayDetail?.sourceBatchId || replayDetail?.batchId || null,
  };
}

export function bookingReplayOperationsStatusLine(state: BookingReplayOperationsPanelState) {
  if (state.kind === 'empty') return state.message;
  const detailText = state.hasReplayDetail
    ? `Replay detail loaded for ${state.replayDetailBatchId}.`
    : 'No replay detail selected yet.';
  return `${state.batchCount} batch row(s) loaded. Owner filter: ${state.activeOwnerFilter}. ${detailText}`;
}

export function bookingReplayOperationsOwnerFilterPayload(ownerId: string) {
  const trimmed = ownerId.trim();
  return {
    ownerId: trimmed,
    filterValue: trimmed === 'UNASSIGNED' ? '' : trimmed,
    isUnassigned: trimmed === 'UNASSIGNED' || trimmed === '',
  };
}
