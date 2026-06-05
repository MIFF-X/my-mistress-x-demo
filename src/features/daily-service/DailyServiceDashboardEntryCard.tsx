import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyServiceDashboardEntryCardProps = {
  title?: string;
  subtitle?: string;
  streakLabel?: string;
  taskLabel?: string;
  rewardLabel?: string;
  statusLabel?: string;
  onOpenPress?: () => void;
};

export function DailyServiceDashboardEntryCard({
  title = 'Daily Service',
  subtitle = 'Open today’s tasks, streaks, journal prompts, mood check-ins, rewards, and reminders.',
  streakLabel = '5-day streak',
  taskLabel = '3 tasks today',
  rewardLabel = '+100 points ready',
  statusLabel = 'ACTIVE',
  onOpenPress,
}: DailyServiceDashboardEntryCardProps) {
  return (
    <Pressable
      onPress={onOpenPress}
      style={{
        backgroundColor: '#101010',
        borderColor: '#d4af37',
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
        <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#f5c542', fontSize: 10, fontWeight: '900' }}>{statusLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{streakLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#1a0b13', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{taskLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#071712', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#1D9E75', fontSize: 10, fontWeight: '900' }}>{rewardLabel}</Text>
        </View>
      </View>

      <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', marginTop: 12 }}>Open Daily Service →</Text>
    </Pressable>
  );
}
