import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

type LiveRoomDiscoveryChip = {
  id: string;
  label: string;
  count?: number | string;
  emoji?: string;
  locked?: boolean;
  active?: boolean;
};

type LiveRoomDiscoveryChipsProps = {
  title?: string;
  subtitle?: string;
  chips?: LiveRoomDiscoveryChip[];
  selectedId?: string;
  onSelect?: (chip: LiveRoomDiscoveryChip) => void;
};

const defaultChips: LiveRoomDiscoveryChip[] = [
  { id: 'live-now', label: 'Live Now', count: 54, emoji: '🔴', active: true },
  { id: 'watch-with', label: 'Watch With Mistress', count: 18, emoji: '📺' },
  { id: 'audio-rooms', label: 'Audio Rooms', count: 23, emoji: '🎙️' },
  { id: 'nearby-events', label: 'Events Near You', count: 12, emoji: '📍' },
  { id: 'pk-battles', label: 'PK Battles', count: 7, emoji: '🏆' },
  { id: 'private-rooms', label: 'Private Rooms', count: 'VIP', emoji: '🔐', locked: true },
  { id: 'gift-heavy', label: 'Gift Heavy', count: 31, emoji: '🎁' },
  { id: 'new-mistresses', label: 'New Mistresses', count: 40, emoji: '✨' },
];

export function LiveRoomDiscoveryChips({
  title = 'Discover Rooms',
  subtitle = 'Filter live shows, audio rooms, Watch With Mistress, events, and VIP spaces.',
  chips = defaultChips,
  selectedId,
  onSelect,
}: LiveRoomDiscoveryChipsProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {chips.map((chip) => {
          const active = selectedId ? selectedId === chip.id : chip.active;
          return (
            <Pressable
              key={chip.id}
              onPress={() => onSelect?.(chip)}
              style={{
                backgroundColor: active ? '#ff3f8e' : chip.locked ? '#1b1018' : '#151515',
                borderColor: active ? '#ff9ac7' : chip.locked ? '#6b2144' : '#333',
                borderWidth: 1,
                borderRadius: 999,
                paddingHorizontal: 12,
                paddingVertical: 9,
                minHeight: 40,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {chip.emoji ? <Text style={{ fontSize: 14 }}>{chip.emoji}</Text> : null}
              <Text style={{ color: active ? '#fff' : chip.locked ? '#ff9abf' : '#ddd', fontWeight: '800', fontSize: 12 }}>
                {chip.label}
              </Text>
              {chip.count !== undefined ? (
                <View style={{ backgroundColor: active ? '#fff' : '#2a2a2a', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ color: active ? '#ff3f8e' : '#ddd', fontWeight: '900', fontSize: 10 }}>{chip.count}</Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
