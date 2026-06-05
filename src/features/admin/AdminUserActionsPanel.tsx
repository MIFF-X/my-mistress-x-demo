import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminUser } from '../../api/adminApi';
import { AdminUserStatus, updateAdminUserStatus } from '../../api/adminCommandApi';

type Props = {
  user: AdminUser;
  onUpdated?: (user: AdminUser) => void;
};

const USER_STATUS_ACTIONS: Array<{ label: string; status: AdminUserStatus; tone: string }> = [
  { label: 'Restore', status: 'ACTIVE', tone: '#1D9E75' },
  { label: 'Suspend', status: 'SUSPENDED', tone: '#d4af37' },
  { label: 'Ban', status: 'BANNED', tone: '#441122' },
  { label: 'Pending', status: 'PENDING_VERIFICATION', tone: '#ff9abf' },
];

export function AdminUserActionsPanel({ user, onUpdated }: Props) {
  const [loadingStatus, setLoadingStatus] = useState<AdminUserStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(status: AdminUserStatus) {
    try {
      setLoadingStatus(status);
      setError(null);
      setMessage(null);
      const updated = await updateAdminUserStatus(user.id, status);
      setMessage(`User status changed to ${status}.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'User status action failed');
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>User status controls</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {USER_STATUS_ACTIONS.map((action) => {
          const active = user.status === action.status;
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
