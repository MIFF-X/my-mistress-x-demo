import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { AdminPpvItem } from '../../api/adminCommandApi';
import { AdminPpvActionsPanel } from './AdminPpvActionsPanel';

type Props = {
  items: AdminPpvItem[];
  onRefresh: () => void;
  onItemUpdated: (item: AdminPpvItem) => void;
};

function label(user?: { username?: string; displayName?: string | null; role?: string; id?: string } | null) {
  if (!user) return 'Unknown user';
  return user.displayName || user.username || user.id || 'Unknown';
}

export function AdminPpvTab({ items, onRefresh, onItemUpdated }: Props) {
  return (
    <>
      <Pressable onPress={onRefresh} style={{ backgroundColor: '#ff0055', padding: 10, borderRadius: 10, marginBottom: 12 }}>
        <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '800' }}>Refresh PPV</Text>
      </Pressable>

      {items.map((item) => (
        <View key={item.id} style={{ backgroundColor: '#111', padding: 12, borderRadius: 14, marginBottom: 8 }}>
          <Text style={{ color: '#fff', fontSize: 16, fontWeight: '800' }}>{item.title}</Text>
          <Text style={{ color: item.isActive ? '#1D9E75' : '#ff0055', marginTop: 4 }}>
            {item.isActive ? 'Active' : 'Inactive'} · {item.accessType} · {item.price} credits
          </Text>
          <Text style={{ color: '#aaa', fontSize: 11, marginTop: 4 }}>Owner: {label(item.mistress)}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Unlocks loaded: {item.unlocks.length}</Text>
          <AdminPpvActionsPanel item={item} onUpdated={onItemUpdated} />
        </View>
      ))}

      {items.length === 0 ? <Text style={{ color: '#777' }}>No PPV items found.</Text> : null}
    </>
  );
}
