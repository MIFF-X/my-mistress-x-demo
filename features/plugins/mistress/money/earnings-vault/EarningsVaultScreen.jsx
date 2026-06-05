import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

const METHODS = ['PayID', 'Bank Transfer', 'Stripe Connect'];

export default function EarningsVaultScreen() {
  const [balance, setBalance] = useState({ availableBalance: 0, pendingBalance: 0 });
  const [payouts, setPayouts] = useState([]);
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('PayID');
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [bal, pays] = await Promise.all([fetch('/api/earnings-vault/balance').then(r => r.json()), fetch('/api/earnings-vault/payouts').then(r => r.json())]);
      setBalance(bal);
      setPayouts(pays.items ?? []);
    } catch {} finally { setLoading(false); }
  }

  async function requestPayout() {
    const cents = Math.round(Number(amount) * 100);
    if (cents < 1000) { Alert.alert('Minimum payout is $10.00'); return; }
    try {
      await fetch('/api/earnings-vault/payout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amountCents: cents, method }) });
      Alert.alert('✦ Payout Requested', `$${amount} via ${method} — pending approval.`);
      load();
    } catch { Alert.alert('Error', 'Payout request failed.'); }
  }

  if (loading) return <View style={s.center}><ActivityIndicator color="#d4af37" /></View>;

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>EARNINGS VAULT</Text>

      <View style={s.balanceCard}>
        <View style={s.balRow}>
          <Text style={s.balLabel}>Available</Text>
          <Text style={s.balAmount}>${(balance.availableBalance / 100).toFixed(2)}</Text>
        </View>
        <View style={[s.balRow, s.balRowPending]}>
          <Text style={s.balLabel}>Pending</Text>
          <Text style={s.balPending}>${(balance.pendingBalance / 100).toFixed(2)}</Text>
        </View>
      </View>

      <Text style={s.label}>Request Payout</Text>
      <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Amount in AUD..." placeholderTextColor="#4a3060" />
      <View style={s.methodRow}>
        {METHODS.map((m) => (
          <TouchableOpacity key={m} style={[s.chip, method === m && s.chipActive]} onPress={() => setMethod(m)}>
            <Text style={[s.chipText, method === m && s.chipTextActive]}>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={s.btn} onPress={requestPayout}>
        <Text style={s.btnText}>✦ Request Payout</Text>
      </TouchableOpacity>

      <Text style={s.label}>Recent Payouts</Text>
      {payouts.length === 0 && <Text style={s.empty}>No payouts yet.</Text>}
      {payouts.map((p) => (
        <View key={p.id} style={s.payoutRow}>
          <Text style={s.payoutMethod}>{p.method}</Text>
          <Text style={s.payoutAmount}>${(p.amountCents / 100).toFixed(2)}</Text>
          <Text style={[s.payoutStatus, { color: p.status === 'PAID' ? '#22c55e' : '#d4af37' }]}>{p.status}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 24, paddingBottom: 48 },
  center: { flex: 1, backgroundColor: '#0d0618', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 20 },
  balanceCard: { backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', borderRadius: 14, padding: 20, marginBottom: 24 },
  balRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  balRowPending: { borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.15)', marginTop: 8, paddingTop: 16 },
  balLabel: { color: '#c9a8d4', fontSize: 13 }, balAmount: { color: '#d4af37', fontSize: 28, fontWeight: '700' },
  balPending: { color: 'rgba(212,175,55,0.5)', fontSize: 18, fontWeight: '600' },
  label: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginTop: 16 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16, marginBottom: 12 },
  methodRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)' },
  chipActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  chipText: { color: '#c9a8d4', fontSize: 12 }, chipTextActive: { color: '#d4af37', fontWeight: '700' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center', marginBottom: 8 },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  empty: { color: 'rgba(201,168,212,0.4)', fontSize: 13, textAlign: 'center', paddingVertical: 20 },
  payoutRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', marginBottom: 8 },
  payoutMethod: { color: '#fff', fontSize: 13, flex: 1 }, payoutAmount: { color: '#d4af37', fontWeight: '700', marginRight: 12 },
  payoutStatus: { fontSize: 11, fontWeight: '700', letterSpacing: 1 },
});
