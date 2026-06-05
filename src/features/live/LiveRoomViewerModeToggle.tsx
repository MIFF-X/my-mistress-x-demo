import React from 'react';
import { Pressable, Text, View } from 'react-native';

type ViewerMode = 'focus' | 'chat' | 'gifts' | 'full_screen' | 'mini_cam';

type ViewerModeOption = {
  id: ViewerMode;
  label: string;
  helper: string;
  icon: string;
};

type LiveRoomViewerModeToggleProps = {
  title?: string;
  subtitle?: string;
  activeMode?: ViewerMode;
  modes?: ViewerModeOption[];
  onModeChange?: (mode: ViewerMode) => void;
};

const defaultModes: ViewerModeOption[] = [
  { id: 'focus', label: 'Focus', helper: 'Hide extras', icon: '◎' },
  { id: 'chat', label: 'Chat', helper: 'Show sidebar', icon: '💬' },
  { id: 'gifts', label: 'Gifts', helper: 'Gift rail', icon: '🎁' },
  { id: 'full_screen', label: 'Full', helper: 'Theatre mode', icon: '⛶' },
  { id: 'mini_cam', label: 'Mini Cam', helper: 'Host overlay', icon: '◱' },
];

export function LiveRoomViewerModeToggle({
  title = 'Viewer Mode',
  subtitle = 'Let Subs choose focus mode, chat, gifts, full screen, or the Mistress commentary cam overlay.',
  activeMode = 'chat',
  modes = defaultModes,
  onModeChange,
}: LiveRoomViewerModeToggleProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {modes.map((mode) => {
          const active = activeMode === mode.id;
          return (
            <Pressable
              key={mode.id}
              onPress={() => onModeChange?.(mode.id)}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              style={{
                backgroundColor: active ? '#ff3f8e' : '#101010',
                borderColor: active ? '#ff9abf' : '#303030',
                borderWidth: 1,
                borderRadius: 14,
                paddingHorizontal: 10,
                paddingVertical: 9,
                minWidth: 102,
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ color: active ? '#fff' : '#ff9abf', fontSize: 16 }}>{mode.icon}</Text>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{mode.label}</Text>
              </View>
              <Text style={{ color: active ? '#ffe5ef' : '#777', fontSize: 10, marginTop: 4 }}>{mode.helper}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
