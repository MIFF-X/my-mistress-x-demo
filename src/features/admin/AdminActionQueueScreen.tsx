import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminModerationItem, listAdminModeration } from '../../api/adminCommandApi';
import { AdminModerationActionsPanel } from './AdminModerationActionsPanel';

function nameOf(user?: { username?: string; displayName?: string | null; id?: string } | null) {
  return user?.displayName || user?.username || user?.id || 'Unknown';
}

export function AdminActionQueueScreen() {
  const [items, setItems] = useState<AdminModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setItems(await listAdminModeration());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Queue failed to load');
    } finally {
      setLoading(false);
    }
  }

  function onUpdated(updated: AdminModerationItem) {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
        Admin Action Queue
      </Text>

      <Pressable onPress={refresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Refresh Queue</Text>
      </Pressable>

      {loading ? <Text style={{ color: '#999' }}>Loading queue...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      {items.map((item) => (
        <View key={item.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{item.title}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4 }}>{item.priority} · {item.status} · {item.area}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>{item.description || 'No description supplied.'}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 6 }}>Reporter: {nameOf(item.reporter)}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 2 }}>Assigned: {nameOf(item.assigned)}</Text>
          <AdminModerationActionsPanel item={item} onUpdated={onUpdated} />
        </View>
      ))}

      {!loading && items.length === 0 ? <Text style={{ color: '#777' }}>No queue items found.</Text> : null}
    </ScrollView>
  );
}
