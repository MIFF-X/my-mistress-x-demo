import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxChatStudioBuildOrder, mxChatStudioSections, mxChatStudioSurfaces } from './chatStudioConfig';
import type { MxChatStudioDrawerId, MxChatStudioSection } from './chatStudioTypes';

const colors = {
  background: '#050505',
  panel: '#11100d',
  panelSoft: '#17130d',
  gold: '#d4af37',
  goldLight: '#f9d976',
  goldDark: '#6f4c16',
  text: '#f1dfad',
  muted: '#9a927f',
  border: '#39270c',
  green: '#2FAE77',
  pink: '#E654A8',
};

const drawerIcons: Record<MxChatStudioDrawerId, string> = {
  communication: '☎',
  'expression-assets': '✦',
  'sticker-store': '▧',
  'avatar-maker': '☺',
  gifts: '◇',
  'wrappers-effects': '✉',
  'live-rooms': '◉',
  'calls-bookings': '◷',
  'asset-packs': '▦',
  'layout-reorder': '↕',
};

function StudioChip({ label }: { label: string }) {
  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#080706' }}>
      <Text style={{ color: colors.goldLight, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

function StudioSectionCard({ section, active, onPress }: { section: MxChatStudioSection; active: boolean; onPress: (id: MxChatStudioDrawerId) => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => onPress(section.id)}
      style={{
        flexBasis: 260,
        flexGrow: 1,
        borderColor: active ? colors.gold : colors.border,
        borderWidth: active ? 2 : 1,
        borderRadius: 20,
        backgroundColor: active ? '#171108' : colors.panelSoft,
        padding: 15,
        gap: 10,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 38, height: 38, borderRadius: 13, borderColor: active ? colors.gold : colors.green, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: active ? colors.goldLight : colors.green, fontSize: 21, fontWeight: '900' }}>{drawerIcons[section.id]}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ color: colors.text, fontSize: 16, fontWeight: '900' }}>{section.title}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{section.subtitle}</Text>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {section.items.slice(0, 5).map((item) => (
          <StudioChip key={item} label={item} />
        ))}
      </View>
    </Pressable>
  );
}

export function ChatStudioScreen({ initialSectionId = 'communication' }: { initialSectionId?: MxChatStudioDrawerId }) {
  const [activeSectionId, setActiveSectionId] = useState<MxChatStudioDrawerId>(initialSectionId);
  const activeSection = useMemo(
    () => mxChatStudioSections.find((section) => section.id === activeSectionId) || mxChatStudioSections[0],
    [activeSectionId],
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 15 }}>
      <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 26, backgroundColor: colors.panel, padding: 18, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>Mistress-X Command Layer</Text>
          <Text style={{ color: colors.goldLight, fontSize: 28, fontWeight: '900', textAlign: 'center' }}>MX Chat Studio</Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
            One place for communication, paid chat, calls, live rooms, stickers, avatars, GIFs, wrappers, effects, gifts, asset packs and drag-to-reorder layouts.
          </Text>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
          {mxChatStudioSurfaces.map((surface) => (
            <StudioChip key={surface} label={surface.replace(/-/g, ' ')} />
          ))}
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {mxChatStudioSections.map((section) => (
            <StudioSectionCard key={section.id} section={section} active={section.id === activeSectionId} onPress={setActiveSectionId} />
          ))}
        </View>

        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 20, backgroundColor: '#080706', padding: 15, gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View style={{ width: 42, height: 42, borderRadius: 14, borderColor: colors.gold, borderWidth: 1, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ color: colors.goldLight, fontSize: 22 }}>{drawerIcons[activeSection.id]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.goldLight, fontSize: 18, fontWeight: '900' }}>{activeSection.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{activeSection.subtitle}</Text>
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Included tools</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {activeSection.items.map((item) => (
                <View key={item} style={{ flexGrow: 1, flexBasis: 190, borderColor: '#221908', borderWidth: 1, borderRadius: 14, backgroundColor: colors.panelSoft, padding: 11 }}>
                  <Text style={{ color: colors.text, fontSize: 12, fontWeight: '800' }}>✦ {item}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Connected systems</Text>
            <Text style={{ color: colors.muted, fontSize: 12, lineHeight: 18 }}>{activeSection.relatedSystems.join(' • ')}</Text>
          </View>
        </View>

        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 20, backgroundColor: colors.panelSoft, padding: 15, gap: 10 }}>
          <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>Next build order</Text>
          {mxChatStudioBuildOrder.map((step, index) => (
            <Text key={step} style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{index + 1}. {step}</Text>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}
