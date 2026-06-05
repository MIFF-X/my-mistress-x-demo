import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FALLBACK_OWNED = [
  {
    id: 'owned-golden-wink-001',
    assetId: 'golden-wink-nft-001',
    editionNumber: 43,
    source: 'PURCHASE',
    status: 'ACTIVE',
    purchasePriceCredits: 350,
    acquiredAt: '2026-05-31T10:00:00.000Z',
    metadata: { profileVisibility: { showOnProfile: false, showInCabinet: false, visibilityLabel: 'PRIVATE' } },
    display: {
      title: 'Golden Wink NFT',
      assetKind: 'ANIMATED_STICKER',
      chainMode: 'OFFCHAIN_NFT_READY',
      collectionTitle: 'Golden Era NFT Drop',
      utility: ['Can be sent in chat', 'Counts toward monthly album completion'],
      value: ['Limited edition supply', 'Can retain collectible value inside the MX vault'],
    },
  },
  {
    id: 'owned-content-pass-001',
    assetId: 'creator-content-pass-001',
    editionNumber: 9,
    source: 'RAFFLE_WIN',
    status: 'ACTIVE',
    purchasePriceCredits: 50,
    acquiredAt: '2026-05-31T11:00:00.000Z',
    metadata: { profileVisibility: { showOnProfile: true, showInCabinet: true, visibilityLabel: 'CABINET' } },
    display: {
      title: 'Creator Content Pass NFT',
      assetKind: 'CONTENT_PASS',
      chainMode: 'OFFCHAIN_NFT_READY',
      collectionTitle: 'Monetized Content NFT Sets',
      utility: ['Can unlock vault sections later', 'Can be attached to subscription perks'],
      value: ['Limited edition pass', 'Can be raffled, auctioned, sold, or won'],
    },
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
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export default function NftOwnerVaultScreen() {
  const [items, setItems] = useState([]);
  const [source, setSource] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selected, setSelected] = useState(null);
  const [busyOwnershipId, setBusyOwnershipId] = useState(null);

  useEffect(() => {
    loadOwned();
  }, []);

  async function loadOwned() {
    setLoading(true);
    try {
      const data = await api('/api/nft-marketplace/me/owned');
      setItems(data.items || []);
      setSource(data.source || 'api');
    } catch {
      setItems([]);
      setSource('fallback_preview');
    } finally {
      setLoading(false);
    }
  }

  const visibleItems = useMemo(() => {
    const base = items.length > 0 ? items : FALLBACK_OWNED;
    if (filter === 'ALL') return base;
    if (filter === 'PROFILE_VISIBLE') return base.filter((item) => getVisibility(item).showOnProfile);
    if (filter === 'PRIVATE') return base.filter((item) => !getVisibility(item).showOnProfile);
    return base.filter((item) => getAssetKind(item) === filter || item.source === filter || getChainMode(item) === filter);
  }, [items, filter]);

  const totalValue = useMemo(() => visibleItems.reduce((sum, item) => sum + Number(item.purchasePriceCredits || 0), 0), [visibleItems]);

  async function updateVisibility(item, visibilityLabel) {
    const ownershipId = item.id;
    if (!ownershipId) return;
    const nextVisibility = getNextVisibilityPayload(visibilityLabel);
    setBusyOwnershipId(ownershipId);
    try {
      const data = await api(`/api/nft-marketplace/me/owned/${ownershipId}/visibility`, {
        method: 'PATCH',
        body: JSON.stringify(nextVisibility),
      });
      const updatedOwnership = data.ownership || { ...item, metadata: mergeVisibilityMetadata(item.metadata || {}, nextVisibility) };
      setItems((prev) => prev.map((entry) => (entry.id === ownershipId ? { ...entry, ...updatedOwnership } : entry)));
      setSelected((prev) => (prev?.id === ownershipId ? { ...prev, ...updatedOwnership } : prev));
    } catch {
      const fallback = { ...item, metadata: mergeVisibilityMetadata(item.metadata || {}, nextVisibility) };
      setItems((prev) => (prev.length > 0 ? prev.map((entry) => (entry.id === ownershipId ? fallback : entry)) : prev));
      setSelected((prev) => (prev?.id === ownershipId ? fallback : prev));
      Alert.alert('Preview Mode', 'Visibility toggle is wired, but the backend/API was not reachable from this screen.');
    } finally {
      setBusyOwnershipId(null);
    }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>COLLECTOR VAULT</Text>
        <Text style={s.title}>MY NFT VAULT</Text>
        <Text style={s.sub}>A private display cabinet for bought, won, swapped, and rewarded MX digital assets.</Text>
        <View style={s.metricRow}>
          <Metric label="Owned" value={visibleItems.length.toString()} />
          <Metric label="Value" value={`${totalValue} cr`} />
          <Metric label="Source" value={source} />
        </View>
      </View>

      <View style={s.filterRow}>
        {['ALL', 'PROFILE_VISIBLE', 'PRIVATE', 'ANIMATED_STICKER', 'CONTENT_PASS', 'PLATFORM_COLLECTIBLE', 'OFFCHAIN_NFT_READY', 'PURCHASE', 'RAFFLE_WIN'].map((item) => (
          <TouchableOpacity key={item} style={[s.filterChip, filter === item && s.filterChipActive]} onPress={() => setFilter(item)}>
            <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item.replace(/_/g, ' ')}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.privacyInfoBox}>
        <Text style={s.privacyInfoTitle}>Profile privacy</Text>
        <Text style={s.privacyInfoText}>NFTs stay private by default. Mark only the digital assets you want shown on your profile or public cabinet.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} />
      ) : (
        <View style={s.grid}>
          {visibleItems.map((item) => (
            <OwnedNftCard
              key={item.id || `${item.assetId}-${item.editionNumber}`}
              item={item}
              selected={selected?.id === item.id}
              busy={busyOwnershipId === item.id}
              onPress={() => setSelected(item)}
              onVisibility={updateVisibility}
            />
          ))}
        </View>
      )}

      {selected ? (
        <View style={s.detailPanel}>
          <Text style={s.detailKicker}>Selected asset</Text>
          <Text style={s.detailTitle}>{getTitle(selected)}</Text>
          <Text style={s.detailText}>Asset ID: {selected.assetId}</Text>
          <Text style={s.detailText}>Edition: #{selected.editionNumber || '—'}</Text>
          <Text style={s.detailText}>Kind: {getAssetKind(selected).replace(/_/g, ' ')}</Text>
          <Text style={s.detailText}>Collection: {getCollectionTitle(selected) || 'Standalone'}</Text>
          <Text style={s.detailText}>Mode: {getChainMode(selected).replace(/_/g, ' ')}</Text>
          <Text style={s.detailText}>Visibility: {getVisibility(selected).visibilityLabel}</Text>
          <Text style={s.detailText}>Source: {selected.source || 'OWNED'}</Text>
          <Text style={s.detailText}>Status: {selected.status || 'ACTIVE'}</Text>
          <Text style={s.detailText}>Acquired: {selected.acquiredAt ? new Date(selected.acquiredAt).toLocaleString() : '—'}</Text>
          <Text style={s.detailText}>Utility: {getUtility(selected).join(' • ') || 'Display collectible'}</Text>
          <Text style={s.detailText}>Value: {getValueNotes(selected).join(' • ') || 'Private digital asset'}</Text>
          <VisibilityControls item={selected} busy={busyOwnershipId === selected.id} onVisibility={updateVisibility} />
        </View>
      ) : null}
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return <View style={s.metricCard}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}

function OwnedNftCard({ item, selected, busy, onPress, onVisibility }) {
  const visibility = getVisibility(item);
  return (
    <TouchableOpacity style={[s.card, selected && s.cardSelected, visibility.showOnProfile && s.profileVisibleCard]} onPress={onPress} activeOpacity={0.85}>
      <View style={s.assetIcon}><Text style={s.assetIconText}>{getIcon(item)}</Text></View>
      <Text style={s.cardTitle} numberOfLines={2}>{getTitle(item)}</Text>
      <Text style={s.cardMeta}>{getAssetKind(item).replace(/_/g, ' ')}</Text>
      <Text style={s.cardMeta}>{getCollectionTitle(item) || 'Standalone'}</Text>
      <Text style={s.cardMeta}>Edition #{item.editionNumber || '—'}</Text>
      <Text style={s.cardMeta}>{getChainMode(item).replace(/_/g, ' ')}</Text>
      <Text style={s.visibilityLabel}>{visibility.visibilityLabel}</Text>
      <Text style={s.cardPrice}>{item.purchasePriceCredits || 0} credits</Text>
      <Text style={s.cardSource}>{item.source || 'OWNED'}</Text>
      <VisibilityControls item={item} compact busy={busy} onVisibility={onVisibility} />
    </TouchableOpacity>
  );
}

function VisibilityControls({ item, compact, busy, onVisibility }) {
  const visibility = getVisibility(item);
  return (
    <View style={compact ? s.visibilityCompact : s.visibilityBlock}>
      {['PRIVATE', 'PROFILE', 'CABINET'].map((label) => (
        <TouchableOpacity
          key={label}
          disabled={busy}
          style={[s.visibilityButton, visibility.visibilityLabel === label && s.visibilityButtonActive, busy && s.visibilityButtonDisabled]}
          onPress={() => onVisibility(item, label)}
        >
          <Text style={[s.visibilityButtonText, visibility.visibilityLabel === label && s.visibilityButtonTextActive]}>{busy ? '...' : label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function getNextVisibilityPayload(label) {
  if (label === 'PRIVATE') return { showOnProfile: false, showInCabinet: false, visibilityLabel: 'PRIVATE' };
  if (label === 'CABINET') return { showOnProfile: true, showInCabinet: true, visibilityLabel: 'CABINET' };
  return { showOnProfile: true, showInCabinet: false, visibilityLabel: 'PROFILE' };
}

function mergeVisibilityMetadata(metadata, payload) {
  return {
    ...metadata,
    profileVisibility: {
      showOnProfile: payload.showOnProfile,
      showInCabinet: payload.showInCabinet,
      visibilityLabel: payload.visibilityLabel,
      updatedAt: new Date().toISOString(),
    },
  };
}

function getVisibility(item) {
  const visibility = item?.metadata?.profileVisibility || item?.profileVisibility || {};
  return {
    showOnProfile: Boolean(visibility.showOnProfile),
    showInCabinet: Boolean(visibility.showInCabinet),
    visibilityLabel: visibility.visibilityLabel || (visibility.showOnProfile ? 'PROFILE' : 'PRIVATE'),
  };
}

function getTitle(item) {
  return item?.display?.title || item?.asset?.title || item?.metadata?.title || item?.title || item?.assetId || 'MX NFT Asset';
}

function getAssetKind(item) {
  return item?.display?.assetKind || item?.asset?.assetKind || item?.metadata?.assetKind || item?.assetKind || 'DIGITAL_ASSET';
}

function getCollectionTitle(item) {
  return item?.display?.collectionTitle || item?.collection?.title || item?.asset?.collection?.title || item?.metadata?.collection || null;
}

function getChainMode(item) {
  return item?.display?.chainMode || item?.asset?.chainMode || item?.metadata?.chainMode || 'PLATFORM_COLLECTIBLE';
}

function getUtility(item) {
  const utility = item?.display?.utility || item?.asset?.utilityNotes || item?.metadata?.utility || item?.utilityNotes || [];
  return Array.isArray(utility) ? utility : [];
}

function getValueNotes(item) {
  const value = item?.display?.value || item?.asset?.valueNotes || item?.metadata?.value || item?.valueNotes || [];
  return Array.isArray(value) ? value : [];
}

function getIcon(item) {
  const kind = getAssetKind(item);
  if (kind === 'ANIMATED_STICKER' || kind === 'STICKER') return '🎴';
  if (kind === 'CONTENT_PASS') return '◆';
  if (kind === 'TROPHY') return '🏆';
  if (kind === 'PROFILE_CARD') return '🃏';
  return '✦';
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },
  inner: { padding: 20, paddingBottom: 48 },
  hero: { padding: 18, borderRadius: 22, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', backgroundColor: 'rgba(212,175,55,0.07)', marginBottom: 18 },
  kicker: { color: '#d4af37', fontSize: 11, fontWeight: '900', letterSpacing: 2, marginBottom: 6 },
  title: { color: '#fff', fontSize: 25, fontWeight: '900', letterSpacing: 2, marginBottom: 8 },
  sub: { color: '#c9a8d4', fontSize: 13, lineHeight: 19 },
  metricRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  metricCard: { flex: 1, borderRadius: 14, padding: 10, backgroundColor: 'rgba(255,255,255,0.05)' },
  metricValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  metricLabel: { color: '#c9a8d4', fontSize: 10, marginTop: 2 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', paddingHorizontal: 10, paddingVertical: 7 },
  filterChipActive: { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: '#d4af37' },
  filterText: { color: '#c9a8d4', fontSize: 10, fontWeight: '800' },
  filterTextActive: { color: '#d4af37' },
  privacyInfoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginBottom: 14 },
  privacyInfoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 4 },
  privacyInfoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12 },
  cardSelected: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  profileVisibleCard: { borderColor: 'rgba(34,197,94,0.65)' },
  assetIcon: { height: 82, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.09)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  assetIconText: { fontSize: 34 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '900', minHeight: 34 },
  cardMeta: { color: '#c9a8d4', fontSize: 10, marginTop: 4 },
  visibilityLabel: { color: '#22c55e', fontSize: 9, fontWeight: '900', marginTop: 6 },
  cardPrice: { color: '#d4af37', fontSize: 11, fontWeight: '900', marginTop: 6 },
  cardSource: { color: '#ff3f7f', fontSize: 9, fontWeight: '900', marginTop: 4 },
  visibilityCompact: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  visibilityBlock: { flexDirection: 'row', gap: 8, marginTop: 12 },
  visibilityButton: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', paddingHorizontal: 8, paddingVertical: 5 },
  visibilityButtonActive: { borderColor: '#22c55e', backgroundColor: 'rgba(34,197,94,0.12)' },
  visibilityButtonDisabled: { opacity: 0.5 },
  visibilityButtonText: { color: '#c9a8d4', fontSize: 8, fontWeight: '900' },
  visibilityButtonTextActive: { color: '#22c55e' },
  detailPanel: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', backgroundColor: 'rgba(255,255,255,0.035)', padding: 14 },
  detailKicker: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  detailTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  detailText: { color: '#c9a8d4', fontSize: 12, lineHeight: 18 },
});
