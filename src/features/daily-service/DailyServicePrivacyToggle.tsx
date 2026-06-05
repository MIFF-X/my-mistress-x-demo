import React from 'react';
import { Pressable, Text, View } from 'react-native';

type PrivacyMode = 'private' | 'shared' | 'review';

type PrivacyOption = {
  id: PrivacyMode;
  label: string;
  helper: string;
};

type DailyServicePrivacyToggleProps = {
  title?: string;
  subtitle?: string;
  activeMode?: PrivacyMode;
  options?: PrivacyOption[];
  onModeChange?: (mode: PrivacyMode) => void;
};

const defaultOptions: PrivacyOption[] = [
  { id: 'private', label: 'Private', helper: 'Only visible to you' },
  { id: 'shared', label: 'Shared', helper: 'Visible to permitted profile owner' },
  { id: 'review', label: 'Review', helper: 'Queued for admin/safety review' },
];

function modeAccent(mode: PrivacyMode) {
  if (mode === 'private') return '#a855f7';
  if (mode === 'shared') return '#1D9E75';
  return '#d4af37';
}

export function DailyServicePrivacyToggle({
  title = 'Privacy Controls',
  subtitle = 'Choose whether a task, proof item, journal entry, or mood check-in remains private or is shared with permission.',
  activeMode = 'private',
  options = defaultOptions,
  onModeChange,
}: DailyServicePrivacyToggleProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 18, marginTop: 5, marginBottom: 12 }}>{subtitle}</Text>

      <View style={{ gap: 8 }}>
        {options.map((option) => {
          const active = activeMode === option.id;
          const accent = modeAccent(option.id);
          return (
            <Pressable
              key={option.id}
              onPress={() => onModeChange?.(option.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? '#171017' : '#050505',
                borderColor: active ? accent : '#262626',
                borderWidth: 1,
                borderRadius: 14,
                padding: 11,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <View style={{ width: 12, height: 12, borderRadius: 999, backgroundColor: active ? accent : '#333' }} />
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 13 }}>{option.label}</Text>
                <Text style={{ color: active ? accent : '#777', fontSize: 11, marginTop: 3 }}>{option.helper}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
