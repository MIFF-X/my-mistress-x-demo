import React from 'react';
import { Text, View } from 'react-native';

type LiveRoomStatusMetric = {
  id: string;
  label: string;
  value: string | number;
  helper?: string;
  icon?: string;
};

type LiveRoomStatusSummaryProps = {
  title?: string;
  subtitle?: string;
  metrics?: LiveRoomStatusMetric[];
};

const defaultMetrics: LiveRoomStatusMetric[] = [
  { id: 'viewers', label: 'Viewers', value: 284, helper: 'Watching now', icon: '👁️' },
  { id: 'gifts', label: 'Gifts', value: 96, helper: 'Sent in room', icon: '🎁' },
  { id: 'requests', label: 'Requests', value: 12, helper: 'Pending review', icon: '✨' },
  { id: 'access', label: 'Access', value: 'VIP', helper: 'Room setting', icon: '🔐' },
];

export function LiveRoomStatusSummary({
  title = 'Room Status',
  subtitle = 'Quick at-a-glance room stats for live shows, watch rooms, and audio spaces.',
  metrics = defaultMetrics,
}: LiveRoomStatusSummaryProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {metrics.map((metric) => (
          <View
            key={metric.id}
            style={{
              width: '48%',
              minWidth: 145,
              backgroundColor: '#101010',
              borderColor: '#2a1620',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
              {metric.icon ? <Text style={{ fontSize: 18, marginRight: 8 }}>{metric.icon}</Text> : null}
              <Text style={{ color: '#aaa', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{metric.label}</Text>
            </View>
            <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>{metric.value}</Text>
            {metric.helper ? <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{metric.helper}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}
