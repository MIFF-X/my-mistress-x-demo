import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LiveAudioRoomSeatMap } from './LiveAudioRoomSeatMap';
import { LiveRoomAccessPills } from './LiveRoomAccessPills';
import { LiveRoomChatPreviewPanel } from './LiveRoomChatPreviewPanel';
import { LiveRoomCountdownBanner } from './LiveRoomCountdownBanner';
import { LiveRoomDiscoveryChips } from './LiveRoomDiscoveryChips';
import { LiveRoomEventCard } from './LiveRoomEventCard';
import { LiveRoomFeaturedGrid } from './LiveRoomFeaturedGrid';
import { LiveRoomGiftRail } from './LiveRoomGiftRail';
import { LiveRoomGoalProgressCard } from './LiveRoomGoalProgressCard';
import { LiveRoomInviteCodeCard } from './LiveRoomInviteCodeCard';
import { LiveRoomRegionDiscoveryCard } from './LiveRoomRegionDiscoveryCard';
import { LiveRoomReplayAccessCard } from './LiveRoomReplayAccessCard';
import { LiveRoomRequestQueue } from './LiveRoomRequestQueue';
import { LiveRoomStatusSummary } from './LiveRoomStatusSummary';
import { LiveRoomTopSupportersBoard } from './LiveRoomTopSupportersBoard';
import { LiveRoomViewerModeToggle } from './LiveRoomViewerModeToggle';
import { WatchWithMistressQuickActions } from './WatchWithMistressQuickActions';

export function LiveRoomComponentGallery() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Live Room Component Gallery</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview catalogue for the Live Shows, Watch With Mistress, audio rooms, events, discovery, gifts, requests, and replay components.
        </Text>
      </View>

      <LiveRoomDiscoveryChips />
      <LiveRoomAccessPills />
      <LiveRoomCountdownBanner />
      <LiveRoomInviteCodeCard />
      <LiveRoomFeaturedGrid />
      <LiveRoomEventCard />
      <LiveRoomRegionDiscoveryCard />
      <LiveRoomStatusSummary />
      <LiveRoomViewerModeToggle />
      <WatchWithMistressQuickActions />
      <LiveRoomGiftRail />
      <LiveRoomGoalProgressCard />
      <LiveRoomRequestQueue />
      <LiveRoomChatPreviewPanel />
      <LiveRoomTopSupportersBoard />
      <LiveRoomReplayAccessCard />
      <LiveAudioRoomSeatMap />
    </ScrollView>
  );
}
