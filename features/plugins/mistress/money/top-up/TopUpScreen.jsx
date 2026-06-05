import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';

const METHODS = [
  { key: 'card', label: '💳 Card', desc: 'Visa / Mastercard' },
  { key: 'apple_pay', label: '🍎 Apple Pay', desc: 'Touch ID / Face ID' },
  { key: 'google_pay', label: '🤖 Google Pay', desc: 'Tap to pay' },
  { key: 'payid', label: '🏦 PayID', desc: 'Instant bank transfer' },
];
const AMOUNTS = [10, 25, 50, 100, 250, 500];

export default function TopUpScreen() {
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState('card');
  const [loading, setLoading] = useState(false);

  async function handleTopUp() {
    if (!amount || Number(amount) < 5) { Alert.alert('Minimum top-up is $5.00'); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/top-ups/intent', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(amount), method }) });
      const data = await res.json();
      Alert.alert('✦ Top-Up Initiated', `Intent created: ${data.id}\nAmount: $${amount} AUD\nMethod: ${method}`);
    } catch { Alert.alert('Error', 'Top-up failed. Please try again.'); }
    finally { setLoading(false); }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>TOP-UP</Text>
      <Text style={s.sub}>Add funds to your Mistress-X wallet</Text>

      <Text style={s.label}>Select Amount</Text>
      <View style={s.grid}>
        {AMOUNTS.map((a) => (
          <TouchableOpacity key={a} style={[s.amountBtn, amount === String(a) && s.amountBtnActive]} onPress={() => setAmount(String(a))}>
            <Text style={[s.amountText, amount === String(a) && s.amountTextActive]}>${a}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.label}>Custom Amount</Text>
      <TextInput style={s.input} value={amount} onChangeText={setAmount} keyboardType="numeric" placeholder="Enter amount..." placeholderTextColor="#4a3060" />

      <Text style={s.label}>Payment Method</Text>
      {METHODS.map((m) => (
        <TouchableOpacity key={m.key} style={[s.methodRow, method === m.key && s.methodRowActive]} onPress={() => setMethod(m.key)}>
          <Text style={s.methodLabel}>{m.label}</Text>
          <Text style={s.methodDesc}>{m.desc}</Text>
          {method === m.key && <Text style={s.tick}>✓</Text>}
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={[s.btn, loading && s.btnDim]} onPress={handleTopUp} disabled={loading}>
        <Text style={s.btnText}>{loading ? 'Processing...' : `✦ Top Up $${amount || '0'}`}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' },
  inner: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 4 },
  sub: { color: '#c9a8d4', fontSize: 12, letterSpacing: 1, marginBottom: 24 },
  label: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginTop: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  amountBtn: { width: '30%', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', alignItems: 'center' },
  amountBtnActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  amountText: { color: '#c9a8d4', fontSize: 16, fontWeight: '600' },
  amountTextActive: { color: '#d4af37' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', fontSize: 16 },
  methodRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', marginBottom: 8, gap: 12 },
  methodRowActive: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  methodLabel: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  methodDesc: { color: '#c9a8d4', fontSize: 11 },
  tick: { color: '#d4af37', fontSize: 16, fontWeight: '700' },
  btn: { marginTop: 24, padding: 16, borderRadius: 12, backgroundColor: '#d4af37', alignItems: 'center' },
  btnDim: { opacity: 0.5 },
  btnText: { color: '#0d0618', fontWeight: '700', fontSize: 15, letterSpacing: 2 },
});
