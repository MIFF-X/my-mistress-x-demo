import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

const ENV_TYPES = [
  { key: 'vending_machine', label: '🎰 Vending Machine', desc: 'Auto-dispense items' },
  { key: 'mystery_box', label: '📦 Mystery Box', desc: 'Surprise reveals' },
  { key: 'private_vault', label: '🔐 Private Vault', desc: 'Exclusive access items' },
  { key: 'DIGITAL', label: '💾 Digital Store', desc: 'Digital downloads' },
];

export default function InventoryScreen() {
  const [tab, setTab] = useState('browse');
  const [products, setProducts] = useState([]);
  const [type, setType] = useState('DIGITAL');
  const [form, setForm] = useState({ name: '', description: '', priceCents: '', type: 'DIGITAL', stock: '' });

  useEffect(() => { load(); }, [tab]);

  async function load() {
    const url = tab === 'mine' ? '/api/marketplace/mine' : `/api/marketplace?type=${type}`;
    const data = await fetch(url).then(r => r.json()).catch(() => ({ items: [] }));
    setProducts(data.items ?? []);
  }

  async function create() {
    if (!form.name || !form.priceCents) { Alert.alert('Name and price required.'); return; }
    await fetch('/api/marketplace', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, priceCents: Number(form.priceCents), stock: Number(form.stock) || -1 }) });
    Alert.alert('✦ Product listed!'); load(); setTab('mine');
  }

  async function purchase(id) {
    await fetch(`/api/marketplace/${id}/purchase`, { method: 'POST' });
    Alert.alert('✦ Purchased!');
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>INVENTORY</Text>
      <View style={s.tabs}>
        {['browse', 'mine', 'list'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t === 'list' ? '+ List' : t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'browse' && (
        <View style={s.envRow}>
          {ENV_TYPES.map(e => (
            <TouchableOpacity key={e.key} style={[s.envCard, type === e.key && s.envCardActive]} onPress={() => { setType(e.key); load(); }}>
              <Text style={s.envIcon}>{e.label.split(' ')[0]}</Text>
              <Text style={s.envLabel}>{e.label.split(' ').slice(1).join(' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {tab === 'list' && (
        <View>
          <TextInput style={s.input} value={form.name} onChangeText={v => setForm(f => ({...f, name: v}))} placeholder="Product name..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.description} onChangeText={v => setForm(f => ({...f, description: v}))} placeholder="Description..." placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.priceCents} onChangeText={v => setForm(f => ({...f, priceCents: v}))} placeholder="Price (cents)..." keyboardType="numeric" placeholderTextColor="#4a3060" />
          <TextInput style={s.input} value={form.stock} onChangeText={v => setForm(f => ({...f, stock: v}))} placeholder="Stock (-1 = unlimited)..." keyboardType="numeric" placeholderTextColor="#4a3060" />
          <TouchableOpacity style={s.btn} onPress={create}><Text style={s.btnText}>✦ List Product</Text></TouchableOpacity>
        </View>
      )}

      {products.map(p => (
        <View key={p.id} style={s.productCard}>
          <View style={s.productHeader}>
            <Text style={s.productName}>{p.name}</Text>
            <Text style={s.productPrice}>${(p.priceCents / 100).toFixed(2)}</Text>
          </View>
          {p.description && <Text style={s.productDesc}>{p.description}</Text>}
          {p.stock !== -1 && p.stock !== undefined && <Text style={s.stock}>Stock: {p.stock}</Text>}
          {tab === 'browse' && <TouchableOpacity style={s.buyBtn} onPress={() => purchase(p.id)}><Text style={s.buyText}>Buy Now</Text></TouchableOpacity>}
        </View>
      ))}
      {products.length === 0 && tab !== 'list' && <Text style={s.empty}>No items found.</Text>}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  envRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  envCard: { width: '47%', padding: 14, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', alignItems: 'center' },
  envCardActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  envIcon: { fontSize: 24, marginBottom: 6 }, envLabel: { color: '#c9a8d4', fontSize: 11, textAlign: 'center' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 10 },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center', marginBottom: 20 },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  productCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 12, padding: 16, marginBottom: 10 },
  productHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  productName: { color: '#fff', fontWeight: '600', fontSize: 14, flex: 1 }, productPrice: { color: '#d4af37', fontWeight: '700' },
  productDesc: { color: '#c9a8d4', fontSize: 12, marginBottom: 6 }, stock: { color: 'rgba(201,168,212,0.5)', fontSize: 11, marginBottom: 8 },
  buyBtn: { padding: 10, borderRadius: 8, backgroundColor: '#ff3f7f', alignItems: 'center' },
  buyText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
