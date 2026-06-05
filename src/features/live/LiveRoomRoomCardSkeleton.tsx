import React from 'react';
import { Text, View } from 'react-native';

type LiveRoomCardSkeletonProps = {
  title?: string;
  subtitle?: string;
  cardCount?: number;
};

export function LiveRoomCardSkeleton({
  title = 'Loading Rooms',
  subtitle = 'Skeleton cards for room discovery, live grids, watch rooms, and events while data loads.',
  cardCount = 4,
}: LiveRoomCardSkeletonProps) {
  const cards = Array.from({ length: cardCount }, (_, index) => `room-skeleton-${index}`);

  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {cards.map((id, index) => (
          <View
            key={id}
            style={{
              width: '48%',
              minWidth: 160,
              backgroundColor: '#101010',
              borderColor: '#222',
              borderWidth: 1,
              borderRadius: 16,
              padding: 12,
              opacity: index % 2 === 0 ? 0.82 : 0.62,
            }}
          >
            <View style={{ height: 10, width: 64, backgroundColor: '#2a1620', borderRadius: 999, marginBottom: 10 }} />
            <View style={{ height: 72, backgroundColor: '#1a0b13', borderRadius: 14, marginBottom: 10 }} />
            <View style={{ height: 14, width: '80%', backgroundColor: '#242424', borderRadius: 999, marginBottom: 8 }} />
            <View style={{ height: 10, width: '58%', backgroundColor: '#1f1f1f', borderRadius: 999, marginBottom: 8 }} />
            <View style={{ height: 10, width: '44%', backgroundColor: '#1f1f1f', borderRadius: 999 }} />
          </View>
        ))}
      </View>
    </View>
  );
}
