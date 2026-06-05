import React from 'react';
import { Text, View } from 'react-native';
import { AdminBookingReviewBatchHistory, AdminBookingReviewBatchReplayDetail } from '../../api/adminCommandApi';
import { BookingReviewOwnerDrilldownPanel } from './BookingReviewOwnerDrilldownPanel';
import { BookingReviewReplayDetailPanel } from './BookingReviewReplayDetailPanel';
import { BookingReviewReplayQueueSummaryPanel } from './BookingReviewReplayQueueSummaryPanel';
import {
  bookingReplayOperationsOwnerFilterPayload,
  bookingReplayOperationsStatusLine,
  getBookingReplayOperationsPanelState,
} from './bookingReviewReplayOperationsPanelHelpers';

type BookingReviewReplayOperationsPanelProps = {
  batchHistory: AdminBookingReviewBatchHistory[];
  replayDetail: AdminBookingReviewBatchReplayDetail | null;
  alertOwnerId?: string;
  isReplayDetailLoading?: boolean;
  replayDetailError?: string | null;
  onOwnerSelected?: (ownerId: string) => void;
  onOwnerCsvExport?: (csvText: string) => void;
  onAlertUpdated?: (detail: AdminBookingReviewBatchReplayDetail) => void;
  onStatus?: (message: string) => void;
  onDownloadReplayCsv?: (batchId: string) => void;
};

function smallTextStyle(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

export function BookingReviewReplayOperationsPanel({
  batchHistory,
  replayDetail,
  alertOwnerId = '',
  isReplayDetailLoading,
  replayDetailError,
  onOwnerSelected,
  onOwnerCsvExport,
  onAlertUpdated,
  onStatus,
  onDownloadReplayCsv,
}: BookingReviewReplayOperationsPanelProps) {
  const panelState = getBookingReplayOperationsPanelState({
    batchHistory,
    replayDetail,
    activeOwnerFilter: alertOwnerId,
  });

  const handleOwnerSelected = (ownerId: string) => {
    const payload = bookingReplayOperationsOwnerFilterPayload(ownerId);
    onOwnerSelected?.(payload.filterValue);
  };

  return (
    <View style={{ backgroundColor: '#050505', borderRadius: 12, padding: 10, marginTop: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{panelState.title}</Text>
          <Text style={smallTextStyle(panelState.kind === 'empty' ? panelState.tone : '#777')}>
            {bookingReplayOperationsStatusLine(panelState)}
          </Text>
        </View>
        {panelState.kind === 'ready' ? (
          <View style={{ borderColor: '#333', borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, marginTop: 4 }}>
            <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>
              Owner: {panelState.activeOwnerFilter}
            </Text>
          </View>
        ) : null}
      </View>

      <Text style={smallTextStyle('#777')}>
        Queue health, owner drilldowns, replay detail, stale-alert actions, reminders, and failed-row retry tools.
      </Text>

      <BookingReviewReplayQueueSummaryPanel rows={batchHistory} />

      <BookingReviewOwnerDrilldownPanel
        rows={batchHistory}
        onOwnerSelected={handleOwnerSelected}
        onExportCsv={onOwnerCsvExport}
      />

      <BookingReviewReplayDetailPanel
        detail={replayDetail}
        alertOwnerId={alertOwnerId}
        isLoading={isReplayDetailLoading}
        errorMessage={replayDetailError}
        emptyMessage="Select a batch row to load replay detail."
        onAlertUpdated={onAlertUpdated}
        onStatus={onStatus}
        onDownloadReplayCsv={onDownloadReplayCsv}
      />
    </View>
  );
}
