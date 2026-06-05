import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';

export default function LiveShowsScreen() {
  const [tab, setTab] = useState('upcoming');
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', ticketPriceCents: '', scheduledAt: '' });

  useEffect(() => { loadShows(); }, [tab]);

  async function loadShows() {
    setLoading(true);
    const url = tab === 'mine' ? '/api/live-shows/mine' : '/api/live-shows?status=SCHEDULED';
    const data = await fetch(url).then(r => r.json()).catch(() => ({ items: [] }));
    setShows(data.items ?? []);
    setLoading(false);
  }

  async function createShow() {
    await fetch('/api/live-shows', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, ticketPriceCents: Number(form.ticketPriceCents) || 0 }) });
    Alert.alert('✦ Show created!'); loadShows();
  }

  async function startShow(id) {
    await fetch(`/api/live-shows/${id}/start`, { method: 'POST' });
    Alert.alert('🎥 Show is LIVE!'); loadShows();
  }

  async function buyTicket(id) {
    await fetch(`/api/live-shows/${id}/ticket`, { method: 'POST' });
    Alert.alert('🎟 Ticket purchased!');
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>LIVE SHOWS</Text>
      <View style={s.tabs}>
        {['upcoming', 'mine', 'create'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' && (
        <View>
          <TextInput style={s.input} value={form.title} onChangeText={v => setForm(f => ({...f, title: v}))} placeholder="Show title..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.ticketPriceCents} onChangeText={v => setForm(f => ({...f, ticketPriceCents: v}))} placeholder="Ticket price (cents)..." keyboardType="numeric" placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.scheduledAt} onChangeText={v => setForm(f => ({...f, scheduledAt: v}))} placeholder="Scheduled at (ISO date)..." placeholderTextColor="#4a3060" />
          <TouchableOpacity style={s.btn} onPress={createShow}><Text style={s.btnText}>✦ Schedule Show</Text></TouchableOpacity>
        </View>
      )}

      {loading && tab !== 'create' ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : shows.map(show => (
        <View key={show.id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{show.title}</Text>
            <View style={[s.badge, { backgroundColor: show.status === 'LIVE' ? '#22c55e' : 'rgba(212,175,55,0.2)' }]}>
              <Text style={s.badgeText}>{show.status}</Text>
            </View>
          </View>
          {show.ticketPriceCents > 0 && <Text style={s.cardMeta}>🎟 ${(show.ticketPriceCents / 100).toFixed(2)}</Text>}
          {show.scheduledAt && <Text style={s.cardMeta}>📅 {new Date(show.scheduledAt).toLocaleString()}</Text>}
          <View style={s.actions}>
            {tab === 'mine' && show.status === 'SCHEDULED' && <TouchableOpacity style={s.actionBtn} onPress={() => startShow(show.id)}><Text style={s.actionText}>▶ Go Live</Text></TouchableOpacity>}
            {tab === 'upcoming' && <TouchableOpacity style={s.actionBtn} onPress={() => buyTicket(show.id)}><Text style={s.actionText}>🎟 Buy Ticket</Text></TouchableOpacity>}
          </View>
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
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 }, badgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardMeta: { color: '#c9a8d4', fontSize: 11, marginBottom: 4 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 8 },
  actionBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8, backgroundColor: '#ff3f7f' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
