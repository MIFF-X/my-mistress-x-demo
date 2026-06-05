import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';

export default function StylingMarketplaceScreen() {
  const [tab, setTab] = useState('browse');
  const [packs, setPacks] = useState([]);
  const [installed, setInstalled] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'installed') {
        const data = await fetch('/api/style-packs/installed').then(r => r.json());
        setInstalled(data.items ?? []);
      } else {
        const data = await fetch('/api/style-packs').then(r => r.json());
        setPacks(data.items ?? []);
      }
    } catch {} finally { setLoading(false); }
  }

  async function installPack(id, name) {
    await fetch(`/api/style-packs/${id}/install`, { method: 'POST' });
    Alert.alert('✦ Installed!', `${name} has been applied to your profile.`);
    load();
  }

  const TIER_COLORS = { FREE: '#22c55e', PREMIUM: '#d4af37', EXCLUSIVE: '#ff3f7f' };

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>STYLING PACKS</Text>
      <Text style={s.sub}>Customize your Mistress-X experience</Text>
      <View style={s.tabs}>
        {['browse', 'installed'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : (
        (tab === 'browse' ? packs : installed.map(i => i.pack ?? i)).map(pack => (
          <View key={pack?.id} style={s.packCard}>
            <View style={s.packHeader}>
              <Text style={s.packName}>{pack?.name ?? 'Pack'}</Text>
              <View style={[s.tierBadge, { backgroundColor: (TIER_COLORS[pack?.tier] ?? '#c9a8d4') + '22', borderColor: TIER_COLORS[pack?.tier] ?? '#c9a8d4' }]}>
                <Text style={[s.tierText, { color: TIER_COLORS[pack?.tier] ?? '#c9a8d4' }]}>{pack?.tier ?? 'FREE'}</Text>
              </View>
            </View>
            {pack?.description && <Text style={s.packDesc}>{pack.description}</Text>}
            <View style={s.packMeta}>
              {pack?.priceCents > 0 ? <Text style={s.packPrice}>${(pack.priceCents / 100).toFixed(2)}</Text> : <Text style={s.packFree}>FREE</Text>}
            </View>
            {tab === 'browse' && (
              <TouchableOpacity style={s.installBtn} onPress={() => installPack(pack?.id, pack?.name)}>
                <Text style={s.installText}>✦ Install Pack</Text>
              </TouchableOpacity>
            )}
            {tab === 'installed' && <Text style={s.installedBadge}>✓ Installed</Text>}
          </View>
        ))
      )}
      {!loading && (tab === 'browse' ? packs : installed).length === 0 && (
        <Text style={s.empty}>{tab === 'browse' ? 'No packs available yet.' : 'No packs installed.'}</Text>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#d4af37', letterSpacing: 4 }, sub: { color: '#c9a8d4', fontSize: 11, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  packCard: { backgroundColor: 'rgba(255,255,255,0.03)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.15)', borderRadius: 14, padding: 18, marginBottom: 12 },
  packHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  packName: { color: '#fff', fontWeight: '700', fontSize: 15, flex: 1 },
  tierBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 }, tierText: { fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  packDesc: { color: '#c9a8d4', fontSize: 12, marginBottom: 10 },
  packMeta: { flexDirection: 'row', marginBottom: 12 },
  packPrice: { color: '#d4af37', fontWeight: '700', fontSize: 14 }, packFree: { color: '#22c55e', fontWeight: '700', fontSize: 12 },
  installBtn: { padding: 12, borderRadius: 10, backgroundColor: '#8b1e5a', alignItems: 'center' },
  installText: { color: '#fff', fontWeight: '700', letterSpacing: 1 },
  installedBadge: { color: '#22c55e', fontWeight: '700', fontSize: 12 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
