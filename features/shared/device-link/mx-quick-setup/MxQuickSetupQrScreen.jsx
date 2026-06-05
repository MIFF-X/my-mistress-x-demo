import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { approveQuickSetupPairing, createQuickSetupPairing } from './mx-quick-setup-api.js';
import ConnectedDevicesPanel from './ConnectedDevicesPanel.jsx';

const DEVICE_TABS = [
  { id: 'ios', label: 'iOS', platform: 'IOS' },
  { id: 'android', label: 'Android', platform: 'ANDROID' },
];

const SETUP_STEPS = [
  ['Pick up where you left off', 'Continue setup, chat, dashboard, or plugin work from another device.'],
  ['Stay in the loop', 'Get notified when setup needs approval or a plugin action needs attention.'],
  ['Start something new', 'Use the paired device to launch quick setup flows or MX Stream Deck actions.'],
];

function makeMatrix(seed, size = 17) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  const finders = [{ x: 0, y: 0 }, { x: size - 5, y: 0 }, { x: 0, y: size - 5 }];

  return Array.from({ length: size }, (_, y) => (
    Array.from({ length: size }, (_, x) => {
      const zone = finders.find(f => x >= f.x && x < f.x + 5 && y >= f.y && y < f.y + 5);
      if (zone) {
        const lx = x - zone.x;
        const ly = y - zone.y;
        return lx === 0 || ly === 0 || lx === 4 || ly === 4 || (lx >= 2 && lx <= 3 && ly >= 2 && ly <= 3);
      }
      const value = (hash + x * 13 + y * 17 + x * y * 7 + (x ^ y) * 19) % 11;
      return [0, 2, 5, 8].includes(value);
    })
  ));
}

function QrPreview({ payload, loading }) {
  const matrix = useMemo(() => makeMatrix(payload), [payload]);
  return (
    <View style={s.qrFrame}>
      <View style={s.qrGrid}>
        {matrix.map((row, rowIndex) => (
          <View key={`r-${rowIndex}`} style={s.qrRow}>
            {row.map((cell, colIndex) => (
              <View key={`c-${rowIndex}-${colIndex}`} style={[s.qrDot, cell && s.qrDotOn]} />
            ))}
          </View>
        ))}
      </View>
      <View style={s.qrBadge}>{loading ? <ActivityIndicator color="#fff" /> : <Text style={s.qrBadgeText}>MX</Text>}</View>
    </View>
  );
}

function fallbackPairing(device) {
  const platform = DEVICE_TABS.find(tab => tab.id === device)?.platform || 'IOS';
  const code = platform === 'ANDROID' ? 'MX-PAIR-A9D2' : 'MX-PAIR-7K92';
  return {
    pairingCode: code,
    pairingUrl: `mx://setup/pair?code=${code}&platform=${platform}&surface=mx-stream-deck`,
    ttlSeconds: 600,
    devicePlatform: platform,
    expiresAt: null,
    id: null,
  };
}

export default function MxQuickSetupQrScreen() {
  const [device, setDevice] = useState('ios');
  const [pairing, setPairing] = useState(() => fallbackPairing('ios'));
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [error, setError] = useState('');

  const activeTab = DEVICE_TABS.find(tab => tab.id === device) || DEVICE_TABS[0];
  const payload = `${pairing?.pairingUrl || fallbackPairing(device).pairingUrl}&device=${device}`;
  const setupCode = pairing?.pairingCode || fallbackPairing(device).pairingCode;

  useEffect(() => {
    generatePairing(device);
  }, [device]);

  async function generatePairing(nextDevice = device) {
    const tab = DEVICE_TABS.find(item => item.id === nextDevice) || DEVICE_TABS[0];
    setLoading(true);
    setApproved(false);
    setError('');

    try {
      const record = await createQuickSetupPairing({
        devicePlatform: tab.platform,
        deviceLabel: `${tab.label} companion device`,
        redirectSurface: 'mx-stream-deck',
        requestedFrom: 'mx-quick-setup-qr',
      });
      setPairing(record);
    } catch (err) {
      setPairing(fallbackPairing(nextDevice));
      setError(err.message || 'Using local setup preview until backend auth is available.');
    } finally {
      setLoading(false);
    }
  }

  async function approveDevice() {
    if (!pairing) return;
    setApproving(true);
    setError('');

    try {
      await approveQuickSetupPairing({
        tokenId: pairing.id,
        pairingCode: pairing.pairingCode,
        devicePlatform: activeTab.platform,
        deviceLabel: `${activeTab.label} companion device`,
        metadata: { approvedFrom: 'mx-quick-setup-qr' },
      });
      setApproved(true);
      Alert.alert('MX Quick Setup', 'Device approved and linked.');
    } catch (err) {
      setApproved(false);
      setError(err.message || 'Device approval is waiting for backend auth.');
      Alert.alert('MX Quick Setup', err.message || 'Device approval is waiting for backend auth.');
    } finally {
      setApproving(false);
    }
  }

  return (
    <View style={s.screen}>
      <ScrollView contentContainerStyle={s.inner}>
        <View style={s.header}>
          <Text style={s.eyebrow}>DEVICE LINK</Text>
          <Text style={s.title}>MX QUICK SETUP QR</Text>
          <Text style={s.sub}>Scan-to-pair setup for phones, tablets, desktop helpers, Codex handoff, and quick plugin onboarding.</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Approve on your device</Text>
          <Text style={s.cardSub}>Scan to open Mistress-X setup in the mobile app or companion device.</Text>

          <View style={s.deviceTabs}>
            {DEVICE_TABS.map(tab => (
              <TouchableOpacity key={tab.id} style={[s.deviceTab, device === tab.id && s.deviceTabActive]} onPress={() => setDevice(tab.id)}>
                <Text style={[s.deviceText, device === tab.id && s.deviceTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <QrPreview payload={payload} loading={loading} />

          <View style={s.codePanel}>
            <Text style={s.codeLabel}>Manual setup code</Text>
            <Text style={s.code}>{setupCode}</Text>
            <Text style={s.payload} numberOfLines={1}>{payload}</Text>
            {pairing?.ttlSeconds ? <Text style={s.expiry}>Expires in {Math.ceil(pairing.ttlSeconds / 60)} minutes</Text> : null}
          </View>

          {error ? <Text style={s.errorText}>{error}</Text> : null}

          <View style={s.actionRow}>
            <TouchableOpacity style={[s.secondaryButton, loading && s.buttonDisabled]} onPress={() => generatePairing(device)} disabled={loading}>
              <Text style={s.secondaryButtonText}>{loading ? 'REFRESHING...' : 'REFRESH QR'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.primaryButton, approving && s.buttonDisabled]} onPress={approveDevice} disabled={approving}>
              <Text style={s.primaryButtonText}>{approved ? 'DEVICE APPROVED' : approving ? 'APPROVING...' : 'APPROVE DEVICE'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.stepsCard}>
          <Text style={s.sectionTitle}>What this unlocks</Text>
          {SETUP_STEPS.map(([title, body]) => (
            <View key={title} style={s.stepRow}>
              <View style={s.stepIcon}><Text style={s.stepIconText}>✦</Text></View>
              <View style={{ flex: 1 }}>
                <Text style={s.stepTitle}>{title}</Text>
                <Text style={s.stepBody}>{body}</Text>
              </View>
            </View>
          ))}
        </View>

        <ConnectedDevicesPanel />

        <View style={s.securityCard}>
          <Text style={s.sectionTitle}>Security rules</Text>
          <Text style={s.securityLine}>• Pairing codes expire and must be single-use.</Text>
          <Text style={s.securityLine}>• New devices require visible approval from the signed-in account.</Text>
          <Text style={s.securityLine}>• Sensitive actions still require confirmation.</Text>
          <Text style={s.securityLine}>• Every setup approval should be written to an audit log.</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#080410' },
  inner: { padding: 18, paddingBottom: 90 },
  header: { alignItems: 'center', paddingTop: 18, paddingBottom: 18 },
  eyebrow: { color: 'rgba(201,168,212,0.45)', fontSize: 10, letterSpacing: 4, marginBottom: 6 },
  title: { color: '#d4af37', fontSize: 22, fontWeight: '900', letterSpacing: 3, textAlign: 'center' },
  sub: { color: 'rgba(201,168,212,0.62)', fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: 8, maxWidth: 680 },
  card: { backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.16)', borderRadius: 22, padding: 18, alignItems: 'center', marginBottom: 14 },
  cardTitle: { color: '#fff', fontSize: 24, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  cardSub: { color: 'rgba(201,168,212,0.6)', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 18 },
  deviceTabs: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.035)', borderRadius: 16, padding: 5, width: '100%', marginBottom: 18 },
  deviceTab: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  deviceTabActive: { backgroundColor: 'rgba(255,255,255,0.08)' },
  deviceText: { color: 'rgba(201,168,212,0.55)', fontSize: 14, fontWeight: '700' },
  deviceTextActive: { color: '#fff' },
  qrFrame: { width: 276, height: 276, borderRadius: 32, backgroundColor: '#101010', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: 18 },
  qrGrid: { backgroundColor: '#0f0f12', padding: 14, borderRadius: 20 },
  qrRow: { flexDirection: 'row' },
  qrDot: { width: 10, height: 10, borderRadius: 5, margin: 2, backgroundColor: 'transparent' },
  qrDotOn: { backgroundColor: '#fff' },
  qrBadge: { position: 'absolute', width: 58, height: 58, borderRadius: 29, backgroundColor: '#554cff', borderWidth: 3, borderColor: 'rgba(255,255,255,0.55)', alignItems: 'center', justifyContent: 'center' },
  qrBadgeText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 1 },
  codePanel: { width: '100%', backgroundColor: 'rgba(212,175,55,0.06)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.16)', borderRadius: 14, padding: 12, marginBottom: 10 },
  codeLabel: { color: 'rgba(201,168,212,0.5)', fontSize: 10, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 },
  code: { color: '#d4af37', fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  payload: { color: 'rgba(201,168,212,0.45)', fontSize: 10, marginTop: 4 },
  expiry: { color: 'rgba(201,168,212,0.6)', fontSize: 10, marginTop: 4 },
  errorText: { width: '100%', color: '#f87171', fontSize: 11, lineHeight: 16, marginBottom: 10 },
  actionRow: { width: '100%', flexDirection: 'row', gap: 10 },
  primaryButton: { flex: 1, backgroundColor: '#d4af37', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  primaryButtonText: { color: '#080410', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  secondaryButton: { flex: 1, borderWidth: 1, borderColor: '#d4af37', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  secondaryButtonText: { color: '#d4af37', fontSize: 12, fontWeight: '900', letterSpacing: 2 },
  buttonDisabled: { opacity: 0.55 },
  stepsCard: { backgroundColor: 'rgba(255,255,255,0.025)', borderWidth: 1, borderColor: 'rgba(212,175,55,0.12)', borderRadius: 18, padding: 16, marginBottom: 14 },
  securityCard: { backgroundColor: 'rgba(167,139,250,0.055)', borderWidth: 1, borderColor: 'rgba(167,139,250,0.18)', borderRadius: 18, padding: 16 },
  sectionTitle: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  stepRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', borderTopWidth: 1, borderTopColor: 'rgba(212,175,55,0.08)', paddingTop: 12, marginTop: 12 },
  stepIcon: { width: 34, height: 34, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(212,175,55,0.25)', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(212,175,55,0.06)' },
  stepIconText: { color: '#d4af37', fontSize: 15, fontWeight: '900' },
  stepTitle: { color: '#fff', fontSize: 13, fontWeight: '800', marginBottom: 3 },
  stepBody: { color: 'rgba(201,168,212,0.58)', fontSize: 12, lineHeight: 18 },
  securityLine: { color: 'rgba(201,168,212,0.7)', fontSize: 12, lineHeight: 20, marginBottom: 4 },
});
