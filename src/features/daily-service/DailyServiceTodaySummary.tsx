import React from 'react';
import { Pressable, Text, View } from 'react-native';

type TodaySummaryItem = {
  id: string;
  label: string;
  value: string | number;
  helper: string;
  tone: 'pink' | 'gold' | 'green' | 'purple';
};

type DailyServiceTodaySummaryProps = {
  title?: string;
  subtitle?: string;
  items?: TodaySummaryItem[];
  primaryLabel?: string;
  onPrimaryPress?: () => void;
};

const defaultItems: TodaySummaryItem[] = [
  { id: 'tasks', label: 'Tasks', value: '2/3', helper: 'Due today', tone: 'pink' },
  { id: 'journal', label: 'Journal', value: '1', helper: 'Prompt ready', tone: 'purple' },
  { id: 'mood', label: 'Mood', value: 'Set', helper: 'Focused', tone: 'green' },
  { id: 'reward', label: 'Reward', value: '+100', helper: 'Claimed', tone: 'gold' },
];

function itemAccent(tone: TodaySummaryItem['tone']) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'purple') return '#a855f7';
  return '#ff3f8e';
}

export function DailyServiceTodaySummary({
  title = 'Today Summary',
  subtitle = 'A compact overview of today’s tasks, journal, mood check-in, and reward state.',
  items = defaultItems,
  primaryLabel = 'Continue Today',
  onPrimaryPress,
}: DailyServiceTodaySummaryProps) {
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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: '#1a0b13', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>TODAY</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        {items.map((item) => {
          const accent = itemAccent(item.tone);
          return (
            <View
              key={item.id}
              style={{
                flexGrow: 1,
                minWidth: 130,
                backgroundColor: '#050505',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{item.label}</Text>
              <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 5 }}>{item.value}</Text>
              <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>{item.helper}</Text>
            </View>
          );
        })}
      </View>

      <Pressable
        onPress={onPrimaryPress}
        style={{
          marginTop: 12,
          backgroundColor: '#ff3f8e',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{primaryLabel}</Text>
      </Pressable>
    </View>
  );
}
