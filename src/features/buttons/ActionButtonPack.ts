export type ActionButtonKey =
  | 'abacusAI'
  | 'aiProviderTeam'
  | 'admin'
  | 'adminEconomy'
  | 'adminPlugins'
  | 'adminQueue'
  | 'adminUsers'
  | 'analytics'
  | 'bookings'
  | 'chat'
  | 'contentLibrary'
  | 'creatorGrowth'
  | 'creatorGrowthAnalytics'
  | 'gameHub'
  | 'giftsGoals'
  | 'inventory'
  | 'inventoryPlugins'
  | 'keeperAllowance'
  | 'live'
  | 'marketplaceInventory'
  | 'marketplaceOrders'
  | 'notifications'
  | 'positions'
  | 'ppv'
  | 'previewOps'
  | 'profile'
  | 'records'
  | 'rolodex'
  | 'stickers'
  | 'stylePacks'
  | 'subscriptions'
  | 'uiLayoutStudio'
  | 'wallet'
  | 'storeSupport'
  | 'workshopPortal'
  | 'wishlist';

export type ActionButtonSpec = {
  key: ActionButtonKey;
  badge?: string;
  fallbackGlyph: string;
  accentColor: string;
  pngAssetPath: string;
};

const actionButtonPack: Record<ActionButtonKey, ActionButtonSpec> = {
  abacusAI: {
    key: 'abacusAI',
    badge: 'AI',
    fallbackGlyph: 'AI',
    accentColor: '#c084fc',
    pngAssetPath: 'frontend/assets/action-buttons/abacus-ai.png',
  },
  aiProviderTeam: {
    key: 'aiProviderTeam',
    badge: 'PROVIDERS',
    fallbackGlyph: 'AT',
    accentColor: '#38bdf8',
    pngAssetPath: 'frontend/assets/action-buttons/ai-provider-team.png',
  },
  admin: {
    key: 'admin',
    badge: 'ADMIN',
    fallbackGlyph: 'HQ',
    accentColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-buttons/admin-command-centre.png',
  },
  adminEconomy: {
    key: 'adminEconomy',
    badge: 'ECONOMY',
    fallbackGlyph: 'EC',
    accentColor: '#f59e0b',
    pngAssetPath: 'frontend/assets/action-buttons/admin-economy-engine.png',
  },
  adminPlugins: {
    key: 'adminPlugins',
    badge: 'PLUGINS',
    fallbackGlyph: 'PL',
    accentColor: '#8b5cf6',
    pngAssetPath: 'frontend/assets/action-buttons/admin-plugins.png',
  },
  adminQueue: {
    key: 'adminQueue',
    badge: 'QUEUE',
    fallbackGlyph: 'AQ',
    accentColor: '#60a5fa',
    pngAssetPath: 'frontend/assets/action-buttons/admin-action-queue.png',
  },
  adminUsers: {
    key: 'adminUsers',
    badge: 'USERS',
    fallbackGlyph: 'US',
    accentColor: '#fb7185',
    pngAssetPath: 'frontend/assets/action-buttons/admin-users.png',
  },
  analytics: {
    key: 'analytics',
    fallbackGlyph: 'AN',
    accentColor: '#38bdf8',
    pngAssetPath: 'frontend/assets/action-buttons/analytics.png',
  },
  bookings: {
    key: 'bookings',
    badge: 'CALLS',
    fallbackGlyph: 'PH',
    accentColor: '#22c55e',
    pngAssetPath: 'frontend/assets/action-buttons/paid-calls-bookings.png',
  },
  chat: {
    key: 'chat',
    badge: 'LIVE',
    fallbackGlyph: 'CH',
    accentColor: '#ff0055',
    pngAssetPath: 'frontend/assets/action-buttons/chat.png',
  },
  contentLibrary: {
    key: 'contentLibrary',
    badge: 'LIBRARY',
    fallbackGlyph: 'CL',
    accentColor: '#38bdf8',
    pngAssetPath: 'frontend/assets/action-buttons/content-library.png',
  },
  creatorGrowth: {
    key: 'creatorGrowth',
    badge: 'GROWTH',
    fallbackGlyph: 'GR',
    accentColor: '#f97316',
    pngAssetPath: 'frontend/assets/action-buttons/creator-growth.png',
  },
  creatorGrowthAnalytics: {
    key: 'creatorGrowthAnalytics',
    badge: 'GROWTH',
    fallbackGlyph: 'GA',
    accentColor: '#38bdf8',
    pngAssetPath: 'frontend/assets/action-buttons/creator-growth-analytics.png',
  },
  gameHub: {
    key: 'gameHub',
    badge: 'GAMES',
    fallbackGlyph: 'GM',
    accentColor: '#60a5fa',
    pngAssetPath: 'frontend/assets/action-buttons/game-hub.png',
  },
  giftsGoals: {
    key: 'giftsGoals',
    badge: 'GOALS',
    fallbackGlyph: 'GG',
    accentColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-buttons/gifts-goals.png',
  },
  inventory: {
    key: 'inventory',
    fallbackGlyph: 'IV',
    accentColor: '#c084fc',
    pngAssetPath: 'frontend/assets/action-buttons/inventory.png',
  },
  inventoryPlugins: {
    key: 'inventoryPlugins',
    badge: 'STORE',
    fallbackGlyph: 'IP',
    accentColor: '#a3e635',
    pngAssetPath: 'frontend/assets/action-buttons/inventory-plugins.png',
  },
  keeperAllowance: {
    key: 'keeperAllowance',
    badge: 'KEEPER',
    fallbackGlyph: 'KA',
    accentColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-buttons/keeper-allowance.png',
  },
  live: {
    key: 'live',
    fallbackGlyph: 'LV',
    accentColor: '#ef4444',
    pngAssetPath: 'frontend/assets/action-buttons/live-room.png',
  },
  marketplaceInventory: {
    key: 'marketplaceInventory',
    badge: 'CREATOR',
    fallbackGlyph: 'MI',
    accentColor: '#f59e0b',
    pngAssetPath: 'frontend/assets/action-buttons/marketplace-inventory.png',
  },
  marketplaceOrders: {
    key: 'marketplaceOrders',
    badge: 'ORDERS',
    fallbackGlyph: 'MO',
    accentColor: '#fb7185',
    pngAssetPath: 'frontend/assets/action-buttons/marketplace-orders.png',
  },
  notifications: {
    key: 'notifications',
    badge: 'ALERTS',
    fallbackGlyph: 'NO',
    accentColor: '#60a5fa',
    pngAssetPath: 'frontend/assets/action-buttons/notifications.png',
  },
  positions: {
    key: 'positions',
    badge: 'RANKS',
    fallbackGlyph: 'RK',
    accentColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-buttons/positions-leaderboards.png',
  },
  ppv: {
    key: 'ppv',
    badge: 'PPV',
    fallbackGlyph: 'PV',
    accentColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-buttons/ppv-vault.png',
  },
  previewOps: {
    key: 'previewOps',
    badge: 'PREVIEW',
    fallbackGlyph: 'PO',
    accentColor: '#38bdf8',
    pngAssetPath: 'frontend/assets/action-buttons/preview-ops.png',
  },
  profile: {
    key: 'profile',
    fallbackGlyph: 'PF',
    accentColor: '#2dd4bf',
    pngAssetPath: 'frontend/assets/action-buttons/profile-showcase.png',
  },
  records: {
    key: 'records',
    badge: 'RECORDS',
    fallbackGlyph: 'RC',
    accentColor: '#f5c542',
    pngAssetPath: 'frontend/assets/action-buttons/records-tax-notes.png',
  },
  rolodex: {
    key: 'rolodex',
    badge: 'CARDS',
    fallbackGlyph: 'RX',
    accentColor: '#f97316',
    pngAssetPath: 'frontend/assets/action-buttons/rolodex-cards.png',
  },
  stickers: {
    key: 'stickers',
    badge: 'STICKERS',
    fallbackGlyph: 'ST',
    accentColor: '#c084fc',
    pngAssetPath: 'frontend/assets/action-buttons/sticker-studio.png',
  },
  stylePacks: {
    key: 'stylePacks',
    badge: 'STYLE',
    fallbackGlyph: 'SP',
    accentColor: '#d4af37',
    pngAssetPath: 'frontend/assets/action-buttons/style-packs.png',
  },
  subscriptions: {
    key: 'subscriptions',
    badge: 'SUBS',
    fallbackGlyph: 'MB',
    accentColor: '#7dd3fc',
    pngAssetPath: 'frontend/assets/action-buttons/memberships.png',
  },
  uiLayoutStudio: {
    key: 'uiLayoutStudio',
    badge: 'LAYOUT',
    fallbackGlyph: 'UI',
    accentColor: '#D4AF37',
    pngAssetPath: 'frontend/assets/action-buttons/ui-layout-studio.png',
  },
  wallet: {
    key: 'wallet',
    badge: 'NEW',
    fallbackGlyph: 'WA',
    accentColor: '#1D9E75',
    pngAssetPath: 'frontend/assets/action-buttons/wallet.png',
  },
  storeSupport: {
    key: 'storeSupport',
    badge: 'STORE',
    fallbackGlyph: 'SS',
    accentColor: '#a3e635',
    pngAssetPath: 'frontend/assets/action-buttons/store-support.png',
  },
  workshopPortal: {
    key: 'workshopPortal',
    badge: 'PORTAL',
    fallbackGlyph: 'WP',
    accentColor: '#f5c542',
    pngAssetPath: 'frontend/assets/action-buttons/workshop-portal.png',
  },
  wishlist: {
    key: 'wishlist',
    badge: 'WISH',
    fallbackGlyph: 'WL',
    accentColor: '#f472b6',
    pngAssetPath: 'frontend/assets/action-buttons/wishlist-support.png',
  },
};

export function getActionButtonSpec(key: ActionButtonKey) {
  return actionButtonPack[key];
}

export function getDashboardWidgetVisuals(key: ActionButtonKey, badgeOverride?: string, accentColorOverride?: string) {
  const spec = getActionButtonSpec(key);

  return {
    badge: badgeOverride || spec.badge,
    accentColor: accentColorOverride || spec.accentColor,
  };
}

export function getActionButtonPack() {
  return Object.values(actionButtonPack);
}
