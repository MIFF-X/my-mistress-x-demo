import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomReplayAccessCardProps = {
  title?: string;
  hostName?: string;
  replayLabel?: string;
  accessLabel?: string;
  durationLabel?: string;
  expiresLabel?: string;
  onUnlockReplay?: () => void;
  onViewDetails?: () => void;
};

export function LiveRoomReplayAccessCard({
  title = 'Replay Available',
  hostName = 'Mistress Luna',
  replayLabel = 'Watch With Mistress replay',
  accessLabel = 'VIP / ticket unlock',
  durationLabel = '42 min replay',
  expiresLabel = 'Access window: 72 hours',
  onUnlockReplay,
  onViewDetails,
}: LiveRoomReplayAccessCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#0f0b10',
        borderColor: '#d4af37',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#d4af37', fontSize: 12, fontWeight: '900', marginTop: 4 }}>{hostName}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(212, 175, 55, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#f5c542', fontSize: 10, fontWeight: '900' }}>REPLAY</Text>
        </View>
      </View>

      <View
        style={{
          backgroundColor: '#050505',
          borderColor: '#2d2512',
          borderWidth: 1,
          borderRadius: 16,
          padding: 14,
          marginBottom: 12,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '900' }}>{replayLabel}</Text>
        <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>{durationLabel}</Text>
        <Text style={{ color: '#777', fontSize: 11, marginTop: 5 }}>{expiresLabel}</Text>
        <Text style={{ color: '#f5c542', fontSize: 11, fontWeight: '900', marginTop: 8 }}>{accessLabel}</Text>
      </View>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable
          onPress={onUnlockReplay}
          style={{
            flex: 1,
            backgroundColor: '#d4af37',
            borderRadius: 999,
            paddingVertical: 11,
            alignItems: 'center',
          }}
        >
          <Text style={{ color: '#080808', fontWeight: '900' }}>Unlock Replay</Text>
        </Pressable>
        <Pressable
          onPress={onViewDetails}
          style={{
            borderColor: '#3a3220',
            borderWidth: 1,
            borderRadius: 999,
            paddingHorizontal: 14,
            justifyContent: 'center',
          }}
        >
          <Text style={{ color: '#fff', fontWeight: '800' }}>Details</Text>
        </Pressable>
      </View>
    </View>
  );
}
