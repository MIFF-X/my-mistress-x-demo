import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { AdminUser, listAdminUsers } from '../../api/adminApi';
import { AdminUserStatusActionsPanel } from './AdminUserStatusActionsPanel';

export function AdminUserCommandScreen() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    try {
      setLoading(true);
      setError(null);
      setUsers(await listAdminUsers());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Users failed to load');
    } finally {
      setLoading(false);
    }
  }

  function onUpdated(updated: AdminUser) {
    setUsers((current) => current.map((user) => (user.id === updated.id ? updated : user)));
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', marginBottom: 8 }}>
        Admin User Command
      </Text>
      <Text style={{ color: '#aaa', marginBottom: 12 }}>
        Review user accounts and update account status from one admin-only surface.
      </Text>

      <Pressable onPress={refresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '900' }}>Refresh Users</Text>
      </Pressable>

      {loading ? <Text style={{ color: '#999' }}>Loading users...</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', marginBottom: 10 }}>{error}</Text> : null}

      {users.map((user) => (
        <View key={user.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 10 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>
            {user.displayName || user.username}
          </Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>{user.email}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 6 }}>
            {user.role} · {user.status} · {user.isAdult ? 'Adult confirmed' : 'Adult not confirmed'}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>
            Wallet: {user.wallet?.balance ?? 0} {user.wallet?.currency || 'CREDITS'}
          </Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 2 }}>
            Joined: {new Date(user.createdAt).toLocaleString()}
          </Text>

          <AdminUserStatusActionsPanel user={user} onUpdated={onUpdated} />
        </View>
      ))}

      {!loading && users.length === 0 ? <Text style={{ color: '#777' }}>No users found.</Text> : null}
    </ScrollView>
  );
}
