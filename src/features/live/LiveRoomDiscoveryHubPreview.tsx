import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { LiveRoomAccessPills } from './LiveRoomAccessPills';
import { LiveRoomCountdownBanner } from './LiveRoomCountdownBanner';
import { LiveRoomDiscoveryChips } from './LiveRoomDiscoveryChips';
import { LiveRoomFeaturedGrid } from './LiveRoomFeaturedGrid';
import { LiveRoomRegionDiscoveryCard } from './LiveRoomRegionDiscoveryCard';
import { LiveRoomStatusSummary } from './LiveRoomStatusSummary';

export function LiveRoomDiscoveryHubPreview() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#000', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900' }}>Live & Watch Hub</Text>
        <Text style={{ color: '#999', marginTop: 4 }}>
          Preview shell for live shows, Watch With Mistress, audio rooms, events, access filters, and region discovery.
        </Text>
      </View>

      <LiveRoomCountdownBanner />
      <LiveRoomDiscoveryChips />
      <LiveRoomAccessPills />
      <LiveRoomFeaturedGrid />
      <LiveRoomStatusSummary />
      <LiveRoomRegionDiscoveryCard />
    </ScrollView>
  );
}
