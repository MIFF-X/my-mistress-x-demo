import type { AuthUser } from '../../../api/authApi';
import { enabledMistressXPlugins, type MistressXPluginDefinition } from '../../../plugins';

export type DashboardRole = AuthUser['role'];

export type DashboardView =
  | 'abacusAI'
  | 'aiProviderTeam'
  | 'home'
  | 'bookings'
  | 'callScheduling'
  | 'chat'
  | 'contentLibrary'
  | 'dashboardModuleRegister'
  | 'quickCheckZone'
  | 'workshopPortal'
  | 'creatorGrowth'
  | 'creatorGrowthAnalytics'
  | 'earningsVault'
  | 'gameHub'
  | 'live'
  | 'liveAccessStack'
  | 'inventory'
  | 'inventoryPlugins'
  | 'keeperAllowance'
  | 'collectorEconomy'
  | 'marketplaceInventory'
  | 'marketplaceOrders'
  | 'pluginMarketplace'
  | 'notifications'
  | 'positions'
  | 'previewOps'
  | 'profile'
  | 'records'
  | 'wallet'
  | 'wishlist'
  | 'storeSupport'
  | 'ppv'
  | 'headmistressDashboard'
  | 'admin'
  | 'adminAnalytics'
  | 'adminEconomy'
  | 'adminQueue'
  | 'adminUsers'
  | 'adminMemberDelegation'
  | 'trustedMemberDelegation'
  | 'adminPlugins'
  | 'littleBlackBook'
  | 'rolodex'
  | 'stickers'
  | 'stylePacks'
  | 'uiLayoutStudio'
  | 'subVault'
  | 'subscriptions'
  | 'magneticFeatures';

export type DashboardWidgetSize = 'compact' | 'standard' | 'wide';
export type DashboardWidgetSource = 'core' | 'plugin';
export type DashboardLayoutPreset = 'role-default' | 'commerce' | 'community' | 'creator-ops';

export type DashboardWidgetDefinition = {
  id: string;
  view: DashboardView;
  title: string;
  subtitle?: string;
  badge?: string;
  icon: string;
  roles: DashboardRole[];
  source: DashboardWidgetSource;
  defaultSize?: DashboardWidgetSize;
  disabled?: boolean;
  pluginKey?: string;
  autoRegistered?: boolean;
};

export type DashboardWidgetLayoutItem = {
  id: string;
  visible: boolean;
  size: DashboardWidgetSize;
  removed?: boolean;
};

export type DashboardPresetDefinition = {
  id: DashboardLayoutPreset;
  title: string;
  roles: DashboardRole[];
};

const ALL_ROLES: DashboardRole[] = ['HEADMISTRESS', 'MISTRESS', 'SUB', 'ADMIN'];
const ADMIN_ROLES: DashboardRole[] = ['HEADMISTRESS', 'ADMIN'];
const CREATOR_ROLES: DashboardRole[] = ['HEADMISTRESS', 'MISTRESS', 'ADMIN'];

function registryRolesToDashboardRoles(plugin: MistressXPluginDefinition): DashboardRole[] {
  const mapped = new Set<DashboardRole>();

  plugin.roles.forEach((role) => {
    if (role === 'headmistress') {
      mapped.add('HEADMISTRESS');
      mapped.add('ADMIN');
    }
    if (role === 'mistress') mapped.add('MISTRESS');
    if (role === 'sub') mapped.add('SUB');
  });

  return mapped.size > 0 ? Array.from(mapped) : ALL_ROLES;
}

function registryIcon(plugin: MistressXPluginDefinition) {
  return plugin.name
    .split(/\s+/)
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 4)
    .toUpperCase();
}

function registrySubtitle(plugin: MistressXPluginDefinition) {
  const capabilityText = plugin.capabilities.slice(0, 3).join(', ');
  return `${plugin.category.replace(/-/g, ' ')}${capabilityText ? ` | ${capabilityText}` : ''}`;
}

function registryView(plugin: MistressXPluginDefinition): DashboardView {
  const viewByPluginKey: Record<string, DashboardView> = {
    'chat-core': 'chat',
    'ppv-content': 'ppv',
    'live-shows': 'live',
    'video-call-bookings': 'bookings',
    'sticker-collections': 'stickers',
    'rolodex-cards': 'rolodex',
    'wallet-economy': 'wallet',
    'competition-leaderboards': 'positions',
  };

  if (viewByPluginKey[plugin.key]) return viewByPluginKey[plugin.key];

  const firstScreenKey = plugin.routes?.[0]?.screenKey;
  const viewByScreenKey: Record<string, DashboardView> = {
    ChatScreen: 'chat',
    PpvScreen: 'ppv',
    LiveRoomScreen: 'live',
    LiveAccessStackScreen: 'liveAccessStack',
    BookingsScreen: 'bookings',
    CallSchedulingScreen: 'callScheduling',
    StickerStudioScreen: 'stickers',
    RolodexScreen: 'rolodex',
    LittleBlackBookScreen: 'littleBlackBook',
    WalletScreen: 'wallet',
    EarningsVaultScreen: 'earningsVault',
    PositionsScreen: 'positions',
  };

  return firstScreenKey && viewByScreenKey[firstScreenKey] ? viewByScreenKey[firstScreenKey] : 'pluginMarketplace';
}

const CORE_WIDGETS: DashboardWidgetDefinition[] = [
  { id: 'abacus-ai', view: 'abacusAI', title: 'Abacus AI', subtitle: 'Insights, Studio handoffs, providers, automations & audits', icon: 'AI', badge: 'AI', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'ai-provider-team', view: 'aiProviderTeam', title: 'AI Provider Team', subtitle: 'Provider switcher, capability labels, routing policies & usage analytics', icon: 'AIT', badge: 'PROVIDERS', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'headmistress-dashboard', view: 'headmistressDashboard', title: 'Headmistress Dashboard', subtitle: 'Revenue, compliance, safety & risk overview', icon: 'HQ', badge: 'OWNER', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'dashboard-module-register', view: 'dashboardModuleRegister', title: 'Dashboard Module Register', subtitle: 'Sub, Mistress and Headmistress tile map from sketches', icon: 'REG', badge: 'REGISTER', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'quick-check-zone', view: 'quickCheckZone', title: 'Quick Check Zone', subtitle: 'Confessions, bookings, requests, Rolodex, fulfilment and messages', icon: 'QC', badge: 'CHECK', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'magnetic-features', view: 'magneticFeatures', title: 'Magnetic Feature Dashboard', subtitle: 'Feature contracts, registry health and plug-and-play readiness', icon: 'MAG', badge: 'MAGNETIC', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'command-centre', view: 'admin', title: 'Command Centre', subtitle: 'Headmistress controls & oversight', icon: 'CMD', badge: 'ADMIN', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'admin-analytics-status', view: 'adminAnalytics', title: 'Admin Analytics', subtitle: 'Conversations, revenue, tokens, status, logs & webhooks', icon: 'ANL', badge: 'ANALYTICS', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'admin-economy', view: 'adminEconomy', title: 'Economy Engine', subtitle: 'Money rules, credits, rewards and platform economy controls', icon: 'ECO', badge: 'ECONOMY', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'admin-users', view: 'adminUsers', title: 'Admin User Command', subtitle: 'Suspend, restore, ban & verify users', icon: 'USR', badge: 'USERS', roles: ADMIN_ROLES, source: 'core' },
  { id: 'admin-member-delegation', view: 'adminMemberDelegation', title: 'Admin Member +', subtitle: 'Delegate platform helpers, trusted members, jobs & admin messages', icon: 'ADM', badge: 'DELEGATE', roles: ADMIN_ROLES, source: 'core' },
  { id: 'trusted-member-delegation', view: 'trustedMemberDelegation', title: 'Trusted Member +', subtitle: 'Delegate creator profile helpers, jobs and trusted messages', icon: 'TRU', badge: 'TRUSTED', roles: ['MISTRESS'], source: 'core' },
  { id: 'admin-plugins', view: 'adminPlugins', title: 'Admin Plugin Command', subtitle: 'Activate, scaffold, disable & park plugins', icon: 'MOD', badge: 'PLUGINS', roles: ADMIN_ROLES, source: 'core' },
  { id: 'admin-queue', view: 'adminQueue', title: 'Admin Action Queue', subtitle: 'Review, escalate, resolve & dismiss queue items', icon: 'QUE', badge: 'QUEUE', roles: ADMIN_ROLES, source: 'core' },
  { id: 'workshop-portal', view: 'workshopPortal', title: 'Workshop Portal', subtitle: 'Moderation queues, release downloads, OAuth links & role panels', icon: 'WP', badge: 'PORTAL', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'preview-ops', view: 'previewOps', title: 'Preview Ops', subtitle: 'Local tunnels, readiness checks, public warnings & shutdown safety', icon: 'OPS', badge: 'PREVIEW', roles: ADMIN_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'notifications', view: 'notifications', title: 'Notifications', subtitle: 'Inbox, alerts & platform notices', icon: 'NTF', badge: 'ALERTS', roles: ALL_ROLES, source: 'core' },
  { id: 'live-room', view: 'live', title: 'Live Room', subtitle: 'Go live or join sessions', icon: 'LIVE', roles: ALL_ROLES, source: 'core' },
  { id: 'live-access-stack', view: 'liveAccessStack', title: 'Live Access Stack', subtitle: 'Rooms, paid calls, watch sessions, replays & safety gates', icon: 'LIV', badge: 'ACCESS', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'game-hub', view: 'gameHub', title: 'Game Hub', subtitle: 'Quiz imports, hosted games, reaction rooms & live overlays', icon: 'GAME', badge: 'GAMES', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'content-library', view: 'contentLibrary', title: 'Content Library', subtitle: 'Media libraries, playlists, drops, packs & replay archives', icon: 'LIB', badge: 'LIBRARY', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'bookings', view: 'bookings', title: 'Paid Calls / Bookings', subtitle: 'Phone, video, timers & extensions', icon: 'CALL', badge: 'CALLS', roles: ALL_ROLES, source: 'core' },
  { id: 'call-scheduling', view: 'callScheduling', title: 'Call Scheduling', subtitle: 'Scheduled call queue, wallet handoffs, reminders & calendar ids', icon: 'SCH', badge: 'SCHEDULE', roles: ALL_ROLES, source: 'core' },
  { id: 'chat', view: 'chat', title: 'Chat', subtitle: 'Messages & paid chat', icon: 'CHAT', badge: 'LIVE', roles: ALL_ROLES, source: 'core' },
  { id: 'ppv', view: 'ppv', title: 'PPV Vault', subtitle: 'Premium content unlocks', icon: 'PPV', badge: 'PPV', roles: ALL_ROLES, source: 'core' },
  { id: 'subscriptions', view: 'subscriptions', title: 'Memberships', subtitle: 'Subscription tiers & creator plans', icon: 'SUB', badge: 'SUBS', roles: ALL_ROLES, source: 'core' },
  { id: 'positions', view: 'positions', title: 'Positions & Leaderboards', subtitle: 'Crown, shoe, bag, door holders & ranks', icon: 'RANK', badge: 'RANKS', roles: ALL_ROLES, source: 'core' },
  { id: 'stickers', view: 'stickers', title: 'Sticker Studio', subtitle: 'Create, collect & release sticker drops', icon: 'STK', badge: 'STICKERS', roles: ALL_ROLES, source: 'core' },
  { id: 'rolodex', view: 'rolodex', title: 'Rolodex Cards', subtitle: 'Contact cards, notes & quick tags', icon: 'CARD', badge: 'CARDS', roles: CREATOR_ROLES, source: 'core' },
  { id: 'little-black-book', view: 'littleBlackBook', title: 'Little Black Book', subtitle: 'Sub-side Mistress cards & private notes', icon: 'LBB', badge: 'SUB', roles: ['SUB'], source: 'core' },
  { id: 'sub-vault', view: 'subVault', title: 'Sub Vault', subtitle: 'Consent, verification references & revocation', icon: 'ID', badge: 'VAULT', roles: ALL_ROLES, source: 'core' },
  { id: 'inventory', view: 'inventory', title: 'Inventory', subtitle: 'Owned gifts & sticker album', icon: 'INV', roles: ALL_ROLES, source: 'core' },
  { id: 'profile', view: 'profile', title: 'Profile', subtitle: 'Public showcase', icon: 'PRO', roles: ALL_ROLES, source: 'core' },
  { id: 'wallet', view: 'wallet', title: 'Wallet', subtitle: 'Balance & transactions', icon: 'WAL', badge: 'NEW', roles: ALL_ROLES, source: 'core' },
  { id: 'earnings-vault', view: 'earningsVault', title: 'Earnings Vault', subtitle: 'Creator cashout, payout methods, reserves & approval status', icon: 'EV', badge: 'PAYOUT', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'keeper-allowance', view: 'keeperAllowance', title: 'Keeper & Allowance Wallet', subtitle: 'Agreements, caps, renewals, goal roles, receipts & audit trail', icon: 'KEEP', badge: 'KEEPER', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'records-tax-notes', view: 'records', title: 'Records & Tax Notes', subtitle: 'Creator receipts, platform fees & export notes', icon: 'REC', badge: 'RECORDS', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'style-packs', view: 'stylePacks', title: 'Style Packs', subtitle: 'Free, paid, custom, and installed UI packs', icon: 'STYLE', badge: 'STYLE', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'ui-layout-studio', view: 'uiLayoutStudio', title: 'UI Layout Studio', subtitle: 'Choose dashboard layouts, responsive shells & style modes', icon: 'UI', badge: 'LAYOUT', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'creator-growth', view: 'creatorGrowth', title: 'Creator Growth Tools', subtitle: 'Profile links, campaigns, traffic sources & conversion destinations', icon: 'GRO', badge: 'GROWTH', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'creator-growth-analytics', view: 'creatorGrowthAnalytics', title: 'Creator Growth Analytics', subtitle: 'Campaign events, sources, conversions and rates', icon: 'CGA', badge: 'ANALYTICS', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'wishlist', view: 'wishlist', title: 'Wishlist Support', subtitle: 'Creator wishlists, buyer purchase flow and reserve intent', icon: 'WISH', badge: 'WISH', roles: ALL_ROLES, source: 'core' },
  { id: 'store-support', view: 'storeSupport', title: 'Store Support', subtitle: 'Store worlds, buyer purchases and creator item setup', icon: 'STORE', badge: 'STORE', roles: ALL_ROLES, source: 'core' },
  { id: 'analytics', view: 'home', title: 'Analytics', subtitle: 'Earnings & performance', icon: 'ANL', roles: ALL_ROLES, source: 'core', disabled: true },
];

const PLATFORM_PLUGIN_WIDGETS: DashboardWidgetDefinition[] = [
  { id: 'collector-economy', view: 'collectorEconomy', title: 'Collector Economy', subtitle: 'Marketplace worlds, order states, rewards & disputes', icon: 'COL', badge: 'COLLECT', roles: ALL_ROLES, source: 'plugin', pluginKey: 'marketplace.collector-economy', autoRegistered: true, defaultSize: 'wide' },
  { id: 'marketplace-inventory', view: 'marketplaceInventory', title: 'Marketplace Inventory Worlds', subtitle: 'Create and manage vending, hamper & mystery stock', icon: 'SHOP', badge: 'CREATOR', roles: CREATOR_ROLES, source: 'plugin', pluginKey: 'marketplace.inventory-worlds', autoRegistered: true, defaultSize: 'wide' },
  { id: 'marketplace-orders', view: 'marketplaceOrders', title: 'Marketplace Orders', subtitle: 'Fulfil sales, filter queues & manage seller handoffs', icon: 'ORD', badge: 'ORDERS', roles: CREATOR_ROLES, source: 'plugin', pluginKey: 'marketplace.seller-orders', autoRegistered: true, defaultSize: 'wide' },
  { id: 'plugin-marketplace', view: 'pluginMarketplace', title: 'Plugin Marketplace', subtitle: 'Browse priced plugins, bundles, addons & requests', icon: 'PLG', badge: 'PLUGINS', roles: ALL_ROLES, source: 'plugin', pluginKey: 'platform.plugin-marketplace', autoRegistered: true },
  { id: 'inventory-plugins', view: 'inventoryPlugins', title: 'Inventory Plugins', subtitle: 'Browse, request approval & purchase items', icon: 'ITEM', badge: 'SHOP', roles: ALL_ROLES, source: 'plugin', pluginKey: 'marketplace.inventory-plugins', autoRegistered: true, defaultSize: 'wide' },
];


const GIFT_BUNDLE_WIDGETS: DashboardWidgetDefinition[] = [
  { id: 'gift-bundle-builder', view: 'stickers', title: 'Gift Bundle Builder', subtitle: 'Group draft stickers, icons, cards and digital gifts into upload-ready packs', icon: 'BNDL', badge: 'BUNDLE', roles: CREATOR_ROLES, source: 'plugin', pluginKey: 'gift.bundle-builder', autoRegistered: true, defaultSize: 'wide' },
];


const DIGITAL_GIFT_STORE_WIDGETS: DashboardWidgetDefinition[] = [
  { id: 'digital-gift-store', view: 'storeSupport', title: 'Digital Gift Store', subtitle: 'Upload, preview, price and stage digital gifts and bundle manifests', icon: 'GIFT', badge: 'GIFTS', roles: CREATOR_ROLES, source: 'plugin', pluginKey: 'digital-gifts.store-upload', autoRegistered: true, defaultSize: 'wide' },
];


const STORE_ROUTING_WIDGETS: DashboardWidgetDefinition[] = [
  { id: 'sticker-marketplace-purchase', view: 'stickers', title: 'Sticker Purchase UX', subtitle: 'Single sticker, pack, limited drop and collector progress purchase states', icon: 'BUY', badge: 'BUY', roles: ALL_ROLES, source: 'core', defaultSize: 'wide' },
  { id: 'content-bundle-polish', view: 'contentLibrary', title: 'Content Bundle Polish', subtitle: 'Bundle card preview, item states, access toggles and readiness checks', icon: 'BND', badge: 'BUNDLE', roles: CREATOR_ROLES, source: 'core', defaultSize: 'wide' },
];

const REGISTRY_PLUGIN_WIDGETS: DashboardWidgetDefinition[] = enabledMistressXPlugins.map((plugin) => ({
  id: `registry-${plugin.key}`,
  view: registryView(plugin),
  title: plugin.name,
  subtitle: registrySubtitle(plugin),
  icon: registryIcon(plugin),
  badge: 'REGISTRY',
  roles: registryRolesToDashboardRoles(plugin),
  source: 'plugin',
  pluginKey: plugin.key,
  autoRegistered: true,
  defaultSize: plugin.routes && plugin.routes.length > 1 ? 'wide' : 'standard',
}));

export const DASHBOARD_LAYOUT_PRESETS: DashboardPresetDefinition[] = [
  { id: 'role-default', title: 'Role Default', roles: ALL_ROLES },
  { id: 'commerce', title: 'Commerce', roles: ALL_ROLES },
  { id: 'community', title: 'Community', roles: ALL_ROLES },
  { id: 'creator-ops', title: 'Creator Ops', roles: CREATOR_ROLES },
];

export const DASHBOARD_WIDGET_REGISTRY = [...CORE_WIDGETS, ...PLATFORM_PLUGIN_WIDGETS, ...GIFT_BUNDLE_WIDGETS, ...DIGITAL_GIFT_STORE_WIDGETS, ...STORE_ROUTING_WIDGETS, ...REGISTRY_PLUGIN_WIDGETS];

const ROLE_DEFAULT_ORDER: Record<DashboardRole, string[]> = {
  ADMIN: ['headmistress-dashboard', 'command-centre', 'admin-analytics-status', 'admin-economy', 'admin-plugins', 'plugin-marketplace', 'magnetic-features', 'dashboard-module-register', 'quick-check-zone', 'admin-member-delegation', 'admin-users', 'admin-queue', 'workshop-portal', 'preview-ops', 'collector-economy', 'marketplace-inventory', 'marketplace-orders', 'digital-gift-store', 'gift-bundle-builder', 'sticker-marketplace-purchase', 'content-bundle-polish', 'inventory-plugins', 'style-packs', 'ui-layout-studio', 'live-access-stack', 'game-hub', 'content-library', 'content-bundle-polish', 'bookings', 'call-scheduling', 'wallet', 'earnings-vault', 'keeper-allowance', 'records-tax-notes', 'notifications', 'analytics'],
  HEADMISTRESS: ['headmistress-dashboard', 'command-centre', 'admin-analytics-status', 'admin-economy', 'admin-plugins', 'plugin-marketplace', 'magnetic-features', 'dashboard-module-register', 'quick-check-zone', 'admin-member-delegation', 'admin-users', 'admin-queue', 'workshop-portal', 'preview-ops', 'collector-economy', 'marketplace-inventory', 'marketplace-orders', 'digital-gift-store', 'gift-bundle-builder', 'sticker-marketplace-purchase', 'content-bundle-polish', 'inventory-plugins', 'style-packs', 'ui-layout-studio', 'live-access-stack', 'game-hub', 'content-library', 'bookings', 'call-scheduling', 'chat', 'wallet', 'earnings-vault', 'keeper-allowance', 'records-tax-notes', 'notifications', 'analytics'],
  MISTRESS: ['quick-check-zone', 'notifications', 'live-room', 'live-access-stack', 'chat', 'bookings', 'call-scheduling', 'content-library', 'ppv', 'subscriptions', 'digital-gift-store', 'gift-bundle-builder', 'stickers', 'sticker-marketplace-purchase', 'content-bundle-polish', 'marketplace-inventory', 'marketplace-orders', 'inventory-plugins', 'plugin-marketplace', 'creator-growth', 'creator-growth-analytics', 'wallet', 'earnings-vault', 'keeper-allowance', 'records-tax-notes', 'rolodex', 'trusted-member-delegation', 'dashboard-module-register', 'abacus-ai', 'ai-provider-team', 'workshop-portal', 'collector-economy', 'style-packs', 'ui-layout-studio', 'positions', 'wishlist', 'store-support', 'analytics'],
  SUB: ['notifications', 'live-room', 'live-access-stack', 'chat', 'bookings', 'call-scheduling', 'content-library', 'ppv', 'subscriptions', 'positions', 'stickers', 'sticker-marketplace-purchase', 'little-black-book', 'sub-vault', 'collector-economy', 'plugin-marketplace', 'inventory-plugins', 'inventory', 'profile', 'wishlist', 'store-support', 'wallet', 'keeper-allowance', 'ui-layout-studio', 'dashboard-module-register', 'game-hub', 'analytics'],
};

const PRESET_ORDER: Record<DashboardLayoutPreset, string[]> = {
  'role-default': [],
  commerce: ['wallet', 'earnings-vault', 'keeper-allowance', 'records-tax-notes', 'collector-economy', 'marketplace-inventory', 'marketplace-orders', 'digital-gift-store', 'gift-bundle-builder', 'inventory-plugins', 'plugin-marketplace', 'subscriptions', 'ppv', 'content-library', 'bookings', 'call-scheduling', 'inventory', 'wishlist', 'store-support', 'ui-layout-studio', 'dashboard-module-register', 'analytics'],
  community: ['notifications', 'chat', 'live-room', 'live-access-stack', 'game-hub', 'content-library', 'positions', 'stickers', 'gift-bundle-builder', 'digital-gift-store', 'sticker-marketplace-purchase', 'content-bundle-polish', 'profile', 'little-black-book', 'rolodex', 'sub-vault', 'quick-check-zone', 'workshop-portal', 'ui-layout-studio', 'dashboard-module-register'],
  'creator-ops': ['quick-check-zone', 'notifications', 'live-access-stack', 'content-library', 'bookings', 'call-scheduling', 'chat', 'marketplace-inventory', 'marketplace-orders', 'digital-gift-store', 'gift-bundle-builder', 'stickers', 'creator-growth', 'creator-growth-analytics', 'wallet', 'earnings-vault', 'keeper-allowance', 'records-tax-notes', 'rolodex', 'trusted-member-delegation', 'abacus-ai', 'ai-provider-team', 'workshop-portal', 'preview-ops', 'ui-layout-studio', 'analytics'],
};

export function canOpenCommandCentre(role?: string) {
  return role === 'HEADMISTRESS' || role === 'ADMIN';
}

export function canManageMarketplaceInventory(role?: string) {
  return role === 'MISTRESS' || role === 'HEADMISTRESS' || role === 'ADMIN';
}

export function getDashboardWidgetDefinition(widgetId: string) {
  return DASHBOARD_WIDGET_REGISTRY.find((widget) => widget.id === widgetId);
}

export function getVisibleDashboardWidgetDefinitions(role: DashboardRole) {
  return DASHBOARD_WIDGET_REGISTRY.filter((widget) => widget.roles.includes(role));
}

export function getAvailableDashboardPresets(role: DashboardRole) {
  return DASHBOARD_LAYOUT_PRESETS.filter((preset) => preset.roles.includes(role));
}

export function createDashboardLayoutPreset(role: DashboardRole, preset: DashboardLayoutPreset = 'role-default'): DashboardWidgetLayoutItem[] {
  const availableWidgets = getVisibleDashboardWidgetDefinitions(role);
  const availableIds = new Set(availableWidgets.map((widget) => widget.id));
  const order = preset === 'role-default' ? ROLE_DEFAULT_ORDER[role] : PRESET_ORDER[preset];
  const orderedIds = order.filter((widgetId) => availableIds.has(widgetId));
  const missingIds = availableWidgets
    .map((widget) => widget.id)
    .filter((widgetId) => !orderedIds.includes(widgetId));

  return [...orderedIds, ...missingIds].map((widgetId) => {
    const widget = getDashboardWidgetDefinition(widgetId);
    return {
      id: widgetId,
      visible: orderedIds.includes(widgetId) || Boolean(widget?.autoRegistered),
      size: widget?.defaultSize || 'standard',
      removed: false,
    };
  });
}

export function normalizeDashboardLayout(layout: DashboardWidgetLayoutItem[], role: DashboardRole): DashboardWidgetLayoutItem[] {
  const availableWidgets = getVisibleDashboardWidgetDefinitions(role);
  const availableIds = new Set(availableWidgets.map((widget) => widget.id));
  const seenIds = new Set<string>();
  const normalized = layout.reduce<DashboardWidgetLayoutItem[]>((items, item) => {
    if (!availableIds.has(item.id) || seenIds.has(item.id)) return items;
    seenIds.add(item.id);
    const widget = getDashboardWidgetDefinition(item.id);
    const removed = Boolean(item.removed);
    items.push({
      id: item.id,
      visible: removed ? false : item.visible,
      size: item.size || widget?.defaultSize || 'standard',
      removed,
    });
    return items;
  }, []);

  availableWidgets.forEach((widget) => {
    if (seenIds.has(widget.id)) return;
    normalized.push({
      id: widget.id,
      visible: Boolean(widget.autoRegistered),
      size: widget.defaultSize || 'standard',
      removed: false,
    });
  });

  return normalized;
}
