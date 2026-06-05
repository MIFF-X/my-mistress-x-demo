import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GameSkinForgeScreen } from './game-skins/GameSkinForgeScreen';
import { IconForgeScreen } from './icon-forge/iconForgeScreen';
import { PackPreviewScreen } from './packPreviewScreen';

type StylingEngineHubTab = 'packs' | 'icons' | 'game-skins';

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
  purple: '#9F7AEA',
};

const hubTabs: Array<{ id: StylingEngineHubTab; title: string; subtitle: string }> = [
  {
    id: 'packs',
    title: 'Pack Preview',
    subtitle: 'View finished style packs, included assets, pricing, and marketplace cards.',
  },
  {
    id: 'icons',
    title: 'Icon Forge',
    subtitle: 'Add, organise, edit, export, save, and publish custom icon collections.',
  },
  {
    id: 'game-skins',
    title: 'Game Skin Forge',
    subtitle: 'Mix slot, scratch, wheel, mystery, and animated icon packs for game plugins.',
  },
];

function HubTabButton({ active, title, subtitle, onPress }: { active: boolean; title: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={{
        flexGrow: 1,
        flexBasis: 210,
        borderColor: active ? colors.gold : colors.border,
        borderWidth: active ? 2 : 1,
        borderRadius: 18,
        backgroundColor: active ? '#171105' : colors.panelSoft,
        padding: 13,
        gap: 5,
      }}
    >
      <Text style={{ color: active ? colors.goldLight : colors.text, fontSize: 14, fontWeight: '900' }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 10, lineHeight: 15 }}>{subtitle}</Text>
    </Pressable>
  );
}

function HubHeader({ activeTab, setActiveTab }: { activeTab: StylingEngineHubTab; setActiveTab: (tab: StylingEngineHubTab) => void }) {
  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 26, backgroundColor: colors.panel, padding: 18, gap: 16 }}>
      <View style={{ alignItems: 'center', gap: 7 }}>
        <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>Mistress-X Styling Engine</Text>
        <Text style={{ color: colors.goldLight, fontSize: 27, fontWeight: '900', textAlign: 'center' }}>Headmistress Asset Generator</Text>
        <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>
          One zone for theme packs, icon collections, game skins, animated assets, app market bundles, and plug-and-play platform visuals.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {hubTabs.map((tab) => (
          <HubTabButton
            key={tab.id}
            active={activeTab === tab.id}
            title={tab.title}
            subtitle={tab.subtitle}
            onPress={() => setActiveTab(tab.id)}
          />
        ))}
      </View>
    </View>
  );
}

export function StylingEngineHubScreen({ initialTab = 'packs' }: { initialTab?: StylingEngineHubTab }) {
  const [activeTab, setActiveTab] = useState<StylingEngineHubTab>(initialTab);

  const activeScreen = useMemo(() => {
    if (activeTab === 'icons') {
      return <IconForgeScreen />;
    }

    if (activeTab === 'game-skins') {
      return <GameSkinForgeScreen />;
    }

    return <PackPreviewScreen />;
  }, [activeTab]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 14, gap: 14 }}>
      <HubHeader activeTab={activeTab} setActiveTab={setActiveTab} />
      <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 28, overflow: 'hidden', backgroundColor: '#020202' }}>
        {activeScreen}
      </View>
    </ScrollView>
  );
}
