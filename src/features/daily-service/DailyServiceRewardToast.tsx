import React from 'react';
import { Pressable, Text, View } from 'react-native';

type RewardToastTone = 'points' | 'badge' | 'sticker' | 'milestone';

type DailyServiceRewardToastProps = {
  tone?: RewardToastTone;
  title?: string;
  subtitle?: string;
  rewardLabel?: string;
  actionLabel?: string;
  onActionPress?: () => void;
};

function toneAccent(tone: RewardToastTone) {
  if (tone === 'points') return '#d4af37';
  if (tone === 'badge') return '#ff3f8e';
  if (tone === 'sticker') return '#a855f7';
  return '#1D9E75';
}

function toneIcon(tone: RewardToastTone) {
  if (tone === 'points') return '✦';
  if (tone === 'badge') return '★';
  if (tone === 'sticker') return '◆';
  return '✓';
}

export function DailyServiceRewardToast({
  tone = 'points',
  title = 'Reward Unlocked',
  subtitle = 'Daily service progress has been recorded.',
  rewardLabel = '+100 points',
  actionLabel = 'View Rewards',
  onActionPress,
}: DailyServiceRewardToastProps) {
  const accent = toneAccent(tone);

  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: accent,
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <View
        style={{
          width: 48,
          height: 48,
          borderRadius: 18,
          backgroundColor: accent,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text style={{ color: '#080808', fontSize: 24, fontWeight: '900' }}>{toneIcon(tone)}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{title}</Text>
        <Text style={{ color: '#999', fontSize: 12, marginTop: 3 }}>{subtitle}</Text>
        <Text style={{ color: accent, fontSize: 12, fontWeight: '900', marginTop: 6 }}>{rewardLabel}</Text>
      </View>

      <Pressable onPress={onActionPress} style={{ backgroundColor: '#050505', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 8 }}>
        <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}
