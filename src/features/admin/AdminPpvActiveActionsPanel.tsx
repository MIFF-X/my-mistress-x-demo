import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPpvItem, updateAdminPpvActive } from '../../api/adminCommandApi';

type Props = {
  item: AdminPpvItem;
  onUpdated?: (item: AdminPpvItem) => void;
};

export function AdminPpvActiveActionsPanel({ item, onUpdated }: Props) {
  const [savingValue, setSavingValue] = useState<boolean | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleActive(isActive: boolean) {
    try {
      setSavingValue(isActive);
      setError(null);
      setMessage(null);
      const updated = await updateAdminPpvActive(item.id, isActive);
      setMessage(isActive ? 'PPV item activated.' : 'PPV item deactivated.');
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PPV status update failed');
    } finally {
      setSavingValue(null);
    }
  }

  const actions = [
    { label: 'Activate', value: true, color: '#1D9E75' },
    { label: 'Deactivate', value: false, color: '#441122' },
  ];

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>
        PPV active status actions
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {actions.map((action) => {
          const active = item.isActive === action.value;
          const loading = savingValue === action.value;

          return (
            <Pressable
              key={action.label}
              onPress={() => handleActive(action.value)}
              disabled={active || savingValue !== null}
              style={{
                backgroundColor: active ? '#333' : action.color,
                opacity: active || (savingValue !== null && !loading) ? 0.55 : 1,
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
