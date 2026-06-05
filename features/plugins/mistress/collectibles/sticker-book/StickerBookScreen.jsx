import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Image } from 'react-native';

const RARITY_META = {
  COMMON:    { color: '#c9a8d4', glow: 'rgba(201,168,212,0.15)', label: 'COMMON' },
  RARE:      { color: '#60a5fa', glow: 'rgba(96,165,250,0.2)',   label: 'RARE'   },
  PREMIUM:   { color: '#d4af37', glow: 'rgba(212,175,55,0.25)',  label: 'PREMIUM' },
  LIMITED:   { color: '#ff9f40', glow: 'rgba(255,159,64,0.25)',  label: 'LIMITED' },
  LEGENDARY: { color: '#ff3f7f', glow: 'rgba(255,63,127,0.3)',   label: 'LEGENDARY' },
};

const THEME_ACCENT = {
  STANDARD:  '#d4af37',
  DARK:      '#8b1e5a',
  SEASONAL:  '#22c55e',
  SPECIAL:   '#ff3f7f',
  EXCLUSIVE: '#a78bfa',
};

function ProgressBar({ pct, color }) {
  return (
    <View style={pb.track}>
      <View style={[pb.fill, { width: `${pct}%`, backgroundColor: color }]} />
    </View>
  );
}
const pb = StyleSheet.create({
  track: { height: 4, backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden', marginTop: 6 },
  fill:  { height: 4, borderRadius: 2 },
});

function StickerSlot({ slot }) {
  const r = RARITY_META[slot.rarity] ?? RARITY_META.COMMON;
  if (!slot.collected) {
    return (
      <View style={[s.slot, s.slotLocked, { borderColor: r.color + '30' }]}>
        <Text style={s.slotLockIcon}>🔒</Text>
        <View style={[s.rarityDot, { backgroundColor: r.color + '50' }]} />
      </View>
    );
  }
  return (
    <View style={[s.slot, { borderColor: r.color + '80', backgroundColor: r.glow }]}>
      {slot.imageUrl ? (
        <Image source={{ uri: slot.imageUrl }} style={s.slotImage} resizeMode="cover" />
      ) : (
        <Text style={s.slotEmoji}>🃏</Text>
      )}
      {slot.quantity > 1 && <View style={s.qtyBadge}><Text style={s.qtyText}>×{slot.quantity}</Text></View>}
      <View style={[s.rarityDot, { backgroundColor: r.color }]} />
    </View>
  );
}

function PackSection({ pack }) {
  const [expanded, setExpanded] = useState(true);
  const accent = THEME_ACCENT[pack.theme] ?? THEME_ACCENT.STANDARD;

  return (
    <View style={[s.packCard, { borderColor: accent + '30' }]}>
      <TouchableOpacity style={s.packHeader} onPress={() => setExpanded(e => !e)} activeOpacity={0.8}>
        <View style={{ flex: 1 }}>
          <View style={s.packTitleRow}>
            <Text style={[s.packTitle, { color: accent }]}>{pack.title}</Text>
            {pack.isComplete && <Text style={s.completeBadge}>✦ COMPLETE</Text>}
          </View>
          {pack.description ? <Text style={s.packDesc}>{pack.description}</Text> : null}
          <View style={s.packMeta}>
            <Text style={s.packProgress}>{pack.collectedCount}/{pack.totalSlots} collected</Text>
            <Text style={[s.packPct, { color: accent }]}>{pack.completionPct}%</Text>
          </View>
          <ProgressBar pct={pack.completionPct} color={accent} />
        </View>
        <Text style={[s.chevron, { color: accent }]}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {expanded && (
        <View style={s.slotsGrid}>
          {pack.slots.map(slot => (
            <View key={slot.stickerId} style={s.slotWrap}>
              <StickerSlot slot={slot} />
              <Text style={s.slotTitle} numberOfLines={1}>{slot.collected ? slot.title : '???'}</Text>
            </View>
          ))}
          {pack.slots.length === 0 && (
            <Text style={s.packEmpty}>No stickers in this pack yet.</Text>
          )}
        </View>
      )}
    </View>
  );
}

export default function StickerBookScreen() {
  const [tab, setTab] = useState('book');
  const [book, setBook] = useState(null);
  const [stats, setStats] = useState({ totalOwned: 0, completedPacks: 0, totalPacks: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    try {
      const [b, st] = await Promise.all([
        fetch('/api/sticker-book').then(r => r.json()),
        fetch('/api/sticker-book/stats').then(r => r.json()),
      ]);
      setBook(b);
      setStats(st);
    } catch {}
    setLoading(false);
  }

  return (
    <View style={s.screen}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.title}>✦ STICKER BOOK ✦</Text>
        <Text style={s.sub}>Your personal collection</Text>
      </View>

      {/* Stats strip */}
      <View style={s.statsStrip}>
        <View style={s.statItem}>
          <Text style={s.statNum}>{stats.totalOwned}</Text>
          <Text style={s.statLabel}>OWNED</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{stats.completedPacks}</Text>
          <Text style={s.statLabel}>COMPLETE</Text>
        </View>
        <View style={s.statDivider} />
        <View style={s.statItem}>
          <Text style={s.statNum}>{stats.totalPacks}</Text>
          <Text style={s.statLabel}>PACKS</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={s.tabs}>
        {['book', 'loose'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>
              {t === 'book' ? 'PACKS' : 'LOOSE STICKERS'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color="#d4af37" style={{ marginTop: 40 }} />
      ) : (
        <ScrollView contentContainerStyle={s.inner}>
          {tab === 'book' && (
            <>
              {(book?.packSections ?? []).length === 0 && (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>📖</Text>
                  <Text style={s.emptyText}>No sticker packs available yet.{'\n'}Check back when Mistress releases one.</Text>
                </View>
              )}
              {(book?.packSections ?? []).map(pack => (
                <PackSection key={pack.packId} pack={pack} />
              ))}
            </>
          )}

          {tab === 'loose' && (
            <>
              {(book?.loose ?? []).length === 0 && (
                <View style={s.emptyState}>
                  <Text style={s.emptyIcon}>🃏</Text>
                  <Text style={s.emptyText}>No loose stickers yet.{'\n'}These appear when you receive stickers outside of packs.</Text>
                </View>
              )}
              <View style={s.slotsGrid}>
                {(book?.loose ?? []).map(sticker => (
                  <View key={sticker.stickerId} style={s.slotWrap}>
                    <StickerSlot slot={{ ...sticker, collected: true }} />
                    <Text style={s.slotTitle} numberOfLines={1}>{sticker.title}</Text>
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },

  header: { paddingTop: 24, paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 18, fontWeight: '700', color: '#d4af37', letterSpacing: 4, textAlign: 'center' },
  sub:   { color: 'rgba(201,168,212,0.5)', fontSize: 10, letterSpacing: 3, textAlign: 'center', marginTop: 4 },

  statsStrip: { flexDirection: 'row', backgroundColor: 'rgba(212,175,55,0.06)', borderTopWidth: 1, borderBottomWidth: 1, borderColor: 'rgba(212,175,55,0.1)', paddingVertical: 14 },
  statItem:   { flex: 1, alignItems: 'center' },
  statNum:    { color: '#d4af37', fontSize: 22, fontWeight: '700' },
  statLabel:  { color: 'rgba(201,168,212,0.5)', fontSize: 9, letterSpacing: 2, marginTop: 2 },
  statDivider:{ width: 1, backgroundColor: 'rgba(212,175,55,0.15)' },

  tabs:        { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.1)' },
  tab:         { flex: 1, paddingVertical: 12, alignItems: 'center' },
  tabActive:   { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText:     { color: 'rgba(201,168,212,0.4)', fontSize: 11, letterSpacing: 1 },
  tabTextActive: { color: '#d4af37', fontWeight: '700' },

  inner: { padding: 16, paddingBottom: 80 },

  packCard:   { backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderRadius: 16, padding: 16, marginBottom: 14 },
  packHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  packTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' },
  packTitle:  { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  completeBadge: { fontSize: 9, color: '#d4af37', fontWeight: '700', letterSpacing: 2, borderWidth: 1, borderColor: '#d4af37', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  packDesc:   { color: 'rgba(201,168,212,0.5)', fontSize: 11, marginBottom: 6 },
  packMeta:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  packProgress: { color: 'rgba(201,168,212,0.5)', fontSize: 11 },
  packPct:    { fontSize: 11, fontWeight: '700' },
  chevron:    { fontSize: 12, marginTop: 2, opacity: 0.7 },
  packEmpty:  { color: 'rgba(201,168,212,0.3)', fontSize: 12, paddingVertical: 16, textAlign: 'center' },

  slotsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  slotWrap:   { width: '22%', alignItems: 'center' },
  slot:       { width: '100%', aspectRatio: 1, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  slotLocked: { backgroundColor: 'rgba(255,255,255,0.025)' },
  slotImage:  { width: '100%', height: '100%' },
  slotEmoji:  { fontSize: 28 },
  slotLockIcon: { fontSize: 18, opacity: 0.3 },
  rarityDot:  { position: 'absolute', bottom: 4, right: 4, width: 6, height: 6, borderRadius: 3 },
  qtyBadge:   { position: 'absolute', top: 3, right: 3, backgroundColor: 'rgba(0,0,0,0.7)', borderRadius: 6, paddingHorizontal: 4, paddingVertical: 1 },
  qtyText:    { color: '#fff', fontSize: 8, fontWeight: '700' },
  slotTitle:  { color: 'rgba(201,168,212,0.6)', fontSize: 9, marginTop: 4, textAlign: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:  { fontSize: 44, marginBottom: 14 },
  emptyText:  { color: 'rgba(201,168,212,0.4)', textAlign: 'center', fontSize: 13, lineHeight: 22 },
});
