import React from 'react';
import { Pressable, Text, View } from 'react-native';

type LiveRoomChatMessage = {
  id: string;
  sender: string;
  message: string;
  timeLabel?: string;
  badge?: string;
};

type LiveRoomChatPreviewPanelProps = {
  title?: string;
  subtitle?: string;
  messages?: LiveRoomChatMessage[];
  unreadCount?: number;
  onOpenChat?: () => void;
};

const defaultMessages: LiveRoomChatMessage[] = [
  { id: 'm1', sender: 'VelvetFan', message: 'Room is ready 🔥', timeLabel: 'now', badge: 'VIP' },
  { id: 'm2', sender: 'NightOwl', message: 'Gift goal is close.', timeLabel: '1m' },
  { id: 'm3', sender: 'Mistress', message: 'Starting in a moment.', timeLabel: '2m', badge: 'HOST' },
];

export function LiveRoomChatPreviewPanel({
  title = 'Live Chat Preview',
  subtitle = 'Compact room chat preview for sidebars, Watch With Mistress, and live show cards.',
  messages = defaultMessages,
  unreadCount = 18,
  onOpenChat,
}: LiveRoomChatPreviewPanelProps) {
  return (
    <View
      style={{
        backgroundColor: '#101010',
        borderColor: '#2a1620',
        borderWidth: 1,
        borderRadius: 18,
        padding: 14,
        marginBottom: 16,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{title}</Text>
          <Text style={{ color: '#999', fontSize: 12, marginTop: 4 }}>{subtitle}</Text>
        </View>
        <View style={{ backgroundColor: '#ff3f8e', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ color: '#fff', fontWeight: '900', fontSize: 10 }}>{unreadCount}</Text>
        </View>
      </View>

      <View style={{ gap: 8 }}>
        {messages.map((message) => (
          <View key={message.id} style={{ backgroundColor: '#050505', borderRadius: 14, padding: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                <Text style={{ color: '#ff9abf', fontWeight: '900', fontSize: 12 }}>{message.sender}</Text>
                {message.badge ? (
                  <View style={{ backgroundColor: '#211018', borderRadius: 999, paddingHorizontal: 6, paddingVertical: 2 }}>
                    <Text style={{ color: '#d4af37', fontWeight: '900', fontSize: 9 }}>{message.badge}</Text>
                  </View>
                ) : null}
              </View>
              {message.timeLabel ? <Text style={{ color: '#777', fontSize: 10 }}>{message.timeLabel}</Text> : null}
            </View>
            <Text style={{ color: '#ddd', fontSize: 12, marginTop: 5 }}>{message.message}</Text>
          </View>
        ))}
      </View>

      <Pressable
        onPress={onOpenChat}
        style={{
          marginTop: 12,
          backgroundColor: '#1d1018',
          borderColor: '#ff3f8e',
          borderWidth: 1,
          borderRadius: 999,
          paddingVertical: 10,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: '#ff9abf', fontWeight: '900' }}>Open Chat</Text>
      </Pressable>
    </View>
  );
}
