import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { listWalletTransactions } from '../../api/walletApi';
import type { WalletTransaction } from '../../api/walletApi';
import { getCurrentUser } from '../../state/authStore';
import { ActionPillButton } from '../buttons/ActionPillButton';

const revenueTypes = new Set([
  'GIFT',
  'GOAL_CONTRIBUTION',
  'CHAT_UNLOCK',
  'PAID_MESSAGE',
  'PPV_UNLOCK',
  'SUBSCRIPTION_PAYMENT',
  'LIVE_SHOW_TICKET',
  'CALL_BOOKING',
  'PURCHASE',
  'STORE_PURCHASE',
  'WISHLIST_PURCHASE',
]);

function amountValue(value?: number | string) {
  const parsed = Number(value || 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function moneyLabel(value: number) {
  return `${value.toFixed(2)} credits`;
}

function dateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString();
}

function isRefundLike(tx: WalletTransaction) {
  const label = `${tx.type} ${tx.reason || ''}`.toUpperCase();
  return label.includes('REFUND') || label.includes('CHARGEBACK') || label.includes('DISPUTE');
}

function isTopUp(tx: WalletTransaction) {
  const label = `${tx.type} ${tx.reason || ''}`.toUpperCase();
  return label.includes('TOP_UP') || label.includes('WALLET_TOP_UP');
}

function isRevenueLike(tx: WalletTransaction) {
  return revenueTypes.has(tx.type) || Boolean(tx.platformAmount) || Boolean(tx.mistressAmount);
}

function csvEscape(value: string) {
  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(transactions: WalletTransaction[], deductionNotes: string) {
  const header = ['date', 'type', 'direction', 'gross_credits', 'platform_fee_credits', 'creator_net_credits', 'reason'];
  const rows = transactions.map((tx) => [
    dateLabel(tx.createdAt),
    tx.type,
    tx.direction,
    amountValue(tx.amount).toFixed(2),
    amountValue(tx.platformAmount).toFixed(2),
    amountValue(tx.mistressAmount).toFixed(2),
    tx.reason || '',
  ]);
  const noteRows = deductionNotes.trim()
    ? [
        [],
        ['deduction_notes'],
        ...deductionNotes.split(/\r?\n/).map((line) => [line]),
      ]
    : [];

  return [header, ...rows, ...noteRows].map((row) => row.map((cell) => csvEscape(String(cell))).join(',')).join('\n');
}

function canViewCreatorRecords(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

export function RecordsTaxScreen() {
  const currentUser = getCurrentUser();
  const canView = canViewCreatorRecords(currentUser?.role);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [deductionNotes, setDeductionNotes] = useState('');
  const [showExport, setShowExport] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    if (!canView) return;

    setLoading(true);
    setError('');

    try {
      const nextTransactions = await listWalletTransactions();
      setTransactions(nextTransactions);
    } catch (err: any) {
      setError(err?.message || 'Records could not be loaded.');
    } finally {
      setLoading(false);
    }
  }, [canView]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const summary = useMemo(() => {
    const revenueRows = transactions.filter((tx) => !isTopUp(tx) && isRevenueLike(tx));
    const grossReceipts = revenueRows.reduce((total, tx) => total + amountValue(tx.amount), 0);
    const platformFees = revenueRows.reduce((total, tx) => total + amountValue(tx.platformAmount), 0);
    const creatorNet = revenueRows.reduce((total, tx) => {
      const net = amountValue(tx.mistressAmount);
      return total + (net > 0 ? net : amountValue(tx.amount));
    }, 0);
    const refundRows = transactions.filter(isRefundLike);
    const outgoingRows = transactions.filter((tx) => tx.direction === 'OUT');

    return {
      creatorNet,
      grossReceipts,
      outgoingSpend: outgoingRows.reduce((total, tx) => total + amountValue(tx.amount), 0),
      platformFees,
      refundCount: refundRows.length,
      revenueCount: revenueRows.length,
    };
  }, [transactions]);

  const exportText = useMemo(() => buildCsv(transactions, deductionNotes), [deductionNotes, transactions]);

  if (!canView) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
        <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '900' }}>Creator records are restricted.</Text>
        <Text style={{ color: '#aaa', marginTop: 8 }}>This panel is available to Mistress, Headmistress, and Admin roles.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000' }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Records & Tax Notes</Text>
        <Text style={{ color: '#aaa', marginTop: 6 }}>
          Gift, tribute, support, store, subscription, and unlock records for creator bookkeeping.
        </Text>
      </View>

      <View style={{ backgroundColor: '#211015', borderColor: '#7f1d3c', borderWidth: 1, borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Compliance Note</Text>
        <Text style={{ color: '#ddd', marginTop: 6 }}>
          This is recordkeeping support, not tax advice. Gifts, tributes, and support payments may have tax consequences depending on jurisdiction.
        </Text>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>Gross Receipts</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{moneyLabel(summary.grossReceipts)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>Platform Fees</Text>
          <Text style={{ color: '#d4af37', fontSize: 20, fontWeight: '900' }}>{moneyLabel(summary.platformFees)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>Creator Net</Text>
          <Text style={{ color: '#1D9E75', fontSize: 20, fontWeight: '900' }}>{moneyLabel(summary.creatorNet)}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>Refund / Chargeback Rows</Text>
          <Text style={{ color: '#ff6b6b', fontSize: 20, fontWeight: '900' }}>{summary.refundCount}</Text>
        </View>
        <View style={{ flex: 1, minWidth: 140, backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
          <Text style={{ color: '#777', fontSize: 11 }}>Outgoing Spend</Text>
          <Text style={{ color: '#ff9abf', fontSize: 20, fontWeight: '900' }}>{moneyLabel(summary.outgoingSpend)}</Text>
        </View>
      </View>

      {error ? <Text style={{ color: '#ff6b6b' }}>{error}</Text> : null}

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Statement Rows</Text>
            <Text style={{ color: '#777', fontSize: 12 }}>{summary.revenueCount} revenue-linked rows from {transactions.length} wallet rows</Text>
          </View>
          <ActionPillButton
            actionKey="refreshListings"
            disabled={loading}
            label={loading ? 'Loading...' : 'Refresh'}
            onPress={loadTransactions}
          />
        </View>

        {transactions.slice(0, 8).map((tx) => (
          <View key={tx.id} style={{ backgroundColor: '#050505', borderRadius: 10, padding: 10, marginBottom: 8 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
              <Text style={{ color: '#fff', fontWeight: '900' }}>{tx.type}</Text>
              <Text style={{ color: tx.direction === 'IN' ? '#1D9E75' : '#ff6b6b', fontWeight: '900' }}>
                {tx.direction === 'IN' ? '+' : '-'} {moneyLabel(amountValue(tx.amount))}
              </Text>
            </View>
            <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{dateLabel(tx.createdAt)} - {tx.reason || 'No note'}</Text>
            {(tx.platformAmount || tx.mistressAmount) ? (
              <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>
                Platform {moneyLabel(amountValue(tx.platformAmount))} / Creator {moneyLabel(amountValue(tx.mistressAmount))}
              </Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
        <Text style={{ color: '#ff9abf', fontWeight: '900', marginBottom: 8 }}>Deductions Notes</Text>
        <TextInput
          multiline
          placeholder="Add accountant notes, deductible expense notes, payout reminders, or manual adjustments."
          placeholderTextColor="#777"
          value={deductionNotes}
          onChangeText={setDeductionNotes}
          style={{ backgroundColor: '#050505', borderRadius: 10, color: '#fff', minHeight: 90, padding: 12, textAlignVertical: 'top' }}
        />
      </View>

      <View style={{ backgroundColor: '#111', borderRadius: 12, padding: 12 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900' }}>CSV Statement Text</Text>
          <ActionPillButton
            actionKey={showExport ? 'hideExport' : 'showExport'}
            label={showExport ? 'Hide' : 'Show'}
            onPress={() => setShowExport((current) => !current)}
          />
        </View>
        {showExport ? (
          <TextInput
            editable={false}
            multiline
            value={exportText}
            style={{ backgroundColor: '#050505', borderRadius: 10, color: '#ddd', minHeight: 180, padding: 12, textAlignVertical: 'top' }}
          />
        ) : null}
      </View>
    </ScrollView>
  );
}
