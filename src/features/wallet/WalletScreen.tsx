import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { getWalletBalance, listWalletTransactions, topUpWallet } from '../../api/walletApi';

export function WalletScreen() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState('10');
  const [error, setError] = useState<string | null>(null);
  const [topUpStatus, setTopUpStatus] = useState<string | null>(null);

  useEffect(() => {
    loadWallet();
  }, []);

  async function loadWallet() {
    try {
      setError(null);
      const bal = await getWalletBalance();
      setBalance(Number(bal.balance || 0));

      const tx = await listWalletTransactions();
      setTransactions(tx);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Wallet failed to load');
    }
  }

  async function handleTopUp() {
    const value = Number(amount);
    if (!value) return;

    try {
      setError(null);
      const topUp = await topUpWallet(value);
      setTopUpStatus(
        topUp.nextAction?.instructions ||
          `Top-up request ${topUp.intent.id} created. Complete provider or manual verification before credits are added.`,
      );
      await loadWallet();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Top up failed');
    }
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 10 }}>
        Wallet
      </Text>

      <View style={{ backgroundColor: '#111', padding: 16, borderRadius: 16, marginBottom: 16 }}>
        <Text style={{ color: '#aaa' }}>Balance</Text>
        <Text style={{ color: '#ff0055', fontSize: 28, fontWeight: '800' }}>
          {balance} credits
        </Text>
      </View>

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', marginBottom: 6 }}>Top Up</Text>
        <TextInput
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          style={{ backgroundColor: '#111', color: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}
        />
        <Pressable onPress={handleTopUp} style={{ backgroundColor: '#ff0055', padding: 12, borderRadius: 8 }}>
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '700' }}>Add Credits</Text>
        </Pressable>
      </View>

      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}
      {topUpStatus ? <Text style={{ color: '#1D9E75', marginBottom: 10 }}>{topUpStatus}</Text> : null}

      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Transactions
      </Text>

      {transactions.map((tx) => (
        <View key={tx.id} style={{ backgroundColor: '#111', padding: 10, borderRadius: 10, marginBottom: 6 }}>
          <Text style={{ color: '#fff' }}>{tx.type}</Text>
          <Text style={{ color: tx.direction === 'IN' ? '#1D9E75' : '#ff0055' }}>
            {tx.direction === 'IN' ? '+' : '-'} {tx.amount}
          </Text>
          <Text style={{ color: '#666', fontSize: 11 }}>{tx.reason || tx.description || '-'}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
