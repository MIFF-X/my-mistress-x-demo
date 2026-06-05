import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { getAdminComplianceOverview, listAdminModeration } from '../../api/adminCommandApi';
import { listMarketplaceSellerOrders } from '../../api/marketplaceApi';
import { listNotifications } from '../../api/notificationsApi';
import { getWalletBalance } from '../../api/walletApi';
import { clearAuthSession, getCurrentUser } from '../../state/authStore';
import { mxTheme } from '../../theme/mxTheme';
import { AbacusAiScreen } from '../abacus/AbacusAiScreen';
import { AiProviderTeamScreen } from '../ai-team/AiProviderTeamScreen';
import { AdminActionQueueScreen } from '../admin/AdminActionQueueScreen';
import { AdminAnalyticsStatusScreen } from '../admin/AdminAnalyticsStatusScreen';
import { AdminCommandCentreScreen } from '../admin/AdminCommandCentreScreen';
import { AdminEconomyEngineScreen } from '../admin/AdminEconomyEngineScreen';
import { AdminMemberDelegationScreen, TrustedMemberDelegationScreen } from '../admin/AdminMemberDelegationScreen';
import { AdminPluginCommandScreen } from '../admin/AdminPluginCommandScreen';
import { AdminUserCommandScreen } from '../admin/AdminUserCommandScreen';
import { HeadmistressDashboardScreen } from '../admin/HeadmistressDashboardScreen';
import type { PolicyGuardHandoffTarget } from '../admin/HeadmistressDashboardScreen';
import { BookingsScreen } from '../bookings/BookingsScreen';
import { CallSchedulingScreen } from '../bookings/CallSchedulingScreen';
import { getActionButtonSpec, getDashboardWidgetVisuals, type ActionButtonKey } from '../buttons/ActionButtonPack';
import { ChatScreen } from '../chat/ChatScreen';
import { ContentLibraryScreen } from '../content-library/ContentLibraryScreen';
import { CreatorGrowthAnalyticsDashboard } from '../creator-growth/CreatorGrowthAnalyticsDashboard';
import { CreatorGrowthToolsScreen } from '../creator-growth/CreatorGrowthToolsScreen';
import { GameHubScreen } from '../games/GameHubScreen';
import { GiftsGoalsScreen } from '../gifts/GiftsGoalsScreen';
import { MagneticFeatureDashboardScreen } from '../magnetic/MagneticFeatureDashboardScreen';
import { InventoryScreen } from '../inventory/InventoryScreen';
import { KeeperAllowanceScreen } from '../keeper/KeeperAllowanceScreen';
import { LiveAccessStackScreen } from '../live-access/LiveAccessStackScreen';
import { LiveRoomScreen } from '../live/LiveRoomScreen';
import { CollectorEconomyScreen } from '../marketplace/CollectorEconomyScreen';
import { InventoryPluginsScreen } from '../marketplace/InventoryPluginsScreen';
import { MarketplaceInventoryScreen } from '../marketplace/MarketplaceInventoryScreen';
import { MarketplaceSellerOrdersScreen } from '../marketplace/MarketplaceSellerOrdersScreen';
import { PluginMarketplaceScreen } from '../marketplace/PluginMarketplaceScreen';
import { EarningsVaultScreen } from '../money/EarningsVaultScreen';
import { NotificationsScreen } from '../notifications/NotificationsScreen';
import { PositionsScreen } from '../positions/PositionsScreen';
import { PreviewOpsScreen } from '../preview-ops/PreviewOpsScreen';
import { PpvScreen } from '../ppv/PpvScreen';
import { ProfileShowcase } from '../profile/ProfileShowcase';
import { MxStreamDeckScreen } from '../plugins/MxStreamDeckScreen';
import { MistressQuickCheckZoneScreen } from '../quick-check/MistressQuickCheckZoneScreen';
import { RecordsTaxScreen } from '../records/RecordsTaxScreen';
import { LittleBlackBookScreen } from '../rolodex/LittleBlackBookScreen';
import { RolodexScreen } from '../rolodex/RolodexScreen';
import { StickerStudioScreen } from '../stickers/StickerStudioScreen';
import { StoreSupportScreen } from '../store/StoreSupportScreen';
import { StylePacksScreen } from '../style-packs/StylePacksScreen';
import { SubVaultScreen } from '../sub-vault/SubVaultScreen';
import { SubscriptionsScreen } from '../subscriptions/SubscriptionsScreen';
import { mapDashboardRoleToUiLayoutAudience } from '../ui-layouts/dashboardUiLayoutBridge';
import { UiLayoutDashboardRoute } from '../ui-layouts/uiLayoutDashboardRoute';
import { resolveAppliedUiLayoutTheme } from '../ui-layouts/uiLayoutAppliedTheme';
import { WalletScreen } from '../wallet/WalletScreen';
import { WishlistSupportScreen } from '../wishlist/WishlistSupportScreen';
import { WorkshopPortalScreen } from '../workshop/WorkshopPortalScreen';
import { DashboardModuleRegisterScreen } from './DashboardModuleRegisterScreen';
import { DashboardModuleScaffoldScreen } from './DashboardModuleScaffoldScreen';
import type { DashboardModuleScaffoldPayload } from './DashboardModuleScaffoldScreen';
import { DashboardWidget } from './widgets/DashboardWidget';
import {
  canManageMarketplaceInventory,
  createDashboardLayoutPreset,
  getAvailableDashboardPresets,
  getVisibleDashboardWidgetDefinitions,
  normalizeDashboardLayout,
} from './widgets/dashboardWidgetRegistry';
import type {
  DashboardLayoutPreset,
  DashboardRole,
  DashboardWidgetDefinition,
  DashboardWidgetLayoutItem,
  DashboardWidgetSize,
} from './widgets/dashboardWidgetRegistry';
import {
  clearDashboardLayoutState,
  loadDashboardLayoutState,
  saveDashboardLayoutState,
} from './widgets/dashboardLayoutStore';
import type { StoredDashboardLayout } from './widgets/dashboardLayoutStore';

type DashboardView =
  | 'abacusAI'
  | 'aiProviderTeam'
  | 'home'
  | 'bookings'
  | 'callScheduling'
  | 'chat'
  | 'contentLibrary'
  | 'dashboardModuleRegister'
  | 'moduleScaffold'
  | 'quickCheckZone'
  | 'creatorGrowth'
  | 'creatorGrowthAnalytics'
  | 'gameHub'
  | 'giftsGoals'
  | 'headmistressDashboard'
  | 'earningsVault'
  | 'live'
  | 'liveAccessStack'
  | 'inventory'
  | 'inventoryPlugins'
  | 'keeperAllowance'
  | 'collectorEconomy'
  | 'marketplaceInventory'
  | 'marketplaceOrders'
  | 'pluginMarketplace'
  | 'mxStreamDeck'
  | 'notifications'
  | 'positions'
  | 'previewOps'
  | 'profile'
  | 'records'
  | 'wallet'
  | 'storeSupport'
  | 'workshopPortal'
  | 'wishlist'
  | 'ppv'
  | 'magneticFeatures'
  | 'admin'
  | 'adminAnalytics'
  | 'adminEconomy'
  | 'adminMemberDelegation'
  | 'trustedMemberDelegation'
  | 'adminQueue'
  | 'adminUsers'
  | 'adminPlugins'
  | 'littleBlackBook'
  | 'rolodex'
  | 'stickers'
  | 'stylePacks'
  | 'subVault'
  | 'subscriptions'
  | 'uiLayoutStudio';

type DashboardScreenProps = {
  onLogout?: () => void;
};

type ActivePolicyGuardHandoff = PolicyGuardHandoffTarget & {
  requestedAt: string;
};

type DashboardModule = {
  title: string;
  subtitle: string;
  visual: ActionButtonKey;
  view?: DashboardView;
  badgeOverride?: string;
  locked?: boolean;
};

type DashboardSection = {
  title: 'Core' | 'Money' | 'Audience' | 'Marketplace' | 'Profile';
  subtitle: string;
  accentColor: string;
  items: DashboardModule[];
};

type DashboardSectionIdentity = {
  title: DashboardSection['title'];
  accentColor: string;
};

type DashboardModuleMatch = {
  section: DashboardSection;
  module: DashboardModule;
};

type DashboardSectionFilterValue = DashboardSection['title'] | 'All';

type DashboardHomeMode = 'role' | 'launcher' | 'custom';

type DashboardPriorityAction = {
  title: string;
  metric: string;
  detail: string;
  view?: DashboardView;
  section?: DashboardSectionFilterValue;
  accentColor: string;
};

type DashboardRoleFocus = {
  eyebrow: string;
  title: string;
  detail: string;
  accentColor: string;
  beats: string[];
};

type DashboardSurfaceCopy = {
  primaryModeLabel: string;
  launcherModeLabel: string;
  layoutModeLabel: string;
  launcherTitle: string;
  launcherSubtitle: string;
  layoutTitle: string;
  layoutStatusLabel: string;
  catalogueTitle: string;
  presetsTitle: string;
  emptyLayoutMessage: string;
};

type DashboardPriorityMetricsSource = 'loading' | 'api' | 'fallback';

type DashboardPriorityMetrics = {
  source: DashboardPriorityMetricsSource;
  unreadNotifications?: number;
  walletBalance?: number | string;
  sellerOrders?: number;
  adminOpenQueue?: number;
  adminEscalatedQueue?: number;
  adminUserChecks?: number;
};

const INITIAL_DASHBOARD_PRIORITY_METRICS: DashboardPriorityMetrics = {
  source: 'loading',
};

const CLOSED_ADMIN_QUEUE_STATUSES = new Set(['RESOLVED', 'DISMISSED', 'CLOSED']);
const CLOSED_MARKETPLACE_ORDER_STATUSES = new Set([
  'CANCELLED',
  'CANCELED',
  'COMPLETED',
  'DELIVERED',
  'FULFILLED',
  'REFUNDED',
  'REJECTED',
]);

type DashboardPalette = {
  core: string;
  money: string;
  audience: string;
  marketplace: string;
  profile: string;
};

const MODULES: Record<string, DashboardModule> = {
  abacusAI: {
    title: 'Abacus AI',
    subtitle: 'Insights, AI Studio, automations, provider health and audit trail',
    visual: 'abacusAI',
    view: 'abacusAI',
    badgeOverride: 'AI',
  },
  aiProviderTeam: {
    title: 'AI Provider Team',
    subtitle: 'Provider switcher, capability labels, routing policy and cost analytics',
    visual: 'aiProviderTeam',
    view: 'aiProviderTeam',
    badgeOverride: 'PROVIDERS',
  },
  headmistressDashboard: {
    title: 'Headmistress Dashboard',
    subtitle: 'Revenue, compliance, safety and risk overview',
    visual: 'admin',
    view: 'headmistressDashboard',
    badgeOverride: 'OWNER',
  },
  dashboardModuleRegister: {
    title: 'Dashboard Module Register',
    subtitle: 'Sub, Mistress and Headmistress tile homes from the uploaded sketches',
    visual: 'uiLayoutStudio',
    view: 'dashboardModuleRegister',
    badgeOverride: 'REGISTER',
  },
  magneticFeatures: {
    title: 'Magnetic Feature Dashboard',
    subtitle: 'Frontend/backend contract map, feature status, roles, endpoints and deploy readiness',
    visual: 'adminPlugins',
    view: 'magneticFeatures',
    badgeOverride: 'MAGNETIC',
  },
  quickCheckZone: {
    title: 'Quick Check Zone',
    subtitle: 'Confessions, affirmations, secrets, contracts, bookings, requests, Rolodex and fulfilment',
    visual: 'notifications',
    view: 'quickCheckZone',
    badgeOverride: 'CHECK',
  },
  admin: {
    title: 'Command Centre',
    subtitle: 'Platform oversight, control rooms and governance entry points',
    visual: 'admin',
    view: 'admin',
  },
  adminAnalytics: {
    title: 'Admin Analytics',
    subtitle: 'Conversations, tokens, subscriptions, system status and webhooks',
    visual: 'analytics',
    view: 'adminAnalytics',
    badgeOverride: 'ANALYTICS',
  },
  adminEconomy: {
    title: 'Economy Engine',
    subtitle: 'Money rules, stickers, ranks, punishments and live events',
    visual: 'adminEconomy',
    view: 'adminEconomy',
  },
  adminMemberDelegation: {
    title: 'Admin Member +',
    subtitle: 'Delegate admin roles, trusted members, jobs and admin messages',
    visual: 'adminUsers',
    view: 'adminMemberDelegation',
    badgeOverride: 'DELEGATE',
  },
  trustedMemberDelegation: {
    title: 'Trusted Member +',
    subtitle: 'Delegate creator profile helpers, trusted jobs and messages',
    visual: 'adminUsers',
    view: 'trustedMemberDelegation',
    badgeOverride: 'TRUSTED',
  },
  adminUsers: {
    title: 'Admin User Command',
    subtitle: 'Suspend, restore, ban and verify users',
    visual: 'adminUsers',
    view: 'adminUsers',
  },
  adminPlugins: {
    title: 'Admin Plugin Command',
    subtitle: 'Activate, scaffold, disable and park plugins',
    visual: 'adminPlugins',
    view: 'adminPlugins',
  },
  adminQueue: {
    title: 'Admin Action Queue',
    subtitle: 'Review, escalate, resolve and dismiss queue items',
    visual: 'adminQueue',
    view: 'adminQueue',
  },
  workshopPortal: {
    title: 'Workshop Portal',
    subtitle: 'Moderation queues, release downloads, OAuth links and role panels',
    visual: 'workshopPortal',
    view: 'workshopPortal',
    badgeOverride: 'PORTAL',
  },
  previewOps: {
    title: 'Preview Ops',
    subtitle: 'Local tunnels, readiness checks, public warnings and shutdown safety',
    visual: 'previewOps',
    view: 'previewOps',
    badgeOverride: 'PREVIEW',
  },
  notifications: {
    title: 'Notifications',
    subtitle: 'Inbox, alerts and platform notices',
    visual: 'notifications',
    view: 'notifications',
  },
  live: {
    title: 'Live Room',
    subtitle: 'Go live or join sessions',
    visual: 'live',
    view: 'live',
  },
  liveAccessStack: {
    title: 'Live Access Stack',
    subtitle: 'Rooms, paid calls, watch sessions, replays and safety gates',
    visual: 'live',
    view: 'liveAccessStack',
    badgeOverride: 'ACCESS',
  },
  bookings: {
    title: 'Paid Calls / Bookings',
    subtitle: 'Phone, video, timers and extensions',
    visual: 'bookings',
    view: 'bookings',
  },
  callScheduling: {
    title: 'Call Scheduling',
    subtitle: 'Scheduled call queue, wallet handoffs, reminders and calendar ids',
    visual: 'bookings',
    view: 'callScheduling',
    badgeOverride: 'SCHEDULE',
  },
  chat: {
    title: 'Chat',
    subtitle: 'Messages and paid chat',
    visual: 'chat',
    view: 'chat',
  },
  contentLibrary: {
    title: 'Content Library',
    subtitle: 'Media libraries, playlists, drops, packs and replay archives',
    visual: 'contentLibrary',
    view: 'contentLibrary',
    badgeOverride: 'LIBRARY',
  },
  giftsGoals: {
    title: 'Gifts & Goals',
    subtitle: 'Premium gifts, public funds, contributions and receipts',
    visual: 'giftsGoals',
    view: 'giftsGoals',
  },
  ppv: {
    title: 'PPV Vault',
    subtitle: 'Premium content unlocks',
    visual: 'ppv',
    view: 'ppv',
  },
  subscriptions: {
    title: 'Memberships',
    subtitle: 'Subscription tiers and creator plans',
    visual: 'subscriptions',
    view: 'subscriptions',
  },
  wallet: {
    title: 'Wallet',
    subtitle: 'Balance, transactions and payment readiness',
    visual: 'wallet',
    view: 'wallet',
  },
  earningsVault: {
    title: 'Earnings Vault',
    subtitle: 'Creator cashout, payout methods, reserves and approval status',
    visual: 'wallet',
    view: 'earningsVault',
    badgeOverride: 'PAYOUT',
  },
  keeperAllowance: {
    title: 'Keeper & Allowance Wallet',
    subtitle: 'Agreements, caps, renewals, goal roles, receipts and audit trail',
    visual: 'keeperAllowance',
    view: 'keeperAllowance',
    badgeOverride: 'KEEPER',
  },
  records: {
    title: 'Records & Tax Notes',
    subtitle: 'Creator receipts, platform fees, net records and export text',
    visual: 'records',
    view: 'records',
  },
  storeSupport: {
    title: 'Store Support',
    subtitle: 'Store worlds, buyer purchases and creator item setup',
    visual: 'storeSupport',
    view: 'storeSupport',
  },
  wishlist: {
    title: 'Wishlist Support',
    subtitle: 'Creator wishlists, buyer purchase flow and reserve intent',
    visual: 'wishlist',
    view: 'wishlist',
  },
  positions: {
    title: 'Positions & Leaderboards',
    subtitle: 'Crown, shoe, bag, door holders and ranks',
    visual: 'positions',
    view: 'positions',
  },
  stickers: {
    title: 'Sticker Studio',
    subtitle: 'Create, collect and release sticker drops',
    visual: 'stickers',
    view: 'stickers',
  },
  stylePacks: {
    title: 'Style Packs',
    subtitle: 'Free, paid, custom and installed UI packs',
    visual: 'stylePacks',
    view: 'stylePacks',
    badgeOverride: 'STYLE',
  },

  uiLayoutStudio: {
    title: 'UI Layout Studio',
    subtitle: 'Choose web/app dashboard layouts, responsive shells and style modes',
    visual: 'uiLayoutStudio',
    view: 'uiLayoutStudio',
    badgeOverride: 'LAYOUT',
  },
  rolodex: {
    title: 'Rolodex Cards',
    subtitle: 'Contact cards, notes and quick tags',
    visual: 'rolodex',
    view: 'rolodex',
  },
  creatorGrowth: {
    title: 'Creator Growth Tools',
    subtitle: 'Profile links, QR campaigns, traffic sources and conversion destinations',
    visual: 'creatorGrowth',
    view: 'creatorGrowth',
  },
  creatorGrowthAnalytics: {
    title: 'Creator Growth Analytics',
    subtitle: 'Campaign events, sources, conversions and rates',
    visual: 'creatorGrowthAnalytics',
    view: 'creatorGrowthAnalytics',
  },
  gameHub: {
    title: 'Game Hub',
    subtitle: 'Quiz imports, hosted games, reaction rooms and live overlays',
    visual: 'gameHub',
    view: 'gameHub',
    badgeOverride: 'GAMES',
  },
  mxStreamDeck: {
    title: 'MX Stream Deck',
    subtitle: 'Role-aware quick replies, game buttons, QR setup and command actions',
    visual: 'gameHub',
    view: 'mxStreamDeck',
    badgeOverride: 'DECK',
  },
  collectorEconomy: {
    title: 'Collector Economy',
    subtitle: 'Marketplace worlds, order states, rewards and dispute flow',
    visual: 'marketplaceInventory',
    view: 'collectorEconomy',
    badgeOverride: 'COLLECT',
  },
  marketplaceInventory: {
    title: 'Marketplace Inventory Worlds',
    subtitle: 'Create and manage vending, hamper and mystery stock',
    visual: 'marketplaceInventory',
    view: 'marketplaceInventory',
  },
  marketplaceOrders: {
    title: 'Marketplace Orders',
    subtitle: 'Fulfil sales, update status, tracking and seller notes',
    visual: 'marketplaceOrders',
    view: 'marketplaceOrders',
  },
  inventoryPluginsCreator: {
    title: 'Inventory Plugins',
    subtitle: 'Buyer-facing plugin-world flow preview',
    visual: 'inventoryPlugins',
    view: 'inventoryPlugins',
    badgeOverride: 'STORE',
  },
  inventoryPluginsBuyer: {
    title: 'Inventory Plugins',
    subtitle: 'Browse, request approval and purchase items',
    visual: 'inventoryPlugins',
    view: 'inventoryPlugins',
    badgeOverride: 'SHOP',
  },
  inventory: {
    title: 'Inventory',
    subtitle: 'Your owned gifts and sticker album',
    visual: 'inventory',
    view: 'inventory',
  },
  profile: {
    title: 'Profile',
    subtitle: 'Your public showcase',
    visual: 'profile',
    view: 'profile',
  },
  analytics: {
    title: 'Analytics',
    subtitle: 'Earnings and performance',
    visual: 'analytics',
    locked: true,
  },
};

function canOpenCommandCentre(role?: string) {
  return role === 'HEADMISTRESS' || role === 'ADMIN';
}

function nextWidgetSize(size: DashboardWidgetSize): DashboardWidgetSize {
  if (size === 'compact') return 'standard';
  if (size === 'standard') return 'wide';
  return 'compact';
}

function sourceLabel(widget: DashboardWidgetDefinition) {
  if (widget.source === 'plugin') return widget.pluginKey ? `Plugin: ${widget.pluginKey}` : 'Plugin';
  return 'Core';
}

function widgetIdentityLabel(widget: DashboardWidgetDefinition, sectionTitle?: DashboardSection['title']) {
  const source = sourceLabel(widget);
  if (!sectionTitle || sectionTitle === source) return source;
  return `${sectionTitle} | ${source}`;
}

function catalogueMeta(widget: DashboardWidgetDefinition, status: string, sectionTitle?: DashboardSection['title']) {
  return `${widgetIdentityLabel(widget, sectionTitle)} | ${status}`;
}

function buildDashboardSectionIdentityByView(sections: DashboardSection[]) {
  const identityByView = new Map<DashboardView, DashboardSectionIdentity>();

  sections.forEach((section) => {
    section.items.forEach((item) => {
      if (!item.view || identityByView.has(item.view)) return;

      identityByView.set(item.view, {
        title: section.title,
        accentColor: section.accentColor,
      });
    });
  });

  return identityByView;
}

function getWidgetSectionIdentity(
  widget: DashboardWidgetDefinition,
  sections: DashboardSection[],
  identityByView: Map<DashboardView, DashboardSectionIdentity>,
  fallbackAccentColor: string,
) {
  const viewIdentity = identityByView.get(widget.view as DashboardView);
  if (viewIdentity) return viewIdentity;

  const titleSection = sections.find((section) => section.items.some((item) => item.title === widget.title));
  if (titleSection) {
    return {
      title: titleSection.title,
      accentColor: titleSection.accentColor,
    };
  }

  return {
    title: 'Core' as const,
    accentColor: fallbackAccentColor,
  };
}

function findDashboardModuleByView(sections: DashboardSection[], view: DashboardView): DashboardModuleMatch | undefined {
  for (const section of sections) {
    const module = section.items.find((item) => item.view === view);
    if (module) return { section, module };
  }

  return undefined;
}

function DashboardActionButton({
  label,
  accentColor = mxTheme.colors.accent,
  accented,
  active,
  disabled,
  onPress,
}: {
  label: string;
  accentColor?: string;
  accented?: boolean;
  active?: boolean;
  disabled?: boolean;
  onPress?: () => void;
}) {
  const showAccent = !disabled && (active || accented);

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={{
        backgroundColor: active ? '#171717' : '#111',
        borderColor: showAccent ? accentColor : mxTheme.colors.border,
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 11,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={{ color: disabled ? mxTheme.colors.muted : showAccent ? accentColor : mxTheme.colors.text, fontSize: 12, fontWeight: '900' }}>{label}</Text>
    </Pressable>
  );
}

function AccessNotice({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '800' }}>{title}</Text>
      {subtitle ? <Text style={{ color: '#aaa', marginTop: 8 }}>{subtitle}</Text> : null}
    </View>
  );
}

function CatalogueRow({
  widget,
  status,
  sectionIdentity,
  locked,
  onAction,
  onRemove,
}: {
  widget: DashboardWidgetDefinition;
  status: string;
  sectionIdentity?: DashboardSectionIdentity;
  locked: boolean;
  onAction: () => void;
  onRemove?: () => void;
}) {
  const accentColor = sectionIdentity?.accentColor || mxTheme.colors.accent;

  return (
    <View style={{ borderTopColor: mxTheme.colors.border, borderTopWidth: 1, paddingVertical: 10 }}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        <View style={{ width: 4, borderRadius: 999, backgroundColor: accentColor, opacity: locked ? 0.45 : 1 }} />
        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <View style={{ flex: 1, minWidth: 180 }}>
            <Text style={{ color: mxTheme.colors.text, fontWeight: '900' }}>{widget.title}</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, marginTop: 3 }}>
              {catalogueMeta(widget, status, sectionIdentity?.title)}
            </Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            <DashboardActionButton label={status === 'Visible' ? 'Hide' : status === 'Hidden' ? 'Show' : 'Add'} accentColor={accentColor} accented disabled={locked} onPress={onAction} />
            {onRemove ? <DashboardActionButton label="Remove" accentColor={accentColor} accented disabled={locked} onPress={onRemove} /> : null}
          </View>
        </View>
      </View>
    </View>
  );
}

function getDashboardPalette(role?: string): DashboardPalette {
  if (role === 'HEADMISTRESS' || role === 'ADMIN') {
    return {
      core: '#d4af37',
      money: '#f5c542',
      audience: '#60a5fa',
      marketplace: '#1D9E75',
      profile: '#2dd4bf',
    };
  }

  if (role === 'MISTRESS') {
    return {
      core: '#ff4d8d',
      money: '#d4af37',
      audience: '#7dd3fc',
      marketplace: '#1D9E75',
      profile: '#c084fc',
    };
  }

  return {
    core: '#60a5fa',
    money: '#1D9E75',
    audience: '#f5c542',
    marketplace: '#a3e635',
    profile: '#2dd4bf',
  };
}

function formatRoleLabel(role?: string) {
  if (!role) return 'Member';
  if (role === 'HEADMISTRESS') return 'Headmistress';
  return role.charAt(0) + role.slice(1).toLowerCase();
}

function getConsoleLabel(role?: string) {
  if (role === 'HEADMISTRESS') return 'Headmistress Console';
  if (role === 'ADMIN') return 'Admin Console';
  if (role === 'MISTRESS') return 'Creator Console';
  if (role === 'SUB') return 'Sub Console';
  return 'Member Console';
}

function getDashboardRoleFocus(role: string | undefined, palette: DashboardPalette, canUseAdmin: boolean): DashboardRoleFocus {
  if (canUseAdmin) {
    return {
      eyebrow: role === 'HEADMISTRESS' ? 'Headmistress Mode' : 'Admin Mode',
      title: 'Command first',
      detail: 'Queue, risk, economy and creator operations stay closest to hand.',
      accentColor: palette.core,
      beats: ['Queue', 'Compliance', 'Economy'],
    };
  }

  if (role === 'MISTRESS') {
    return {
      eyebrow: 'Creator Mode',
      title: 'Revenue first',
      detail: 'Growth, paid access, orders and records stay ahead of the general tools.',
      accentColor: palette.core,
      beats: ['Go Live', 'Orders', 'Records'],
    };
  }

  return {
    eyebrow: 'Sub Mode',
    title: 'Access first',
    detail: 'Chat, live sessions, wallet and unlocks stay close.',
    accentColor: palette.core,
    beats: ['Chat', 'Live', 'Wallet'],
  };
}

function getDashboardSurfaceCopy(role: string | undefined, canUseAdmin: boolean): DashboardSurfaceCopy {
  if (canUseAdmin) {
    return {
      primaryModeLabel: 'Command',
      launcherModeLabel: 'Modules',
      layoutModeLabel: 'Layout',
      launcherTitle: 'Command Modules',
      launcherSubtitle: 'Command, money, audience, marketplace and profile tools by section.',
      layoutTitle: 'Command Layout',
      layoutStatusLabel: 'Command layout',
      catalogueTitle: 'Command Catalogue',
      presetsTitle: 'Command Presets',
      emptyLayoutMessage: 'No command widgets are visible.',
    };
  }

  if (role === 'MISTRESS') {
    return {
      primaryModeLabel: 'Revenue',
      launcherModeLabel: 'Modules',
      layoutModeLabel: 'Layout',
      launcherTitle: 'Creator Modules',
      launcherSubtitle: 'Revenue, audience, marketplace and profile tools by section.',
      layoutTitle: 'Creator Layout',
      layoutStatusLabel: 'Creator layout',
      catalogueTitle: 'Creator Catalogue',
      presetsTitle: 'Creator Presets',
      emptyLayoutMessage: 'No creator widgets are visible.',
    };
  }

  return {
    primaryModeLabel: 'Access',
    launcherModeLabel: 'Browse',
    layoutModeLabel: 'Layout',
    launcherTitle: 'Access Browser',
    launcherSubtitle: 'Chat, live, wallet, unlocks and profile tools by section.',
    layoutTitle: 'Access Layout',
    layoutStatusLabel: 'Access layout',
    catalogueTitle: 'Access Catalogue',
    presetsTitle: 'Access Presets',
    emptyLayoutMessage: 'No access widgets are visible.',
  };
}

function buildDashboardSections(role: string | undefined, palette: DashboardPalette, canUseAdmin: boolean): DashboardSection[] {
  if (canUseAdmin) {
    return [
      {
        title: 'Core',
        subtitle: 'Command and control first.',
        accentColor: palette.core,
        items: [MODULES.headmistressDashboard, MODULES.dashboardModuleRegister, MODULES.magneticFeatures, MODULES.quickCheckZone, MODULES.abacusAI, MODULES.aiProviderTeam, MODULES.admin, MODULES.adminAnalytics, MODULES.adminEconomy, MODULES.adminMemberDelegation, MODULES.adminUsers, MODULES.adminPlugins, MODULES.adminQueue, MODULES.workshopPortal, MODULES.previewOps],
      },
      {
        title: 'Money',
        subtitle: 'Revenue, transactions and monetisation checks.',
        accentColor: palette.money,
        items: [MODULES.wallet, MODULES.earningsVault, MODULES.keeperAllowance, MODULES.records, MODULES.wishlist, MODULES.giftsGoals, MODULES.ppv, MODULES.subscriptions],
      },
      {
        title: 'Audience',
        subtitle: 'Alerts, live sessions, chat and recognition.',
        accentColor: palette.audience,
        items: [MODULES.notifications, MODULES.live, MODULES.liveAccessStack, MODULES.gameHub, MODULES.contentLibrary, MODULES.bookings, MODULES.callScheduling, MODULES.chat, MODULES.positions, MODULES.stickers, MODULES.rolodex],
      },
      {
        title: 'Marketplace',
        subtitle: 'Creator growth, inventory worlds and order flow.',
        accentColor: palette.marketplace,
        items: [MODULES.stylePacks, MODULES.mxStreamDeck, MODULES.uiLayoutStudio, MODULES.storeSupport, MODULES.creatorGrowth, MODULES.creatorGrowthAnalytics, MODULES.collectorEconomy, MODULES.marketplaceInventory, MODULES.marketplaceOrders, MODULES.inventoryPluginsCreator],
      },
      {
        title: 'Profile',
        subtitle: 'Owned items, showcase and reporting.',
        accentColor: palette.profile,
        items: [MODULES.inventory, MODULES.profile, MODULES.analytics],
      },
    ];
  }

  if (role === 'MISTRESS') {
    return [
      {
        title: 'Core',
        subtitle: 'Creator growth and revenue controls first.',
        accentColor: palette.core,
        items: [MODULES.dashboardModuleRegister, MODULES.quickCheckZone, MODULES.trustedMemberDelegation, MODULES.abacusAI, MODULES.aiProviderTeam, MODULES.creatorGrowth, MODULES.creatorGrowthAnalytics, MODULES.contentLibrary, MODULES.workshopPortal, MODULES.giftsGoals, MODULES.ppv],
      },
      {
        title: 'Money',
        subtitle: 'Subscriptions, wallet and repeat revenue.',
        accentColor: palette.money,
        items: [MODULES.earningsVault, MODULES.records, MODULES.subscriptions, MODULES.wallet, MODULES.keeperAllowance, MODULES.wishlist],
      },
      {
        title: 'Audience',
        subtitle: 'Live sessions, paid access, chat and recognition.',
        accentColor: palette.audience,
        items: [MODULES.live, MODULES.liveAccessStack, MODULES.gameHub, MODULES.chat, MODULES.bookings, MODULES.callScheduling, MODULES.notifications, MODULES.positions, MODULES.stickers, MODULES.rolodex],
      },
      {
        title: 'Marketplace',
        subtitle: 'Inventory worlds, order management and buyer flows.',
        accentColor: palette.marketplace,
        items: [MODULES.stylePacks, MODULES.mxStreamDeck, MODULES.uiLayoutStudio, MODULES.storeSupport, MODULES.collectorEconomy, MODULES.marketplaceInventory, MODULES.marketplaceOrders, MODULES.inventoryPluginsCreator],
      },
      {
        title: 'Profile',
        subtitle: 'Owned items, showcase and reporting.',
        accentColor: palette.profile,
        items: [MODULES.inventory, MODULES.profile, MODULES.analytics],
      },
    ];
  }

  return [
    {
      title: 'Core',
      subtitle: 'Chat, live access and payments first.',
      accentColor: palette.core,
      items: [MODULES.dashboardModuleRegister, MODULES.chat, MODULES.live, MODULES.liveAccessStack, MODULES.wallet, MODULES.bookings, MODULES.callScheduling, MODULES.notifications],
    },
    {
      title: 'Money',
      subtitle: 'Purchases, unlocks, memberships and goals.',
      accentColor: palette.money,
      items: [MODULES.ppv, MODULES.contentLibrary, MODULES.subscriptions, MODULES.giftsGoals, MODULES.keeperAllowance, MODULES.wishlist],
    },
    {
      title: 'Audience',
      subtitle: 'Ranks, stickers and contact loops.',
      accentColor: palette.audience,
      items: [MODULES.gameHub, MODULES.mxStreamDeck, MODULES.positions, MODULES.stickers, MODULES.rolodex],
    },
    {
      title: 'Marketplace',
      subtitle: 'Browse inventory plugin worlds and owned items.',
      accentColor: palette.marketplace,
      items: [MODULES.storeSupport, MODULES.collectorEconomy, MODULES.inventoryPluginsBuyer, MODULES.inventory],
    },
    {
      title: 'Profile',
      subtitle: 'Public showcase and reporting.',
      accentColor: palette.profile,
      items: [MODULES.profile, MODULES.uiLayoutStudio, MODULES.analytics],
    },
  ];
}

function formatCountMetric(value: number | undefined, fallback: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }

  return value > 99 ? '99+' : String(value);
}

function formatCreditMetric(value: number | string | undefined, fallback: string) {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return String(value);
  }

  if (Math.abs(amount) >= 1000) {
    const compact = amount / 1000;
    return `${Number.isInteger(compact) ? compact.toFixed(0) : compact.toFixed(1)}k`;
  }

  return String(Math.round(amount));
}

function normalizeStatus(status: string | undefined) {
  return String(status || '').trim().toUpperCase();
}

function getMetricSourceLabel(source: DashboardPriorityMetricsSource) {
  if (source === 'api') {
    return 'live metrics';
  }

  if (source === 'loading') {
    return 'loading';
  }

  return 'demo metrics';
}

async function safeLoad<T>(loader: () => Promise<T>) {
  try {
    return await loader();
  } catch {
    return null;
  }
}

async function loadDashboardPriorityMetrics(
  role: string | undefined,
  canUseAdmin: boolean,
  canUseCreatorInventory: boolean,
): Promise<DashboardPriorityMetrics> {
  const [notifications, wallet, moderationQueue, complianceOverview, sellerOrders] = await Promise.all([
    safeLoad(listNotifications),
    safeLoad(getWalletBalance),
    canUseAdmin ? safeLoad(listAdminModeration) : Promise.resolve(null),
    canUseAdmin ? safeLoad(getAdminComplianceOverview) : Promise.resolve(null),
    canUseCreatorInventory || role === 'MISTRESS' ? safeLoad(listMarketplaceSellerOrders) : Promise.resolve(null),
  ]);

  const metrics: DashboardPriorityMetrics = { source: 'fallback' };
  let hasLiveMetric = false;

  if (notifications) {
    metrics.unreadNotifications = notifications.filter((notification) => !notification.read).length;
    hasLiveMetric = true;
  }

  if (wallet) {
    metrics.walletBalance = wallet.balance;
    hasLiveMetric = true;
  }

  if (moderationQueue) {
    const openQueue = moderationQueue.filter((item) => !CLOSED_ADMIN_QUEUE_STATUSES.has(normalizeStatus(item.status)));
    metrics.adminOpenQueue = openQueue.length;
    metrics.adminEscalatedQueue = openQueue.filter((item) => normalizeStatus(item.status) === 'ESCALATED').length;
    hasLiveMetric = true;
  }

  if (complianceOverview) {
    if (metrics.adminOpenQueue === undefined) {
      metrics.adminOpenQueue = complianceOverview.counts.moderationOpen;
    }

    if (metrics.adminEscalatedQueue === undefined) {
      metrics.adminEscalatedQueue = complianceOverview.counts.moderationEscalated;
    }

    metrics.adminUserChecks = complianceOverview.counts.bannedUsers + complianceOverview.counts.suspendedUsers;
    hasLiveMetric = true;
  }

  if (sellerOrders) {
    metrics.sellerOrders = sellerOrders.filter(
      (order) => !CLOSED_MARKETPLACE_ORDER_STATUSES.has(normalizeStatus(order.status)),
    ).length;
    hasLiveMetric = true;
  }

  return {
    ...metrics,
    source: hasLiveMetric ? 'api' : 'fallback',
  };
}

function buildDashboardPriorities(
  role: string | undefined,
  palette: DashboardPalette,
  canUseAdmin: boolean,
  metrics: DashboardPriorityMetrics,
): DashboardPriorityAction[] {
  if (canUseAdmin) {
    return [
      {
        title: 'Command Queue',
        metric: formatCountMetric(metrics.adminOpenQueue, '5'),
        detail:
          metrics.adminOpenQueue === undefined
            ? 'items to review'
            : `${formatCountMetric(metrics.adminEscalatedQueue, '0')} escalated`,
        view: 'adminQueue',
        accentColor: palette.core,
      },
      {
        title: 'Money Watch',
        metric: formatCreditMetric(metrics.walletBalance, '$'),
        detail: metrics.walletBalance === undefined ? 'economy controls' : 'wallet snapshot',
        view: 'adminEconomy',
        accentColor: palette.money,
      },
      {
        title: 'User Checks',
        metric: formatCountMetric(metrics.adminUserChecks, '3'),
        detail: metrics.adminUserChecks === undefined ? 'accounts flagged' : 'restricted accounts',
        view: 'adminUsers',
        accentColor: palette.audience,
      },
    ];
  }

  if (role === 'MISTRESS') {
    return [
      {
        title: 'Go Live',
        metric: 'Now',
        detail: 'open live room',
        view: 'live',
        accentColor: palette.audience,
      },
      {
        title: 'Revenue',
        metric: formatCreditMetric(metrics.walletBalance, '4'),
        detail: metrics.walletBalance === undefined ? 'money tools ready' : 'wallet balance',
        section: 'Money',
        accentColor: palette.money,
      },
      {
        title: 'Orders',
        metric: formatCountMetric(metrics.sellerOrders, '2'),
        detail: metrics.sellerOrders === undefined ? 'store actions' : 'seller orders active',
        view: 'marketplaceOrders',
        accentColor: palette.marketplace,
      },
    ];
  }

  return [
    {
      title: 'Messages',
      metric:
        metrics.unreadNotifications === undefined ? 'Open' : formatCountMetric(metrics.unreadNotifications, '0'),
      detail: metrics.unreadNotifications === undefined ? 'chat and paid chat' : 'alerts and chat',
      view: 'chat',
      accentColor: palette.core,
    },
    {
      title: 'Balance',
      metric: formatCreditMetric(metrics.walletBalance, '$'),
      detail: metrics.walletBalance === undefined ? 'wallet ready' : 'wallet balance',
      view: 'wallet',
      accentColor: palette.money,
    },
    {
      title: 'Wishlist',
      metric: 'New',
      detail: 'creator requests',
      view: 'wishlist',
      accentColor: palette.marketplace,
    },
  ];
}

function CreatorOnlyMessage({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View style={{ flex: 1, padding: 16, backgroundColor: '#000' }}>
      <Text style={{ color: '#ff6b6b', fontSize: 18, fontWeight: '800' }}>{title}</Text>
      <Text style={{ color: '#aaa', marginTop: 8 }}>{subtitle}</Text>
    </View>
  );
}

function DashboardSectionHeader({ title, subtitle, accentColor }: { title: string; subtitle: string; accentColor: string }) {
  return (
    <View
      style={{
        marginTop: 16,
        marginBottom: 8,
        paddingHorizontal: 2,
      }}
    >
      <Text
        style={{
          color: accentColor,
          fontSize: 12,
          fontWeight: '900',
          letterSpacing: 1,
          textTransform: 'uppercase',
        }}
      >
        {title}
      </Text>
      <Text style={{ color: '#777', marginTop: 3, fontSize: 12 }}>{subtitle}</Text>
    </View>
  );
}

function DashboardAccountHeader({
  displayName,
  role,
  email,
  accentColor,
  compact = false,
  onLogout,
}: {
  displayName: string;
  role?: string;
  email: string;
  accentColor: string;
  compact?: boolean;
  onLogout: () => void;
}) {
  return (
    <View style={{ backgroundColor: '#000', paddingTop: compact ? 8 : 14, paddingBottom: compact ? 6 : 10 }}>
      <View
        style={{
          padding: compact ? 9 : 12,
          borderRadius: compact ? 10 : 12,
          borderWidth: 1,
          borderColor: compact ? accentColor : '#232323',
          backgroundColor: compact ? '#0c0c0c' : '#101010',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <View style={{ width: compact ? 3 : 4, alignSelf: 'stretch', borderRadius: 999, backgroundColor: accentColor }} />
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text style={{ color: '#fff', fontSize: compact ? 15 : 17, fontWeight: '800' }} numberOfLines={1}>
            {displayName}
          </Text>
          <Text style={{ color: '#aaa', marginTop: compact ? 2 : 3, fontSize: compact ? 11 : 12 }} numberOfLines={1}>
            {compact
              ? `${formatRoleLabel(role)} | ${getConsoleLabel(role)}`
              : `${formatRoleLabel(role)} | ${email || 'demo session'}`}
          </Text>
          {!compact ? (
            <Text style={{ color: accentColor, marginTop: 4, fontSize: 11, fontWeight: '800' }} numberOfLines={1}>
              {getConsoleLabel(role)}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={onLogout}
          style={{
            paddingVertical: compact ? 6 : 7,
            paddingHorizontal: compact ? 9 : 10,
            backgroundColor: '#1b1115',
            borderRadius: 8,
            borderWidth: 1,
            borderColor: '#3a1c27',
          }}
        >
          <Text style={{ color: '#ff9abf', fontWeight: '800', fontSize: 11 }}>Switch</Text>
        </Pressable>
      </View>
    </View>
  );
}

function DashboardRoleFocusBand({ focus }: { focus: DashboardRoleFocus }) {
  return (
    <View
      style={{
        borderColor: focus.accentColor,
        borderWidth: 1,
        borderRadius: 12,
        backgroundColor: '#101010',
        padding: 12,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 7 }}>
        <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: focus.accentColor }} />
        <Text style={{ color: focus.accentColor, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' }}>
          {focus.eyebrow}
        </Text>
      </View>
      <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900' }}>{focus.title}</Text>
      <Text style={{ color: '#999', fontSize: 12, lineHeight: 17, marginTop: 5 }}>{focus.detail}</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 7, marginTop: 10 }}>
        {focus.beats.map((beat) => (
          <View
            key={beat}
            style={{
              borderColor: '#2c2c2c',
              borderWidth: 1,
              borderRadius: 999,
              backgroundColor: '#0b0b0b',
              paddingHorizontal: 9,
              paddingVertical: 5,
            }}
          >
            <Text style={{ color: '#cfcfcf', fontSize: 11, fontWeight: '800' }}>{beat}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DashboardHomeModeSwitch({
  mode,
  accentColor,
  surfaceCopy,
  onChange,
}: {
  mode: DashboardHomeMode;
  accentColor: string;
  surfaceCopy: DashboardSurfaceCopy;
  onChange: (mode: DashboardHomeMode) => void;
}) {
  const options: Array<{ value: DashboardHomeMode; label: string }> = [
    { value: 'role', label: surfaceCopy.primaryModeLabel },
    { value: 'launcher', label: surfaceCopy.launcherModeLabel },
    { value: 'custom', label: surfaceCopy.layoutModeLabel },
  ];

  return (
    <View style={{ flexDirection: 'row', gap: 8, paddingTop: 2, paddingBottom: 10 }}>
      {options.map((option) => {
        const isActive = mode === option.value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="button"
            accessibilityState={{ selected: isActive }}
            onPress={() => onChange(option.value)}
            style={{
              minHeight: 34,
              flex: 1,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: isActive ? accentColor : '#272727',
              backgroundColor: isActive ? '#171717' : '#0d0d0d',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 12,
              paddingVertical: 8,
            }}
          >
            <Text style={{ color: isActive ? accentColor : '#aaa', fontSize: 12, fontWeight: '900' }}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function DashboardModuleLauncher({
  sections,
  surfaceCopy,
  onOpenModule,
}: {
  sections: DashboardSection[];
  surfaceCopy: DashboardSurfaceCopy;
  onOpenModule: (view: DashboardView) => void;
}) {
  const moduleCount = sections.reduce((count, section) => count + section.items.length, 0);

  return (
    <View style={{ paddingTop: 2 }}>
      <View style={{ marginBottom: 14 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{surfaceCopy.launcherTitle}</Text>
        <Text style={{ color: mxTheme.colors.muted, marginTop: 4 }}>
          {surfaceCopy.launcherSubtitle} {moduleCount} modules.
        </Text>
      </View>

      {sections.map((section) => (
        <View key={`launcher-${section.title}`} style={{ marginBottom: 16 }}>
          <DashboardSectionHeader title={section.title} subtitle={section.subtitle} accentColor={section.accentColor} />
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {section.items.map((item) => {
              const spec = getActionButtonSpec(item.visual);
              const badge = item.badgeOverride || spec.badge;
              const disabled = item.locked || !item.view;
              const cardAccent = disabled ? '#2b2b33' : section.accentColor;

              return (
                <Pressable
                  key={`${section.title}-${item.title}-launcher`}
                  disabled={disabled}
                  onPress={() => item.view ? onOpenModule(item.view) : undefined}
                  style={{
                    backgroundColor: '#151518',
                    borderColor: cardAccent,
                    borderWidth: 1,
                    borderRadius: 14,
                    padding: 13,
                    flexGrow: 1,
                    flexBasis: 230,
                    minHeight: 118,
                    opacity: disabled ? 0.55 : 1,
                    shadowColor: cardAccent,
                    shadowOpacity: disabled ? 0 : 0.12,
                    shadowRadius: 8,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      <View style={{ width: 4, height: 18, borderRadius: 999, backgroundColor: cardAccent }} />
                      <Text style={{ color: cardAccent, fontSize: 10, fontWeight: '900', textTransform: 'uppercase' }}>
                        {section.title}
                      </Text>
                    </View>
                    {badge ? (
                      <View
                        style={{
                          borderColor: '#2c2c2c',
                          borderWidth: 1,
                          borderRadius: 999,
                          backgroundColor: '#101010',
                          paddingVertical: 4,
                          paddingHorizontal: 7,
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 5,
                        }}
                      >
                        <View style={{ width: 5, height: 5, borderRadius: 999, backgroundColor: cardAccent }} />
                        <Text style={{ color: mxTheme.colors.muted, fontSize: 9, fontWeight: '900' }}>{badge}</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={{ color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 12 }}>{item.title}</Text>
                  <Text style={{ color: '#aaa', fontSize: 12, marginTop: 5 }}>{item.subtitle}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ))}
    </View>
  );
}

function countSectionModules(sections: DashboardSection[], filter: DashboardSectionFilterValue) {
  if (filter === 'All') {
    return sections.reduce((total, section) => total + section.items.length, 0);
  }

  return sections.find((section) => section.title === filter)?.items.length || 0;
}

function DashboardSectionFilter({
  sections,
  activeSection,
  accentColor,
  onChange,
}: {
  sections: DashboardSection[];
  activeSection: DashboardSectionFilterValue;
  accentColor: string;
  onChange: (section: DashboardSectionFilterValue) => void;
}) {
  const filters: DashboardSectionFilterValue[] = ['All', ...sections.map((section) => section.title)];

  return (
    <View style={{ paddingTop: 2, paddingBottom: 6 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8, paddingVertical: 6 }}
      >
        {filters.map((filter) => {
          const isActive = activeSection === filter;
          const moduleCount = countSectionModules(sections, filter);

          return (
            <Pressable
              key={filter}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              onPress={() => onChange(filter)}
              style={{
                minHeight: 34,
                minWidth: filter === 'All' ? 62 : 86,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: isActive ? accentColor : '#272727',
                backgroundColor: isActive ? '#171717' : '#0d0d0d',
                paddingHorizontal: 12,
                paddingVertical: 8,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 7,
              }}
            >
              <Text style={{ color: isActive ? accentColor : '#aaa', fontSize: 12, fontWeight: '800' }}>
                {filter}
              </Text>
              <Text style={{ color: isActive ? '#d0d0d0' : '#666', fontSize: 11, fontWeight: '800' }}>
                {moduleCount}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function DashboardPriorityStrip({
  priorities,
  metricsSource,
  accentColor,
  onOpenView,
  onOpenSection,
}: {
  priorities: DashboardPriorityAction[];
  metricsSource: DashboardPriorityMetricsSource;
  accentColor: string;
  onOpenView: (view: DashboardView) => void;
  onOpenSection: (section: DashboardSectionFilterValue) => void;
}) {
  return (
    <View style={{ paddingBottom: 4 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ color: '#fff', fontSize: 14, fontWeight: '900' }}>Today</Text>
        <Text style={{ color: '#777', fontSize: 11, fontWeight: '800' }}>{getMetricSourceLabel(metricsSource)}</Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10, paddingBottom: 8 }}
      >
        {priorities.map((priority) => {
          const openPriority = () => {
            if (priority.view) {
              onOpenView(priority.view);
              return;
            }

            if (priority.section) {
              onOpenSection(priority.section);
            }
          };

          return (
            <Pressable
              key={priority.title}
              accessibilityRole="button"
              onPress={openPriority}
              style={{
                width: 128,
                minHeight: 88,
                borderRadius: 12,
                borderWidth: 1,
                borderColor: accentColor,
                backgroundColor: '#151515',
                padding: 12,
                justifyContent: 'space-between',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                <View style={{ width: 7, height: 7, borderRadius: 999, backgroundColor: accentColor }} />
                <Text style={{ color: accentColor, fontSize: 11, fontWeight: '900' }} numberOfLines={1}>
                  {priority.title}
                </Text>
              </View>
              <Text style={{ color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8 }} numberOfLines={1}>
                {priority.metric}
              </Text>
              <Text style={{ color: '#999', fontSize: 11, lineHeight: 15, marginTop: 4 }} numberOfLines={2}>
                {priority.detail}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createInitialDashboardLayout(userId: string, role: DashboardRole): StoredDashboardLayout {
  return loadDashboardLayoutState(userId, role) || {
    items: createDashboardLayoutPreset(role),
    locked: false,
    preset: 'role-default',
    updatedAt: new Date().toISOString(),
  };
}

export function DashboardScreen({ onLogout }: DashboardScreenProps) {
  const [activeView, setActiveView] = useState<DashboardView>('home');
  const [policyGuardHandoff, setPolicyGuardHandoff] = useState<ActivePolicyGuardHandoff | null>(null);
  const [activeModuleScaffold, setActiveModuleScaffold] = useState<DashboardModuleScaffoldPayload | null>(null);
  const [activeSection, setActiveSection] = useState<DashboardSectionFilterValue>('All');
  const [homeMode, setHomeMode] = useState<DashboardHomeMode>('role');
  const [priorityMetrics, setPriorityMetrics] = useState<DashboardPriorityMetrics>(INITIAL_DASHBOARD_PRIORITY_METRICS);
  const [isAccountHeaderCompact, setIsAccountHeaderCompact] = useState(false);
  const accountHeaderCompactRef = useRef(false);
  const currentUser = getCurrentUser();
  const dashboardRole: DashboardRole = currentUser?.role || 'SUB';
  const dashboardUserId = currentUser?.id || 'anonymous';
  const dashboardAudience = mapDashboardRoleToUiLayoutAudience(currentUser?.role);
  const appliedUiTheme = useMemo(
    () => resolveAppliedUiLayoutTheme(dashboardUserId, dashboardAudience),
    [dashboardAudience, dashboardUserId],
  );
  const [layoutState, setLayoutState] = useState<StoredDashboardLayout>(() => createInitialDashboardLayout(dashboardUserId, dashboardRole));
  const [editMode, setEditMode] = useState(false);
  const [notice, setNotice] = useState('');
  const canUseAdmin = canOpenCommandCentre(currentUser?.role);
  const canUseCreatorInventory = canManageMarketplaceInventory(currentUser?.role);
  const palette = getDashboardPalette(currentUser?.role);
  const sections = buildDashboardSections(currentUser?.role, palette, canUseAdmin);
  const sectionIdentityByView = buildDashboardSectionIdentityByView(sections);
  const priorities = buildDashboardPriorities(currentUser?.role, palette, canUseAdmin, priorityMetrics);
  const roleFocus = getDashboardRoleFocus(currentUser?.role, palette, canUseAdmin);
  const surfaceCopy = getDashboardSurfaceCopy(currentUser?.role, canUseAdmin);
  const visibleSections = activeSection === 'All' ? sections : sections.filter((section) => section.title === activeSection);
  const availableWidgets = useMemo(() => getVisibleDashboardWidgetDefinitions(dashboardRole), [dashboardRole]);
  const availablePresets = useMemo(() => getAvailableDashboardPresets(dashboardRole), [dashboardRole]);
  const normalizedLayout = useMemo(() => normalizeDashboardLayout(layoutState.items, dashboardRole), [dashboardRole, layoutState.items]);
  const visibleLayout = useMemo(() => normalizedLayout.filter((item) => item.visible && !item.removed), [normalizedLayout]);
  const widgetById = useMemo(() => new Map(availableWidgets.map((widget) => [widget.id, widget])), [availableWidgets]);
  const activePreset = layoutState.preset;
  const layoutLocked = layoutState.locked;

  useEffect(() => {
    setLayoutState(createInitialDashboardLayout(dashboardUserId, dashboardRole));
    setEditMode(false);
    setHomeMode('role');
  }, [dashboardRole, dashboardUserId]);

  useEffect(() => {
    let isMounted = true;

    setPriorityMetrics(INITIAL_DASHBOARD_PRIORITY_METRICS);
    loadDashboardPriorityMetrics(currentUser?.role, canUseAdmin, canUseCreatorInventory).then((metrics) => {
      if (isMounted) {
        setPriorityMetrics(metrics);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [currentUser?.role, canUseAdmin, canUseCreatorInventory]);

  async function handleLogout() {
    await clearAuthSession();
    onLogout?.();
  }

  function handleDashboardScroll(event: { nativeEvent: { contentOffset: { y: number } } }) {
    const shouldCompact = event.nativeEvent.contentOffset.y > 28;
    if (accountHeaderCompactRef.current === shouldCompact) return;

    accountHeaderCompactRef.current = shouldCompact;
    setIsAccountHeaderCompact(shouldCompact);
  }

  function returnHome() {
    accountHeaderCompactRef.current = false;
    setIsAccountHeaderCompact(false);
    setHomeMode('role');
    setActiveView('home');
  }

  function changeHomeMode(mode: DashboardHomeMode) {
    accountHeaderCompactRef.current = false;
    setIsAccountHeaderCompact(false);
    setHomeMode(mode);
  }

  function updateLayout(updater: (items: DashboardWidgetLayoutItem[]) => DashboardWidgetLayoutItem[]) {
    if (layoutLocked) return;
    setLayoutState((current) => ({
      ...current,
      items: normalizeDashboardLayout(updater(normalizedLayout), dashboardRole),
    }));
  }

  function setLayoutLocked(locked: boolean | ((current: boolean) => boolean)) {
    setLayoutState((current) => ({
      ...current,
      locked: typeof locked === 'function' ? locked(current.locked) : locked,
    }));
  }

  function loadPreset(preset: DashboardLayoutPreset) {
    if (layoutLocked) return;
    setLayoutState({
      items: createDashboardLayoutPreset(dashboardRole, preset),
      locked: false,
      preset,
      updatedAt: new Date().toISOString(),
    });
    setNotice(`Loaded ${preset.replace(/-/g, ' ')} layout.`);
  }

  function saveLayout() {
    const saved = saveDashboardLayoutState(dashboardUserId, dashboardRole, {
      items: normalizedLayout,
      locked: layoutLocked,
      preset: activePreset,
    });
    setLayoutState(saved);
    setNotice('Dashboard layout saved.');
  }

  function resetLayout() {
    if (layoutLocked) return;
    clearDashboardLayoutState(dashboardUserId, dashboardRole);
    setLayoutState(createInitialDashboardLayout(dashboardUserId, dashboardRole));
    setNotice('Dashboard layout reset.');
  }

  function moveWidget(widgetId: string, offset: number) {
    updateLayout((items) => {
      const next = [...items];
      const index = next.findIndex((item) => item.id === widgetId);
      if (index < 0) return next;
      const targetIndex = Math.max(0, Math.min(next.length - 1, index + offset));
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function hideWidget(widgetId: string) {
    updateLayout((items) => items.map((item) => item.id === widgetId ? { ...item, visible: false, removed: false } : item));
  }

  function showWidget(widgetId: string) {
    updateLayout((items) => items.map((item) => item.id === widgetId ? { ...item, visible: true, removed: false } : item));
  }

  function addWidget(widgetId: string) {
    updateLayout((items) => {
      const existing = items.find((item) => item.id === widgetId);
      if (existing) {
        return items.map((item) => item.id === widgetId ? { ...item, visible: true, removed: false } : item);
      }

      const widget = widgetById.get(widgetId);
      return [...items, { id: widgetId, visible: true, size: widget?.defaultSize || 'standard', removed: false }];
    });
  }

  function removeWidget(widgetId: string) {
    updateLayout((items) => items.map((item) => item.id === widgetId ? { ...item, visible: false, removed: true } : item));
  }

  function resizeWidget(widgetId: string) {
    updateLayout((items) => items.map((item) => item.id === widgetId ? { ...item, size: nextWidgetSize(item.size) } : item));
  }

  function openPolicyGuardHandoff(target: PolicyGuardHandoffTarget) {
    setPolicyGuardHandoff({ ...target, requestedAt: new Date().toISOString() });
    setActiveView(target.view);
  }

  function openDashboardRegisterModule(view: string, scaffold?: DashboardModuleScaffoldPayload) {
    setActiveModuleScaffold(scaffold || null);
    setActiveView(view as DashboardView);
  }

  function renderActiveScreen() {
    let screen: React.ReactNode = null;

    if (activeView === 'headmistressDashboard') {
      screen = canUseAdmin ? (
        <HeadmistressDashboardScreen onOpenPolicyGuardHandoff={openPolicyGuardHandoff} />
      ) : (
        <AccessNotice title="Headmistress Dashboard access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'abacusAI') {
      screen = canUseCreatorInventory ? (
        <AbacusAiScreen />
      ) : (
        <CreatorOnlyMessage title="Abacus AI is for Mistresses, Headmistress, and Admin." subtitle="Subs will get a separate assistant surface when the buyer-facing flow is designed." />
      );
    }
    if (activeView === 'aiProviderTeam') {
      screen = canUseCreatorInventory ? (
        <AiProviderTeamScreen />
      ) : (
        <CreatorOnlyMessage
          title="AI Provider Team is for Mistresses, Headmistress, and Admin."
          subtitle="Provider routing, cost controls and policy labels stay with creator/admin operations."
        />
      );
    }
    if (activeView === 'dashboardModuleRegister') {
      screen = <DashboardModuleRegisterScreen currentRole={currentUser?.role} onOpenModule={openDashboardRegisterModule} />;
    }
    if (activeView === 'moduleScaffold') {
      screen = (
        <DashboardModuleScaffoldScreen
          module={activeModuleScaffold}
          onOpenRelatedModule={(view) => setActiveView(view as DashboardView)}
        />
      );
    }
    if (activeView === 'quickCheckZone') {
      screen = canUseCreatorInventory ? (
        <MistressQuickCheckZoneScreen
          handoffItemId={policyGuardHandoff?.view === 'quickCheckZone' ? policyGuardHandoff.itemId : undefined}
          handoffLabel={policyGuardHandoff?.view === 'quickCheckZone' ? policyGuardHandoff.label : undefined}
          handoffRequestedAt={policyGuardHandoff?.view === 'quickCheckZone' ? policyGuardHandoff.requestedAt : undefined}
          onOpenModule={(view) => setActiveView(view as DashboardView)}
        />
      ) : (
        <CreatorOnlyMessage
          title="Quick Check Zone is for Mistresses, Headmistress, and Admin."
          subtitle="Subs keep buyer-facing alerts in Notifications while creator intake queues are wired."
        />
      );
    }
    if (activeView === 'bookings') screen = <BookingsScreen />;
    if (activeView === 'callScheduling') screen = <CallSchedulingScreen />;
    if (activeView === 'live') screen = <LiveRoomScreen />;
    if (activeView === 'liveAccessStack') screen = <LiveAccessStackScreen />;
    if (activeView === 'gameHub') screen = <GameHubScreen />;
    if (activeView === 'contentLibrary') screen = <ContentLibraryScreen />;
    if (activeView === 'workshopPortal') {
      screen = canUseCreatorInventory ? (
        <WorkshopPortalScreen />
      ) : (
        <CreatorOnlyMessage
          title="Workshop Portal is for Mistresses, Headmistress, and Admin."
          subtitle="Subs will see only buyer-facing release and plugin surfaces when those flows are wired."
        />
      );
    }
    if (activeView === 'previewOps') {
      screen = canUseAdmin ? (
        <PreviewOpsScreen />
      ) : (
        <CreatorOnlyMessage
          title="Preview Ops is restricted to Headmistress and Admin."
          subtitle="Public preview tunnel setup and shutdown controls stay in the admin operations lane."
        />
      );
    }
    if (activeView === 'inventory') screen = <InventoryScreen />;
    if (activeView === 'inventoryPlugins') screen = <InventoryPluginsScreen />;
    if (activeView === 'keeperAllowance') screen = <KeeperAllowanceScreen />;
    if (activeView === 'collectorEconomy') screen = <CollectorEconomyScreen />;
    if (activeView === 'pluginMarketplace') screen = <PluginMarketplaceScreen />;
    if (activeView === 'mxStreamDeck') screen = <MxStreamDeckScreen role={currentUser?.role} />;
    if (activeView === 'creatorGrowth') {
      screen = canUseCreatorInventory ? (
        <CreatorGrowthToolsScreen />
      ) : (
        <CreatorOnlyMessage
          title="Creator Growth Tools are for Mistresses, Headmistress, and Admin."
          subtitle="Subs can discover creators through the buyer-facing discovery surfaces when they are added."
        />
      );
    }
    if (activeView === 'creatorGrowthAnalytics') {
      screen = canUseCreatorInventory ? (
        <CreatorGrowthAnalyticsDashboard />
      ) : (
        <CreatorOnlyMessage
          title="Creator Growth Analytics are for Mistresses, Headmistress, and Admin."
          subtitle="Subs will see buyer-facing discovery and landing surfaces when they are added."
        />
      );
    }
    if (activeView === 'marketplaceInventory') {
      screen = canUseCreatorInventory ? (
        <MarketplaceInventoryScreen />
      ) : (
        <CreatorOnlyMessage
          title="Creator inventory access is for Mistresses, Headmistress, and Admin."
          subtitle="Subs can use Inventory Plugins to browse, request approval, and purchase marketplace items."
        />
      );
    }
    if (activeView === 'marketplaceOrders') {
      screen = canUseCreatorInventory ? (
        <MarketplaceSellerOrdersScreen />
      ) : (
        <CreatorOnlyMessage
          title="Marketplace order management is for Mistresses, Headmistress, and Admin."
          subtitle="Subs can view their purchases and approval requests through buyer-facing Inventory Plugins."
        />
      );
    }
    if (activeView === 'giftsGoals') screen = <GiftsGoalsScreen />;
    if (activeView === 'notifications') {
      screen = <NotificationsScreen onOpenDestination={(destination) => setActiveView(destination as DashboardView)} />;
    }
    if (activeView === 'positions') screen = <PositionsScreen />;
    if (activeView === 'ppv') screen = <PpvScreen />;
    if (activeView === 'littleBlackBook') screen = <LittleBlackBookScreen />;
    if (activeView === 'rolodex') screen = <RolodexScreen />;
    if (activeView === 'subVault') {
      screen = (
        <SubVaultScreen
          handoffItemId={policyGuardHandoff?.view === 'subVault' ? policyGuardHandoff.itemId : undefined}
          handoffLabel={policyGuardHandoff?.view === 'subVault' ? policyGuardHandoff.label : undefined}
          handoffRequestedAt={policyGuardHandoff?.view === 'subVault' ? policyGuardHandoff.requestedAt : undefined}
        />
      );
    }
    if (activeView === 'stickers') screen = <StickerStudioScreen />;
    if (activeView === 'stylePacks') {
      screen = canUseCreatorInventory ? (
        <StylePacksScreen />
      ) : (
        <CreatorOnlyMessage title="Style Packs are for Mistresses, Headmistress, and Admin." subtitle="Subs keep the standard app theme while creator branding tools are wired." />
      );
    }
    if (activeView === 'subscriptions') screen = <SubscriptionsScreen />;
    if (activeView === 'adminPlugins') {
      screen = canUseAdmin ? (
        <AdminPluginCommandScreen />
      ) : (
        <CreatorOnlyMessage title="Admin plugin access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'magneticFeatures') {
      screen = canUseAdmin ? (
        <MagneticFeatureDashboardScreen />
      ) : (
        <CreatorOnlyMessage title="Magnetic Feature Dashboard access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'adminAnalytics') {
      screen = canUseAdmin ? (
        <AdminAnalyticsStatusScreen />
      ) : (
        <CreatorOnlyMessage title="Admin analytics access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'adminUsers') {
      screen = canUseAdmin ? (
        <AdminUserCommandScreen />
      ) : (
        <CreatorOnlyMessage title="Admin user access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'adminMemberDelegation') {
      screen = canUseAdmin ? (
        <AdminMemberDelegationScreen />
      ) : (
        <CreatorOnlyMessage title="Admin Member + access is restricted." subtitle="Only Headmistress and Admin users can delegate platform Admin Members." />
      );
    }
    if (activeView === 'trustedMemberDelegation') {
      screen = currentUser?.role === 'MISTRESS' ? (
        <TrustedMemberDelegationScreen />
      ) : (
        <CreatorOnlyMessage title="Trusted Member + is for Mistresses." subtitle="Headmistress/Admin use Admin Member + for platform delegation." />
      );
    }
    if (activeView === 'adminQueue') {
      screen = canUseAdmin ? (
        <AdminActionQueueScreen />
      ) : (
        <CreatorOnlyMessage title="Admin queue access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'adminEconomy') {
      screen = canUseAdmin ? (
        <AdminEconomyEngineScreen />
      ) : (
        <CreatorOnlyMessage title="Economy Engine access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'admin') {
      screen = canUseAdmin ? (
        <AdminCommandCentreScreen />
      ) : (
        <CreatorOnlyMessage title="Command Centre access is restricted." subtitle="This area is only available to Headmistress and Admin users." />
      );
    }
    if (activeView === 'profile') {
      screen = (
        <ProfileShowcase
          userId={currentUser?.id}
          displayName={currentUser?.username || currentUser?.displayName || 'Member'}
          roleLabel={currentUser?.role || 'Member'}
          viewerRoleLabel={currentUser?.role || 'Member'}
          stylePackTitle={appliedUiTheme.stylePackTitle}
          stylePackAccent={appliedUiTheme.accent}
          stylePackTags={appliedUiTheme.tags}
          gifts={[]}
          stickers={[]}
          badges={[currentUser?.role || 'Member', 'Collector']}
          showGoalFundActions={currentUser?.role === 'SUB'}
          onOpenProfileDestination={(destination) => setActiveView(destination as DashboardView)}
        />
      );
    }
    if (activeView === 'chat') screen = <ChatScreen />;
    if (activeView === 'wallet') screen = <WalletScreen />;
    if (activeView === 'earningsVault') {
      screen = canUseCreatorInventory ? (
        <EarningsVaultScreen />
      ) : (
        <CreatorOnlyMessage
          title="Earnings Vault is for Mistresses, Headmistress, and Admin."
          subtitle="Subs can review top-ups and spend history through the Wallet screen."
        />
      );
    }
    if (activeView === 'records') {
      screen = canUseCreatorInventory ? (
        <RecordsTaxScreen />
      ) : (
        <CreatorOnlyMessage
          title="Records & Tax Notes are for Mistresses, Headmistress, and Admin."
          subtitle="Subs can review wallet transactions through the Wallet screen."
        />
      );
    }
    if (activeView === 'storeSupport') screen = <StoreSupportScreen />;
    if (activeView === 'wishlist') screen = <WishlistSupportScreen />;
    if (activeView === 'uiLayoutStudio') {
      screen = (
        <UiLayoutDashboardRoute
          userId={currentUser?.id}
          role={currentUser?.role}
          width={390}
          onSaved={() => setNotice('UI layout preferences saved.')}
        />
      );
    }

    return screen || <AccessNotice title="Dashboard view is not available yet." subtitle={`No screen is registered for ${activeView}.`} />;
  }

  function renderCatalogue() {
    if (!editMode) return null;

    const catalogueRows = availableWidgets.map((widget) => {
      const layoutItem = normalizedLayout.find((item) => item.id === widget.id);
      const status = layoutItem?.removed ? 'Not added' : layoutItem?.visible ? 'Visible' : layoutItem ? 'Hidden' : 'Not added';
      const sectionIdentity = getWidgetSectionIdentity(widget, sections, sectionIdentityByView, palette.core);
      return {
        widget,
        layoutItem,
        status,
        sectionIdentity,
      };
    });
    const catalogueGroups = sections
      .map((section) => ({
        section,
        rows: catalogueRows.filter((row) => row.sectionIdentity.title === section.title),
      }))
      .filter((group) => group.rows.length > 0);

    return (
      <View style={{ backgroundColor: '#111', borderColor: mxTheme.colors.border, borderWidth: 1, borderRadius: 16, padding: 14, marginBottom: 14 }}>
        <Text style={{ color: mxTheme.colors.text, fontSize: 18, fontWeight: '900', marginBottom: 8 }}>{surfaceCopy.catalogueTitle}</Text>
        {catalogueGroups.map((group) => (
          <View key={`catalogue-${group.section.title}`} style={{ marginTop: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <View style={{ width: 6, height: 6, borderRadius: 999, backgroundColor: group.section.accentColor }} />
              <Text style={{ color: group.section.accentColor, fontSize: 12, fontWeight: '900', textTransform: 'uppercase' }}>
                {group.section.title}
              </Text>
              <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800' }}>
                {group.rows.length}
              </Text>
            </View>
            {group.rows.map(({ widget, layoutItem, status, sectionIdentity }) => (
              <CatalogueRow
                key={widget.id}
                widget={widget}
                status={status}
                sectionIdentity={sectionIdentity}
                locked={layoutLocked}
                onAction={() => status === 'Visible' ? hideWidget(widget.id) : status === 'Hidden' ? showWidget(widget.id) : addWidget(widget.id)}
                onRemove={layoutItem && !layoutItem.removed ? () => removeWidget(widget.id) : undefined}
              />
            ))}
          </View>
        ))}
      </View>
    );
  }

  function renderCustomLayout() {
    return (
      <View style={{ paddingTop: 2 }}>
        <View style={{ marginBottom: 14 }}>
          <Text style={{ color: mxTheme.colors.text, fontSize: 22, fontWeight: '900' }}>{surfaceCopy.layoutTitle}</Text>
          <Text style={{ color: mxTheme.colors.muted, marginTop: 4 }}>
            {surfaceCopy.layoutStatusLabel} | {visibleLayout.length} visible / {availableWidgets.length} available | {layoutLocked ? 'Locked' : 'Unlocked'}
          </Text>
        </View>

        {notice ? <Text style={{ color: mxTheme.colors.success, marginBottom: 10 }}>{notice}</Text> : null}

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 }}>
          <DashboardActionButton label={editMode ? 'Done' : 'Edit'} accentColor={palette.core} active={editMode} onPress={() => setEditMode((current) => !current)} />
          <DashboardActionButton label={layoutLocked ? 'Unlock Layout' : 'Lock Layout'} accentColor={palette.core} active={!layoutLocked} onPress={() => setLayoutLocked((current) => !current)} />
          <DashboardActionButton label="Save Layout" accentColor={palette.core} accented onPress={saveLayout} />
          {editMode ? <DashboardActionButton label="Reset" accentColor={palette.core} accented disabled={layoutLocked} onPress={resetLayout} /> : null}
        </View>

        {editMode ? (
          <View style={{ marginBottom: 8 }}>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 12, fontWeight: '900', marginBottom: 8 }}>{surfaceCopy.presetsTitle}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
              {availablePresets.map((preset) => (
                <DashboardActionButton
                  key={preset.id}
                  label={preset.title}
                  accentColor={palette.core}
                  active={activePreset === preset.id}
                  disabled={layoutLocked}
                  onPress={() => loadPreset(preset.id)}
                />
              ))}
            </View>
          </View>
        ) : null}

        {renderCatalogue()}

        {visibleLayout.length === 0 ? <Text style={{ color: mxTheme.colors.muted }}>{surfaceCopy.emptyLayoutMessage}</Text> : null}
        {visibleLayout.map((item, visibleIndex) => {
          const widget = widgetById.get(item.id);
          if (!widget) return null;
          const sectionIdentity = getWidgetSectionIdentity(widget, sections, sectionIdentityByView, palette.core);

          return (
            <DashboardWidget
              key={item.id}
              title={widget.title}
              subtitle={widget.subtitle}
              icon={widget.icon}
              badge={widget.badge}
              sourceLabel={widgetIdentityLabel(widget, sectionIdentity?.title)}
              accentColor={sectionIdentity?.accentColor || palette.core}
              size={item.size}
              locked={widget.disabled}
              editMode={editMode}
              layoutLocked={layoutLocked}
              onPress={() => widget.disabled ? undefined : setActiveView(widget.view)}
              onMoveUp={visibleIndex === 0 ? undefined : () => moveWidget(item.id, -1)}
              onMoveDown={visibleIndex === visibleLayout.length - 1 ? undefined : () => moveWidget(item.id, 1)}
              onHide={() => hideWidget(item.id)}
              onRemove={() => removeWidget(item.id)}
              onResize={() => resizeWidget(item.id)}
            />
          );
        })}
      </View>
    );
  }

  if (activeView !== 'home') {
    const activeModuleMatch = findDashboardModuleByView(sections, activeView);
    const activeViewWidget = availableWidgets.find((widget) => widget.view === activeView);
    let activeShellIdentity: DashboardSectionIdentity = sectionIdentityByView.get(activeView) || {
      title: 'Core',
      accentColor: palette.core,
    };

    if (activeModuleMatch) {
      activeShellIdentity = {
        title: activeModuleMatch.section.title,
        accentColor: activeModuleMatch.section.accentColor,
      };
    } else if (activeViewWidget) {
      activeShellIdentity = getWidgetSectionIdentity(activeViewWidget, sections, sectionIdentityByView, palette.core);
    }

    const activeShellTitle = activeModuleMatch?.module.title || activeViewWidget?.title || getConsoleLabel(currentUser?.role);

    return (
      <View style={{ flex: 1, backgroundColor: '#000' }}>
        <Pressable
          onPress={returnHome}
          style={{
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: '#0d0d0d',
            borderBottomWidth: 1,
            borderBottomColor: '#222',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <View style={{ width: 4, alignSelf: 'stretch', borderRadius: 999, backgroundColor: activeShellIdentity.accentColor }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: activeShellIdentity.accentColor, fontSize: 12, fontWeight: '900' }}>Back to dashboard</Text>
            <Text style={{ color: mxTheme.colors.muted, fontSize: 11, fontWeight: '800', marginTop: 3 }}>
              {getConsoleLabel(currentUser?.role)} | {activeShellIdentity.title} | {activeShellTitle}
            </Text>
          </View>
        </Pressable>
        {renderActiveScreen()}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#000' }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 30 }}
      onScroll={handleDashboardScroll}
      scrollEventThrottle={32}
      stickyHeaderIndices={[0]}
    >
      <DashboardAccountHeader
        displayName={currentUser?.displayName || currentUser?.username || 'Mistress-X'}
        role={currentUser?.role}
        email={currentUser?.email || 'demo session'}
        accentColor={palette.core}
        compact={isAccountHeaderCompact}
        onLogout={handleLogout}
      />

      <DashboardHomeModeSwitch
        mode={homeMode}
        accentColor={palette.core}
        surfaceCopy={surfaceCopy}
        onChange={changeHomeMode}
      />

      {homeMode === 'custom' ? (
        renderCustomLayout()
      ) : homeMode === 'launcher' ? (
        <DashboardModuleLauncher
          sections={sections}
          surfaceCopy={surfaceCopy}
          onOpenModule={setActiveView}
        />
      ) : (
        <>
          <DashboardRoleFocusBand focus={roleFocus} />

          <DashboardPriorityStrip
            priorities={priorities}
            metricsSource={priorityMetrics.source}
            accentColor={palette.core}
            onOpenView={setActiveView}
            onOpenSection={setActiveSection}
          />

          <DashboardSectionFilter
            sections={sections}
            activeSection={activeSection}
            accentColor={palette.core}
            onChange={setActiveSection}
          />

          <View>
            {visibleSections.map((section) => (
              <View key={section.title}>
                <DashboardSectionHeader title={section.title} subtitle={section.subtitle} accentColor={section.accentColor} />
                {section.items.map((item) => {
                  const openModule = item.view && !item.locked ? () => setActiveView(item.view as DashboardView) : undefined;

                  return (
                    <DashboardWidget
                      key={`${section.title}-${item.title}`}
                      title={item.title}
                      subtitle={item.subtitle}
                      locked={item.locked}
                      onPress={openModule}
                      {...getDashboardWidgetVisuals(item.visual, item.badgeOverride, section.accentColor)}
                    />
                  );
                })}
              </View>
            ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}
