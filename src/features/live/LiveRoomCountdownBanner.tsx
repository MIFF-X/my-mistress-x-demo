import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomCountdownBannerProps = {
  title?: string;
  hostName?: string;
  startsAtLabel?: string;
  accessLabel?: string;
  reminderLabel?: string;
  roomTypeLabel?: string;
  onReminderPress?: () => void;
};

export function LiveRoomCountdownBanner({
  title = 'Watch With Mistress starts soon',
  hostName = 'Mistress Luna',
  startsAtLabel = 'Starts in 18 minutes',
  accessLabel = 'Membership / ticket access',
  reminderLabel = 'Set Reminder',
  roomTypeLabel = 'Co-viewing room',
  onReminderPress,
}: LiveRoomCountdownBannerProps) {
  return (
    <View
      style={{
        backgroundColor: '#140711',
        borderColor: '#ff3f8e',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
        overflow: 'hidden',
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View style={{ backgroundColor: 'rgba(255, 63, 142, 0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>SCHEDULED</Text>
        </View>
        <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>{accessLabel}</Text>
      </View>

      <View style={{ backgroundColor: '#050505', borderRadius: 16, padding: 14 }}>
        <Text style={{ color: '#fff', fontSize: 20, fontWeight: '900' }}>{title}</Text>
        <Text style={{ color: '#ff9abf', fontSize: 13, fontWeight: '800', marginTop: 5 }}>{hostName}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 3 }}>{roomTypeLabel}</Text>

        <View style={{ marginTop: 14, backgroundColor: '#180b13', borderRadius: 14, padding: 12, borderColor: '#2d1622', borderWidth: 1 }}>
          <Text style={{ color: '#d4af37', fontSize: 22, fontWeight: '900' }}>{startsAtLabel}</Text>
          <Text style={{ color: '#777', fontSize: 11, marginTop: 4 }}>Save it to alerts so the room appears before it opens.</Text>
        </View>
      </View>

      <Pressable
        onPress={onReminderPress}
        style={{
          backgroundColor: '#ff3f8e',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>{reminderLabel}</Text>
      </Pressable>
    </View>
  );
}
