import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminUser, AdminUserStatus, updateAdminUserStatus } from '../../api/adminApi';

type Props = {
  user: AdminUser;
  onUpdated?: (user: AdminUser) => void;
};

const ACTIONS: Array<{ label: string; status: AdminUserStatus; color: string }> = [
  { label: 'Restore', status: 'ACTIVE', color: '#1D9E75' },
  { label: 'Suspend', status: 'SUSPENDED', color: '#d4af37' },
  { label: 'Ban', status: 'BANNED', color: '#441122' },
  { label: 'Pending', status: 'PENDING_VERIFICATION', color: '#ff9abf' },
];

export function AdminUserStatusActionsPanel({ user, onUpdated }: Props) {
  const [savingStatus, setSavingStatus] = useState<AdminUserStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(status: AdminUserStatus) {
    try {
      setSavingStatus(status);
      setError(null);
      setMessage(null);
      const updated = await updateAdminUserStatus(user.id, status);
      setMessage(`User moved to ${status}.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User status update failed');
    } finally {
      setSavingStatus(null);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>
        User status actions
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {ACTIONS.map((action) => {
          const active = user.status === action.status;
          const loading = savingStatus === action.status;

          return (
            <Pressable
              key={action.status}
              onPress={() => handleStatus(action.status)}
              disabled={active || Boolean(savingStatus)}
              style={{
                backgroundColor: active ? '#333' : action.color,
                opacity: active || (savingStatus && !loading) ? 0.55 : 1,
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
