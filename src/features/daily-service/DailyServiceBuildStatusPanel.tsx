import React from 'react';
import { Text, View } from 'react-native';

type BuildStatusItem = {
  id: string;
  label: string;
  status: 'done' | 'pending' | 'blocked' | 'testing';
  detail: string;
};

type DailyServiceBuildStatusPanelProps = {
  title?: string;
  subtitle?: string;
  items?: BuildStatusItem[];
};

const defaultItems: BuildStatusItem[] = [
  { id: 'components', label: 'UI Components', status: 'done', detail: 'Daily service cards and previews scaffolded.' },
  { id: 'typecheck', label: 'Typecheck', status: 'testing', detail: 'Pull latest branch and run npm run typecheck.' },
  { id: 'routes', label: 'Route Wiring', status: 'pending', detail: 'Mount previews into dashboard navigation later.' },
  { id: 'backend', label: 'Backend API', status: 'pending', detail: 'Connect tasks, journals, rewards, and approvals after UI pass.' },
];

function statusAccent(status: BuildStatusItem['status']) {
  if (status === 'done') return '#1D9E75';
  if (status === 'testing') return '#d4af37';
  if (status === 'blocked') return '#ff3f8e';
  return '#a855f7';
}

export function DailyServiceBuildStatusPanel({
  title = 'Daily Service Build Status',
  subtitle = 'Implementation checkpoint for the daily service UI pass before route and backend wiring.',
  items = defaultItems,
}: DailyServiceBuildStatusPanelProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }}>{subtitle}</Text>

      <View style={{ gap: 10 }}>
        {items.map((item) => {
          const accent = statusAccent(item.status);
          return (
            <View key={item.id} style={{ backgroundColor: '#050505', borderColor: accent, borderWidth: 1, borderRadius: 14, padding: 11 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{item.label}</Text>
                <Text style={{ color: accent, fontWeight: '900', fontSize: 10 }}>{item.status.toUpperCase()}</Text>
              </View>
              <Text style={{ color: '#888', fontSize: 11, lineHeight: 16, marginTop: 5 }}>{item.detail}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
