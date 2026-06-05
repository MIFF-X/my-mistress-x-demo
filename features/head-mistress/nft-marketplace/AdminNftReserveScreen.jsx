import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const STATUSES = ['HELD', 'RELEASED', 'REFUNDED'];
const RESERVE_TYPES = ['BID', 'RAFFLE_ENTRY'];

const FALLBACK_RESERVES = [
  {
    id: 'preview-reserve-bid-001',
    assetId: 'golden-wink-nft-001',
    actorId: 'sub-preview-001',
    creatorId: 'creator-aurora',
    reserveType: 'BID',
    status: 'HELD',
    credits: 350,
    walletTransactionId: 'preview-wallet-tx-bid',
    sourceRef: 'nft-bid-hold-preview',
    note: 'Preview bid hold awaiting auction close.',
  },
  {
    id: 'preview-reserve-bid-002',
    assetId: 'golden-wink-nft-001',
    actorId: 'sub-preview-003',
    creatorId: 'creator-aurora',
    reserveType: 'BID',
    status: 'HELD',
    credits: 250,
    walletTransactionId: 'preview-wallet-tx-bid-2',
    sourceRef: 'nft-bid-hold-preview-2',
    note: 'Lower preview bid for settlement demo.',
  },
  {
    id: 'preview-reserve-raffle-001',
    assetId: 'creator-content-pass-001',
    actorId: 'sub-preview-002',
    creatorId: 'mistress-x-system',
    reserveType: 'RAFFLE_ENTRY',
    status: 'HELD',
    credits: 50,
    walletTransactionId: 'preview-wallet-tx-raffle',
    sourceRef: 'nft-raffle-entry-preview',
    note: 'Preview raffle entry awaiting draw.',
  },
];

function getToken() {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;
  } catch {
    return null;
  }
}

async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(text || `Request failed: ${response.status}`);
  }

  return response.json();
}

export default function AdminNftReserveScreen() {
  const [status, setStatus] = useState('HELD');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyReserveId, setBusyReserveId] = useState(null);
  const [note, setNote] = useState('');
  const [source, setSource] = useState('loading');
  const [assetId, setAssetId] = useState('golden-wink-nft-001');
  const [reserveType, setReserveType] = useState('BID');
  const [winnerReserveIds, setWinnerReserveIds] = useState('preview-reserve-bid-001');
  const [refundNonWinners, setRefundNonWinners] = useState(true);
  const [settling, setSettling] = useState(false);
  const [settlementResult, setSettlementResult] = useState(null);

  const visibleItems = useMemo(() => {
    if (items.length > 0) return items;
    return status === 'HELD' ? FALLBACK_RESERVES.filter((reserve) => {
      if (assetId && reserve.assetId !== assetId) return false;
      if (reserveType && reserve.reserveType !== reserveType) return false;
      return true;
    }) : [];
  }, [items, status, assetId, reserveType]);

  const totals = useMemo(() => visibleItems.reduce((sum, reserve) => sum + Number(reserve.credits || 0), 0), [visibleItems]);

  useEffect(() => {
    loadReserves(status);
  }, [status]);

  async function loadReserves(nextStatus = status) {
    setLoading(true);
    setSettlementResult(null);
    try {
      const path = assetId.trim()
        ? `/api/nft-marketplace/reserves/asset/${assetId.trim()}?status=${nextStatus}&reserveType=${reserveType}`
        : `/api/nft-marketplace/reserves?status=${nextStatus}`;
      const data = await api(path);
      setItems(data.items || []);
      setSource(data.source || 'api');
    } catch {
      setItems([]);
      setSource('fallback_preview');
    } finally {
      setLoading(false);
    }
  }

  async function act(reserveId, action) {
    setBusyReserveId(reserveId);
    try {
      await api(`/api/nft-marketplace/reserves/${reserveId}/${action}`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
      Alert.alert('Reserve Updated', `${action.toUpperCase()} completed for ${reserveId}.`);
      setNote('');
      await loadReserves(status);
    } catch {
      Alert.alert('Preview Mode', `The ${action} action is wired, but the backend/API was not reachable from this screen.`);
    } finally {
      setBusyReserveId(null);
    }
  }

  async function settleAsset() {
    const winners = winnerReserveIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (!assetId.trim() || winners.length === 0) {
      Alert.alert('Settlement needs asset + winner', 'Enter an asset ID and at least one winning reserve ID.');
      return;
    }

    setSettling(true);
    try {
      const data = await api(`/api/nft-marketplace/reserves/asset/${assetId.trim()}/settle`, {
        method: 'POST',
        body: JSON.stringify({
          winnerReserveIds: winners,
          reserveType,
          refundNonWinners,
          note: note || `${reserveType} settlement from reserve admin screen`,
        }),
      });
      setSettlementResult(data.settlement || data);
      Alert.alert('Settlement Complete', `Released ${data.settlement?.released ?? 0}, refunded ${data.settlement?.refunded ?? 0}.`);
      await loadReserves(status);
    } catch {
      const fallback = {
        assetId: assetId.trim(),
        reserveType,
        winnerReserveIds: winners,
        released: winners.length,
        refunded: refundNonWinners ? Math.max(0, visibleItems.length - winners.length) : 0,
        settledByUserId: 'preview-admin',
        settledAt: new Date().toISOString(),
      };
      setSettlementResult(fallback);
      Alert.alert('Preview Settlement', 'Settlement controls are wired, but the backend/API was not reachable from this screen.');
    } finally {
      setSettling(false);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>HEADMISTRESS FINANCE</Text>
        <Text style={s.title}>NFT RESERVE CONTROL</Text>
        <Text style={s.sub}>Review held NFT bid and raffle credits, then release winning funds to creators or refund users when needed.</Text>
        <View style={s.metricRow}>
          <Metric label="Reserves" value={visibleItems.length.toString()} />
          <Metric label="Credits held" value={totals.toString()} />
          <Metric label="Source" value={source} />
        </View>
      </View>

      <View style={s.settlePanel}>
        <Text style={s.panelTitle}>Auction / raffle settlement</Text>
        <Text style={s.panelText}>Load held reserves for one asset, enter winner reserve IDs, then settle. Winners release to creator; non-winners refund when enabled.</Text>

        <Text style={s.sectionTitle}>Asset ID</Text>
        <TextInput style={s.input} value={assetId} onChangeText={setAssetId} placeholder="asset id..." placeholderTextColor="#6c5877" autoCapitalize="none" />

        <Text style={s.sectionTitle}>Reserve type</Text>
        <View style={s.statusRow}>
          {RESERVE_TYPES.map((type) => (
            <TouchableOpacity key={type} style={[s.statusChip, reserveType === type && s.statusChipActive]} onPress={() => setReserveType(type)}>
              <Text style={[s.statusText, reserveType === type && s.statusTextActive]}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={s.loadAssetBtn} onPress={() => loadReserves('HELD')}>
          <Text style={s.loadAssetText}>LOAD HELD RESERVES FOR ASSET</Text>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>Winner reserve IDs</Text>
        <TextInput
          style={s.input}
          value={winnerReserveIds}
          onChangeText={setWinnerReserveIds}
          placeholder="reserve-id-1, reserve-id-2"
          placeholderTextColor="#6c5877"
          autoCapitalize="none"
        />

        <TouchableOpacity style={[s.toggleRow, refundNonWinners && s.toggleRowActive]} onPress={() => setRefundNonWinners((prev) => !prev)}>
          <Text style={s.toggleText}>{refundNonWinners ? '✓ Refund non-winners after settlement' : '○ Do not auto-refund non-winners'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[s.settleBtn, settling && s.disabled]} onPress={settleAsset} disabled={settling}>
          <Text style={s.settleText}>{settling ? 'SETTLING…' : 'SETTLE WINNER(S)'}</Text>
        </TouchableOpacity>

        {settlementResult ? (
          <View style={s.resultBox}>
            <Text style={s.resultTitle}>Last settlement</Text>
            <Text style={s.resultText}>Asset: {settlementResult.assetId}</Text>
            <Text style={s.resultText}>Released: {settlementResult.released}</Text>
            <Text style={s.resultText}>Refunded: {settlementResult.refunded}</Text>
          </View>
        ) : null}
      </View>

      <Text style={s.sectionTitle}>Reserve status</Text>
      <View style={s.statusRow}>
        {STATUSES.map((item) => (
          <TouchableOpacity key={item} style={[s.statusChip, status === item && s.statusChipActive]} onPress={() => setStatus(item)}>
            <Text style={[s.statusText, status === item && s.statusTextActive]}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>Release / refund note</Text>
      <TextInput style={s.input} value={note} onChangeText={setNote} placeholder="Winner release note, refund reason, dispute note..." placeholderTextColor="#6c5877" />

      <View style={s.infoBox}>
        <Text style={s.infoTitle}>Reserve rule</Text>
        <Text style={s.infoText}>Held bid/raffle credits should stay auditable. Release sends funds to the creator; refund returns credits to the original actor.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} />
      ) : (
        <View style={s.list}>
          {visibleItems.map((reserve) => (
            <ReserveCard key={reserve.id} reserve={reserve} busy={busyReserveId === reserve.id} onRelease={() => act(reserve.id, 'release')} onRefund={() => act(reserve.id, 'refund')} />
          ))}
          {visibleItems.length === 0 && <Text style={s.empty}>No reserves in this status.</Text>}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return <View style={s.metricCard}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}

function ReserveCard({ reserve, busy, onRelease, onRefund }) {
  const isHeld = reserve.status === 'HELD';
  return (
    <View style={s.reserveCard}>
      <View style={s.reserveHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.reserveTitle}>{reserve.reserveType || 'RESERVE'} • {reserve.credits || 0} credits</Text>
          <Text style={s.reserveSub}>{reserve.assetId}</Text>
        </View>
        <Text style={[s.reserveStatus, reserve.status === 'HELD' && s.reserveStatusHeld]}>{reserve.status || 'HELD'}</Text>
      </View>
      <Text style={s.reserveMeta}>Reserve ID: {reserve.id}</Text>
      <Text style={s.reserveMeta}>Actor: {reserve.actorId || '—'}</Text>
      <Text style={s.reserveMeta}>Creator: {reserve.creatorId || '—'}</Text>
      <Text style={s.reserveMeta}>Wallet Tx: {reserve.walletTransactionId || '—'}</Text>
      <Text style={s.reserveMeta}>Source: {reserve.sourceRef || '—'}</Text>
      {reserve.note ? <Text style={s.reserveNote}>{reserve.note}</Text> : null}
      {isHeld ? <View style={s.buttonRow}><TouchableOpacity disabled={busy} style={[s.actionBtn, s.releaseBtn, busy && s.disabled]} onPress={onRelease}><Text style={s.releaseText}>{busy ? 'Working…' : 'Release'}</Text></TouchableOpacity><TouchableOpacity disabled={busy} style={[s.actionBtn, s.refundBtn, busy && s.disabled]} onPress={onRefund}><Text style={s.refundText}>{busy ? 'Working…' : 'Refund'}</Text></TouchableOpacity></View> : null}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' },
  inner: { padding: 20, paddingBottom: 48 },
  hero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', backgroundColor: 'rgba(212,175,55,0.07)', marginBottom: 20 },
  kicker: { color: '#d4af37', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  title: { color: '#fff', fontSize: 24, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  sub: { color: '#c9a8d4', fontSize: 13, lineHeight: 19 },
  metricRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  metricCard: { flex: 1, borderRadius: 14, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  metricValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  metricLabel: { color: '#c9a8d4', fontSize: 10, marginTop: 2 },
  settlePanel: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', backgroundColor: 'rgba(255,255,255,0.035)', padding: 14, marginBottom: 18 },
  panelTitle: { color: '#fff', fontSize: 17, fontWeight: '900', marginBottom: 6 },
  panelText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  sectionTitle: { color: '#d4af37', fontSize: 13, fontWeight: '900', letterSpacing: 2, marginTop: 18, marginBottom: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', paddingHorizontal: 10, paddingVertical: 7 },
  statusChipActive: { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: '#d4af37' },
  statusText: { color: '#c9a8d4', fontSize: 10, fontWeight: '800' },
  statusTextActive: { color: '#d4af37' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 12 },
  loadAssetBtn: { borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', padding: 11, alignItems: 'center', marginTop: 12 },
  loadAssetText: { color: '#d4af37', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  toggleRow: { borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', padding: 11, marginTop: 4 },
  toggleRowActive: { backgroundColor: 'rgba(212,175,55,0.09)', borderColor: '#d4af37' },
  toggleText: { color: '#d4af37', fontSize: 12, fontWeight: '800' },
  settleBtn: { backgroundColor: '#d4af37', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 12 },
  settleText: { color: '#0d0618', fontSize: 12, fontWeight: '900', letterSpacing: 1 },
  resultBox: { borderRadius: 12, padding: 12, backgroundColor: 'rgba(34,197,94,0.08)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.25)', marginTop: 12 },
  resultTitle: { color: '#22c55e', fontSize: 12, fontWeight: '900', marginBottom: 5 },
  resultText: { color: '#c9a8d4', fontSize: 11, lineHeight: 16 },
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginBottom: 14 },
  infoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 5 },
  infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  list: { gap: 12 },
  reserveCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14 },
  reserveHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  reserveTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
  reserveSub: { color: '#c9a8d4', fontSize: 11, marginTop: 2 },
  reserveStatus: { color: '#c9a8d4', borderColor: 'rgba(201,168,212,0.32)', borderWidth: 1, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '900' },
  reserveStatusHeld: { color: '#0d0618', backgroundColor: '#d4af37', borderColor: '#d4af37' },
  reserveMeta: { color: '#c9a8d4', fontSize: 11, lineHeight: 17 },
  reserveNote: { color: '#d4af37', fontSize: 12, lineHeight: 17, marginTop: 8 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionBtn: { flex: 1, borderRadius: 10, padding: 11, alignItems: 'center', borderWidth: 1 },
  releaseBtn: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  refundBtn: { backgroundColor: 'rgba(255,63,127,0.18)', borderColor: 'rgba(255,63,127,0.45)' },
  releaseText: { color: '#0d0618', fontSize: 12, fontWeight: '900' },
  refundText: { color: '#ff3f7f', fontSize: 12, fontWeight: '900' },
  disabled: { opacity: 0.45 },
  empty: { color: 'rgba(201,168,212,0.55)', textAlign: 'center', paddingVertical: 32 },
});
