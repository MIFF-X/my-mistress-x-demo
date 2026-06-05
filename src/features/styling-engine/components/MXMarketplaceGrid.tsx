import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import type { AssetPackManifest, StylingEngineCartAction } from '../assetPackTypes';
import { resolvePackCollection } from '../assetManifestResolver';
import { manifestToPackCard } from '../packManifest';
import { MXPackCard } from './MXPackCard';

type MXMarketplaceGridProps = {
  manifests: AssetPackManifest[];
  selectedPackId?: string;
  emptyLabel?: string;
  onSelectPack?: (packId: string) => void;
  onCartAction?: (action: StylingEngineCartAction) => void;
};

const palette = {
  gold: '#c8a84b',
  goldLight: '#f0d060',
  muted: '#6a5820',
  border: '#2a2208',
  panel: '#0e0c07',
};

export function MXMarketplaceGrid({ manifests, selectedPackId, emptyLabel = 'No packs match this filter yet.', onSelectPack, onCartAction }: MXMarketplaceGridProps) {
  const resolvedPacks = useMemo(() => resolvePackCollection(manifests), [manifests]);
  const cards = useMemo(() => resolvedPacks.map((manifest) => ({ manifest, card: manifestToPackCard(manifest), firstAsset: manifest.resolvedAssets[0] })), [resolvedPacks]);

  if (cards.length === 0) {
    return (
      <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 14, backgroundColor: palette.panel, padding: 16 }}>
        <Text style={{ color: palette.goldLight, fontSize: 16, fontWeight: '900' }}>{emptyLabel}</Text>
        <Text style={{ color: palette.muted, fontSize: 12, marginTop: 6 }}>Switch family or tier filters to reveal matching Styling Engine packs.</Text>
      </View>
    );
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <Text style={{ color: palette.gold, fontSize: 13, fontWeight: '900', letterSpacing: 1.5, textTransform: 'uppercase' }}>Marketplace Packs</Text>
        <Text style={{ color: palette.muted, fontSize: 12, fontWeight: '800' }}>{cards.length} visible</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
        {cards.map(({ manifest, card, firstAsset }) => (
          <View key={manifest.id} style={{ flexGrow: 1, flexBasis: 180, maxWidth: 360, gap: 7 }}>
            <MXPackCard
              pack={card}
              selected={selectedPackId === manifest.id}
              onPress={() => onSelectPack?.(manifest.id)}
              onPrimaryAction={() => onCartAction?.({ packId: manifest.id, action: card.tier === 'free' ? 'download-free' : 'add-to-cart', requestedAt: new Date().toISOString() })}
              onSecondaryAction={() => onSelectPack?.(manifest.id)}
            />
            {firstAsset ? (
              <View style={{ borderColor: palette.border, borderWidth: 1, borderRadius: 8, backgroundColor: '#080806', padding: 8, gap: 3 }}>
                <Text style={{ color: palette.goldLight, fontSize: 9, fontWeight: '900' }}>Asset path resolver</Text>
                <Text numberOfLines={1} style={{ color: palette.muted, fontSize: 8 }}>Astro: {firstAsset.astroIconName}</Text>
                <Text numberOfLines={1} style={{ color: palette.muted, fontSize: 8 }}>Web: {firstAsset.webIconPath}</Text>
              </View>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export default MXMarketplaceGrid;
