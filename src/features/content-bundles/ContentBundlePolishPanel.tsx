import React, { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { buildContentBundleSummary, starterContentBundlePack } from './contentBundleMockData';
import type { ContentBundleAccessStatus, ContentBundleItem } from './contentBundleTypes';

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

function toneForStatus(status: ContentBundleAccessStatus) {
  if (status === 'unlocked' || status === 'included') return '#1D9E75';
  if (status === 'timed-access') return '#d4af37';
  if (status === 'expired') return '#ff6b6b';
  return '#777';
}

function MetricCard({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <View style={{ ...panelStyle(`${tone}66`), flexGrow: 1, flexBasis: 130, maxWidth: 220 }}>
      <Text style={smallText('#aaa')}>{label}</Text>
      <Text style={{ color: tone, fontSize: 22, fontWeight: '900', marginTop: 4 }}>{value}</Text>
    </View>
  );
}

function ContentItemCard({ item, onToggle }: { item: ContentBundleItem; onToggle: () => void }) {
  const tone = toneForStatus(item.accessStatus);

  return (
    <View style={{ ...panelStyle(tone), flexGrow: 1, flexBasis: 230, maxWidth: 380 }}>
      <Text style={{ fontSize: 32 }}>{item.previewLabel}</Text>
      <Text style={{ color: '#fff', fontSize: 17, fontWeight: '900', marginTop: 6 }}>{item.title}</Text>
      <Text style={{ color: '#ff9abf', marginTop: 4 }}>{item.subtitle}</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>{item.description}</Text>
      <Text style={smallText(tone)}>Status: {item.accessStatus}</Text>
      <Text style={smallText('#d4af37')}>Price: {item.priceCredits} credits</Text>
      <Text style={smallText('#60a5fa')}>Kind: {item.kind} · Unlocks: {item.unlockCount}</Text>
      {item.durationMinutes ? <Text style={smallText('#aaa')}>Duration: {item.durationMinutes} min</Text> : null}
      {item.expiresAt ? <Text style={smallText('#aaa')}>Expiry: {item.expiresAt}</Text> : null}
      <Pressable onPress={onToggle} style={{ backgroundColor: tone, borderRadius: 10, paddingVertical: 9, paddingHorizontal: 11, marginTop: 10, alignSelf: 'flex-start' }}>
        <Text style={{ color: '#000', fontWeight: '900', fontSize: 11 }}>Toggle Access</Text>
      </Pressable>
    </View>
  );
}

function ChecklistCard({ complete, total }: { complete: number; total: number }) {
  const ready = complete === total;

  return (
    <View style={panelStyle(ready ? '#1D9E75' : '#d4af37')}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>Readiness checklist</Text>
      <Text style={smallText(ready ? '#1D9E75' : '#d4af37')}>{complete}/{total} complete</Text>
      {starterContentBundlePack.checklist.map((item) => (
        <Text key={item.id} style={smallText(item.complete ? '#1D9E75' : '#d4af37')}>{item.complete ? '✓' : '•'} {item.label}</Text>
      ))}
    </View>
  );
}

export function ContentBundlePolishPanel() {
  const [items, setItems] = useState(starterContentBundlePack.items);
  const pack = { ...starterContentBundlePack, items };
  const summary = useMemo(() => buildContentBundleSummary(pack), [items]);

  function toggleAccess(itemId: string) {
    setItems((current) => current.map((item) => {
      if (item.id !== itemId) return item;
      if (item.accessStatus === 'locked') return { ...item, accessStatus: 'unlocked' as const, unlockCount: item.unlockCount + 1 };
      return { ...item, accessStatus: 'locked' as const };
    }));
  }

  return (
    <View style={panelStyle('#ff0055')}>
      <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>Content Bundle Polish</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>{starterContentBundlePack.subtitle}</Text>

      <View style={{ ...panelStyle('#d4af37'), backgroundColor: '#160f05', marginTop: 12 }}>
        <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>BUNDLE CARD</Text>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginTop: 6 }}>{starterContentBundlePack.title}</Text>
        <Text style={{ color: '#ddd', marginTop: 6 }}>{starterContentBundlePack.description}</Text>
        <Text style={smallText('#d4af37')}>Bundle price: {starterContentBundlePack.priceCredits} credits · Value: {summary.totalBundleValue} credits</Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <MetricCard label="Items" value={summary.totalItems} tone="#ff9abf" />
        <MetricCard label="Locked" value={summary.lockedItems} tone="#777" />
        <MetricCard label="Unlocked" value={summary.unlockedItems} tone="#1D9E75" />
        <MetricCard label="Timed" value={summary.timedAccessItems} tone="#d4af37" />
        <MetricCard label="Unlocks" value={summary.totalUnlocks} tone="#60a5fa" />
      </View>

      <ChecklistCard complete={summary.checklistComplete} total={summary.checklistTotal} />

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8, marginBottom: 8 }}>Bundle items</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {items.map((item) => <ContentItemCard key={item.id} item={item} onToggle={() => toggleAccess(item.id)} />)}
      </View>
    </View>
  );
}
