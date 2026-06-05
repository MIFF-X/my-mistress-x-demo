import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { mxTheme } from '../../theme/mxTheme';

export type ProfileMenuDestination =
  | 'liveAccessStack'
  | 'live'
  | 'chat'
  | 'giftsGoals'
  | 'bookings'
  | 'wishlist'
  | 'stickers'
  | 'ppv'
  | 'inventoryPlugins'
  | 'earningsVault'
  | 'uiLayoutStudio'
  | 'notifications';

type ProfileMenuRole = 'guest' | 'sub' | 'mistress' | 'headmistress' | 'admin';

type FrostedProfileBurgerMenuProps = {
  displayName: string;
  roleLabel: string;
  onClose: () => void;
  onNavigate?: (destination: ProfileMenuDestination) => void;
};

type ProfileMenuItem = {
  label: string;
  destination: ProfileMenuDestination;
  badge?: string;
  roles: ProfileMenuRole[];
  ownerOnly?: boolean;
};

const allRoles: ProfileMenuRole[] = ['guest', 'sub', 'mistress', 'headmistress', 'admin'];
const loggedInRoles: ProfileMenuRole[] = ['sub', 'mistress', 'headmistress', 'admin'];
const creatorRoles: ProfileMenuRole[] = ['mistress', 'headmistress', 'admin'];
const adminRoles: ProfileMenuRole[] = ['headmistress', 'admin'];

const menuGroups: ProfileMenuItem[][] = [
  [
    { label: 'Watch With Mistress', destination: 'liveAccessStack', badge: 'LIVE', roles: allRoles },
    { label: 'Live Shows', destination: 'live', roles: allRoles },
    { label: 'Messages', destination: 'chat', badge: '3', roles: loggedInRoles },
    { label: 'Gifts', destination: 'giftsGoals', roles: loggedInRoles },
  ],
  [
    { label: 'Bookings', destination: 'bookings', roles: loggedInRoles },
    { label: 'Wishlist', destination: 'wishlist', roles: loggedInRoles },
    { label: 'Sticker Album', destination: 'stickers', roles: loggedInRoles },
    { label: 'Content Store', destination: 'ppv', roles: allRoles },
  ],
  [
    { label: 'Vending / Hamper / Vault', destination: 'inventoryPlugins', roles: loggedInRoles },
    { label: 'Earnings Vault', destination: 'earningsVault', roles: creatorRoles, ownerOnly: true },
    { label: 'Settings', destination: 'uiLayoutStudio', roles: loggedInRoles },
    { label: 'Help / Report', destination: 'notifications', roles: allRoles },
  ],
  [
    { label: 'Admin Review', destination: 'notifications', badge: 'ADMIN', roles: adminRoles },
  ],
];

function normalizeProfileMenuRole(roleLabel: string): ProfileMenuRole {
  const normalized = roleLabel.trim().toLowerCase();

  if (normalized === 'headmistress') return 'headmistress';
  if (normalized === 'admin') return 'admin';
  if (normalized === 'mistress') return 'mistress';
  if (normalized === 'sub') return 'sub';

  return 'guest';
}

function getVisibleMenuGroups(role: ProfileMenuRole) {
  return menuGroups
    .map((group) => group.filter((item) => item.roles.includes(role)))
    .filter((group) => group.length > 0);
}

export function FrostedProfileBurgerMenu({ displayName, roleLabel, onClose, onNavigate }: FrostedProfileBurgerMenuProps) {
  const role = normalizeProfileMenuRole(roleLabel);
  const visibleMenuGroups = getVisibleMenuGroups(role);
  const openDestination = (destination: ProfileMenuDestination) => {
    onClose();
    onNavigate?.(destination);
  };

  return (
    <View
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        bottom: 8,
        width: '86%',
        borderRadius: 22,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.25)',
        backgroundColor: 'rgba(16, 8, 22, 0.96)',
        padding: 14,
        zIndex: 10,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <View>
          <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{displayName}</Text>
          <Text style={{ color: mxTheme.colors.warning, marginTop: 4, fontWeight: '700' }}>{roleLabel}</Text>
          <Text style={{ color: '#ff9abf', marginTop: 4, fontSize: 12 }}>
            {role === 'guest' ? 'Preview-safe menu' : 'Active Watch context visible behind menu'}
          </Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Close profile menu" onPress={onClose}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '900' }}>×</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {visibleMenuGroups.map((group, index) => (
          <View key={`menu-group-${index}`} style={{ marginBottom: 12 }}>
            {group.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                accessibilityLabel={`Open ${item.label}`}
                onPress={() => openDestination(item.destination)}
                style={{
                  backgroundColor: item.ownerOnly ? 'rgba(245, 197, 66, 0.12)' : 'rgba(255,255,255,0.08)',
                  borderWidth: 1,
                  borderColor: item.ownerOnly ? 'rgba(245, 197, 66, 0.32)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 14,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  marginBottom: 8,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '800' }}>{item.label}</Text>
                {item.badge ? (
                  <View style={{ backgroundColor: mxTheme.colors.warning, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 3 }}>
                    <Text style={{ color: '#050505', fontSize: 10, fontWeight: '900' }}>{item.badge}</Text>
                  </View>
                ) : null}
              </Pressable>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
