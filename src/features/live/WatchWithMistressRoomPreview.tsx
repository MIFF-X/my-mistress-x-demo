import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LiveRoomChatPreviewPanel } from './LiveRoomChatPreviewPanel';
import { LiveRoomGiftRail } from './LiveRoomGiftRail';
import { LiveRoomGoalProgressCard } from './LiveRoomGoalProgressCard';
import { LiveRoomReplayAccessCard } from './LiveRoomReplayAccessCard';
import { LiveRoomRequestQueue } from './LiveRoomRequestQueue';
import { LiveRoomTopSupportersBoard } from './LiveRoomTopSupportersBoard';
import { LiveRoomViewerModeToggle } from './LiveRoomViewerModeToggle';
import { WatchWithMistressQuickActions } from './WatchWithMistressQuickActions';

export function WatchWithMistressRoomPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Watch With Mistress Room</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for co-watching, commentary cam controls, gifts, requests, goals, chat, supporters, and replay unlocks.
        </Text>
      </View>

      <View
        style={{
          backgroundColor: '#050505',
          borderColor: '#ff3f8e',
          borderWidth: 1,
          borderRadius: 20,
          minHeight: 210,
          padding: 16,
          marginBottom: 16,
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <View style={{ backgroundColor: 'rgba(255, 63, 142, 0.18)', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
            <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>WATCHING NOW</Text>
          </View>
          <Text style={{ color: '#d4af37', fontSize: 11, fontWeight: '900' }}>Subscriber room</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: '#ff3f8e', fontSize: 46, fontWeight: '900' }}>▶</Text>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8 }}>Main co-watch player placeholder</Text>
          <Text style={{ color: '#777', fontSize: 12, marginTop: 4 }}>Safe preview / shared content frame / commentary overlay</Text>
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#aaa', fontSize: 11 }}>👁 284 viewers</Text>
          <Text style={{ color: '#ff9abf', fontSize: 11, fontWeight: '900' }}>Mistress cam enabled</Text>
        </View>
      </View>

      <LiveRoomViewerModeToggle />
      <WatchWithMistressQuickActions />
      <LiveRoomGiftRail />
      <LiveRoomGoalProgressCard />
      <LiveRoomRequestQueue />
      <LiveRoomChatPreviewPanel />
      <LiveRoomTopSupportersBoard />
      <LiveRoomReplayAccessCard />
    </ScrollView>
  );
}
