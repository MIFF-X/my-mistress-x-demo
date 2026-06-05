import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { StickerMarketplacePurchasePanel } from './StickerMarketplacePurchasePanel';

export function StickerMarketplacePurchaseScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 6 }}>Sticker Marketplace</Text>
      <Text style={{ color: '#aaa', marginBottom: 14 }}>
        Purchase single stickers, sticker packs, limited drops, and bundle-linked collectibles.
      </Text>
      <StickerMarketplacePurchasePanel />
      <View style={{ height: 24 }} />
    </ScrollView>
  );
}
