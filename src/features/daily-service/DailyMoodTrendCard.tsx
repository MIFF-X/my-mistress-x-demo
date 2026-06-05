import React from 'react';
import { Text, View } from 'react-native';

type MoodTrendPoint = {
  id: string;
  label: string;
  moodLabel: string;
  emoji: string;
  score: number;
};

type DailyMoodTrendCardProps = {
  title?: string;
  subtitle?: string;
  points?: MoodTrendPoint[];
};

const defaultPoints: MoodTrendPoint[] = [
  { id: 'mon', label: 'M', moodLabel: 'Focused', emoji: '🎯', score: 85 },
  { id: 'tue', label: 'T', moodLabel: 'Calm', emoji: '🌙', score: 74 },
  { id: 'wed', label: 'W', moodLabel: 'Motivated', emoji: '🔥', score: 92 },
  { id: 'thu', label: 'T', moodLabel: 'Reflective', emoji: '📝', score: 68 },
  { id: 'fri', label: 'F', moodLabel: 'Proud', emoji: '✨', score: 96 },
  { id: 'sat', label: 'S', moodLabel: 'Tired', emoji: '☁️', score: 42 },
  { id: 'sun', label: 'S', moodLabel: 'Open', emoji: '○', score: 0 },
];

function scoreAccent(score: number) {
  if (score >= 85) return '#1D9E75';
  if (score >= 65) return '#d4af37';
  if (score > 0) return '#a855f7';
  return '#333';
}

export function DailyMoodTrendCard({
  title = 'Mood Trend',
  subtitle = 'Weekly mood trend for private check-ins and permissioned summary views.',
  points = defaultPoints,
}: DailyMoodTrendCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 14 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 8 }}>
        {points.map((point) => {
          const accent = scoreAccent(point.score);
          const height = point.score > 0 ? Math.max(18, Math.round(point.score * 0.7)) : 18;
          return (
            <View key={point.id} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ fontSize: 18, marginBottom: 6 }}>{point.emoji}</Text>
              <View
                style={{
                  width: '100%',
                  maxWidth: 28,
                  height,
                  borderRadius: 999,
                  backgroundColor: accent,
                  opacity: point.score > 0 ? 1 : 0.35,
                }}
              />
              <Text style={{ color: '#777', fontSize: 10, marginTop: 6 }}>{point.label}</Text>
              <Text style={{ color: accent, fontSize: 9, fontWeight: '900', marginTop: 2 }} numberOfLines={1}>{point.moodLabel}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}
