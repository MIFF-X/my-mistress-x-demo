import React, { useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

const LISTING_MODES = [
  { id: 'sell_now', label: 'Sell', desc: 'Fixed-price digital asset listing.' },
  { id: 'auction', label: 'Auction', desc: 'Reserve price, live bids, and close timer.' },
  { id: 'raffle', label: 'Raffle', desc: 'Entry price, winner count, and draw status.' },
  { id: 'swap_offer', label: 'Swap', desc: 'Supporters can trade or make offers.' },
  { id: 'reward_win', label: 'Win', desc: 'Attach assets to games, streaks, or rewards.' },
];

const ASSET_TYPES = [
  'Sticker',
  'Sticker Set',
  'Animated Sticker',
  'Badge',
  'Profile Card',
  'Video Collectible',
  'Content Pass',
  'Trophy',
];

const DEMO_ASSETS = [
  {
    id: 'golden-era-drop',
    title: 'Golden Era Sticker Set',
    creator: 'Mistress Aurora',
    type: 'Sticker Set',
    supply: '42 / 100 minted',
    mode: 'Sell + Raffle + Swap',
    price: '350 credits',
    value: 'Limited monthly set; vault collectible; resale-ready metadata.',
  },
  {
    id: 'content-pass',
    title: 'Creator Content Pass',
    creator: 'Mistress-X Monetize Content',
    type: 'Content Pass',
    supply: '8 / 50 minted',
    mode: 'Sell + Auction + Raffle + Win',
    price: '999 credits',
    value: 'Digital pass for future vault/content unlocks and rewards.',
  },
  {
    id: 'matching-item',
    title: 'Matching Catalogue Asset',
    creator: 'Collector System',
    type: 'Catalogue Match',
    supply: '1 / 1 minted',
    mode: 'Win + Auction + Swap',
    price: 'Reward unlock',
    value: 'One-of-one digital asset linked to a matching marketplace purchase.',
  },
];

export default function MxNftMarketplaceScreen() {
  const [mode, setMode] = useState('sell_now');
  const selectedMode = useMemo(() => LISTING_MODES.find((item) => item.id === mode) ?? LISTING_MODES[0], [mode]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>MONETIZE CONTENT</Text>
        <Text style={s.title}>MX NFT MARKETPLACE</Text>
        <Text style={s.lede}>
          Turn stickers, sticker sets, badges, profile cards, content passes, video collectibles, trophies, and matching catalogue rewards into digital assets that can be bought, sold, swapped, auctioned, raffled, or won.
        </Text>
        <View style={s.platformRow}>
          {['iPhone', 'Android', 'Web', 'Tablet', 'Desktop'].map((item) => (
            <Text key={item} style={s.platformPill}>{item}</Text>
          ))}
        </View>
      </View>

      <Text style={s.sectionTitle}>Creator setup</Text>
      <View style={s.modeGrid}>
        {LISTING_MODES.map((item) => (
          <TouchableOpacity key={item.id} style={[s.modeCard, mode === item.id && s.modeActive]} onPress={() => setMode(item.id)}>
            <Text style={s.modeTitle}>{item.label}</Text>
            <Text style={s.modeDesc}>{item.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.panel}>
        <Text style={s.panelTitle}>Current setup: {selectedMode.label}</Text>
        <Text style={s.panelText}>Creator chooses asset type, uploads/selects content, sets supply, price/reserve/entry rules, enables resale or swap, previews metadata, then publishes to the marketplace.</Text>
      </View>

      <Text style={s.sectionTitle}>Asset types</Text>
      <View style={s.assetTypeWrap}>
        {ASSET_TYPES.map((type) => (
          <Text key={type} style={s.assetType}>{type}</Text>
        ))}
      </View>

      <Text style={s.sectionTitle}>Marketplace actions</Text>
      <View style={s.actionRow}>
        {['Buy', 'Sell', 'Swap', 'Win', 'Bid', 'Enter Raffle', 'Make Offer'].map((action) => (
          <Text key={action} style={s.actionPill}>{action}</Text>
        ))}
      </View>

      <Text style={s.sectionTitle}>Live demo listings</Text>
      {DEMO_ASSETS.map((asset) => (
        <View key={asset.id} style={s.assetCard}>
          <View style={s.assetHeader}>
            <View style={{ flex: 1 }}>
              <Text style={s.assetTitle}>{asset.title}</Text>
              <Text style={s.assetCreator}>{asset.creator}</Text>
            </View>
            <Text style={s.assetPrice}>{asset.price}</Text>
          </View>
          <Text style={s.assetMeta}>{asset.type} • {asset.supply}</Text>
          <Text style={s.assetMeta}>Mode: {asset.mode}</Text>
          <Text style={s.assetValue}>Digital value: {asset.value}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' },
  inner: { padding: 20, paddingBottom: 48 },
  hero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', backgroundColor: 'rgba(212,175,55,0.07)', marginBottom: 20 },
  kicker: { color: '#d4af37', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  title: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  lede: { color: '#c9a8d4', fontSize: 13, lineHeight: 19 },
  platformRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  platformPill: { color: '#0d0618', backgroundColor: '#d4af37', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 10, fontWeight: '900' },
  sectionTitle: { color: '#d4af37', fontSize: 15, fontWeight: '900', letterSpacing: 2, marginTop: 18, marginBottom: 10 },
  modeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  modeCard: { width: '47%', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', padding: 13, backgroundColor: 'rgba(255,255,255,0.03)' },
  modeActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.1)' },
  modeTitle: { color: '#fff', fontSize: 14, fontWeight: '900', marginBottom: 4 },
  modeDesc: { color: '#c9a8d4', fontSize: 11, lineHeight: 15 },
  panel: { borderRadius: 14, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, marginTop: 14 },
  panelTitle: { color: '#fff', fontSize: 14, fontWeight: '900', marginBottom: 5 },
  panelText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  assetTypeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  assetType: { color: '#d4af37', borderColor: 'rgba(212,175,55,0.25)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: '800' },
  actionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  actionPill: { color: '#fff', backgroundColor: 'rgba(255,63,127,0.18)', borderColor: 'rgba(255,63,127,0.32)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, fontSize: 11, fontWeight: '900' },
  assetCard: { borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14, marginBottom: 10 },
  assetHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  assetTitle: { color: '#fff', fontSize: 14, fontWeight: '900' },
  assetCreator: { color: '#c9a8d4', fontSize: 11, marginTop: 2 },
  assetPrice: { color: '#d4af37', fontSize: 12, fontWeight: '900' },
  assetMeta: { color: '#c9a8d4', fontSize: 12, marginBottom: 4 },
  assetValue: { color: '#d4af37', fontSize: 12, lineHeight: 17, marginTop: 3 },
});
