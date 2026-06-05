import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPlugin, AdminPluginStatus, updateAdminPluginStatus } from '../../api/adminCommandApi';

type Props = {
  plugin: AdminPlugin;
  onUpdated?: (plugin: AdminPlugin) => void;
};

const PLUGIN_STATUS_ACTIONS: Array<{ label: string; status: AdminPluginStatus; tone: string }> = [
  { label: 'Plan', status: 'PLANNED', tone: '#777' },
  { label: 'Scaffold', status: 'SCAFFOLDED', tone: '#d4af37' },
  { label: 'Activate', status: 'ACTIVE', tone: '#1D9E75' },
  { label: 'Disable', status: 'DISABLED', tone: '#441122' },
];

export function AdminPluginActionsPanel({ plugin, onUpdated }: Props) {
  const [loadingStatus, setLoadingStatus] = useState<AdminPluginStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(status: AdminPluginStatus) {
    try {
      setLoadingStatus(status);
      setError(null);
      setMessage(null);
      const updated = await updateAdminPluginStatus(plugin.id, status);
      setMessage(`Plugin moved to ${status}.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugin status action failed');
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>Plugin lifecycle controls</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {PLUGIN_STATUS_ACTIONS.map((action) => {
          const active = plugin.status === action.status;
          const loading = loadingStatus === action.status;
          return (
            <Pressable
              key={action.status}
              onPress={() => handleStatus(action.status)}
              disabled={active || Boolean(loadingStatus)}
              style={{
                backgroundColor: active ? '#333' : action.tone,
                opacity: active || (loadingStatus && !loading) ? 0.55 : 1,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 10,
                marginRight: 7,
                marginBottom: 7,
              }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>
                {loading ? 'Saving...' : active ? `${action.label} ✓` : action.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {message ? <Text style={{ color: '#1D9E75', fontSize: 11, marginTop: 4 }}>{message}</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}
