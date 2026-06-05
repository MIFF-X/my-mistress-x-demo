import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomFeaturedCard = {
  id: string;
  title: string;
  hostName: string;
  roomType: string;
  viewerCount?: number | string;
  priceLabel?: string;
  status?: 'live' | 'scheduled' | 'locked' | 'vip';
  accentColor?: string;
};

type LiveRoomFeaturedGridProps = {
  title?: string;
  subtitle?: string;
  rooms?: LiveRoomFeaturedCard[];
  onOpenRoom?: (room: LiveRoomFeaturedCard) => void;
};

const defaultRooms: LiveRoomFeaturedCard[] = [
  {
    id: 'watch-luna',
    title: 'Watch With Mistress',
    hostName: 'Mistress Luna',
    roomType: 'Co-viewing / commentary',
    viewerCount: 284,
    priceLabel: 'MX 250 entry',
    status: 'live',
    accentColor: '#ff3f8e',
  },
  {
    id: 'vip-ava',
    title: 'VIP Velvet Room',
    hostName: 'Mistress Ava',
    roomType: 'Private group room',
    viewerCount: 'VIP',
    priceLabel: 'Subscription required',
    status: 'vip',
    accentColor: '#d4af37',
  },
  {
    id: 'audio-noire',
    title: 'After Dark Audio',
    hostName: 'Noire',
    roomType: 'Audio room / listeners',
    viewerCount: 96,
    priceLabel: 'Free preview',
    status: 'scheduled',
    accentColor: '#a855f7',
  },
  {
    id: 'pk-battle',
    title: 'PK Tribute Battle',
    hostName: 'Two hosts',
    roomType: 'Competitive live show',
    viewerCount: 412,
    priceLabel: 'Gifts decide winner',
    status: 'live',
    accentColor: '#ff7a18',
  },
];

function statusLabel(status?: LiveRoomFeaturedCard['status']) {
  if (status === 'live') return 'LIVE NOW';
  if (status === 'vip') return 'VIP';
  if (status === 'locked') return 'LOCKED';
  return 'SCHEDULED';
}

export function LiveRoomFeaturedGrid({
  title = 'Featured Live Rooms',
  subtitle = 'A compact card grid for live shows, Watch With Mistress, VIP rooms, and PK battles.',
  rooms = defaultRooms,
  onOpenRoom,
}: LiveRoomFeaturedGridProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {rooms.map((room) => {
          const accent = room.accentColor || '#ff3f8e';
          return (
            <Pressable
              key={room.id}
              onPress={() => onOpenRoom?.(room)}
              style={{
                width: '48%',
                minWidth: 160,
                backgroundColor: '#101010',
                borderColor: accent,
                borderWidth: 1,
                borderRadius: 16,
                padding: 12,
                shadowColor: accent,
                shadowOpacity: 0.25,
                shadowRadius: 10,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <Text style={{ color: accent, fontSize: 10, fontWeight: '900' }}>{statusLabel(room.status)}</Text>
                <Text style={{ color: '#bbb', fontSize: 11 }}>👁 {room.viewerCount || 0}</Text>
              </View>

              <View
                style={{
                  height: 72,
                  borderRadius: 14,
                  backgroundColor: '#1a0b13',
                  borderColor: '#2d1622',
                  borderWidth: 1,
                  marginBottom: 10,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ color: accent, fontSize: 24 }}>◆</Text>
                <Text style={{ color: '#777', fontSize: 10, marginTop: 2 }}>room preview</Text>
              </View>

              <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>{room.title}</Text>
              <Text style={{ color: '#ddd', fontSize: 12, marginTop: 3 }}>{room.hostName}</Text>
              <Text style={{ color: '#888', fontSize: 11, marginTop: 3 }}>{room.roomType}</Text>
              <Text style={{ color: accent, fontSize: 11, fontWeight: '800', marginTop: 8 }}>{room.priceLabel}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
