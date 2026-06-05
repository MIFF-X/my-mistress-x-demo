import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomGoalProgressCardProps = {
  title?: string;
  subtitle?: string;
  current?: number;
  target?: number;
  unitLabel?: string;
  rewardLabel?: string;
  onContributePress?: () => void;
};

function clampPercent(current: number, target: number) {
  if (!Number.isFinite(current) || !Number.isFinite(target) || target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export function LiveRoomGoalProgressCard({
  title = 'Room Goal',
  subtitle = 'Track progress toward a shared room milestone during live shows or Watch With Mistress.',
  current = 740,
  target = 1000,
  unitLabel = 'MX',
  rewardLabel = 'Unlock bonus commentary when complete',
  onContributePress,
}: LiveRoomGoalProgressCardProps) {
  const percent = clampPercent(current, target);

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
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#f5c542', fontSize: 10, fontWeight: '900' }}>{percent}%</Text>
        </View>
      </View>

      <View style={{ marginTop: 14 }}>
        <View style={{ height: 14, borderRadius: 999, backgroundColor: '#241b0a', overflow: 'hidden' }}>
          <View style={{ width: `${percent}%`, height: '100%', backgroundColor: '#d4af37', borderRadius: 999 }} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{unitLabel} {current}</Text>
          <Text style={{ color: '#999', fontWeight: '800', fontSize: 12 }}>Goal {unitLabel} {target}</Text>
        </View>
      </View>

      <Text style={{ color: '#f5c542', fontSize: 12, fontWeight: '800', marginTop: 10 }}>{rewardLabel}</Text>

      <Pressable
        onPress={onContributePress}
        style={{
          marginTop: 12,
          backgroundColor: '#d4af37',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#080808', fontWeight: '900' }}>Contribute</Text>
      </Pressable>
    </View>
  );
}
