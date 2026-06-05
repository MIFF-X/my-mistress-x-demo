import React from 'react';
import { Text, View } from 'react-native';

type ServiceStreakDay = {
  id: string;
  label: string;
  completed: boolean;
  milestone?: boolean;
};

type DailyServiceStreakWidgetProps = {
  title?: string;
  subtitle?: string;
  currentStreak?: number;
  longestStreak?: number;
  serviceDays?: number;
  pointsToday?: number;
  days?: ServiceStreakDay[];
};

const defaultDays: ServiceStreakDay[] = [
  { id: 'mon', label: 'M', completed: true },
  { id: 'tue', label: 'T', completed: true },
  { id: 'wed', label: 'W', completed: true },
  { id: 'thu', label: 'T', completed: true },
  { id: 'fri', label: 'F', completed: true, milestone: true },
  { id: 'sat', label: 'S', completed: false },
  { id: 'sun', label: 'S', completed: false },
];

export function DailyServiceStreakWidget({
  title = 'Days of Service',
  subtitle = 'Daily login, service streak, and milestone progress for the dashboard.',
  currentStreak = 5,
  longestStreak = 18,
  serviceDays = 42,
  pointsToday = 100,
  days = defaultDays,
}: DailyServiceStreakWidgetProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
        <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{currentStreak}</Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 3 }}>Current streak</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#ff9abf', fontSize: 22, fontWeight: '900' }}>{longestStreak}</Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 3 }}>Longest</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#1D9E75', fontSize: 22, fontWeight: '900' }}>{serviceDays}</Text>
          <Text style={{ color: '#888', fontSize: 10, marginTop: 3 }}>Service days</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
        {days.map((day) => (
          <View key={day.id} style={{ alignItems: 'center' }}>
            <View
              style={{
                width: 34,
                height: 34,
                borderRadius: 999,
                backgroundColor: day.completed ? (day.milestone ? '#d4af37' : '#ff3f8e') : '#1b1b1b',
                borderColor: day.completed ? '#fff' : '#333',
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ color: day.completed && day.milestone ? '#080808' : '#fff', fontWeight: '900', fontSize: 12 }}>
                {day.completed ? '✓' : day.label}
              </Text>
            </View>
            <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>{day.label}</Text>
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, marginTop: 14, alignSelf: 'flex-start' }}>
        <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 11 }}>+{pointsToday} daily login points</Text>
      </View>
    </View>
  );
}
