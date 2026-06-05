import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import {
  AdminModerationItem,
  AdminModerationStatus,
  updateAdminModerationStatus,
} from '../../api/adminCommandApi';

type Props = {
  item: AdminModerationItem;
  onUpdated?: (item: AdminModerationItem) => void;
};

const STATUS_ACTIONS: Array<{ label: string; status: AdminModerationStatus; tone: string }> = [
  { label: 'Review', status: 'IN_REVIEW', tone: '#d4af37' },
  { label: 'Escalate', status: 'ESCALATED', tone: '#ff9abf' },
  { label: 'Resolve', status: 'RESOLVED', tone: '#1D9E75' },
  { label: 'Dismiss', status: 'DISMISSED', tone: '#441122' },
];

export function AdminModerationActionsPanel({ item, onUpdated }: Props) {
  const [loadingStatus, setLoadingStatus] = useState<AdminModerationStatus | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleStatus(status: AdminModerationStatus) {
    try {
      setLoadingStatus(status);
      setError(null);
      setMessage(null);
      const updated = await updateAdminModerationStatus(item.id, status);
      setMessage(`Moderation item moved to ${status}.`);
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Moderation action failed');
    } finally {
      setLoadingStatus(null);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>
        Command Centre actions
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {STATUS_ACTIONS.map((action) => {
          const active = item.status === action.status;
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
