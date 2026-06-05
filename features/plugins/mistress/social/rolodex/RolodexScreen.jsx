import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

export default function RolodexScreen() {
  const [tab, setTab] = useState('cards');
  const [cards, setCards] = useState([]);
  const [form, setForm] = useState({ displayName: '', tags: '', privateNotes: '', colorTheme: '#8b1e5a', isKeeper: false });

  useEffect(() => { load(); }, []);

  async function load() {
    const data = await fetch('/api/rolodex').then(r => r.json()).catch(() => ({ items: [] }));
    setCards(data.items ?? []);
  }

  async function createCard() {
    if (!form.displayName) { Alert.alert('Display name required.'); return; }
    await fetch('/api/rolodex', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) }) });
    Alert.alert('✦ Card created!'); load(); setTab('cards');
  }

  async function deleteCard(id) {
    Alert.alert('Delete Card?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => { await fetch(`/api/rolodex/${id}`, { method: 'DELETE' }); load(); } },
    ]);
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>ROLODEX</Text>
      <Text style={s.sub}>Your Sub contact cards</Text>
      <View style={s.tabs}>
        {['cards', 'add'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'add' ? '+ New Card' : 'My Cards'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'add' && (
        <View>
          <TextInput style={s.input} value={form.displayName} onChangeText={v => setForm(f => ({...f, displayName: v}))} placeholder="Display name..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.tags} onChangeText={v => setForm(f => ({...f, tags: v}))} placeholder="Tags (comma separated)..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.privateNotes} onChangeText={v => setForm(f => ({...f, privateNotes: v}))} placeholder="Private notes..." placeholderTextColor="#4a3060" multiline />
          <TouchableOpacity style={[s.keeperToggle, form.isKeeper && s.keeperActive]} onPress={() => setForm(f => ({...f, isKeeper: !f.isKeeper}))}>
            <Text style={[s.keeperText, form.isKeeper && s.keeperTextActive]}>{form.isKeeper ? '♦ Keeper Card' : '◇ Mark as Keeper'}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.btn} onPress={createCard}><Text style={s.btnText}>✦ Create Card</Text></TouchableOpacity>
        </View>
      )}

      {tab === 'cards' && (
        <View>
          {cards.length === 0 && <Text style={s.empty}>No cards yet. Add your first sub.</Text>}
          {cards.map(card => (
            <View key={card.id} style={[s.card, { borderLeftColor: card.colorTheme ?? '#8b1e5a' }]}>
              <View style={s.cardHeader}>
                <Text style={s.cardName}>{card.displayName}</Text>
                {card.isKeeper && <Text style={s.keeperBadge}>♦ KEEPER</Text>}
              </View>
              {(card.tags ?? []).length > 0 && (
                <View style={s.tagRow}>
                  {card.tags.map(t => <View key={t} style={s.tag}><Text style={s.tagText}>{t}</Text></View>)}
                </View>
              )}
              {card.privateNotes && <Text style={s.notes} numberOfLines={2}>{card.privateNotes}</Text>}
              <TouchableOpacity onPress={() => deleteCard(card.id)}><Text style={s.deleteText}>Remove</Text></TouchableOpacity>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#d4af37', letterSpacing: 4 }, sub: { color: '#c9a8d4', fontSize: 11, letterSpacing: 1, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 12 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  keeperToggle: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center', marginBottom: 12 },
  keeperActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  keeperText: { color: '#c9a8d4', fontWeight: '600' }, keeperTextActive: { color: '#d4af37' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center' },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', borderLeftWidth: 3, borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardName: { color: '#fff', fontWeight: '700', fontSize: 16 }, keeperBadge: { color: '#d4af37', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8 },
  tag: { backgroundColor: 'rgba(139,30,90,0.3)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, tagText: { color: '#c9a8d4', fontSize: 10 },
  notes: { color: 'rgba(201,168,212,0.6)', fontSize: 12, fontStyle: 'italic', marginBottom: 8 },
  deleteText: { color: '#ff3f7f', fontSize: 11, fontWeight: '600' },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
