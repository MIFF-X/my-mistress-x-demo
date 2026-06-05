import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const FALLBACK_LISTINGS = [
  {
    id: 'listing-golden-wink',
    assetId: 'golden-wink-nft-001',
    listingMode: 'SELL_NOW',
    priceCredits: 350,
    reservePriceCredits: 0,
    raffleEntryCredits: 25,
    allowResale: true,
    allowSwap: true,
    status: 'ACTIVE',
    asset: {
      id: 'golden-wink-nft-001',
      title: 'Golden Wink NFT',
      description: 'Rare animated sticker collectible from the Golden Era drop.',
      assetKind: 'ANIMATED_STICKER',
      chainMode: 'OFFCHAIN_NFT_READY',
      editionSize: 100,
      editionsMinted: 42,
      remainingEditions: 58,
      utilityNotes: ['Can be sent in chat', 'Counts toward monthly album completion', 'NFT metadata can be generated later'],
      valueNotes: ['Limited edition supply', 'Can retain collectable value inside the MX vault'],
      traits: { Drop: 'Golden Era', Rarity: 'Rare', Use: 'Chat Sticker' },
    },
  },
  {
    id: 'listing-content-pass-auction',
    assetId: 'creator-content-pass-001',
    listingMode: 'AUCTION',
    priceCredits: 999,
    reservePriceCredits: 1500,
    raffleEntryCredits: 50,
    allowResale: true,
    allowSwap: false,
    status: 'ACTIVE',
    asset: {
      id: 'creator-content-pass-001',
      title: 'Creator Content Pass NFT',
      description: 'Limited content pass for future vault/content unlocks and rewards.',
      assetKind: 'CONTENT_PASS',
      chainMode: 'OFFCHAIN_NFT_READY',
      editionSize: 50,
      editionsMinted: 8,
      remainingEditions: 42,
      utilityNotes: ['Can represent a content bundle', 'Can be attached to subscription perks', 'Can unlock vault sections later'],
      valueNotes: ['Limited edition pass', 'Can be raffled, auctioned, sold, or won'],
      traits: { Section: 'Monetize Content', Rarity: 'Limited', Use: 'Content Pass' },
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

export default function MxNftMarketplaceScreen() {
  const [listings, setListings] = useState([]);
  const [source, setSource] = useState('loading');
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [selectedListing, setSelectedListing] = useState(null);
  const [busyAction, setBusyAction] = useState('');

  useEffect(() => {
    loadListings();
  }, []);

  async function loadListings() {
    setLoading(true);
    try {
      const data = await api('/api/nft-marketplace/listings');
      setListings(data.items || []);
      setSource(data.source || 'api');
    } catch {
      setListings([]);
      setSource('fallback_preview');
    } finally {
      setLoading(false);
    }
  }

  const visibleListings = useMemo(() => {
    const base = listings.length > 0 ? listings : FALLBACK_LISTINGS;
    if (filter === 'ALL') return base;
    return base.filter((listing) => listing.listingMode === filter || listing.asset?.assetKind === filter);
  }, [listings, filter]);

  async function runAction(actionType, listing, payload = {}) {
    const assetId = listing.assetId || listing.asset?.id;
    if (!assetId) return;
    const endpoint = actionType === 'BUY'
      ? `/api/nft-marketplace/assets/${assetId}/buy`
      : actionType === 'BID'
        ? `/api/nft-marketplace/assets/${assetId}/bid`
        : actionType === 'RAFFLE'
          ? `/api/nft-marketplace/assets/${assetId}/raffle-entry`
          : `/api/nft-marketplace/assets/${assetId}/swap-offer`;

    setBusyAction(actionType);
    try {
      const data = await api(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      Alert.alert('NFT action sent', `${actionType} created for ${listing.asset?.title || assetId}.`);
      return data;
    } catch {
      Alert.alert('Preview Mode', `${actionType} is wired, but the backend/API was not reachable from this screen.`);
      return null;
    } finally {
      setBusyAction('');
    }
  }

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.inner}>
        <View style={s.hero}>
          <Text style={s.kicker}>MX DIGITAL ASSETS</Text>
          <Text style={s.title}>NFT MARKETPLACE</Text>
          <Text style={s.sub}>Sell, auction, raffle, swap, win, and collect Mistress-X stickers, content passes, profile cards, trophies, and digital sets.</Text>
          <View style={s.metricRow}>
            <Metric label="Listings" value={visibleListings.length.toString()} />
            <Metric label="Source" value={source} />
            <Metric label="Mode" value={filter} />
          </View>
        </View>

        <View style={s.filterRow}>
          {['ALL', 'SELL_NOW', 'AUCTION', 'RAFFLE', 'ANIMATED_STICKER', 'CONTENT_PASS'].map((item) => (
            <TouchableOpacity key={item} style={[s.filterChip, filter === item && s.filterChipActive]} onPress={() => setFilter(item)}>
              <Text style={[s.filterText, filter === item && s.filterTextActive]}>{item.replace(/_/g, ' ')}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={s.infoBox}>
          <Text style={s.infoTitle}>Listing detail modal active</Text>
          <Text style={s.infoText}>Tap any listing to open a full action panel with Buy, Bid, Raffle Entry, and Swap controls.</Text>
        </View>

        {loading ? (
          <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} />
        ) : (
          <View style={s.grid}>
            {visibleListings.map((listing) => (
              <ListingCard key={listing.id || listing.assetId} listing={listing} onPress={() => setSelectedListing(listing)} />
            ))}
          </View>
        )}
      </ScrollView>

      {selectedListing ? (
        <ListingDetailModal
          listing={selectedListing}
          busyAction={busyAction}
          onClose={() => setSelectedListing(null)}
          onAction={runAction}
        />
      ) : null}
    </View>
  );
}

function Metric({ label, value }) {
  return <View style={s.metricCard}><Text style={s.metricValue}>{value}</Text><Text style={s.metricLabel}>{label}</Text></View>;
}

function ListingCard({ listing, onPress }) {
  const asset = listing.asset || {};
  return (
    <TouchableOpacity style={s.card} onPress={onPress} activeOpacity={0.85}>
      <View style={s.assetIcon}><Text style={s.assetIconText}>{getIcon(asset)}</Text></View>
      <Text style={s.cardTitle} numberOfLines={2}>{asset.title || listing.assetId}</Text>
      <Text style={s.cardMeta}>{String(asset.assetKind || 'DIGITAL_ASSET').replace(/_/g, ' ')}</Text>
      <Text style={s.cardMeta}>{String(listing.listingMode || 'SELL_NOW').replace(/_/g, ' ')}</Text>
      <Text style={s.cardPrice}>{listing.priceCredits || listing.reservePriceCredits || listing.raffleEntryCredits || 0} credits</Text>
      <Text style={s.cardSource}>{listing.status || 'ACTIVE'}</Text>
    </TouchableOpacity>
  );
}

function ListingDetailModal({ listing, busyAction, onClose, onAction }) {
  const asset = listing.asset || {};
  const [bidCredits, setBidCredits] = useState(String(listing.reservePriceCredits || listing.priceCredits || 100));
  const [raffleCredits, setRaffleCredits] = useState(String(listing.raffleEntryCredits || 25));
  const [swapAssetId, setSwapAssetId] = useState('');

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onClose}>
      <View style={m.overlay}>
        <View style={m.sheet}>
          <View style={m.header}>
            <View style={m.bigIcon}><Text style={m.bigIconText}>{getIcon(asset)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={m.kicker}>{String(listing.listingMode || 'SELL_NOW').replace(/_/g, ' ')}</Text>
              <Text style={m.title}>{asset.title || listing.assetId}</Text>
              <Text style={m.sub}>{String(asset.assetKind || 'DIGITAL_ASSET').replace(/_/g, ' ')} • {asset.chainMode || 'PLATFORM_COLLECTIBLE'}</Text>
            </View>
            <TouchableOpacity style={m.closeButton} onPress={onClose}><Text style={m.closeText}>×</Text></TouchableOpacity>
          </View>

          <ScrollView style={m.body}>
            <Text style={m.description}>{asset.description || 'Mistress-X digital asset.'}</Text>
            <View style={m.detailGrid}>
              <SmallStat label="Price" value={`${listing.priceCredits || 0} cr`} />
              <SmallStat label="Reserve" value={`${listing.reservePriceCredits || 0} cr`} />
              <SmallStat label="Raffle" value={`${listing.raffleEntryCredits || 0} cr`} />
              <SmallStat label="Remaining" value={`${asset.remainingEditions ?? '—'}`} />
            </View>

            <Section title="Utility" items={asset.utilityNotes || []} />
            <Section title="Value notes" items={asset.valueNotes || []} />

            <Text style={m.sectionTitle}>Actions</Text>
            <TouchableOpacity style={m.primaryButton} disabled={busyAction === 'BUY'} onPress={() => onAction('BUY', listing, { credits: Number(listing.priceCredits || 0), note: 'Buy now from marketplace detail modal' })}>
              <Text style={m.primaryText}>{busyAction === 'BUY' ? 'BUYING…' : `BUY NOW • ${listing.priceCredits || 0} CREDITS`}</Text>
            </TouchableOpacity>

            <View style={m.inputRow}>
              <TextInput style={m.input} value={bidCredits} onChangeText={setBidCredits} keyboardType="number-pad" placeholder="Bid credits" placeholderTextColor="#6c5877" />
              <TouchableOpacity style={m.secondaryButton} disabled={busyAction === 'BID'} onPress={() => onAction('BID', listing, { credits: Number(bidCredits || 0), note: 'Bid from marketplace detail modal' })}>
                <Text style={m.secondaryText}>{busyAction === 'BID' ? 'BIDDING…' : 'BID'}</Text>
              </TouchableOpacity>
            </View>

            <View style={m.inputRow}>
              <TextInput style={m.input} value={raffleCredits} onChangeText={setRaffleCredits} keyboardType="number-pad" placeholder="Entry credits" placeholderTextColor="#6c5877" />
              <TouchableOpacity style={m.secondaryButton} disabled={busyAction === 'RAFFLE'} onPress={() => onAction('RAFFLE', listing, { credits: Number(raffleCredits || 0), note: 'Raffle entry from marketplace detail modal' })}>
                <Text style={m.secondaryText}>{busyAction === 'RAFFLE' ? 'ENTERING…' : 'RAFFLE ENTRY'}</Text>
              </TouchableOpacity>
            </View>

            <View style={m.inputRow}>
              <TextInput style={m.input} value={swapAssetId} onChangeText={setSwapAssetId} placeholder="Owned asset id to offer" placeholderTextColor="#6c5877" autoCapitalize="none" />
              <TouchableOpacity style={m.secondaryButton} disabled={busyAction === 'SWAP'} onPress={() => onAction('SWAP', listing, { offeredAssetId: swapAssetId, note: 'Swap offer from marketplace detail modal' })}>
                <Text style={m.secondaryText}>{busyAction === 'SWAP' ? 'OFFERING…' : 'SWAP'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SmallStat({ label, value }) {
  return <View style={m.smallStat}><Text style={m.smallValue}>{value}</Text><Text style={m.smallLabel}>{label}</Text></View>;
}

function Section({ title, items }) {
  if (!items || items.length === 0) return null;
  return <View style={m.section}><Text style={m.sectionTitle}>{title}</Text>{items.map((item) => <Text key={item} style={m.bullet}>• {item}</Text>)}</View>;
}

function getIcon(asset) {
  const kind = asset.assetKind;
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
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 12, padding: 12, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginBottom: 14 },
  infoTitle: { color: '#d4af37', fontWeight: '900', marginBottom: 4 },
  infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 17 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: { width: '47%', borderRadius: 18, borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', backgroundColor: 'rgba(255,255,255,0.03)', padding: 12 },
  assetIcon: { height: 82, borderRadius: 14, backgroundColor: 'rgba(212,175,55,0.09)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.18)', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  assetIconText: { fontSize: 34 },
  cardTitle: { color: '#fff', fontSize: 13, fontWeight: '900', minHeight: 34 },
  cardMeta: { color: '#c9a8d4', fontSize: 10, marginTop: 4 },
  cardPrice: { color: '#d4af37', fontSize: 11, fontWeight: '900', marginTop: 6 },
  cardSource: { color: '#22c55e', fontSize: 9, fontWeight: '900', marginTop: 4 },
});

const m = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(8,4,16,0.92)', justifyContent: 'flex-end' },
  sheet: { maxHeight: '92%', backgroundColor: '#0d0618', borderTopLeftRadius: 24, borderTopRightRadius: 24, borderWidth: 1, borderColor: 'rgba(212,175,55,0.24)' },
  header: { flexDirection: 'row', gap: 12, padding: 18, borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.12)' },
  bigIcon: { width: 62, height: 62, borderRadius: 18, backgroundColor: 'rgba(212,175,55,0.10)', alignItems: 'center', justifyContent: 'center' },
  bigIconText: { fontSize: 32 },
  kicker: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  title: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 4 },
  sub: { color: '#c9a8d4', fontSize: 11, marginTop: 4 },
  closeButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.06)' },
  closeText: { color: '#fff', fontSize: 22 },
  body: { padding: 18 },
  description: { color: '#c9a8d4', fontSize: 13, lineHeight: 19, marginBottom: 12 },
  detailGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  smallStat: { width: '47%', borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.04)', padding: 10 },
  smallValue: { color: '#fff', fontWeight: '900' },
  smallLabel: { color: '#c9a8d4', fontSize: 10, marginTop: 2 },
  section: { marginTop: 10 },
  sectionTitle: { color: '#d4af37', fontSize: 12, fontWeight: '900', letterSpacing: 1.5, marginBottom: 6, marginTop: 10 },
  bullet: { color: '#c9a8d4', fontSize: 12, lineHeight: 18 },
  primaryButton: { backgroundColor: '#d4af37', borderRadius: 12, padding: 13, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#080410', fontWeight: '900', fontSize: 12 },
  inputRow: { flexDirection: 'row', gap: 8, marginTop: 9 },
  input: { flex: 1, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.22)', backgroundColor: 'rgba(255,255,255,0.04)', color: '#fff', paddingHorizontal: 10, paddingVertical: 9 },
  secondaryButton: { minWidth: 112, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.35)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 10 },
  secondaryText: { color: '#d4af37', fontWeight: '900', fontSize: 10 },
});
