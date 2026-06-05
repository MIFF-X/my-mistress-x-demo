import React from 'react';
import { Text, View } from 'react-native';

type DailyServiceProgressRingProps = {
  title?: string;
  subtitle?: string;
  percent?: number;
  centreLabel?: string;
  helperLabel?: string;
};

function clampPercent(percent: number) {
  if (!Number.isFinite(percent)) return 0;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

export function DailyServiceProgressRing({
  title = 'Daily Progress',
  subtitle = 'Quick circular-style progress card for today’s tasks, journal, mood check-in, and reward claim.',
  percent = 75,
  centreLabel = '3/4',
  helperLabel = 'One item left today',
}: DailyServiceProgressRingProps) {
  const safePercent = clampPercent(percent);
  const remaining = 100 - safePercent;

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
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5 }}>{subtitle}</Text>

      <View style={{ alignItems: 'center', marginTop: 16 }}>
        <View
          style={{
            width: 124,
            height: 124,
            borderRadius: 999,
            borderWidth: 12,
            borderTopColor: '#ff3f8e',
            borderRightColor: safePercent >= 50 ? '#ff3f8e' : '#2a1620',
            borderBottomColor: safePercent >= 75 ? '#ff3f8e' : '#2a1620',
            borderLeftColor: safePercent >= 25 ? '#ff3f8e' : '#2a1620',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#050505',
          }}
        >
          <Text style={{ color: '#fff', fontSize: 26, fontWeight: '900' }}>{centreLabel}</Text>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900', marginTop: 2 }}>{safePercent}%</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 14 }}>
        <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#ff9abf', fontSize: 18, fontWeight: '900' }}>{safePercent}%</Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Complete</Text>
        </View>
        <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
          <Text style={{ color: '#d4af37', fontSize: 18, fontWeight: '900' }}>{remaining}%</Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 3 }}>Remaining</Text>
        </View>
      </View>

      <Text style={{ color: '#aaa', fontSize: 12, textAlign: 'center', marginTop: 12 }}>{helperLabel}</Text>
    </View>
  );
}
