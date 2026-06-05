import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPpvItem, updateAdminPpvActive } from '../../api/adminCommandApi';

type Props = {
  item: AdminPpvItem;
  onUpdated?: (item: AdminPpvItem) => void;
};

export function AdminPpvActionsPanel({ item, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function setActive(isActive: boolean) {
    try {
      setLoading(true);
      setError(null);
      setMessage(null);
      const updated = await updateAdminPpvActive(item.id, isActive);
      setMessage(isActive ? 'PPV item activated.' : 'PPV item deactivated.');
      onUpdated?.(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PPV action failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ marginTop: 10 }}>
      <Text style={{ color: '#aaa', fontSize: 11, marginBottom: 6 }}>PPV visibility controls</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        <Pressable
          onPress={() => setActive(true)}
          disabled={item.isActive || loading}
          style={{
            backgroundColor: item.isActive ? '#333' : '#1D9E75',
            opacity: item.isActive || loading ? 0.55 : 1,
            borderRadius: 999,
            paddingVertical: 8,
            paddingHorizontal: 10,
            marginRight: 7,
            marginBottom: 7,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{loading ? 'Saving...' : item.isActive ? 'Active ✓' : 'Activate'}</Text>
        </Pressable>

        <Pressable
          onPress={() => setActive(false)}
          disabled={!item.isActive || loading}
          style={{
            backgroundColor: !item.isActive ? '#333' : '#441122',
            opacity: !item.isActive || loading ? 0.55 : 1,
            borderRadius: 999,
            paddingVertical: 8,
            paddingHorizontal: 10,
            marginRight: 7,
            marginBottom: 7,
          }}
        >
          <Text style={{ color: '#fff', fontSize: 11, fontWeight: '900' }}>{loading ? 'Saving...' : !item.isActive ? 'Inactive ✓' : 'Deactivate'}</Text>
        </Pressable>
      </View>
      {message ? <Text style={{ color: '#1D9E75', fontSize: 11, marginTop: 4 }}>{message}</Text> : null}
      {error ? <Text style={{ color: '#ff6b6b', fontSize: 11, marginTop: 4 }}>{error}</Text> : null}
    </View>
  );
}
