import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminModerationItem, listAdminModeration } from '../../api/adminCommandApi';
import { AdminModerationActionsPanel } from './AdminModerationActionsPanel';

function userLabel(user?: { username?: string; displayName?: string | null; role?: string; id?: string } | null) {
  if (!user) return 'Unknown user';
  return `${user.displayName || user.username || user.id || 'Unknown'}${user.role ? ` · ${user.role}` : ''}`;
}

function panelStyle() {
  return { backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 } as const;
}

function statusColor(status: string) {
  if (status === 'RESOLVED') return '#1D9E75';
  if (status === 'ESCALATED') return '#ff9abf';
  if (status === 'IN_REVIEW') return '#d4af37';
  if (status === 'DISMISSED') return '#777';
  return '#ff0055';
}

export function AdminModerationCommandCentreScreen() {
  const [items, setItems] = useState<AdminModerationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadItems();
  }, []);

  async function loadItems() {
    try {
      setLoading(true);
      setError(null);
      setItems(await listAdminModeration());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation queue failed to load');
    } finally {
      setLoading(false);
    }
  }

  function handleUpdated(updated: AdminModerationItem) {
    setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
        Moderation Command Centre
      </Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>
        Review safety, dispute, verification, ledger, profile, PPV, live show, and system moderation items.
      </Text>

      <Pressable onPress={loadItems} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Refresh Moderation Queue</Text>
      </Pressable>

      {loading ? <Text style={{ color: '#999' }}>Loading moderation queue...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      {items.map((item) => (
        <View key={item.id} style={panelStyle()}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{item.title}</Text>
          <Text style={{ color: statusColor(item.status), marginTop: 4, fontWeight: '800' }}>
            {item.priority} · {item.status} · {item.area} · {item.type}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 6 }}>
            {item.description || 'No description supplied.'}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 6 }}>
            Reporter: {userLabel(item.reporter)}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 2 }}>
            Assigned: {userLabel(item.assigned)}
          </Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>
            Target: {item.targetType || 'unknown'} · {item.targetId || item.targetUserId || 'none'}
          </Text>
          <Text style={{ color: '#777', fontSize: 10, marginTop: 4 }}>
            Created: {new Date(item.createdAt).toLocaleString()} · Updated: {new Date(item.updatedAt).toLocaleString()}
          </Text>

          <AdminModerationActionsPanel item={item} onUpdated={handleUpdated} />
        </View>
      ))}

      {!loading && items.length === 0 ? (
        <Text style={{ color: '#777' }}>No moderation items found.</Text>
      ) : null}
    </ScrollView>
  );
}
