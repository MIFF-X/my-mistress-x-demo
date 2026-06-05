import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const FALLBACK_VISIBLE = [
  {
    id: 'profile-visible-golden-wink',
    assetId: 'golden-wink-nft-001',
    editionNumber: 43,
    source: 'PURCHASE',
    status: 'ACTIVE',
    metadata: { profileVisibility: { showOnProfile: true, showInCabinet: false, visibilityLabel: 'PROFILE' } },
    display: {
      title: 'Golden Wink NFT',
      assetKind: 'ANIMATED_STICKER',
      chainMode: 'OFFCHAIN_NFT_READY',
      collectionTitle: 'Golden Era NFT Drop',
      utility: ['Can be sent in chat', 'Counts toward monthly album completion'],
    },
  },
  {
    id: 'cabinet-visible-content-pass',
    assetId: 'creator-content-pass-001',
    editionNumber: 9,
    source: 'RAFFLE_WIN',
    status: 'ACTIVE',
    metadata: { profileVisibility: { showOnProfile: true, showInCabinet: true, visibilityLabel: 'CABINET' } },
    display: {
      title: 'Creator Content Pass NFT',
      assetKind: 'CONTENT_PASS',
      chainMode: 'OFFCHAIN_NFT_READY',
      collectionTitle: 'Monetized Content NFT Sets',
      utility: ['Can unlock vault sections later', 'Can be attached to subscription perks'],
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

async function api(path) {
  const token = getToken();
  const response = await fetch(path, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error(`Request failed: ${response.status}`);
  return response.json();
}

export default function NftProfileCabinetScreen() {
  const [items, setItems] = useState([]);
  const [source, setSource] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('CABINET');
  const [selected, setSelected] = useState(null);

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
    const base = items.length > 0 ? items : FALLBACK_VISIBLE;
    return base.filter((item) => {
      const visibility = getVisibility(item);
      if (!visibility.showOnProfile) return false;
      if (view === 'CABINET') return visibility.showInCabinet || visibility.visibilityLabel === 'CABINET';
      return true;
    });
  }, [items, view]);

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <View style={s.hero}>
        <Text style={s.kicker}>PUBLIC PROFILE SURFACE</Text>
        <Text style={s.title}>NFT CABINET</Text>
        <Text style={s.sub}>Only owner-approved digital assets marked Profile or Cabinet appear here. Private NFTs stay hidden.</Text>
        <View style={s.metricRow}>
          <Metric label="Visible" value={visibleItems.length.toString()} />
          <Metric label="Mode" value={view} />
          <Metric label="Source" value={source} />
        </View>
      </View>

      <View style={s.toggleRow}>
        {['CABINET', 'PROFILE'].map((mode) => (
          <TouchableOpacity key={mode} style={[s.toggleChip, view === mode && s.toggleChipActive]} onPress={() => setView(mode)}>
            <Text style={[s.toggleText, view === mode && s.toggleTextActive]}>{mode}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.infoBox}>
        <Text style={s.infoTitle}>Visibility rule</Text>
        <Text style={s.infoText}>This surface must only render assets with profileVisibility.showOnProfile=true. Cabinet mode further filters to showInCabinet=true.</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} />
      ) : (
        <View style={s.grid}>
          {visibleItems.map((item) => (
            <CabinetCard key={item.id || `${item.assetId}-${item.editionNumber}`} item={item} selected={selected?.id === item.id} onPress={() => setSelected(item)} />
          ))}
          {visibleItems.length === 0 ? <Text style={s.empty}>No profile-visible NFT assets yet.</Text> : null}
        </View>
      )}

      {selected ? (
        <View style={s.detailPanel}>
          <Text style={s.detailKicker}>Cabinet item</Text>
          <Text style={s.detailTitle}>{getTitle(selected)}</Text>
          <Text style={s.detailText}>Edition: #{selected.editionNumber || '—'}</Text>
          <Text style={s.detailText}>Collection: {getCollectionTitle(selected) || 'Standalone'}</Text>
          <Text style={s.detailText}>Kind: {getAssetKind(selected).replace(/_/g, ' ')}</Text>
          <Text style={s.detailText}>Visibility: {getVisibility(selected).visibilityLabel}</Text>
          <Text style={s.detailText}>Utility: {getUtility(selected).join(' • ') || 'Display collectible'}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Metric({ label, value }) {
  return <View style={s.metricCard}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}

function CabinetCard({ item, selected, onPress }) {
  return (
    <TouchableOpacity style={[s.card, selected && s.cardSelected]} onPress={onPress} activeOpacity={0.85}>
      <View style={s.assetIcon}><Text style={s.assetIconText}>{getIcon(item)}</Text></View>
      <Text style={s.cardTitle} numberOfLines={2}>{getTitle(item)}</Text>
      <Text style={s.cardMeta}>{getAssetKind(item).replace(/_/g, ' ')}</Text>
      <Text style={s.cardMeta}>{getCollectionTitle(item) || 'Standalone'}</Text>
      <Text style={s.cardMeta}>Edition #{item.editionNumber || '—'}</Text>
      <Text style={s.visibilityLabel}>{getVisibility(item).visibilityLabel}</Text>
    </TouchableOpacity>
  );
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
  return item?.display?.title || item?.asset?.title || item?.metadata?.title || item?.assetId || 'MX NFT Asset';
}

function getAssetKind(item) {
  return item?.display?.assetKind || item?.asset?.assetKind || item?.metadata?.assetKind || 'DIGITAL_ASSET';
}

function getCollectionTitle(item) {
  return item?.display?.collectionTitle || item?.collection?.title || item?.asset?.collection?.title || item?.metadata?.collection || null;
}

function getUtility(item) {
  const utility = item?.display?.utility || item?.asset?.utilityNotes || item?.metadata?.utility || [];
  return Array.isArray(utility) ? utility : [];
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
  toggleRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  toggleChip: { borderRadius: 999, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', paddingHorizontal: 12, paddingVertical: 8 },
  toggleChipActive: { backgroundColor: 'rgba(212,175,55,0.16)', borderColor: '#d4af37' },
  toggleText: { color: '#c9a8d4', fontSize: 11, fontWeight: '900' },
  toggleTextActive: { color: '#d4af37' },
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginBottom: 14 },
  infoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 4 },
  infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(34,197,94,0.45)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12 },
  cardSelected: { borderColor: '#d4af37', backgroundColor: 'rgba(212,175,55,0.08)' },
  assetIcon: { height: 82, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.09)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  assetIconText: { fontSize: 34 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '900', minHeight: 34 },
  cardMeta: { color: '#c9a8d4', fontSize: 10, marginTop: 4 },
  visibilityLabel: { color: '#22c55e', fontSize: 9, fontWeight: '900', marginTop: 6 },
  detailPanel: { marginTop: 18, borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', backgroundColor: 'rgba(255,255,255,0.035)', padding: 14 },
  detailKicker: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  detailTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 8 },
  detailText: { color: '#c9a8d4', fontSize: 12, lineHeight: 18 },
  empty: { color: 'rgba(201,168,212,0.55)', textAlign: 'center', paddingVertical: 32, width: '100%' },
});
