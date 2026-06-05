import React from 'react';
import { Pressable, Text, View } from 'react-native';

type DailyServiceEmptyStateProps = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  onPrimaryPress?: () => void;
  onSecondaryPress?: () => void;
};

export function DailyServiceEmptyState({
  title = 'No daily items yet',
  subtitle = 'Add a task, start a challenge, write a journal prompt, or set a reminder to begin the daily service loop.',
  primaryLabel = 'Add Task',
  secondaryLabel = 'Start Challenge',
  onPrimaryPress,
  onSecondaryPress,
}: DailyServiceEmptyStateProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 20,
        padding: 18,
        marginBottom: 16,
        alignItems: 'center',
      }}
    >
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 22,
          backgroundColor: '#1a0b13',
          borderColor: '#d4af37',
          borderWidth: 1,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#d4af37', fontSize: 30, fontWeight: '900' }}>✓</Text>
      </View>

      <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900', textAlign: 'center' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 8, textAlign: 'center' }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 16 }}>
        <Pressable onPress={onPrimaryPress} style={{ backgroundColor: '#ff3f8e', borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>{primaryLabel}</Text>
        </Pressable>
        <Pressable onPress={onSecondaryPress} style={{ borderColor: '#3a202b', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 10 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900' }}>{secondaryLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}
