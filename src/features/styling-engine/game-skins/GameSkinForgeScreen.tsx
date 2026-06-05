import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxAnimatedIconCategories, mxDemoGameVisualBundles, mxGameIconPacks, mxGameSkinPacks } from './gameSkinConfig';
import type { MxGameIconPack, MxGameSkinPack, MxGameVisualBundle } from './gameSkinTypes';

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
  purple: '#9F7AEA',
  pink: '#E654A8',
};

function Chip({ label }: { label: string }) {
  return (
    <View style={{ borderRadius: 999, borderColor: colors.goldDark, borderWidth: 1, backgroundColor: '#080706', paddingHorizontal: 9, paddingVertical: 5 }}>
      <Text style={{ color: colors.goldLight, fontSize: 10, fontWeight: '900' }}>{label}</Text>
    </View>
  );
}

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>{title}</Text>
      <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{subtitle}</Text>
    </View>
  );
}

function SkinPackCard({ pack, selected, onPress }: { pack: MxGameSkinPack; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderColor: selected ? colors.gold : colors.border,
        borderWidth: selected ? 2 : 1,
        borderRadius: 18,
        backgroundColor: selected ? '#171105' : colors.panelSoft,
        padding: 14,
        gap: 10,
        flexBasis: 260,
        flexGrow: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.goldLight, fontSize: 15, fontWeight: '900' }}>{pack.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{pack.description}</Text>
        </View>
        <Text style={{ color: selected ? colors.gold : colors.muted, fontSize: 24 }}>{selected ? '✓' : '+'}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Chip label={pack.gameType} />
        <Chip label={pack.themeId.replace('mx-', '')} />
        <Chip label={`${pack.requiredSlots.length} slots`} />
      </View>
    </Pressable>
  );
}

function IconPackCard({ pack, selected, onPress }: { pack: MxGameIconPack; selected: boolean; onPress: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={{
        borderColor: selected ? colors.purple : colors.border,
        borderWidth: selected ? 2 : 1,
        borderRadius: 18,
        backgroundColor: selected ? '#120d1f' : colors.panelSoft,
        padding: 14,
        gap: 10,
        flexBasis: 260,
        flexGrow: 1,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.goldLight, fontSize: 15, fontWeight: '900' }}>{pack.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 11, lineHeight: 16 }}>{pack.description}</Text>
        </View>
        <Text style={{ color: selected ? colors.purple : colors.muted, fontSize: 24 }}>{selected ? '✓' : '+'}</Text>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        <Chip label={`${pack.iconCount} icons`} />
        {pack.compatibleGameTypes.slice(0, 3).map((type) => <Chip key={type} label={type} />)}
      </View>
    </Pressable>
  );
}

function BundleCard({ bundle }: { bundle: MxGameVisualBundle }) {
  return (
    <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: '#080706', padding: 14, gap: 10 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1, gap: 5 }}>
          <Text style={{ color: colors.goldLight, fontSize: 16, fontWeight: '900' }}>{bundle.name}</Text>
          <Text style={{ color: colors.muted, fontSize: 11 }}>{bundle.skinPackId} + {bundle.iconPackId}</Text>
        </View>
        <Chip label={bundle.gameType} />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {Object.entries(bundle.iconMap).map(([slot, icon]) => (
          <View key={slot} style={{ borderRadius: 12, borderColor: '#241a08', borderWidth: 1, padding: 8, backgroundColor: colors.panelSoft }}>
            <Text style={{ color: colors.text, fontSize: 10, fontWeight: '800' }}>{slot} → {icon}</Text>
          </View>
        ))}
      </View>
      <Text style={{ color: colors.muted, fontSize: 10 }}>Targets: {bundle.compatiblePlugins.join(' • ')}</Text>
    </View>
  );
}

export function GameSkinForgeScreen() {
  const [selectedSkinId, setSelectedSkinId] = useState(mxGameSkinPacks[0]?.id || '');
  const [selectedIconPackId, setSelectedIconPackId] = useState(mxGameIconPacks[0]?.id || '');

  const selectedSkin = useMemo(() => mxGameSkinPacks.find((pack) => pack.id === selectedSkinId), [selectedSkinId]);
  const selectedIconPack = useMemo(() => mxGameIconPacks.find((pack) => pack.id === selectedIconPackId), [selectedIconPackId]);
  const compatible = Boolean(selectedSkin && selectedIconPack?.compatibleGameTypes.includes(selectedSkin.gameType));

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 18, gap: 16 }}>
      <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 26, backgroundColor: colors.panel, padding: 18, gap: 18 }}>
        <View style={{ alignItems: 'center', gap: 8, paddingVertical: 10 }}>
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>MX Game Skin Forge</Text>
          <Text style={{ color: colors.text, fontSize: 27, fontWeight: '900', textAlign: 'center' }}>Mix skins with icon packs</Text>
          <Text style={{ color: colors.muted, fontSize: 13, textAlign: 'center', lineHeight: 19 }}>
            Build slot, scratch card, wheel, mystery box, raffle, and animated icon bundles for the app market.
          </Text>
        </View>

        <View style={{ borderColor: compatible ? colors.green : colors.goldDark, borderWidth: 1, borderRadius: 18, backgroundColor: '#080706', padding: 14, gap: 8 }}>
          <SectionTitle title="Current bundle" subtitle="Choose a skin pack, choose an icon pack, then publish the combined bundle to app market or assign it to compatible plugins." />
          <Text style={{ color: colors.text, fontSize: 14, fontWeight: '900' }}>{selectedSkin?.name || 'No skin selected'} + {selectedIconPack?.name || 'No icon pack selected'}</Text>
          <Text style={{ color: compatible ? colors.green : colors.goldLight, fontSize: 11, fontWeight: '900' }}>
            {compatible ? 'Compatible bundle ready for preview.' : 'Choose a compatible icon pack for this skin type.'}
          </Text>
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle title="1. Choose skin" subtitle="Skins control the machine, card, cabinet, frame, lights, reveal surfaces, and theme." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {mxGameSkinPacks.map((pack) => (
              <SkinPackCard key={pack.id} pack={pack} selected={pack.id === selectedSkinId} onPress={() => setSelectedSkinId(pack.id)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle title="2. Choose icons" subtitle="Icon packs load the actual reel symbols, scratch reveals, wheel segments, rewards, and results." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {mxGameIconPacks.map((pack) => (
              <IconPackCard key={pack.id} pack={pack} selected={pack.id === selectedIconPackId} onPress={() => setSelectedIconPackId(pack.id)} />
            ))}
          </View>
        </View>

        <View style={{ gap: 10 }}>
          <SectionTitle title="3. Demo bundles" subtitle="Prebuilt examples of mix-and-match game assets for fast testing." />
          {mxDemoGameVisualBundles.map((bundle) => <BundleCard key={bundle.id} bundle={bundle} />)}
        </View>

        <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: colors.panelSoft, padding: 14, gap: 10 }}>
          <SectionTitle title="Animated categories" subtitle="Platform-specific animated icon categories for future import, generation, and marketplace browsing." />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7 }}>
            {mxAnimatedIconCategories.map((category) => <Chip key={category} label={category} />)}
          </View>
        </View>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          <Pressable accessibilityRole="button" style={{ flexGrow: 1, flexBasis: 180, borderRadius: 16, backgroundColor: colors.gold, paddingVertical: 13, alignItems: 'center' }}>
            <Text style={{ color: '#050505', fontSize: 13, fontWeight: '900' }}>Preview Bundle</Text>
          </Pressable>
          <Pressable accessibilityRole="button" style={{ flexGrow: 1, flexBasis: 180, borderRadius: 16, backgroundColor: colors.purple, paddingVertical: 13, alignItems: 'center' }}>
            <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '900' }}>Publish to Market</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}
