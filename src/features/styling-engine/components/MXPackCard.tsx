import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { StylingEnginePackCard } from '../assetPackTypes';

const palette = {
  background: '#0e0c07',
  panel: '#141008',
  border: '#2a2208',
  borderActive: '#c8a84b',
  gold: '#c8a84b',
  goldLight: '#f0d060',
  goldDark: '#7a6230',
  red: '#8b1a1a',
  green: '#4a9a4a',
  text: '#f1dfad',
  muted: '#6a5820',
};

const tierColors: Record<string, { border: string; text: string; background: string }> = {
  free: { border: '#2a6a2a', text: '#4a9a4a', background: 'rgba(10,60,10,0.5)' },
  paid: { border: '#5a3a08', text: palette.gold, background: 'rgba(60,40,0,0.5)' },
  premium: { border: '#6a106a', text: '#c84bc8', background: 'rgba(80,20,80,0.5)' },
  custom: { border: '#6a1a1a', text: '#c84b4b', background: 'rgba(60,10,10,0.5)' },
  subscription: { border: '#375a7a', text: '#82c7ff', background: 'rgba(20,40,70,0.5)' },
};

type MXPackCardProps = {
  pack: StylingEnginePackCard;
  selected?: boolean;
  onPress?: () => void;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
};

function categoryGlyph(category: string) {
  if (category.includes('icon')) return '✦';
  if (category.includes('seal')) return 'MX';
  if (category.includes('stamp')) return '✓';
  if (category.includes('award')) return '♛';
  if (category.includes('certificate')) return '◇';
  if (category.includes('contract')) return '§';
  if (category.includes('font')) return 'Aa';
  if (category.includes('gift')) return '◆';
  return 'MX';
}

export function MXPackCard({ pack, selected = false, onPress, onPrimaryAction, onSecondaryAction }: MXPackCardProps) {
  const tier = tierColors[pack.tier] || tierColors.paid;
  const glyph = categoryGlyph(pack.category);

  return (
    <View
      style={{
        backgroundColor: palette.background,
        borderColor: selected ? palette.borderActive : palette.border,
        borderWidth: 1,
        borderRadius: 12,
        overflow: 'hidden',
        flexGrow: 1,
        flexBasis: 180,
        maxWidth: 360,
      }}
    >
      <Pressable accessibilityRole="button" onPress={onPress} style={{ minHeight: 224 }}>
        <View style={{ minHeight: 92, alignItems: 'center', justifyContent: 'center', borderBottomColor: '#1a1608', borderBottomWidth: 1, backgroundColor: palette.panel }}>
          <View style={{ width: 58, height: 58, borderRadius: 18, borderColor: palette.goldDark, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#080806' }}>
            <Text style={{ color: palette.gold, fontSize: glyph.length > 2 ? 16 : 22, fontWeight: '900' }}>{glyph}</Text>
          </View>
          <View style={{ position: 'absolute', top: 8, right: 8, borderColor: tier.border, borderWidth: 1, borderRadius: 4, backgroundColor: tier.background, paddingVertical: 3, paddingHorizontal: 7 }}>
            <Text style={{ color: tier.text, fontSize: 8, fontWeight: '900', textTransform: 'uppercase' }}>{pack.tier}</Text>
          </View>
        </View>

        <View style={{ padding: 12, gap: 6 }}>
          <Text style={{ color: palette.muted, fontSize: 9, letterSpacing: 1.5, textTransform: 'uppercase' }}>{pack.category.replace('-', ' ')}</Text>
          <Text style={{ color: palette.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1 }}>{pack.title}</Text>
          <Text style={{ color: palette.muted, fontSize: 11, lineHeight: 16 }}>{pack.description}</Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginTop: 4 }}>
            <Text style={{ color: palette.goldDark, fontSize: 10, fontWeight: '800' }}>{pack.assetCountLabel}</Text>
            <Text style={{ color: pack.priceLabel === 'Free' ? palette.green : palette.goldLight, fontSize: 12, fontWeight: '900' }}>{pack.priceLabel}</Text>
          </View>
        </View>
      </Pressable>

      <View style={{ paddingHorizontal: 12, paddingBottom: 12, gap: 8 }}>
        <Pressable accessibilityRole="button" onPress={onPrimaryAction || onPress} style={{ backgroundColor: pack.tier === 'free' ? '#12100c' : palette.gold, borderColor: pack.tier === 'free' ? palette.goldDark : palette.gold, borderWidth: 1, borderRadius: 8, paddingVertical: 9 }}>
          <Text style={{ color: pack.tier === 'free' ? palette.gold : '#080806', fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 1.4 }}>{pack.ctaLabel}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" onPress={onSecondaryAction || onPress} style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 8, paddingVertical: 8 }}>
          <Text style={{ color: palette.gold, fontSize: 10, fontWeight: '900', textAlign: 'center', letterSpacing: 1.2 }}>Preview Pack</Text>
        </Pressable>
      </View>
    </View>
  );
}

export default MXPackCard;
