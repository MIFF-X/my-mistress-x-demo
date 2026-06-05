import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminPlugin, listAdminPlugins } from '../../api/adminCommandApi';
import { AdminPluginMarketplaceCommandPanel } from './AdminPluginMarketplaceCommandPanel';
import { AdminPluginRegistryCommandPanel } from './AdminPluginRegistryCommandPanel';
import { AdminPluginStatusActionsPanel } from './AdminPluginStatusActionsPanel';

export function AdminPluginCommandScreen() {
  const [plugins, setPlugins] = useState<AdminPlugin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setPlugins(await listAdminPlugins());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Plugins failed to load');
    } finally {
      setLoading(false);
    }
  }

  function onUpdated(updated: AdminPlugin) {
    setPlugins((current) => current.map((plugin) => (plugin.id === updated.id ? updated : plugin)));
  }

  function onCreated(created: AdminPlugin) {
    setPlugins((current) => [created, ...current.filter((plugin) => plugin.id !== created.id)]);
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
        Admin Plugin Command
      </Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>
        Review platform plugins and move each plugin between planned, scaffolded, active, and disabled states.
      </Text>

      <Pressable onPress={refresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Refresh Plugins</Text>
      </Pressable>

      {loading ? <Text style={{ color: '#999' }}>Loading plugins...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      <AdminPluginRegistryCommandPanel plugins={plugins} />

      <AdminPluginMarketplaceCommandPanel
        plugins={plugins}
        onPluginCreated={onCreated}
        onPluginUpdated={onUpdated}
      />

      {plugins.map((plugin) => (
        <View key={plugin.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{plugin.name}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>
            {plugin.area} · {plugin.status}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>
            {plugin.description || 'No description supplied.'}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 6 }}>
            Entitlements loaded: {plugin.entitlements.length}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 2 }}>
            Updated: {new Date(plugin.updatedAt).toLocaleString()}
          </Text>

          <AdminPluginStatusActionsPanel plugin={plugin} onUpdated={onUpdated} />
        </View>
      ))}

      {!loading && plugins.length === 0 ? <Text style={{ color: '#777' }}>No plugins found.</Text> : null}
    </ScrollView>
  );
}
