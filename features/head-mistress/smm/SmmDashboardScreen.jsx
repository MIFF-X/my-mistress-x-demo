import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

const PLATFORMS = ['Blogger', 'Instagram', 'Twitter', 'TikTok', 'OnlyFans'];

export default function SmmDashboardScreen() {
  const [tab, setTab] = useState('dashboard');
  const [stats, setStats] = useState({ totalPosts: 0, scheduled: 0, platforms: [] });
  const [configs, setConfigs] = useState([]);
  const [platform, setPlatform] = useState('Blogger');
  const [apiKey, setApiKey] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const [s, c] = await Promise.all([fetch('/api/smm/dashboard').then(r => r.json()), fetch('/api/smm/configs').then(r => r.json())]);
      setStats(s); setConfigs(c.items ?? []);
    } catch {}
  }

  async function saveConfig() {
    if (!apiKey) { Alert.alert('API key required.'); return; }
    await fetch('/api/smm/configs', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, apiKey }) });
    Alert.alert('✦ Platform connected!'); load(); setApiKey('');
  }

  async function postContent() {
    if (!content) { Alert.alert('Content required.'); return; }
    const result = await fetch('/api/smm/post', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ platform, content }) }).then(r => r.json()).catch(e => ({ error: e.message }));
    if (result.error) Alert.alert('Error', result.error);
    else Alert.alert('✦ Posted!', `Published to ${platform}`);
    setContent('');
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>SMM COMMAND</Text>
      <Text style={s.sub}>Social Media & Content Management</Text>
      <View style={s.tabs}>
        {['dashboard', 'connect', 'post'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'dashboard' && (
        <View>
          <View style={s.statsRow}>
            <View style={s.statCard}><Text style={s.statNum}>{stats.totalPosts}</Text><Text style={s.statLabel}>Total Posts</Text></View>
            <View style={s.statCard}><Text style={s.statNum}>{stats.scheduled}</Text><Text style={s.statLabel}>Scheduled</Text></View>
            <View style={s.statCard}><Text style={s.statNum}>{stats.platforms?.length ?? 0}</Text><Text style={s.statLabel}>Platforms</Text></View>
          </View>
          <Text style={s.sectionLabel}>Connected Platforms</Text>
          {configs.length === 0 && <Text style={s.empty}>No platforms connected yet.</Text>}
          {configs.map(c => (
            <View key={c.platform} style={s.platformRow}>
              <Text style={s.platformName}>{c.platform}</Text>
              <View style={s.connectedDot} /><Text style={s.connectedText}>Connected</Text>
            </View>
          ))}
        </View>
      )}

      {tab === 'connect' && (
        <View>
          <Text style={s.sectionLabel}>Platform</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.platformScroll}>
            {PLATFORMS.map(p => (
              <TouchableOpacity key={p} style={[s.platformChip, platform === p && s.platformChipActive]} onPress={() => setPlatform(p)}>
                <Text style={[s.platformChipText, platform === p && s.platformChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={s.sectionLabel}>API Key / Token</Text>
          <TextInput style={s.input} value={apiKey} onChangeText={setApiKey} placeholder={`${platform} API key...`} placeholderTextColor="#4a3060" secureTextEntry />
          <TouchableOpacity style={s.btn} onPress={saveConfig}><Text style={s.btnText}>✦ Connect Platform</Text></TouchableOpacity>
        </View>
      )}

      {tab === 'post' && (
        <View>
          <Text style={s.sectionLabel}>Post To</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.platformScroll}>
            {PLATFORMS.map(p => (
              <TouchableOpacity key={p} style={[s.platformChip, platform === p && s.platformChipActive]} onPress={() => setPlatform(p)}>
                <Text style={[s.platformChipText, platform === p && s.platformChipTextActive]}>{p}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <Text style={s.sectionLabel}>Content</Text>
          <TextInput style={[s.input, s.textarea]} value={content} onChangeText={setContent} placeholder="Write your post..." placeholderTextColor="#4a3060" multiline numberOfLines={6} />
          <TouchableOpacity style={s.btn} onPress={postContent}><Text style={s.btnText}>🚀 Post Now</Text></TouchableOpacity>
        </View>
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
  statsRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  statCard: { flex: 1, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 12, padding: 16, alignItems: 'center' },
  statNum: { color: '#d4af37', fontSize: 24, fontWeight: '700' }, statLabel: { color: '#c9a8d4', fontSize: 10, marginTop: 4, letterSpacing: 1 },
  sectionLabel: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 10, marginTop: 8 },
  platformScroll: { marginBottom: 16 }, platformRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', marginBottom: 8, gap: 10 },
  platformName: { color: '#fff', fontWeight: '600', flex: 1 },
  connectedDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#22c55e' }, connectedText: { color: '#22c55e', fontSize: 11 },
  platformChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', marginRight: 8 },
  platformChipActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  platformChipText: { color: '#c9a8d4', fontSize: 12 }, platformChipTextActive: { color: '#d4af37', fontWeight: '700' },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 12 },
  textarea: { height: 120, textAlignVertical: 'top' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#d4af37', alignItems: 'center' },
  btnText: { color: '#0d0618', fontWeight: '700', letterSpacing: 2 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 20 },
});
