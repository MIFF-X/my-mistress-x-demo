import React from 'react';
import { Text, View } from 'react-native';

type MiniStat = {
  id: string;
  label: string;
  value: string | number;
  tone: 'pink' | 'gold' | 'green' | 'purple';
};

type DailyServiceMiniStatsBarProps = {
  stats?: MiniStat[];
};

const defaultStats: MiniStat[] = [
  { id: 'today', label: 'Today', value: '3/4', tone: 'pink' },
  { id: 'streak', label: 'Streak', value: 5, tone: 'gold' },
  { id: 'points', label: 'Points', value: '+100', tone: 'green' },
  { id: 'rewards', label: 'Rewards', value: 2, tone: 'purple' },
];

function statAccent(tone: MiniStat['tone']) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'purple') return '#a855f7';
  return '#ff3f8e';
}

export function DailyServiceMiniStatsBar({ stats = defaultStats }: DailyServiceMiniStatsBarProps) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
      {stats.map((stat) => {
        const accent = statAccent(stat.tone);
        return (
          <View
            key={stat.id}
            style={{
              flexGrow: 1,
              minWidth: 78,
              backgroundColor: '#101010',
              borderColor: accent,
              borderWidth: 1,
              borderRadius: 14,
              padding: 10,
            }}
          >
            <Text style={{ color: accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{stat.label}</Text>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 5 }}>{stat.value}</Text>
          </View>
        );
      })}
    </View>
  );
}
