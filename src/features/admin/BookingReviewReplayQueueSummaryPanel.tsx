import React from 'react';
import { Text, View } from 'react-native';
import { AdminBookingReviewBatchHistory } from '../../api/adminCommandApi';
import {
  bookingReplayQueueSummaryCards,
  buildBookingReplayQueueSummary,
} from './bookingReviewReplayQueueSummaryHelpers';

type BookingReviewReplayQueueSummaryPanelProps = {
  rows: AdminBookingReviewBatchHistory[];
};

function smallTextStyle(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

export function BookingReviewReplayQueueSummaryPanel({ rows }: BookingReviewReplayQueueSummaryPanelProps) {
  const summary = buildBookingReplayQueueSummary(rows);
  const cards = bookingReplayQueueSummaryCards(summary);

  return (
    <View style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, minWidth: 220 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Replay Alert Queue Health</Text>
          <Text style={smallTextStyle('#777')}>
            Tracks stale booking-review replay failures, owner assignment, escalation, and retry reminders.
          </Text>
        </View>
        <View style={{ borderColor: summary.statusTone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, marginTop: 4 }}>
          <Text style={{ color: summary.statusTone, fontSize: 11, fontWeight: '900' }}>{summary.statusLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
        {cards.map((card) => (
          <View
            key={card.label}
            style={{ backgroundColor: '#111', borderRadius: 10, padding: 9, width: '48%', marginRight: '2%', marginBottom: 8 }}
          >
            <Text style={{ color: '#aaa', fontSize: 11 }}>{card.label}</Text>
            <Text style={{ color: card.tone, fontSize: 18, fontWeight: '900' }}>{card.value}</Text>
            <Text style={smallTextStyle('#777')}>{card.hint}</Text>
          </View>
        ))}
      </View>

      <Text style={smallTextStyle('#777')}>
        Latest activity: {summary.latestActivityAt ? new Date(summary.latestActivityAt).toLocaleString() : 'None yet'}
      </Text>
      <Text style={smallTextStyle('#777')}>
        Acknowledged {summary.acknowledgedAlerts} · Assigned {summary.assignedAlerts} · Total failed rows {summary.failedRows}
      </Text>
    </View>
  );
}
