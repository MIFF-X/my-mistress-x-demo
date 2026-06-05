import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminUser } from '../../api/adminApi';
import { AdminUserActionsPanel } from './AdminUserActionsPanel';

type Props = {
  users: AdminUser[];
  onRefresh: () => void;
  onUserUpdated: (user: AdminUser) => void;
};

function smallText(color = '#aaa') {
  return { color, fontSize: 11, marginTop: 4 } as const;
}

function statusColor(status: string) {
  if (status === 'ACTIVE') return '#1D9E75';
  if (status === 'SUSPENDED') return '#d4af37';
  if (status === 'BANNED') return '#ff6b6b';
  if (status === 'PENDING_VERIFICATION') return '#ff9abf';
  return '#aaa';
}

export function AdminUsersTab({ users, onRefresh, onUserUpdated }: Props) {
  return (
    <>
      <Pressable onPress={onRefresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Refresh Users</Text>
      </Pressable>

      {users.map((user) => (
        <View key={user.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{user.displayName || user.username}</Text>
          <Text style={smallText()}>{user.email}</Text>
          <Text style={{ color: statusColor(user.status), marginTop: 6 }}>
            {user.role} · {user.status} · {user.isAdult ? 'Adult verified' : 'Adult not confirmed'}
          </Text>
          <Text style={smallText()}>Wallet: {user.wallet?.balance ?? 0} {user.wallet?.currency || 'CREDITS'}</Text>
          <Text style={smallText('#777')}>Joined: {new Date(user.createdAt).toLocaleString()}</Text>
          <AdminUserActionsPanel user={user} onUpdated={onUserUpdated} />
        </View>
      ))}

      {users.length === 0 ? <Text style={{ color: '#777' }}>No users found.</Text> : null}
    </>
  );
}
