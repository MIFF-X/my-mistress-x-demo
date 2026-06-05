import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

const STATUS_COLORS = { PENDING: '#d4af37', APPROVED: '#22c55e', DECLINED: '#ff3f7f', COMPLETED: '#c9a8d4' };

export default function BookingsScreen({ role = 'sub' }) {
  const [tab, setTab] = useState('list');
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({ mistressId: '', type: 'VIDEO', durationMinutes: '30', priceCents: '5000', requestedAt: '', notes: '' });

  useEffect(() => { load(); }, []);

  async function load() {
    const url = role === 'mistress' ? '/api/bookings/mistress' : '/api/bookings';
    const data = await fetch(url).then(r => r.json()).catch(() => ({ items: [] }));
    setBookings(data.items ?? []);
  }

  async function createBooking() {
    await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, durationMinutes: Number(form.durationMinutes), priceCents: Number(form.priceCents) }) });
    Alert.alert('✦ Booking requested!'); load(); setTab('list');
  }

  async function action(id, act) {
    await fetch(`/api/bookings/${id}/${act}`, { method: 'POST' });
    Alert.alert(`✦ Booking ${act}d`); load();
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>BOOKINGS</Text>
      <View style={s.tabs}>
        {[{ k: 'list', l: 'My Bookings' }, { k: 'create', l: '+ New' }].map(t => (
          <TouchableOpacity key={t.k} style={[s.tab, tab === t.k && s.tabActive]} onPress={() => setTab(t.k)}>
            <Text style={[s.tabText, tab === t.k && s.tabTextActive]}>{t.l}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'create' && (
        <View>
          <TextInput style={s.input} value={form.mistressId} onChangeText={v => setForm(f => ({...f, mistressId: v}))} placeholder="Mistress ID..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.durationMinutes} onChangeText={v => setForm(f => ({...f, durationMinutes: v}))} placeholder="Duration (mins)..." keyboardType="numeric" placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.requestedAt} onChangeText={v => setForm(f => ({...f, requestedAt: v}))} placeholder="Requested date/time (ISO)..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.notes} onChangeText={v => setForm(f => ({...f, notes: v}))} placeholder="Notes..." placeholderTextColor="#4a3060" multiline />
          <TouchableOpacity style={s.btn} onPress={createBooking}><Text style={s.btnText}>✦ Request Booking</Text></TouchableOpacity>
        </View>
      )}

      {tab === 'list' && bookings.map(b => (
        <View key={b.id} style={s.card}>
          <View style={s.cardHeader}>
            <Text style={s.cardTitle}>{b.type} — {b.durationMinutes}min</Text>
            <Text style={[s.status, { color: STATUS_COLORS[b.status] ?? '#c9a8d4' }]}>{b.status}</Text>
          </View>
          {b.requestedAt && <Text style={s.meta}>📅 {new Date(b.requestedAt).toLocaleString()}</Text>}
          {b.notes && <Text style={s.meta}>📝 {b.notes}</Text>}
          {role === 'mistress' && b.status === 'PENDING' && (
            <View style={s.actions}>
              <TouchableOpacity style={s.approveBtn} onPress={() => action(b.id, 'approve')}><Text style={s.actionText}>✓ Approve</Text></TouchableOpacity>
              <TouchableOpacity style={s.declineBtn} onPress={() => action(b.id, 'decline')}><Text style={s.actionText}>✗ Decline</Text></TouchableOpacity>
            </View>
          )}
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
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  card: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 12, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: '600', fontSize: 14 }, status: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  meta: { color: '#c9a8d4', fontSize: 11, marginBottom: 3 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 10 },
  approveBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#22c55e', alignItems: 'center' },
  declineBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#ff3f7f', alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});
