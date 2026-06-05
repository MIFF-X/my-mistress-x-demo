import React from 'react';
import { Pressable, Text, View } from 'react-native';

type WeeklyReviewMetric = {
  id: string;
  label: string;
  value: string | number;
  helper: string;
  tone: 'pink' | 'gold' | 'green' | 'purple';
};

type DailyServiceWeeklyReviewCardProps = {
  title?: string;
  subtitle?: string;
  weekLabel?: string;
  metrics?: WeeklyReviewMetric[];
  onOpenReview?: () => void;
};

const defaultMetrics: WeeklyReviewMetric[] = [
  { id: 'completed', label: 'Completed', value: 18, helper: 'Tasks this week', tone: 'green' },
  { id: 'journal', label: 'Journal', value: 5, helper: 'Entries written', tone: 'purple' },
  { id: 'streak', label: 'Streak', value: 7, helper: 'Days active', tone: 'gold' },
  { id: 'rewards', label: 'Rewards', value: 4, helper: 'Unlocked items', tone: 'pink' },
];

function metricAccent(tone: WeeklyReviewMetric['tone']) {
  if (tone === 'gold') return '#d4af37';
  if (tone === 'green') return '#1D9E75';
  if (tone === 'purple') return '#a855f7';
  return '#ff3f8e';
}

export function DailyServiceWeeklyReviewCard({
  title = 'Weekly Review',
  subtitle = 'Summarise weekly service activity, completion, journal entries, streaks, and rewards.',
  weekLabel = 'Week 21',
  metrics = defaultMetrics,
  onOpenReview,
}: DailyServiceWeeklyReviewCardProps) {
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
        <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{weekLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
        {metrics.map((metric) => {
          const accent = metricAccent(metric.tone);
          return (
            <View key={metric.id} style={{ flexGrow: 1, minWidth: 130, backgroundColor: '#050505', borderColor: accent, borderWidth: 1, borderRadius: 16, padding: 12 }}>
              <Text style={{ color: accent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{metric.label}</Text>
              <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 5 }}>{metric.value}</Text>
              <Text style={{ color: '#777', fontSize: 11, marginTop: 3 }}>{metric.helper}</Text>
            </View>
          );
        })}
      </View>

      <Pressable onPress={onOpenReview} style={{ marginTop: 12, backgroundColor: '#d4af37', borderRadius: 999, paddingVertical: 11, alignItems: 'center' }}>
        <Text style={{ color: '#080808', fontWeight: '900' }}>Open Weekly Review</Text>
      </Pressable>
    </View>
  );
}
