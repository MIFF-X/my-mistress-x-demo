import React, { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { listQuickSetupDevices } from './mx-quick-setup-api.js';

function formatDate(value) {
  if (!value) return 'Not recorded';
  try {
    return new Date(value).toLocaleString();
  } catch {
    return 'Not recorded';
  }
}

export default function ConnectedDevicesPanel() {
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDevices();
  }, []);

  async function loadDevices() {
    setLoading(true);
    setError('');
    try {
      const data = await listQuickSetupDevices();
      setDevices(data.devices || []);
    } catch (err) {
      setDevices([]);
      setError(err.message || 'Connected devices are not available yet.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>Connected devices</Text>
        <TouchableOpacity onPress={loadDevices} disabled={loading}>
          <Text style={s.refresh}>{loading ? 'LOADING' : 'REFRESH'}</Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator color="#d4af37" style={{ marginVertical: 8 }} />}
      {error ? <Text style={s.error}>{error}</Text> : null}
      {!loading && !error && devices.length === 0 && (
        <Text style={s.empty}>No connected devices are visible yet. Approve one from the QR flow to see it here.</Text>
      )}

      {!loading && devices.map(device => (
        <View key={device.id} style={s.deviceRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.deviceName}>{device.deviceLabel || 'Connected device'}</Text>
            <Text style={s.deviceMeta}>{device.devicePlatform || 'OTHER'} · {device.status || 'ACTIVE'}</Text>
            <Text style={s.deviceMeta}>Last approved: {formatDate(device.lastApprovedAt)}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: 'rgba(34,197,94,0.045)', borderWidth: 1, borderColor: 'rgba(34,197,94,0.16)', borderRadius: 18, padding: 16, marginBottom: 14 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { color: '#fff', fontSize: 15, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  refresh: { color: '#d4af37', fontSize: 10, fontWeight: '900', letterSpacing: 2 },
  empty: { color: 'rgba(201,168,212,0.52)', fontSize: 12, lineHeight: 18 },
  error: { color: '#f87171', fontSize: 11, lineHeight: 16, marginBottom: 8 },
  deviceRow: { flexDirection: 'row', gap: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: 'rgba(34,197,94,0.12)', paddingTop: 12, marginTop: 12 },
  deviceName: { color: '#fff', fontSize: 13, fontWeight: '800' },
  deviceMeta: { color: 'rgba(201,168,212,0.5)', fontSize: 10, marginTop: 2 },
});
