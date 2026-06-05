import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminBookingReviewBatchReplayDetail } from '../../api/adminCommandApi';
import { BookingReviewReplayAlertPanel } from './BookingReviewReplayAlertPanel';
import {
  bookingReplayAlertHistoryLabel,
  bookingReplayAuditRowLabel,
  bookingReplayBatchListLabel,
  bookingReplayDetailHeadline,
  bookingReplayDownloadBatchId,
  buildBookingReplaySummaryCards,
  getBookingReplayDetailPanelState,
} from './bookingReviewReplayDetailHelpers';

type BookingReviewReplayDetailPanelProps = {
  detail: AdminBookingReviewBatchReplayDetail | null;
  alertOwnerId?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
  emptyMessage?: string;
  onAlertUpdated?: (detail: AdminBookingReviewBatchReplayDetail) => void;
  onStatus?: (message: string) => void;
  onDownloadReplayCsv?: (batchId: string) => void;
};

function smallTextStyle(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function panelStyle() {
  return { backgroundColor: '#111', borderRadius: 10, padding: 10, marginTop: 10 } as const;
}

export function BookingReviewReplayDetailPanel({
  detail,
  alertOwnerId,
  isLoading,
  errorMessage,
  emptyMessage,
  onAlertUpdated,
  onStatus,
  onDownloadReplayCsv,
}: BookingReviewReplayDetailPanelProps) {
  const panelState = getBookingReplayDetailPanelState(detail, { isLoading, errorMessage, emptyMessage });
  if (panelState.kind !== 'ready') {
    return (
      <View style={panelStyle()}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>{panelState.title}</Text>
        <Text style={smallTextStyle(panelState.tone)}>{panelState.message}</Text>
      </View>
    );
  }

  const readyDetail = panelState.detail as AdminBookingReviewBatchReplayDetail;
  const alertHistory = bookingReplayAlertHistoryLabel(readyDetail);

  return (
    <View style={panelStyle()}>
      <Text style={{ color: '#fff', fontWeight: '900' }}>{panelState.title}</Text>
      <Text style={smallTextStyle('#aaa')}>
        {bookingReplayDetailHeadline(readyDetail)}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {buildBookingReplaySummaryCards(readyDetail).map((card) => (
          <View
            key={card.label}
            style={{ backgroundColor: '#050505', width: '48%', padding: 10, borderRadius: 10, marginRight: '2%', marginBottom: 8 }}
          >
            <Text style={{ color: '#aaa', fontSize: 11 }}>{card.label}</Text>
            <Text style={{ color: card.tone, fontSize: 20, fontWeight: '900' }}>{card.value}</Text>
            <Text style={smallTextStyle('#777')}>{card.hint}</Text>
          </View>
        ))}
      </View>

      <BookingReviewReplayAlertPanel detail={readyDetail} assignedToId={alertOwnerId} onUpdated={onAlertUpdated} onStatus={onStatus} />

      {alertHistory ? <Text style={smallTextStyle('#777')}>Alert history: {alertHistory}</Text> : null}

      <Text style={smallTextStyle('#777')}>
        Replay batches: {bookingReplayBatchListLabel(readyDetail)}
      </Text>

      {readyDetail.replayAudits.slice(0, 4).map((audit) => {
        return (
          <Text key={audit.id} style={smallTextStyle('#aaa')}>
            {bookingReplayAuditRowLabel(audit)}
          </Text>
        );
      })}

      {onDownloadReplayCsv ? (
        <Pressable
          onPress={() => onDownloadReplayCsv(bookingReplayDownloadBatchId(readyDetail))}
          style={{ backgroundColor: '#1D9E75', paddingVertical: 8, paddingHorizontal: 10, borderRadius: 10, marginTop: 10, alignSelf: 'flex-start' }}
        >
          <Text style={{ color: '#fff', fontWeight: '900' }}>Download Replay CSV</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
