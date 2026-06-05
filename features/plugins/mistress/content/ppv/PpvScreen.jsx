import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';

const ACCESS_TYPES = ['TIMED', 'BUY_TO_KEEP', 'SUBSCRIPTION_INCLUDED'];

export default function PpvScreen({ role = 'mistress' }) {
  const [tab, setTab] = useState(role === 'mistress' ? 'manage' : 'browse');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', priceCents: '', accessType: 'BUY_TO_KEEP', mediaUrl: '' });

  useEffect(() => { loadItems(); }, [tab]);

  async function loadItems() {
    setLoading(true);
    try {
      const url = tab === 'manage' ? '/api/ppv/my-content' : '/api/ppv';
      const data = await fetch(url).then(r => r.json());
      setItems(data.items ?? []);
    } catch {} finally { setLoading(false); }
  }

  async function createItem() {
    if (!form.title || !form.priceCents) { Alert.alert('Title and price are required.'); return; }
    await fetch('/api/ppv', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, priceCents: Number(form.priceCents) }) });
    Alert.alert('✦ Content submitted for review.');
    loadItems();
  }

  async function unlockItem(id) {
    await fetch(`/api/ppv/${id}/unlock`, { method: 'POST' });
    Alert.alert('✦ Unlocked!');
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>PPV CONTENT</Text>
      <View style={s.tabs}>
        {(role === 'mistress' ? ['manage', 'browse', 'unlocks'] : ['browse', 'unlocks']).map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'manage' && (
        <View style={s.section}>
          <Text style={s.sectionTitle}>Upload Content</Text>
          <TextInput style={s.input} value={form.title} onChangeText={v => setForm(f => ({...f, title: v}))} placeholder="Title..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.mediaUrl} onChangeText={v => setForm(f => ({...f, mediaUrl: v}))} placeholder="Media URL..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.priceCents} onChangeText={v => setForm(f => ({...f, priceCents: v}))} placeholder="Price (cents)..." keyboardType="numeric" placeholderTextColor="#4a3060" />
          <View style={s.chipRow}>
            {ACCESS_TYPES.map(t => (
              <TouchableOpacity key={t} style={[s.chip, form.accessType === t && s.chipActive]} onPress={() => setForm(f => ({...f, accessType: t}))}>
                <Text style={[s.chipText, form.accessType === t && s.chipTextActive]}>{t.replace(/_/g,' ')}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={createItem}><Text style={s.btnText}>✦ Submit for Review</Text></TouchableOpacity>
        </View>
      )}

      {loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : items.map(item => (
        <View key={item.id} style={s.card}>
          <Text style={s.cardTitle}>{item.title}</Text>
          <Text style={s.cardMeta}>${(item.priceCents / 100).toFixed(2)} · {item.accessType} · {item.status}</Text>
          {tab === 'browse' && <TouchableOpacity style={s.unlockBtn} onPress={() => unlockItem(item.id)}><Text style={s.unlockText}>🔓 Unlock</Text></TouchableOpacity>}
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11, letterSpacing: 1 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  section: { marginBottom: 24 }, sectionTitle: { color: '#c9a8d4', fontSize: 13, marginBottom: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 14, marginBottom: 10 },
  chipRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 14 },
  chip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  chipActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  chipText: { color: '#c9a8d4', fontSize: 11 }, chipTextActive: { color: '#d4af37' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center' },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 4 },
  cardMeta: { color: '#c9a8d4', fontSize: 11 },
  unlockBtn: { marginTop: 10, padding: 10, borderRadius: 8, backgroundColor: '#ff3f7f', alignItems: 'center' },
  unlockText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
