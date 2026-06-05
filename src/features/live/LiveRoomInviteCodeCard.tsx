import React from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

type LiveRoomInviteCodeCardProps = {
  title?: string;
  subtitle?: string;
  codeValue?: string;
  onCodeChange?: (value: string) => void;
  onUnlock?: () => void;
  helperText?: string;
};

export function LiveRoomInviteCodeCard({
  title = 'Invite Code Room',
  subtitle = 'Enter a room code to unlock a private Watch With Mistress, live, audio, or event room.',
  codeValue = '',
  onCodeChange,
  onUnlock,
  helperText = 'Codes can be sent by a Mistress, generated for VIPs, or issued after ticket purchase.',
}: LiveRoomInviteCodeCardProps) {
  return (
    <View
      style={{
        backgroundColor: '#0f0f0f',
        borderColor: '#a855f7',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#aaa', fontSize: 12, marginTop: 4 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: 'rgba(168, 85, 247, 0.18)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5 }}>
          <Text style={{ color: '#d8b4fe', fontSize: 10, fontWeight: '900' }}>CODE</Text>
        </View>
      </View>

      <TextInput
        value={codeValue}
        onChangeText={onCodeChange}
        placeholder="Enter access code"
        placeholderTextColor="#777"
        autoCapitalize="characters"
        style={{
          backgroundColor: '#050505',
          color: '#fff',
          borderColor: '#2d173f',
          borderWidth: 1,
          borderRadius: 14,
          paddingHorizontal: 12,
          paddingVertical: 11,
          fontWeight: '800',
          letterSpacing: 1,
          marginTop: 8,
        }}
      />

      <Text style={{ color: '#777', fontSize: 11, marginTop: 8 }}>{helperText}</Text>

      <Pressable
        onPress={onUnlock}
        style={{
          backgroundColor: '#a855f7',
          borderRadius: 999,
          paddingVertical: 11,
          alignItems: 'center',
          marginTop: 12,
        }}
      >
        <Text style={{ color: '#fff', fontWeight: '900' }}>Unlock Room</Text>
      </Pressable>
    </View>
  );
}
