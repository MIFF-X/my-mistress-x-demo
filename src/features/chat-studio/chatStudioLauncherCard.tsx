import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { mxChatStudioRegistryEntry } from './chatStudioRegistry';

const colors = {
  panel: '#11100d',
  panelSoft: '#17130d',
  gold: '#d4af37',
  goldLight: '#f9d976',
  muted: '#9a927f',
  border: '#39270c',
  green: '#2FAE77',
};

export function ChatStudioLauncherCard({ onOpen }: { onOpen?: () => void }) {
  const entry = mxChatStudioRegistryEntry;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Open MX Chat Studio"
      onPress={onOpen}
      style={{
        borderColor: colors.border,
        borderWidth: 1,
        borderRadius: 22,
        backgroundColor: colors.panel,
        padding: 16,
        gap: 14,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ width: 48, height: 48, borderRadius: 16, borderColor: colors.gold, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080706' }}>
          <Text style={{ color: colors.goldLight, fontSize: 24, fontWeight: '900' }}>✦</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ color: colors.goldLight, fontSize: 18, fontWeight: '900' }}>{entry.title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{entry.subtitle}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
        {entry.tags.slice(0, 6).map((tag) => (
          <View key={tag} style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: colors.panelSoft }}>
            <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{tag.replace(/-/g, ' ')}</Text>
          </View>
        ))}
      </View>

      <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 15, padding: 11, backgroundColor: colors.panelSoft }}>
        <Text style={{ color: colors.green, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>Includes {entry.sections.length} studio zones</Text>
        <Text style={{ color: colors.muted, fontSize: 11, marginTop: 4 }}>
          {entry.sections.map((section) => section.title).slice(0, 4).join(' • ')}
        </Text>
      </View>
    </Pressable>
  );
}
