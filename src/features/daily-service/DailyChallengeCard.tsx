import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyChallengeCardProps = {
  title?: string;
  subtitle?: string;
  dayLabel?: string;
  progress?: number;
  total?: number;
  rewardLabel?: string;
  statusLabel?: string;
  onOpenPress?: () => void;
};

function clampPercent(progress: number, total: number) {
  if (!Number.isFinite(progress) || !Number.isFinite(total) || total <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((progress / total) * 100)));
}

export function DailyChallengeCard({
  title = '7-Day Ritual Challenge',
  subtitle = 'Complete a short daily action to build momentum, unlock rewards, and grow the service streak.',
  dayLabel = 'Day 5 of 7',
  progress = 5,
  total = 7,
  rewardLabel = 'Unlock badge + sticker reward',
  statusLabel = 'IN PROGRESS',
  onOpenPress,
}: DailyChallengeCardProps) {
  const percent = clampPercent(progress, total);

  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#ff3f8e',
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
        <View style={{ backgroundColor: 'rgba(255, 63, 142, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{statusLabel}</Text>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 }}>
          <Text style={{ color: '#ff9abf', fontSize: 12, fontWeight: '900' }}>{dayLabel}</Text>
          <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900' }}>{percent}%</Text>
        </View>
        <View style={{ height: 14, borderRadius: 999, backgroundColor: '#24101a', overflow: 'hidden' }}>
          <View style={{ width: `${percent}%`, height: '100%', backgroundColor: '#ff3f8e', borderRadius: 999 }} />
        </View>
      </View>

      <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', marginTop: 10 }}>{rewardLabel}</Text>

      <Pressable
        onPress={onOpenPress}
        style={{
          marginTop: 12,
          backgroundColor: '#ff3f8e',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>Open Challenge</Text>
      </Pressable>
    </View>
  );
}
