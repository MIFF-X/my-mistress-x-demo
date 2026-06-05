import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { demoGeneralIconsManifest, manifestToPackCard } from './packManifest';
import type { AssetPackManifest } from './assetPackTypes';

type PackPreviewScreenProps = {
  manifest?: AssetPackManifest;
  onAddToCart?: (packId: string) => void;
  onBuyNow?: (packId: string) => void;
};

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
};

function EngineChip({ label }: { label: string }) {
  return (
    <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6, backgroundColor: '#0b0906' }}>
      <Text style={{ color: colors.goldLight, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}

export function PackPreviewScreen({ manifest = demoGeneralIconsManifest, onAddToCart, onBuyNow }: PackPreviewScreenProps) {
  const [expanded, setExpanded] = useState(true);
  const card = useMemo(() => manifestToPackCard(manifest), [manifest]);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: 16, gap: 14 }}>
      <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 24, backgroundColor: colors.panel, padding: 18, gap: 16 }}>
        <View style={{ alignItems: 'center', gap: 6 }}>
          <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase' }}>Mistress-X Styling Engine</Text>
          <Text style={{ color: colors.goldLight, fontSize: 28, fontWeight: '900', textAlign: 'center', textTransform: 'uppercase' }}>{card.title}</Text>
          <Text style={{ color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18 }}>{card.description}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          onPress={() => setExpanded((value) => !value)}
          style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: '#0b0906', padding: 15, gap: 14 }}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <View style={{ flex: 1, minWidth: 220, gap: 8 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <EngineChip label={card.badge || card.tier} />
                <EngineChip label={card.category.replace('-', ' ')} />
                <EngineChip label={card.qualityMode.replace('-', ' ')} />
              </View>
              <Text style={{ color: colors.text, fontSize: 21, fontWeight: '900' }}>{card.title}</Text>
              <Text style={{ color: colors.muted, fontSize: 12 }}>{card.assetCountLabel} · {card.priceLabel}</Text>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, flex: 1, minWidth: 220 }}>
              {card.previewItems.map((item) => (
                <View key={item} style={{ flexBasis: '30%', flexGrow: 1, borderColor: colors.border, borderWidth: 1, borderRadius: 12, backgroundColor: '#050505', padding: 9 }}>
                  <Text style={{ color: colors.goldLight, fontSize: 10, textAlign: 'center', fontWeight: '800' }}>{item}</Text>
                </View>
              ))}
            </View>
          </View>
        </Pressable>

        {expanded ? (
          <View style={{ borderColor: colors.border, borderWidth: 1, borderRadius: 18, backgroundColor: '#070604', padding: 15, gap: 15 }}>
            <View style={{ gap: 10 }}>
              <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '900', letterSpacing: 2, textTransform: 'uppercase' }}>What is included</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {card.included.map((item) => (
                  <View key={item} style={{ flexGrow: 1, flexBasis: 210, borderColor: '#221908', borderWidth: 1, borderRadius: 12, backgroundColor: colors.panelSoft, padding: 11 }}>
                    <Text style={{ color: '#d8cfb7', fontSize: 12 }}>✦ {item}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View style={{ borderColor: colors.goldDark, borderWidth: 1, borderRadius: 16, backgroundColor: '#100c05', padding: 14, gap: 11 }}>
              <Text style={{ color: colors.muted, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>Digital package card</Text>
              <Text style={{ color: colors.goldLight, fontSize: 26, fontWeight: '900' }}>{card.priceLabel}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                <Pressable accessibilityRole="button" onPress={() => onAddToCart?.(card.id)} style={{ flexGrow: 1, flexBasis: 160, borderRadius: 12, backgroundColor: colors.gold, padding: 12 }}>
                  <Text style={{ color: '#000', textAlign: 'center', fontWeight: '900' }}>{card.ctaLabel}</Text>
                </Pressable>
                <Pressable accessibilityRole="button" onPress={() => onBuyNow?.(card.id)} style={{ flexGrow: 1, flexBasis: 160, borderColor: colors.goldDark, borderWidth: 1, borderRadius: 12, padding: 12 }}>
                  <Text style={{ color: colors.goldLight, textAlign: 'center', fontWeight: '900' }}>Buy Now</Text>
                </Pressable>
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </ScrollView>
  );
}

export default PackPreviewScreen;
