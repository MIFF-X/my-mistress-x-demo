import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';

const BADGE_ICONS = { VERIFIED: '✓', TRUSTED: '🛡', TOP_EARNER: '💰', HALL_OF_FAME: '🏆', LOYAL_SUB: '🎀' };

export default function BadgesScreen() {
  const [tab, setTab] = useState('my-badges');
  const [badges, setBadges] = useState([]);
  const [allBadges, setAllBadges] = useState([]);
  const [hofItems, setHofItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'my-badges') {
        const [mine, all] = await Promise.all([fetch('/api/recognition/me').then(r => r.json()), fetch('/api/recognition/badges').then(r => r.json())]);
        setBadges(mine.badges ?? []);
        setAllBadges(all.items ?? []);
      } else {
        const data = await fetch('/api/recognition/hall-of-fame').then(r => r.json());
        setHofItems(data.items ?? []);
      }
    } catch {} finally { setLoading(false); }
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>BADGES & AWARDS</Text>
      <View style={s.tabs}>
        {['my-badges', 'hall-of-fame'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.replace(/-/g,' ').toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : (
        tab === 'my-badges' ? (
          <View>
            <Text style={s.sectionLabel}>Your Badges</Text>
            {badges.length === 0 && <Text style={s.empty}>No badges earned yet. Keep going! ✦</Text>}
            <View style={s.badgeGrid}>
              {badges.map((b, i) => (
                <View key={i} style={s.badgeCard}>
                  <Text style={s.badgeIcon}>{BADGE_ICONS[b.id] ?? '🏅'}</Text>
                  <Text style={s.badgeLabel}>{b.label}</Text>
                  <Text style={s.badgeDesc}>{b.description}</Text>
                </View>
              ))}
            </View>
            <Text style={s.sectionLabel}>Available Badges</Text>
            {allBadges.map(b => (
              <View key={b.id} style={[s.row, badges.find(x => x.id === b.id) && s.rowEarned]}>
                <Text style={s.rowIcon}>{BADGE_ICONS[b.id] ?? '🏅'}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.rowLabel}>{b.label}</Text>
                  <Text style={s.rowDesc}>{b.description}</Text>
                </View>
                {badges.find(x => x.id === b.id) && <Text style={s.earned}>✓ Earned</Text>}
              </View>
            ))}
          </View>
        ) : (
          <View>
            {hofItems.length === 0 && <Text style={s.empty}>Hall of Fame is empty for now.</Text>}
            {hofItems.map((item, i) => (
              <View key={i} style={s.hofCard}>
                <Text style={s.hofRank}>#{i + 1}</Text>
                <Text style={s.hofUser}>{item.userId}</Text>
                <Text style={s.hofIcon}>🏆</Text>
              </View>
            ))}
          </View>
        )
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#d4af37', letterSpacing: 4, marginBottom: 16 },
  tabs: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(212,175,55,0.15)', marginBottom: 20 },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' }, tabActive: { borderBottomWidth: 2, borderBottomColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  sectionLabel: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, marginTop: 8 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  badgeCard: { backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: '#d4af37', borderRadius: 14, padding: 16, alignItems: 'center', width: '47%' },
  badgeIcon: { fontSize: 28, marginBottom: 8 }, badgeLabel: { color: '#d4af37', fontWeight: '700', fontSize: 12, textAlign: 'center', marginBottom: 4 },
  badgeDesc: { color: '#c9a8d4', fontSize: 10, textAlign: 'center' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', marginBottom: 8, gap: 12 },
  rowEarned: { borderColor: 'rgba(212,175,55,0.4)', backgroundColor: 'rgba(212,175,55,0.05)' },
  rowIcon: { fontSize: 20 }, rowLabel: { color: '#fff', fontWeight: '600', fontSize: 13 }, rowDesc: { color: '#c9a8d4', fontSize: 11 },
  earned: { color: '#22c55e', fontSize: 11, fontWeight: '700' },
  hofCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', marginBottom: 8, gap: 12 },
  hofRank: { color: '#d4af37', fontWeight: '700', fontSize: 16, width: 32 }, hofUser: { color: '#fff', flex: 1 }, hofIcon: { fontSize: 20 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
