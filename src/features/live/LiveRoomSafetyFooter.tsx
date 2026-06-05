import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomSafetyFooterProps = {
  title?: string;
  subtitle?: string;
  reportLabel?: string;
  blockLabel?: string;
  helpLabel?: string;
  onReportPress?: () => void;
  onBlockPress?: () => void;
  onHelpPress?: () => void;
};

export function LiveRoomSafetyFooter({
  title = 'Safety & Room Controls',
  subtitle = 'Public previews stay safe. Private rooms remain gated by age, access, payment, permissions, and moderation rules.',
  reportLabel = 'Report',
  blockLabel = 'Block',
  helpLabel = 'Help',
  onReportPress,
  onBlockPress,
  onHelpPress,
}: LiveRoomSafetyFooterProps) {
  return (
    <View
      style={{
        backgroundColor: '#0d0d0d',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#888', fontSize: 12, lineHeight: 18, marginTop: 6 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onReportPress} style={{ backgroundColor: '#2a1018', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>{reportLabel}</Text>
        </Pressable>
        <Pressable onPress={onBlockPress} style={{ backgroundColor: '#1a1a1a', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Text style={{ color: '#ddd', fontWeight: '900', fontSize: 12 }}>{blockLabel}</Text>
        </Pressable>
        <Pressable onPress={onHelpPress} style={{ backgroundColor: '#111827', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 }}>
          <Text style={{ color: '#93c5fd', fontWeight: '900', fontSize: 12 }}>{helpLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
