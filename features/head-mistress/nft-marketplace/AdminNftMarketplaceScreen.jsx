import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const REVIEW_STATUSES = ['PENDING_REVIEW', 'APPROVED', 'LISTED', 'REJECTED', 'ARCHIVED'];

const FALLBACK_ITEMS = [
  {
    id: 'golden-wink-nft-001',
    title: 'Golden Wink NFT',
    creatorId: 'creator-aurora',
    assetKind: 'ANIMATED_STICKER',
    chainMode: 'OFFCHAIN_NFT_READY',
    status: 'PENDING_REVIEW',
    imageUrl: 'https://dummyimage.com/512x512/201429/d4af37.png&text=Wink+NFT',
    description: 'Rare animated sticker collectible from the Golden Era drop.',
    utilityNotes: ['Can be sent in chat', 'Counts toward monthly album completion'],
    valueNotes: ['Limited edition supply', 'Can retain collectible value inside the MX vault'],
  },
  {
    id: 'creator-content-pass-001',
    title: 'Creator Content Pass NFT',
    creatorId: 'mistress-x-system',
    assetKind: 'CONTENT_PASS',
    chainMode: 'OFFCHAIN_NFT_READY',
    status: 'PENDING_REVIEW',
    imageUrl: 'https://dummyimage.com/512x512/101827/d4af37.png&text=Content+Pass+NFT',
    description: 'Limited content pass for future vault/content unlocks and rewards.',
    utilityNotes: ['Can represent a content bundle', 'Can be attached to subscription perks'],
    valueNotes: ['Designed to be sold, raffled, auctioned, or won'],
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
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(text || `Request failed: ${res.status}`);
  }

  return res.json();
}

export default function AdminNftMarketplaceScreen() {
  const [status, setStatus] = useState('PENDING_REVIEW');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyAssetId, setBusyAssetId] = useState(null);
  const [reviewNote, setReviewNote] = useState('');
  const [source, setSource] = useState('loading');

  const visibleItems = useMemo(() => {
    if (items.length > 0) return items;
    return status === 'PENDING_REVIEW' ? FALLBACK_ITEMS : [];
  }, [items, status]);

  useEffect(() => {
    loadQueue(status);
  }, [status]);

  async function loadQueue(nextStatus = status) {
    setLoading(true);
    try {
      const data = await api(`/api/admin/nft-marketplace/review-queue?status=${nextStatus}`);
      setItems(data.items || []);
      setSource(data.source || 'api');
    } catch (error) {
      setItems([]);
      setSource('fallback_preview');
    } finally {
      setLoading(false);
    }
  }

  async function reviewAsset(assetId, action) {
    setBusyAssetId(assetId);
    try {
      const body = JSON.stringify({ note: reviewNote, reason: reviewNote });
      await api(`/api/admin/nft-marketplace/assets/${assetId}/${action}`, {
        method: 'PATCH',
        body,
      });
      Alert.alert('NFT Review Updated', `${action.toUpperCase()} completed for ${assetId}.`);
      setReviewNote('');
      await loadQueue(status);
    } catch (error) {
      Alert.alert('Preview Mode', `The ${action} action is wired, but the backend/API was not reachable from this screen.`);
    } finally {
      setBusyAssetId(null);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>HEADMISTRESS CONTROL</Text>
        <Text style={s.title}>NFT MARKETPLACE REVIEW</Text>
        <Text style={s.sub}>Approve, list, reject, or archive creator digital assets before they reach the MX NFT Marketplace.</Text>
        <View style={s.metricRow}>
          <Metric label="Queue" value={visibleItems.length.toString()} />
          <Metric label="Status" value={status.replace('_', ' ')} />
          <Metric label="Source" value={source} />
        </View>
      </View>

      <Text style={s.sectionTitle}>Review status</Text>
      <View style={s.statusRow}>
        {REVIEW_STATUSES.map((item) => (
          <TouchableOpacity key={item} style={[s.statusChip, status === item && s.statusChipActive]} onPress={() => setStatus(item)}>
            <Text style={[s.statusText, status === item && s.statusTextActive]}>{item.replace('_', ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.sectionTitle}>Moderation note</Text>
      <TextInput
        style={s.input}
        value={reviewNote}
        onChangeText={setReviewNote}
        placeholder="Reason, approval note, archive note..."
        placeholderTextColor="#6c5877"
      />

      <View style={s.infoBox}>
        <Text style={s.infoTitle}>Public marketplace safety rule</Text>
        <Text style={s.infoText}>Public previews must stay controlled. Paid/private digital assets remain account-gated, age-gated, ownership-gated, and audit logged.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} />
      ) : (
        <View style={s.queueList}>
          {visibleItems.map((asset) => (
            <AssetReviewCard
              key={asset.id}
              asset={asset}
              busy={busyAssetId === asset.id}
              onApprove={() => reviewAsset(asset.id, 'approve')}
              onList={() => reviewAsset(asset.id, 'list')}
              onReject={() => reviewAsset(asset.id, 'reject')}
              onArchive={() => reviewAsset(asset.id, 'archive')}
            />
          ))}
          {visibleItems.length === 0 && <Text style={s.empty}>No assets in this review status.</Text>}
        </View>
      )}
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return (
    <View style={s.metricCard}>
      <Text style={s.metricValue}>{value}</Text>
      <Text style={s.metricLabel}>{label}</Text>
    </View>
  );
}

function AssetReviewCard({ asset, busy, onApprove, onList, onReject, onArchive }) {
  const utility = Array.isArray(asset.utilityNotes) ? asset.utilityNotes.join(' • ') : 'No utility notes supplied.';
  const value = Array.isArray(asset.valueNotes) ? asset.valueNotes.join(' • ') : 'No value notes supplied.';

  return (
    <View style={s.assetCard}>
      <View style={s.assetHeader}>
        <View style={{ flex: 1 }}>
          <Text style={s.assetTitle}>{asset.title || 'Untitled NFT Asset'}</Text>
          <Text style={s.assetCreator}>{asset.creatorId || 'unknown creator'}</Text>
        </View>
        <Text style={s.assetStatus}>{asset.status || 'PENDING_REVIEW'}</Text>
      </View>
      <Text style={s.assetMeta}>{asset.assetKind || 'DIGITAL_ASSET'} • {asset.chainMode || 'PLATFORM_COLLECTIBLE'}</Text>
      <Text style={s.assetDescription}>{asset.description || 'No description supplied.'}</Text>
      <Text style={s.assetFine}>Utility: {utility}</Text>
      <Text style={s.assetFine}>Value: {value}</Text>

      <View style={s.buttonGrid}>
        <ReviewButton label="Approve" disabled={busy} onPress={onApprove} />
        <ReviewButton label="List" disabled={busy} onPress={onList} primary />
        <ReviewButton label="Reject" disabled={busy} onPress={onReject} danger />
        <ReviewButton label="Archive" disabled={busy} onPress={onArchive} muted />
      </View>
    </View>
  );
}

function ReviewButton({ label, disabled, onPress, primary, danger, muted }) {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      style={[s.reviewBtn, primary && s.reviewBtnPrimary, danger && s.reviewBtnDanger, muted && s.reviewBtnMuted, disabled && s.reviewBtnDisabled]}
    >
      <Text style={[s.reviewBtnText, primary && s.reviewBtnTextDark]}>{disabled ? 'Working...' : label}</Text>
    </TouchableOpacity>
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
  sectionTitle: { color: '#d4af37', fontSize: 13, fontWeight: '900', letterSpacing: 2, marginTop: 18, marginBottom: 10 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', paddingHorizontal: 10, paddingVertical: 7 },
  statusChipActive: { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: '#d4af37' },
  statusText: { color: '#c9a8d4', fontSize: 10, fontWeight: '800' },
  statusTextActive: { color: '#d4af37' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 10, padding: 12, color: '#fff', marginBottom: 12 },
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 14, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginBottom: 14 },
  infoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 5 },
  infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  queueList: { gap: 12 },
  assetCard: { borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 14 },
  assetHeader: { flexDirection: 'row', gap: 10, alignItems: 'flex-start', marginBottom: 8 },
  assetTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
  assetCreator: { color: '#c9a8d4', fontSize: 11, marginTop: 2 },
  assetStatus: { color: '#0d0618', backgroundColor: '#d4af37', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4, fontSize: 9, fontWeight: '900' },
  assetMeta: { color: '#d4af37', fontSize: 11, fontWeight: '900', marginBottom: 6 },
  assetDescription: { color: '#fff', fontSize: 12, lineHeight: 17, marginBottom: 8 },
  assetFine: { color: '#c9a8d4', fontSize: 11, lineHeight: 16, marginBottom: 4 },
  buttonGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  reviewBtn: { flexGrow: 1, minWidth: '46%', borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.28)', padding: 11, alignItems: 'center' },
  reviewBtnPrimary: { backgroundColor: '#d4af37', borderColor: '#d4af37' },
  reviewBtnDanger: { backgroundColor: 'rgba(255,63,127,0.18)', borderColor: 'rgba(255,63,127,0.45)' },
  reviewBtnMuted: { opacity: 0.72 },
  reviewBtnDisabled: { opacity: 0.45 },
  reviewBtnText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  reviewBtnTextDark: { color: '#0d0618' },
  empty: { color: 'rgba(201,168,212,0.55)', textAlign: 'center', paddingVertical: 32 },
});
