import React from 'react';
import { Text, View } from 'react-native';

type LiveRoomSupporter = {
  id: string;
  displayName: string;
  metricLabel: string;
  rank: number;
  badge?: string;
};

type LiveRoomTopSupportersBoardProps = {
  title?: string;
  subtitle?: string;
  supporters?: LiveRoomSupporter[];
};

const defaultSupporters: LiveRoomSupporter[] = [
  { id: 's1', displayName: 'VelvetFan', metricLabel: 'MX 4.2k', rank: 1, badge: 'CROWN' },
  { id: 's2', displayName: 'NightOwl', metricLabel: 'MX 2.7k', rank: 2, badge: 'DIAMOND' },
  { id: 's3', displayName: 'CollectorSub77', metricLabel: 'MX 1.8k', rank: 3, badge: 'ROSE' },
  { id: 's4', displayName: 'SilentWatcher', metricLabel: 'MX 980', rank: 4, badge: 'VIP' },
];

function rankAccent(rank: number) {
  if (rank === 1) return '#d4af37';
  if (rank === 2) return '#c0c0c0';
  if (rank === 3) return '#cd7f32';
  return '#ff9abf';
}

export function LiveRoomTopSupportersBoard({
  title = 'Top Supporters',
  subtitle = 'Live supporter board for gifts, reactions, requests, and room activity.',
  supporters = defaultSupporters,
}: LiveRoomTopSupportersBoardProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ backgroundColor: '#101010', borderColor: '#2a1620', borderWidth: 1, borderRadius: 18, padding: 12 }}>
        {supporters.map((supporter, index) => {
          const accent = rankAccent(supporter.rank);
          return (
            <View
              key={supporter.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 10,
                borderBottomColor: '#1f1f1f',
                borderBottomWidth: index === supporters.length - 1 ? 0 : 1,
              }}
            >
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  backgroundColor: '#1a0b13',
                  borderColor: accent,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 10,
                }}
              >
                <Text style={{ color: accent, fontWeight: '900' }}>{supporter.rank}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 14 }}>{supporter.displayName}</Text>
                {supporter.badge ? <Text style={{ color: accent, fontSize: 10, fontWeight: '900', marginTop: 2 }}>{supporter.badge}</Text> : null}
              </View>

              <Text style={{ color: accent, fontWeight: '900', fontSize: 13 }}>{supporter.metricLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
