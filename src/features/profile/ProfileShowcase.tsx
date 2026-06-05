import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { InventoryGift, InventorySticker } from '../../api/inventoryApi';
import { mxTheme } from '../../theme/mxTheme';
import { FloatingProfileCard } from './FloatingProfileCard';
import { FrostedProfileBurgerMenu, type ProfileMenuDestination } from './FrostedProfileBurgerMenu';
import { ProfileGoalFundsPanel } from './ProfileGoalFundsPanel';
import { ProfileMenuDestinationPanel } from './ProfileMenuDestinationPanel';
import { WatchWithMistressProfileBanner, type WatchWithMistressBanner } from './WatchWithMistressProfileBanner';

type ProfileShowcaseProps = {
  userId?: string | null;
  displayName: string;
  roleLabel?: string;
  viewerRoleLabel?: string;
  stylePackTitle?: string;
  stylePackAccent?: string;
  stylePackTags?: string[];
  gifts?: InventoryGift[];
  stickers?: InventorySticker[];
  badges?: string[];
  showGoalFunds?: boolean;
  showGoalFundActions?: boolean;
  watchWithMistressBanner?: WatchWithMistressBanner;
  onOpenProfileDestination?: (destination: ProfileMenuDestination) => void;
};

type ProfileShowcaseRole = 'headmistress' | 'admin' | 'mistress' | 'sub' | 'member';

type ProfileShowcaseAction = {
  label: string;
  destination: ProfileMenuDestination;
  badge?: string;
};

const defaultWatchBanner: WatchWithMistressBanner = {
  title: 'Watch With Mistress: Velvet Cinema Room',
  state: 'active',
  accessLabel: 'Subscriber room',
  viewerCount: 42,
  hasMistressCam: true,
  hasRetroTvOverlay: true,
  chatSummary: 'Chat live · 18 reactions',
  giftSummary: 'Gifts + paid requests enabled',
  primaryActionLabel: 'Resume watching',
};

const crownRoleConfig: Record<ProfileShowcaseRole, { tierLabel: string; mark: string; accentColor: string; bannerColor: string; statusLabel: string }> = {
  headmistress: {
    tierLabel: 'Headmistress',
    mark: 'HM',
    accentColor: '#e879f9',
    bannerColor: '#3b0d4f',
    statusLabel: 'Command profile',
  },
  admin: {
    tierLabel: 'Admin',
    mark: 'AD',
    accentColor: '#93c5fd',
    bannerColor: '#102a55',
    statusLabel: 'Admin profile',
  },
  mistress: {
    tierLabel: 'Mistress',
    mark: 'MX',
    accentColor: mxTheme.colors.warning,
    bannerColor: '#3b2605',
    statusLabel: 'Verified creator',
  },
  sub: {
    tierLabel: 'Sub',
    mark: 'SB',
    accentColor: '#a5b4fc',
    bannerColor: '#1e1b4b',
    statusLabel: 'Member profile',
  },
  member: {
    tierLabel: 'Member',
    mark: 'MX',
    accentColor: mxTheme.colors.accentSoft,
    bannerColor: '#2b1321',
    statusLabel: 'Profile',
  },
};

function normalizeShowcaseRole(roleLabel?: string): ProfileShowcaseRole {
  const normalized = String(roleLabel || '').trim().toLowerCase();

  if (normalized === 'headmistress') return 'headmistress';
  if (normalized === 'admin') return 'admin';
  if (normalized === 'mistress') return 'mistress';
  if (normalized === 'sub') return 'sub';

  return 'member';
}

function getInitials(displayName: string) {
  return displayName
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'MX';
}

function getRoleActions(role: ProfileShowcaseRole): ProfileShowcaseAction[] {
  if (role === 'headmistress' || role === 'admin') {
    return [
      { label: 'Admin review', destination: 'notifications', badge: 'ADMIN' },
      { label: 'Layout command', destination: 'uiLayoutStudio' },
      { label: 'Inventory governance', destination: 'inventoryPlugins' },
    ];
  }

  if (role === 'mistress') {
    return [
      { label: 'Go live', destination: 'live', badge: 'LIVE' },
      { label: 'Bookings', destination: 'bookings' },
      { label: 'PPV library', destination: 'ppv' },
      { label: 'Earnings', destination: 'earningsVault' },
    ];
  }

  if (role === 'sub') {
    return [
      { label: 'Messages', destination: 'chat', badge: '3' },
      { label: 'Gifts', destination: 'giftsGoals' },
      { label: 'Wishlist', destination: 'wishlist' },
      { label: 'Sticker album', destination: 'stickers' },
    ];
  }

  return [
    { label: 'Watch', destination: 'liveAccessStack', badge: 'LIVE' },
    { label: 'Content store', destination: 'ppv' },
    { label: 'Help', destination: 'notifications' },
  ];
}

function ProfileCrownShowcaseHeader({
  displayName,
  roleLabel,
  badges,
  actionCount,
  stylePackTitle,
  stylePackAccent,
}: {
  displayName: string;
  roleLabel: string;
  badges: string[];
  actionCount: number;
  stylePackTitle?: string;
  stylePackAccent?: string;
}) {
  const role = normalizeShowcaseRole(roleLabel);
  const config = {
    ...crownRoleConfig[role],
    accentColor: stylePackAccent || crownRoleConfig[role].accentColor,
  };
  const honorBadge = badges.find((badge) => badge.toLowerCase() !== roleLabel.toLowerCase()) || config.statusLabel;

  return (
    <View
      style={{
        overflow: 'hidden',
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'rgba(245, 197, 66, 0.34)',
        backgroundColor: '#111',
        marginBottom: 14,
      }}
    >
      <View
        style={{
          backgroundColor: config.bannerColor,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(245, 197, 66, 0.24)',
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          <View
            style={{
              borderColor: config.accentColor,
              borderWidth: 1,
              borderRadius: 999,
              paddingHorizontal: 8,
              paddingVertical: 4,
              backgroundColor: 'rgba(0,0,0,0.32)',
            }}
          >
            <Text style={{ color: config.accentColor, fontSize: 10, fontWeight: '900' }}>{config.mark}</Text>
          </View>
          <Text style={{ color: config.accentColor, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
            {config.tierLabel}
          </Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '800' }}>{actionCount} actions</Text>
      </View>

      <View style={{ alignItems: 'center', paddingHorizontal: 14, paddingVertical: 18 }}>
        <View
          style={{
            width: 84,
            height: 84,
            borderRadius: 42,
            borderColor: config.accentColor,
            borderWidth: 2,
            backgroundColor: '#090909',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 10,
          }}
        >
          <Text style={{ color: config.accentColor, fontSize: 26, fontWeight: '900' }}>{getInitials(displayName)}</Text>
        </View>
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: '900', textAlign: 'center' }}>{displayName}</Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12, fontWeight: '800' }}>{roleLabel}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <View
            style={{
              borderWidth: 1,
              borderColor: 'rgba(74, 222, 128, 0.55)',
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#4ade80', fontSize: 11, fontWeight: '900' }}>Online-ready</Text>
          </View>
          <View
            style={{
              borderWidth: 1,
              borderColor: `${config.accentColor}80`,
              borderRadius: 999,
              paddingHorizontal: 10,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: config.accentColor, fontSize: 11, fontWeight: '900' }}>{honorBadge}</Text>
          </View>
          {stylePackTitle ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: `${config.accentColor}66`,
                borderRadius: 999,
                paddingHorizontal: 10,
                paddingVertical: 5,
                backgroundColor: 'rgba(0,0,0,0.22)',
              }}
            >
              <Text style={{ color: config.accentColor, fontSize: 11, fontWeight: '900' }}>{stylePackTitle}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}

function ProfileRoleActionPanel({
  actions,
  accentColor,
  onAction,
}: {
  actions: ProfileShowcaseAction[];
  accentColor: string;
  onAction: (destination: ProfileMenuDestination) => void;
}) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
        Profile Actions
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {actions.map((action, index) => (
          <Pressable
            key={action.label}
            accessibilityRole="button"
            accessibilityLabel={`Open ${action.label}`}
            onPress={() => onAction(action.destination)}
            style={{
              flexGrow: 1,
              minWidth: index === 0 ? 150 : 118,
              borderWidth: 1,
              borderColor: index === 0 ? accentColor : 'rgba(255,255,255,0.14)',
              backgroundColor: index === 0 ? accentColor : 'rgba(255,255,255,0.08)',
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 11,
            }}
          >
            <Text style={{ color: index === 0 ? '#050505' : '#fff', fontSize: 12, fontWeight: '900' }}>{action.label}</Text>
            {action.badge ? (
              <Text style={{ color: index === 0 ? '#241400' : accentColor, fontSize: 10, fontWeight: '900', marginTop: 3 }}>
                {action.badge}
              </Text>
            ) : null}
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export function ProfileShowcase({
  userId,
  displayName,
  roleLabel = 'Member',
  viewerRoleLabel,
  stylePackTitle,
  stylePackAccent,
  stylePackTags = [],
  gifts = [],
  stickers = [],
  badges = [],
  showGoalFunds = true,
  showGoalFundActions = true,
  watchWithMistressBanner = defaultWatchBanner,
  onOpenProfileDestination,
}: ProfileShowcaseProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeProfileDestination, setActiveProfileDestination] = useState<ProfileMenuDestination | null>(null);
  const featuredGifts = gifts.slice(0, 4);
  const featuredStickers = stickers.slice(0, 4);
  const profileRole = normalizeShowcaseRole(roleLabel);
  const viewerRole = normalizeShowcaseRole(viewerRoleLabel || roleLabel);
  const roleActions = getRoleActions(profileRole);
  const crownConfig = crownRoleConfig[profileRole];
  const appliedAccent = stylePackAccent || crownConfig.accentColor;
  const showcaseTags = [roleLabel, ...stylePackTags.slice(0, 2), 'Watch Ready', 'Collector'];
  const isOwnerView = profileRole === viewerRole;

  const openProfileDestination = (destination: ProfileMenuDestination) => {
    if (onOpenProfileDestination) {
      onOpenProfileDestination(destination);
      return;
    }

    setActiveProfileDestination(destination);
  };

  if (activeProfileDestination) {
    return (
      <View style={{ backgroundColor: '#0b0b0b', padding: 16, borderRadius: 18 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to profile showcase"
          onPress={() => setActiveProfileDestination(null)}
          style={{
            alignSelf: 'flex-start',
            borderWidth: 1,
            borderColor: 'rgba(245, 197, 66, 0.55)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
            marginBottom: 12,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>← Profile</Text>
        </Pressable>
        <ProfileMenuDestinationPanel destination={activeProfileDestination} userId={userId} role={roleLabel} />
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: '#0b0b0b', padding: 16, borderRadius: 18 }}>
      <View style={{ alignItems: 'flex-end', marginBottom: 10 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open profile menu"
          onPress={() => setIsMenuOpen(true)}
          style={{
            borderWidth: 1,
            borderColor: 'rgba(245, 197, 66, 0.65)',
            backgroundColor: 'rgba(255, 255, 255, 0.08)',
            borderRadius: 999,
            paddingHorizontal: 12,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: mxTheme.colors.warning, fontWeight: '900' }}>☰</Text>
        </Pressable>
      </View>

      <ProfileCrownShowcaseHeader
        displayName={displayName}
        roleLabel={roleLabel}
        badges={badges}
        actionCount={roleActions.length}
        stylePackTitle={stylePackTitle}
        stylePackAccent={appliedAccent}
      />

      <ProfileRoleActionPanel actions={roleActions} accentColor={appliedAccent} onAction={openProfileDestination} />

      <WatchWithMistressProfileBanner banner={watchWithMistressBanner} />

      <FloatingProfileCard
        displayName={displayName}
        subtitle={roleLabel}
        statusLabel="PROFILE"
        metaLabel="White outlined discovery card style"
        rarityLabel="Mistress-X Showcase"
        tags={showcaseTags}
        icons={[
          { key: 'watch', label: 'WATCH', state: 'highlighted' },
          { key: 'live', label: 'LIVE', state: 'verified' },
          { key: 'chat', label: 'CHAT', state: 'highlighted' },
          { key: 'gift', label: 'GIFT', state: 'greyed' },
        ]}
        accentColor={appliedAccent}
      />

      {!isOwnerView ? (
        <View
          style={{
            backgroundColor: 'rgba(245, 197, 66, 0.10)',
            borderColor: `${appliedAccent}44`,
            borderWidth: 1,
            borderRadius: 14,
            padding: 12,
            marginBottom: 16,
          }}
        >
          <Text style={{ color: appliedAccent, fontWeight: '900' }}>Viewer-safe profile actions</Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4, fontSize: 12 }}>
            Showing {crownRoleConfig[viewerRole].tierLabel} access against this {crownConfig.tierLabel} profile surface.
          </Text>
        </View>
      ) : null}

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Badges
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {badges.length === 0 ? (
            <Text style={{ color: '#666' }}>No badges yet.</Text>
          ) : (
            badges.map((badge) => (
              <View key={badge} style={{ backgroundColor: '#1b1b1b', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 999 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{badge}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {showGoalFunds ? (
        <ProfileGoalFundsPanel enableActions={showGoalFundActions} mistressUserId={userId} />
      ) : null}

      <View style={{ marginBottom: 16 }}>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Featured Gifts
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {featuredGifts.length === 0 ? (
            <Text style={{ color: '#666' }}>No featured gifts yet.</Text>
          ) : (
            featuredGifts.map((item) => (
              <View key={item.id} style={{ backgroundColor: '#111', padding: 10, borderRadius: 12, minWidth: 70, alignItems: 'center' }}>
                <Text style={{ fontSize: 24 }}>{item.gift?.emoji || 'gift'}</Text>
                <Text style={{ color: '#fff', fontSize: 12 }}>{item.gift?.name || 'Gift'}</Text>
                <Text style={{ color: '#ff9abf', fontSize: 11 }}>x{item.quantity}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      <View>
        <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
          Featured Stickers
        </Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {featuredStickers.length === 0 ? (
            <Text style={{ color: '#666' }}>No featured stickers yet.</Text>
          ) : (
            featuredStickers.map((item) => (
              <View key={item.id} style={{ backgroundColor: '#111', padding: 10, borderRadius: 12, minWidth: 90 }}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>{item.sticker?.title || 'Sticker'}</Text>
                <Text style={{ color: '#ff9abf', fontSize: 11 }}>x{item.quantity}</Text>
              </View>
            ))
          )}
        </View>
      </View>

      {isMenuOpen ? (
        <FrostedProfileBurgerMenu
          displayName={displayName}
          roleLabel={roleLabel}
          onClose={() => setIsMenuOpen(false)}
          onNavigate={openProfileDestination}
        />
      ) : null}
    </View>
  );
}
