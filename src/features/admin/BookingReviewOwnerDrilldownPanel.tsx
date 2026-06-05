import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';
import {
  bookingReplayOwnerDrilldownCsv,
  buildBookingReplayOwnerDrilldowns,
} from './bookingReviewReplayOwnerDrilldownHelpers';

type BookingReviewOwnerDrilldownPanelProps = {
  rows: AdminBookingReviewBatchHistory[];
  onOwnerSelected?: (ownerId: string) => void;
  onExportCsv?: (csvText: string) => void;
};

function smallTextStyle(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

export function BookingReviewOwnerDrilldownPanel({ rows, onOwnerSelected, onExportCsv }: BookingReviewOwnerDrilldownPanelProps) {
  const drilldowns = buildBookingReplayOwnerDrilldowns(rows);

  if (!drilldowns.length) {
    return (
      <View style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginTop: 8 }}>
        <Text style={{ color: '#fff', fontWeight: '900' }}>Replay Alert Owner Drilldown</Text>
        <Text style={smallTextStyle('#777')}>No replay-alert owner rows for the current filters.</Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
        <View>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Replay Alert Owner Drilldown</Text>
          <Text style={smallTextStyle('#777')}>Group stale replay alerts by owner so the Headmistress can chase overdue review work.</Text>
        </View>
        {onExportCsv ? (
          <Pressable
            onPress={() => onExportCsv(bookingReplayOwnerDrilldownCsv(drilldowns))}
            style={{ backgroundColor: '#1D9E75', paddingVertical: 7, paddingHorizontal: 9, borderRadius: 9, marginTop: 6 }}
          >
            <Text style={{ color: '#fff', fontWeight: '900' }}>Owner CSV</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {drilldowns.slice(0, 8).map((owner) => (
          <Pressable
            key={owner.ownerId}
            onPress={() => onOwnerSelected?.(owner.ownerId === 'UNASSIGNED' ? '' : owner.ownerId)}
            style={{
              backgroundColor: '#111',
              borderColor: owner.tone,
              borderWidth: 1,
              width: '48%',
              padding: 10,
              borderRadius: 10,
              marginRight: '2%',
              marginBottom: 8,
            }}
          >
            <Text style={{ color: owner.tone, fontSize: 13, fontWeight: '900' }}>{owner.label}</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 }}>{owner.totalBatches} batch(es)</Text>
            <Text style={smallTextStyle('#ddd')}>
              {owner.staleBatches} stale · {owner.overdueReminders} overdue · {owner.escalated} escalated
            </Text>
            <Text style={smallTextStyle('#777')} numberOfLines={2}>{owner.summary}</Text>
            <Text style={smallTextStyle('#777')} numberOfLines={1}>Batches: {owner.batchIds.slice(0, 3).join(', ')}{owner.batchIds.length > 3 ? '…' : ''}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
