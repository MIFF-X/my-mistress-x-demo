import React from 'react';
import { Pressable, Text, View } from 'react-native';

type RegionDiscoveryItem = {
  id: string;
  regionLabel: string;
  roomCount: number;
  liveCount: number;
  eventCount: number;
  privacyLabel?: string;
};

type LiveRoomRegionDiscoveryCardProps = {
  title?: string;
  subtitle?: string;
  regions?: RegionDiscoveryItem[];
  onRegionPress?: (region: RegionDiscoveryItem) => void;
};

const defaultRegions: RegionDiscoveryItem[] = [
  { id: 'au-east', regionLabel: 'Australia East', roomCount: 48, liveCount: 12, eventCount: 7, privacyLabel: 'Coarse region only' },
  { id: 'uk', regionLabel: 'United Kingdom', roomCount: 63, liveCount: 18, eventCount: 9, privacyLabel: 'No exact location shown' },
  { id: 'global', regionLabel: 'Global Rooms', roomCount: 214, liveCount: 72, eventCount: 24, privacyLabel: 'Online discovery' },
];

export function LiveRoomRegionDiscoveryCard({
  title = 'Region Discovery',
  subtitle = 'Privacy-first region filters for live rooms, Watch With Mistress, audio rooms, and events.',
  regions = defaultRegions,
  onRegionPress,
}: LiveRoomRegionDiscoveryCardProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 4 }}>{title}</Text>
      <Text style={{ color: '#999', fontSize: 12, marginBottom: 10 }}>{subtitle}</Text>

      <View style={{ gap: 10 }}>
        {regions.map((region) => (
          <Pressable
            key={region.id}
            onPress={() => onRegionPress?.(region)}
            style={{
              backgroundColor: '#101010',
              borderColor: '#2a1620',
              borderWidth: 1,
              borderRadius: 18,
              padding: 14,
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900' }}>{region.regionLabel}</Text>
                <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>{region.privacyLabel || 'Privacy-first discovery'}</Text>
              </View>
              <View style={{ backgroundColor: '#1a0b13', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, alignSelf: 'flex-start' }}>
                <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{region.roomCount} rooms</Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
              <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 12, padding: 10 }}>
                <Text style={{ color: '#ff3f8e', fontSize: 18, fontWeight: '900' }}>{region.liveCount}</Text>
                <Text style={{ color: '#888', fontSize: 10, marginTop: 2 }}>Live now</Text>
              </View>
              <View style={{ flex: 1, backgroundColor: '#050505', borderRadius: 12, padding: 10 }}>
                <Text style={{ color: '#d4af37', fontSize: 18, fontWeight: '900' }}>{region.eventCount}</Text>
                <Text style={{ color: '#888', fontSize: 10, marginTop: 2 }}>Events</Text>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
