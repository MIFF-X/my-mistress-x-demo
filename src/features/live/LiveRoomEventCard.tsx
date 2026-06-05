import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomEventCardProps = {
  title?: string;
  hostName?: string;
  dateLabel?: string;
  timeLabel?: string;
  locationLabel?: string;
  accessLabel?: string;
  goingCount?: number | string;
  onSavePress?: () => void;
  onOpenPress?: () => void;
};

export function LiveRoomEventCard({
  title = 'Velvet Watch Party',
  hostName = 'Mistress Luna',
  dateLabel = 'Friday',
  timeLabel = '8:30 PM',
  locationLabel = 'Online / region-safe room',
  accessLabel = 'Ticket or membership',
  goingCount = 126,
  onSavePress,
  onOpenPress,
}: LiveRoomEventCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#ff3f8e',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#ff9abf', fontSize: 12, fontWeight: '900', marginTop: 4 }}>{hostName}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{locationLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#1a0b13', borderRadius: 16, padding: 10, minWidth: 76, alignItems: 'center' }}>
          <Text style={{ color: '#d4af37', fontSize: 13, fontWeight: '900' }}>{dateLabel}</Text>
          <Text style={{ color: '#fff', fontSize: 12, fontWeight: '800', marginTop: 3 }}>{timeLabel}</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        <View style={{ backgroundColor: '#211018', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 10, fontWeight: '900' }}>{accessLabel}</Text>
        </View>
        <View style={{ backgroundColor: '#1a1510', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d4af37', fontSize: 10, fontWeight: '900' }}>{goingCount} going</Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
        <Pressable onPress={onOpenPress} style={{ flex: 1, backgroundColor: '#ff3f8e', borderRadius: 999, paddingVertical: 11, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '900' }}>Open Event</Text>
        </Pressable>
        <Pressable onPress={onSavePress} style={{ borderColor: '#3a202b', borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, justifyContent: 'center' }}>
          <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Save</Text>
        </Pressable>
      </View>
    </View>
  );
}
