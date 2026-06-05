import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';

export default function CommandCentreScreen() {
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState({});
  const [users, setUsers] = useState([]);
  const [modQueue, setModQueue] = useState([]);
  const [auditLog, setAuditLog] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [tab]);

  async function load() {
    setLoading(true);
    try {
      if (tab === 'stats') {
        const s = await fetch('/api/headmistress/stats').then(r => r.json());
        setStats(s);
      } else if (tab === 'users') {
        const u = await fetch('/api/headmistress/users').then(r => r.json());
        setUsers(u.items ?? []);
      } else if (tab === 'moderation') {
        const m = await fetch('/api/headmistress/moderation').then(r => r.json());
        setModQueue(m.items ?? []);
      } else {
        const a = await fetch('/api/headmistress/audit-log').then(r => r.json());
        setAuditLog(a.items ?? []);
      }
    } catch {} finally { setLoading(false); }
  }

  async function resolve(id, action) {
    await fetch(`/api/headmistress/moderation/${id}/resolve`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
    Alert.alert(`✦ Item ${action}`); load();
  }

  const TABS = ['stats', 'users', 'moderation', 'audit'];

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>COMMAND CENTRE</Text>
      <Text style={s.sub}>Headmistress Control Panel</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.tabScroll}>
        {TABS.map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : (
        <>
          {tab === 'stats' && (
            <View>
              <View style={s.statsGrid}>
                {[['Total Users', stats.totalUsers], ['Open Mod Items', stats.openModerationItems]].map(([label, val]) => (
                  <View key={label} style={s.statCard}><Text style={s.statNum}>{val ?? 0}</Text><Text style={s.statLabel}>{label}</Text></View>
                ))}
              </View>
              <Text style={s.metaText}>Last updated: {stats.generatedAt ? new Date(stats.generatedAt).toLocaleString() : '—'}</Text>
            </View>
          )}

          {tab === 'users' && users.map(u => (
            <View key={u.id} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowPrimary}>{u.email}</Text>
                <Text style={s.rowSec}>{u.role} · {u.status}</Text>
              </View>
              <Text style={s.rowDate}>{new Date(u.createdAt).toLocaleDateString()}</Text>
            </View>
          ))}

          {tab === 'moderation' && modQueue.map(item => (
            <View key={item.id} style={s.modCard}>
              <Text style={s.modTitle}>{item.area ?? 'GENERAL'} — {item.priority ?? 'MEDIUM'}</Text>
              <Text style={s.modDesc}>{item.description ?? item.reason ?? 'No description'}</Text>
              <View style={s.modActions}>
                <TouchableOpacity style={s.resolveBtn} onPress={() => resolve(item.id, 'RESOLVED')}><Text style={s.resolveBtnText}>✓ Resolve</Text></TouchableOpacity>
                <TouchableOpacity style={s.dismissBtn} onPress={() => resolve(item.id, 'DISMISSED')}><Text style={s.dismissBtnText}>Dismiss</Text></TouchableOpacity>
              </View>
            </View>
          ))}

          {tab === 'audit' && auditLog.map(log => (
            <View key={log.id} style={s.row}>
              <View style={{ flex: 1 }}>
                <Text style={s.rowPrimary}>{log.action}</Text>
                <Text style={s.rowSec}>{log.entity} · {log.userId}</Text>
              </View>
              <Text style={s.rowDate}>{new Date(log.createdAt).toLocaleDateString()}</Text>
            </View>
          ))}

          {(tab === 'users' && users.length === 0) || (tab === 'moderation' && modQueue.length === 0) || (tab === 'audit' && auditLog.length === 0) ? (
            <Text style={s.empty}>No items to display.</Text>
          ) : null}
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0d0618' }, inner: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 20, fontWeight: '700', color: '#d4af37', letterSpacing: 4 }, sub: { color: '#c9a8d4', fontSize: 11, marginBottom: 16 },
  tabScroll: { marginBottom: 20 },
  tab: { paddingHorizontal: 16, paddingVertical: 10, marginRight: 4, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)' },
  tabActive: { backgroundColor: 'rgba(212,175,55,0.15)', borderColor: '#d4af37' },
  tabText: { color: 'rgba(201,168,212,0.5)', fontSize: 11, letterSpacing: 1 }, tabTextActive: { color: '#d4af37', fontWeight: '700' },
  statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: { flex: 1, backgroundColor: 'rgba(212,175,55,0.08)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 12, padding: 20, alignItems: 'center' },
  statNum: { color: '#d4af37', fontSize: 28, fontWeight: '700' }, statLabel: { color: '#c9a8d4', fontSize: 11, marginTop: 4, textAlign: 'center' },
  metaText: { color: 'rgba(201,168,212,0.4)', fontSize: 11 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', marginBottom: 8 },
  rowPrimary: { color: '#fff', fontWeight: '600', fontSize: 13 }, rowSec: { color: '#c9a8d4', fontSize: 11 }, rowDate: { color: 'rgba(201,168,212,0.4)', fontSize: 11 },
  modCard: { backgroundColor: 'rgba(255,63,127,0.05)', borderWidth: 1, borderColor: 'rgba(255,63,127,0.2)', borderRadius: 12, padding: 16, marginBottom: 10 },
  modTitle: { color: '#ff3f7f', fontWeight: '700', fontSize: 12, letterSpacing: 1, marginBottom: 6 }, modDesc: { color: '#c9a8d4', fontSize: 13, marginBottom: 12 },
  modActions: { flexDirection: 'row', gap: 10 },
  resolveBtn: { flex: 1, padding: 10, borderRadius: 8, backgroundColor: '#22c55e', alignItems: 'center' }, resolveBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  dismissBtn: { flex: 1, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(201,168,212,0.3)', alignItems: 'center' }, dismissBtnText: { color: '#c9a8d4', fontWeight: '600', fontSize: 12 },
  empty: { color: 'rgba(201,168,212,0.4)', textAlign: 'center', paddingVertical: 40 },
});
