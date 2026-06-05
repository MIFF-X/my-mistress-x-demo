import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

const RARITIES = ['COMMON', 'RARE', 'PREMIUM', 'LIMITED', 'LEGENDARY'];
const RARITY_COLORS = { COMMON: '#c9a8d4', RARE: '#60a5fa', PREMIUM: '#d4af37', LIMITED: '#ff9f40', LEGENDARY: '#ff3f7f' };

export default function StickersScreen() {
  const [tab, setTab] = useState('collection');
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: '', imageUrl: '', rarity: 'COMMON' });

  useEffect(() => { load(); }, [tab]);

  async function load() {
    const url = tab === 'collection' ? '/api/stickers/collection' : '/api/stickers/packs';
    const data = await fetch(url).then(r => r.json()).catch(() => ({ items: [] }));
    setItems(data.items ?? []);
  }

  async function createSticker() {
    if (!form.name || !form.imageUrl) { Alert.alert('Name and image URL are required.'); return; }
    await fetch('/api/stickers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    Alert.alert('✦ Sticker created!'); load();
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>STICKER COLLECTOR</Text>
      <View style={s.tabs}>
        {['collection', 'packs', 'create'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' && (
        <View>
          <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f => ({...f, name: v}))} placeholder="Sticker name..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.imageUrl} onChangeText={v => setForm(f => ({...f, imageUrl: v}))} placeholder="Image URL..." placeholderTextColor="#4a3060" />
          <View style={s.rarityRow}>
            {RARITIES.map(r => (
              <TouchableOpacity key={r} style={[s.rarityChip, form.rarity === r && { borderColor: RARITY_COLORS[r], backgroundColor: `${RARITY_COLORS[r]}22` }]} onPress={() => setForm(f => ({...f, rarity: r}))}>
                <Text style={[s.rarityText, form.rarity === r && { color: RARITY_COLORS[r] }]}>{r}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={createSticker}><Text style={s.btnText}>✦ Create Sticker</Text></TouchableOpacity>
        </View>
      )}

      <View style={s.grid}>
        {items.map((item, i) => {
          const sticker = item.sticker ?? item;
          const rarity = sticker.rarity ?? 'COMMON';
          return (
            <View key={item.id ?? i} style={[s.stickerCard, { borderColor: RARITY_COLORS[rarity] + '60' }]}>
              <Text style={s.stickerEmoji}>🃏</Text>
              <Text style={s.stickerName} numberOfLines={1}>{sticker.name ?? 'Sticker'}</Text>
              <Text style={[s.rarityLabel, { color: RARITY_COLORS[rarity] }]}>{rarity}</Text>
            </View>
          );
        })}
      </View>
      {items.length === 0 && tab !== 'create' && <Text style={s.empty}>No stickers yet. Check back soon.</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  rarityRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  rarityChip: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(201,168,212,0.3)' },
  rarityText: { color: '#c9a8d4', fontSize: 10, fontWeight: '700' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  stickerCard: { width: '30%', backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderRadius: 12, padding: 12, alignItems: 'center' },
  stickerEmoji: { fontSize: 32, marginBottom: 6 },
  stickerName: { color: '#fff', fontSize: 11, fontWeight: '600', textAlign: 'center', marginBottom: 4 },
  rarityLabel: { fontSize: 9, fontWeight: '700', letterSpacing: 1 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
