import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyServiceLockedStateProps = {
  title?: string;
  subtitle?: string;
  accessLabel?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

export function DailyServiceLockedState({
  title = 'Daily Service Locked',
  subtitle = 'This daily service area needs a linked profile, accepted task invite, membership, or permission before it can be opened.',
  accessLabel = 'Permission required',
  primaryLabel = 'Request Access',
  secondaryLabel = 'View Profile',
  onPrimaryPress,
  onSecondaryPress,
}: DailyServiceLockedStateProps) {
  return (
    <View
      style={{
        backgroundColor: '#100b10',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 68,
          height: 68,
          borderRadius: 24,
          backgroundColor: '#1a0b13',
          borderColor: '#a855f7',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#d8b4fe', fontSize: 30, fontWeight: '900' }}>🔐</Text>
      </View>

      <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, marginBottom: 10 }}>
        <Text style={{ color: '#d8b4fe', fontSize: 10, fontWeight: '900' }}>{accessLabel}</Text>
      </View>

      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: '#aaa', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <Pressable onPress={onPrimaryPress} style={{ backgroundColor: '#a855f7', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{primaryLabel}</Text>
        </Pressable>
        <Pressable onPress={onSecondaryPress} style={{ borderColor: '#3a214f', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#d8b4fe', fontWeight: '900' }}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
