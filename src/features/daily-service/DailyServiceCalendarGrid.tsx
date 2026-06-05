import React from 'react';
import { Text, View } from 'react-native';

type DailyServiceCalendarDay = {
  id: string;
  dayNumber: number;
  state: 'complete' | 'missed' | 'rest' | 'today' | 'future';
  points?: number;
};

type DailyServiceCalendarGridProps = {
  title?: string;
  subtitle?: string;
  monthLabel?: string;
  days?: DailyServiceCalendarDay[];
};

const defaultDays: DailyServiceCalendarDay[] = Array.from({ length: 28 }, (_, index) => {
  const dayNumber = index + 1;
  const state: DailyServiceCalendarDay['state'] = dayNumber < 18 ? (dayNumber % 6 === 0 ? 'rest' : 'complete') : dayNumber === 18 ? 'today' : dayNumber === 22 ? 'missed' : 'future';
  return { id: `day-${dayNumber}`, dayNumber, state, points: state === 'complete' ? 100 : undefined };
});

function dayAccent(state: DailyServiceCalendarDay['state']) {
  if (state === 'complete') return '#1D9E75';
  if (state === 'today') return '#d4af37';
  if (state === 'missed') return '#ff3f8e';
  if (state === 'rest') return '#a855f7';
  return '#262626';
}

function dayLabel(state: DailyServiceCalendarDay['state']) {
  if (state === 'complete') return '✓';
  if (state === 'today') return '•';
  if (state === 'missed') return '!';
  if (state === 'rest') return 'R';
  return '';
}

export function DailyServiceCalendarGrid({
  title = 'Service Calendar',
  subtitle = 'A compact month grid for streaks, rest days, missed days, points, and milestone tracking.',
  monthLabel = 'This Month',
  days = defaultDays,
}: DailyServiceCalendarGridProps) {
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
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{monthLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 14 }}>
        {days.map((day) => {
          const accent = dayAccent(day.state);
          return (
            <View key={day.id} style={{ width: 36, alignItems: 'center' }}>
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 10,
                  backgroundColor: day.state === 'future' ? '#080808' : accent,
                  borderColor: accent,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: day.state === 'future' ? '#555' : day.state === 'today' ? '#080808' : '#fff', fontWeight: '900', fontSize: 11 }}>
                  {dayLabel(day.state) || day.dayNumber}
                </Text>
              </View>
              <Text style={{ color: '#777', fontSize: 9, marginTop: 3 }}>{day.dayNumber}</Text>
            </View>
          );
        })}
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
        <Text style={{ color: '#1D9E75', fontSize: 10, fontWeight: '900' }}>✓ Complete</Text>
        <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>• Today</Text>
        <Text style={{ color: '#a855f7', fontSize: 10, fontWeight: '900' }}>R Rest</Text>
        <Text style={{ color: '#ff3f8e', fontSize: 10, fontWeight: '900' }}>! Missed</Text>
      </View>
    </View>
  );
}
