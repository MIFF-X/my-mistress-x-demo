import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, ActivityIndicator } from 'react-native';

const CONTROL_ACTIONS = ['BLOCK', 'BAN', 'WARNING', 'MUTE', 'RESTRICT', 'INVISIBLE'];

export default function ComplianceScreen() {
  const [tab, setTab] = useState('report');
  const [report, setReport] = useState({});
  const [targetUserId, setTargetUserId] = useState('');
  const [action, setAction] = useState('WARNING');
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadReport(); }, []);

  async function loadReport() {
    setLoading(true);
    try {
      const r = await fetch('/api/compliance/report').then(res => res.json());
      setReport(r);
    } catch {} finally { setLoading(false); }
  }

  async function applyControl() {
    if (!targetUserId) { Alert.alert('User ID required.'); return; }
    await fetch('/api/compliance/controls', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ targetUserId, action }) });
    Alert.alert('✦ Control Applied', `${action} applied to user ${targetUserId}.`);
    setTargetUserId('');
  }

  return (
    <ScrollView style={s.screen} contentContainerStyle={s.inner}>
      <Text style={s.title}>COMPLIANCE SHIELD</Text>
      <Text style={s.sub}>Platform integrity & consent management</Text>
      <View style={s.tabs}>
        {['report', 'controls', 'consent'].map(t => (
          <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
            <Text style={[s.tabText, tab === t && s.tabTextActive]}>{t.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'report' && (
        loading ? <ActivityIndicator color="#d4af37" style={{ marginTop: 30 }} /> : (
          <View>
            {[['Total Users', report.totalUsers], ['Audit Log Entries', report.auditLogEntries], ['Open Mod Items', report.openModerationItems]].map(([label, val]) => (
              <View key={label} style={s.reportRow}>
                <Text style={s.reportLabel}>{label}</Text>
                <Text style={s.reportVal}>{val ?? 0}</Text>
              </View>
            ))}
            <View style={s.infoBox}>
              <Text style={s.infoText}>Report generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : '—'}</Text>
            </View>
            <TouchableOpacity style={s.refreshBtn} onPress={loadReport}><Text style={s.refreshText}>↻ Refresh Report</Text></TouchableOpacity>
          </View>
        )
      )}

      {tab === 'controls' && (
        <View>
          <Text style={s.label}>Target User ID</Text>
          <TextInput style={s.input} value={targetUserId} onChangeText={setTargetUserId} placeholder="User ID..." placeholderTextColor="#4a3060" />
          <Text style={s.label}>Action</Text>
          <View style={s.actionGrid}>
            {CONTROL_ACTIONS.map(a => (
              <TouchableOpacity key={a} style={[s.actionChip, action === a && s.actionChipActive]} onPress={() => setAction(a)}>
                <Text style={[s.actionText, action === a && s.actionTextActive]}>{a}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.btn} onPress={applyControl}><Text style={s.btnText}>⚡ Apply Control</Text></TouchableOpacity>
        </View>
      )}

      {tab === 'consent' && (
        <View>
          <View style={s.infoBox}>
            <Text style={s.infoTitle}>Consent Framework</Text>
            <Text style={s.infoText}>All user interactions on Mistress-X require explicit, informed consent. Consent is logged, versioned, and revocable at any time. The platform enforces consent checks at the service layer for all sensitive operations.</Text>
          </View>
          <View style={s.consentItem}>
            <Text style={s.consentIcon}>✓</Text>
            <Text style={s.consentLabel}>Terms of Service — v1.0</Text>
          </View>
          <View style={s.consentItem}>
            <Text style={s.consentIcon}>✓</Text>
            <Text style={s.consentLabel}>Age Verification — 18+ enforced</Text>
          </View>
          <View style={s.consentItem}>
            <Text style={s.consentIcon}>✓</Text>
            <Text style={s.consentLabel}>Content Consent — Explicit opt-in per feature</Text>
          </View>
          <View style={s.consentItem}>
            <Text style={s.consentIcon}>✓</Text>
            <Text style={s.consentLabel}>Data Retention — 90 day audit logs</Text>
          </View>
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
  reportRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(212,175,55,0.1)', marginBottom: 8 },
  reportLabel: { color: '#c9a8d4', fontSize: 13 }, reportVal: { color: '#d4af37', fontWeight: '700', fontSize: 18 },
  infoBox: { backgroundColor: 'rgba(212,175,55,0.06)', borderRadius: 10, padding: 16, borderLeftWidth: 3, borderLeftColor: '#d4af37', marginVertical: 12 },
  infoTitle: { color: '#d4af37', fontWeight: '700', marginBottom: 8 }, infoText: { color: '#c9a8d4', fontSize: 12, lineHeight: 18 },
  refreshBtn: { padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(212,175,55,0.3)', alignItems: 'center' },
  refreshText: { color: '#d4af37', fontWeight: '600' },
  label: { color: '#d4af37', fontSize: 10, letterSpacing: 2, fontWeight: '700', textTransform: 'uppercase', marginBottom: 8, marginTop: 12 },
  input: { backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.2)', borderRadius: 8, padding: 12, color: '#fff', marginBottom: 16 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  actionChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,63,127,0.3)' },
  actionChipActive: { backgroundColor: 'rgba(255,63,127,0.15)', borderColor: '#ff3f7f' },
  actionText: { color: '#c9a8d4', fontSize: 11, fontWeight: '600' }, actionTextActive: { color: '#ff3f7f' },
  btn: { padding: 14, borderRadius: 10, backgroundColor: '#ff3f7f', alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700', letterSpacing: 2 },
  consentItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 10, borderWidth: 1, borderColor: 'rgba(34,197,94,0.2)', marginBottom: 8, gap: 12 },
  consentIcon: { color: '#22c55e', fontWeight: '700', fontSize: 16 }, consentLabel: { color: '#c9a8d4', fontSize: 13 },
});
