import React from 'react';
import { Text, View } from 'react-native';
import { BookingsScreen } from '../bookings/BookingsScreen';
import { ChatScreen } from '../chat/ChatScreen';
import { GiftsGoalsScreen } from '../gifts/GiftsGoalsScreen';
import { LiveAccessStackScreen } from '../live-access/LiveAccessStackScreen';
import { LiveRoomScreen } from '../live/LiveRoomScreen';
import { InventoryPluginsScreen } from '../marketplace/InventoryPluginsScreen';
import { EarningsVaultScreen } from '../money/EarningsVaultScreen';
import { NotificationsScreen } from '../notifications/NotificationsScreen';
import { PpvScreen } from '../ppv/PpvScreen';
import { StickerStudioScreen } from '../stickers/StickerStudioScreen';
import { UiLayoutDashboardRoute } from '../ui-layouts/uiLayoutDashboardRoute';
import { WishlistSupportScreen } from '../wishlist/WishlistSupportScreen';
import type { ProfileMenuDestination } from './FrostedProfileBurgerMenu';

type ProfileMenuDestinationPanelProps = {
  destination: ProfileMenuDestination;
  userId?: string | null;
  role?: string;
};

export function ProfileMenuDestinationPanel({ destination, userId, role }: ProfileMenuDestinationPanelProps) {
  if (destination === 'liveAccessStack') return <LiveAccessStackScreen />;
  if (destination === 'live') return <LiveRoomScreen />;
  if (destination === 'chat') return <ChatScreen />;
  if (destination === 'giftsGoals') return <GiftsGoalsScreen />;
  if (destination === 'bookings') return <BookingsScreen />;
  if (destination === 'wishlist') return <WishlistSupportScreen />;
  if (destination === 'stickers') return <StickerStudioScreen />;
  if (destination === 'ppv') return <PpvScreen />;
  if (destination === 'inventoryPlugins') return <InventoryPluginsScreen />;
  if (destination === 'earningsVault') return <EarningsVaultScreen />;
  if (destination === 'notifications') return <NotificationsScreen />;
  if (destination === 'uiLayoutStudio') {
    return <UiLayoutDashboardRoute userId={userId || 'anonymous'} role={role} />;
  }

  return (
    <View style={{ backgroundColor: '#111', borderRadius: 16, padding: 16 }}>
      <Text style={{ color: '#fff', fontWeight: '900' }}>Profile destination</Text>
      <Text style={{ color: '#aaa', marginTop: 6 }}>{destination}</Text>
    </View>
  );
}
