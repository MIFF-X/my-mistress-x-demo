import React from 'react';
import { Pressable, Text, View } from 'react-native';

type AdminControl = {
  id: string;
  label: string;
  helper: string;
  tone: 'audit' | 'safe' | 'warning' | 'danger';
};

type LiveRoomAdminControlStripProps = {
  title?: string;
  subtitle?: string;
  controls?: AdminControl[];
  onControlPress?: (control: AdminControl) => void;
};

const defaultControls: AdminControl[] = [
  { id: 'audit-room', label: 'Audit', helper: 'Open room trail', tone: 'audit' },
  { id: 'moderate-chat', label: 'Moderate', helper: 'Review chat flags', tone: 'warning' },
  { id: 'freeze-gifts', label: 'Pause Gifts', helper: 'Hold paid actions', tone: 'warning' },
  { id: 'close-room', label: 'Close Room', helper: 'Emergency stop', tone: 'danger' },
  { id: 'mark-safe', label: 'Mark Safe', helper: 'Clear review state', tone: 'safe' },
];

function controlAccent(tone: AdminControl['tone']) {
  if (tone === 'safe') return '#1D9E75';
  if (tone === 'warning') return '#d4af37';
  if (tone === 'danger') return '#ff3f8e';
  return '#93c5fd';
}

export function LiveRoomAdminControlStrip({
  title = 'Admin Room Controls',
  subtitle = 'Quick Headmistress/Admin actions for auditing, moderation, paid-action holds, and emergency room controls.',
  controls = defaultControls,
  onControlPress,
}: LiveRoomAdminControlStripProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {controls.map((control) => {
          const accent = controlAccent(control.tone);
          return (
            <Pressable
              key={control.id}
              onPress={() => onControlPress?.(control)}
              style={{
                minWidth: 124,
                flexGrow: 1,
                backgroundColor: '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ color: accent, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>{control.label}</Text>
              <Text style={{ color: '#aaa', fontSize: 11, lineHeight: 16, marginTop: 5 }}>{control.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
