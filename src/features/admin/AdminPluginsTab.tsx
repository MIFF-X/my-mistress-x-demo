import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPlugin } from '../../api/adminCommandApi';
import { AdminPluginActionsPanel } from './AdminPluginActionsPanel';

type Props = {
  plugins: AdminPlugin[];
  onRefresh: () => void;
  onPluginUpdated: (plugin: AdminPlugin) => void;
};

export function AdminPluginsTab({ plugins, onRefresh, onPluginUpdated }: Props) {
  return (
    <>
      <Pressable onPress={onRefresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Refresh Plugins</Text>
      </Pressable>

      {plugins.map((plugin) => (
        <View key={plugin.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{plugin.name}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{plugin.area} · {plugin.status}</Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>{plugin.description || 'No description'}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Entitlements loaded: {plugin.entitlements.length}</Text>
          <AdminPluginActionsPanel plugin={plugin} onUpdated={onPluginUpdated} />
        </View>
      ))}

      {plugins.length === 0 ? <Text style={{ color: '#777' }}>No plugins found.</Text> : null}
    </>
  );
}
