import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { buildStickerPurchaseSummary, starterStickerCollectorProgress, starterStickerPurchaseItems } from './stickerPurchaseMockData';
import type { StickerCollectorProgress, StickerPurchaseItem, StickerPurchaseStatus, StickerRarity } from './stickerPurchaseTypes';

function panelStyle(borderColor = '#333') {
  return {
    backgroundColor: '#111',
    borderColor,
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
  } as const;
}

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function statusTone(status: StickerPurchaseStatus) {
  if (status === 'owned') return '#1D9E75';
  if (status === 'available') return '#d4af37';
  if (status === 'limited-drop') return '#ff9abf';
  if (status === 'sold-out') return '#ff6b6b';
  return '#777';
}

function rarityTone(rarity: StickerRarity) {
  if (rarity === 'legendary') return '#f59e0b';
  if (rarity === 'limited') return '#d4af37';
  if (rarity === 'premium') return '#ff9abf';
  if (rarity === 'rare') return '#60a5fa';
  return '#777';
}

function Chip({ label, tone }: { label: string; tone: string }) {
  return (
    <View style={{ borderColor: tone, borderWidth: 1, borderRadius: 999, paddingVertical: 5, paddingHorizontal: 9, backgroundColor: `${tone}18`, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ color: tone, fontSize: 10, fontWeight: '900' }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flexGrow: 1, flexBasis: 130, maxWidth: 220 }}>
      <Text style={smallText('#aaa')}>{label}</Text>
      <Text style={{ color: tone, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function StickerCard({ item, onBuy }: { item: StickerPurchaseItem; onBuy: () => void }) {
  const remaining = item.totalSupply ? Math.max(item.totalSupply - Number(item.soldCount || 0), 0) : null;
  const soldOut = item.status === 'sold-out' || remaining === 0;
  const owned = item.owned || item.status === 'owned';
  const tone = owned ? '#1D9E75' : soldOut ? '#ff6b6b' : statusTone(item.status);

  return (
    <View style={{ ...panelStyle(tone), flexGrow: 1, flexBasis: 230, maxWidth: 380 }}>
      <Text style={{ fontSize: 32 }}>{item.previewLabel}</Text>
      <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 6 }}>{item.name}</Text>
      <Text style={{ color: '#ff9abf', marginTop: 4 }}>{item.subtitle}</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>{item.description}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
        <Chip label={owned ? 'owned' : soldOut ? 'sold out' : item.status} tone={tone} />
        <Chip label={item.kind.replace(/-/g, ' ')} tone="#d4af37" />
        <Chip label={item.rarity} tone={rarityTone(item.rarity)} />
      </View>
      <Text style={smallText('#d4af37')}>Price: {item.priceCredits} credits</Text>
      {remaining !== null ? <Text style={smallText(remaining <= 20 ? '#ff6b6b' : '#aaa')}>Supply: {remaining}/{item.totalSupply} left · Sold: {item.soldCount || 0}</Text> : null}
      {item.linkedBundleId ? <Text style={smallText('#60a5fa')}>Bundle link: {item.linkedBundleId}</Text> : null}
      {item.linkedGiftId ? <Text style={smallText('#60a5fa')}>Gift link: {item.linkedGiftId}</Text> : null}
      <Pressable disabled={owned || soldOut || item.status === 'locked'} onPress={onBuy} style={{ backgroundColor: owned || soldOut ? '#333' : tone, opacity: owned || soldOut || item.status === 'locked' ? 0.65 : 1, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginTop: 10, alignSelf: 'flex-start' }}>
        <Text style={{ color: owned || soldOut ? '#aaa' : '#000', fontWeight: '900', fontSize: 11 }}>{owned ? 'Owned' : soldOut ? 'Sold Out' : 'Buy Sticker'}</Text>
      </Pressable>
    </View>
  );
}

function ProgressCard({ progress }: { progress: StickerCollectorProgress }) {
  const percent = progress.totalCount ? Math.round((progress.ownedCount / progress.totalCount) * 100) : 0;

  return (
    <View style={{ ...panelStyle('#60a5fa'), flexGrow: 1, flexBasis: 220, maxWidth: 360 }}>
      <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{progress.collectionName}</Text>
      <Text style={smallText('#aaa')}>{progress.ownedCount}/{progress.totalCount} collected · {percent}%</Text>
      <View style={{ backgroundColor: '#222', borderRadius: 999, height: 8, marginTop: 8, overflow: 'hidden' }}>
        <View style={{ backgroundColor: '#60a5fa', width: `${percent}%`, height: 8 }} />
      </View>
      <Text style={smallText('#d4af37')}>{progress.nextRewardLabel}</Text>
    </View>
  );
}

export function StickerMarketplacePurchasePanel() {
  const [items, setItems] = useState(starterStickerPurchaseItems);
  const summary = useMemo(() => buildStickerPurchaseSummary(items, starterStickerCollectorProgress), [items]);

  function buyItem(itemId: string) {
    setItems((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      return { ...item, owned: true, status: 'owned' as const, soldCount: Number(item.soldCount || 0) + 1 };
    }));
  }

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Sticker Marketplace Purchase UX</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>
        Preview purchase states, pack cards, limited drops, ownership, and collector progress.
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <MetricCard label="Items" value={summary.totalItems} tone="#ff9abf" />
        <MetricCard label="Owned" value={summary.ownedItems} tone="#1D9E75" />
        <MetricCard label="Available" value={summary.availableItems} tone="#d4af37" />
        <MetricCard label="Progress" value={`${summary.totalCollectionProgress}%`} tone="#60a5fa" />
      </View>

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8, marginBottom: 8 }}>Collector progress</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {starterStickerCollectorProgress.map((progress) => <ProgressCard key={progress.collectionId} progress={progress} />)}
      </View>

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8, marginBottom: 8 }}>Marketplace items</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item) => <StickerCard key={item.id} item={item} onBuy={() => buyItem(item.id)} />)}
      </View>
    </View>
  );
}
