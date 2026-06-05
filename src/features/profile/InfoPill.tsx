import React from 'react';
import { Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';

export type InfoPillTone = 'pink' | 'gold' | 'purple';

type InfoPillProps = {
  label: string;
  tone: InfoPillTone;
};

export function InfoPill({ label, tone }: InfoPillProps) {
  const backgroundColor = tone === 'gold' ? 'rgba(245, 197, 66, 0.18)' : tone === 'pink' ? 'rgba(255, 0, 85, 0.18)' : 'rgba(127, 119, 221, 0.2)';
  const color = tone === 'gold' ? mxTheme.colors.warning : tone === 'pink' ? '#ff9abf' : '#c7c2ff';

  return (
    <View style={{ backgroundColor, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color, fontSize: 11, fontWeight: '800' }}>{label}</Text>
    </View>
  );
}
