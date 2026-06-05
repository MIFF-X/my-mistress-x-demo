import { createWalletDashboardCard } from '../wallet/wallet-launcher.js';
import { createChatDashboardCard } from '../../plugins/shared/communication/chat/chat-launcher.js';
import { createPpvDashboardCard } from '../ppv/ppv-launcher.js';
import { createSubscriptionsDashboardCard } from '../subscriptions/subscriptions-launcher.js';
import { createLiveShowsDashboardCard } from '../live-shows/live-shows-launcher.js';
import { createGiftsDashboardCard } from '../gifts/gifts-launcher.js';
import { createMarketplaceDashboardCard } from '../marketplace/marketplace-launcher.js';
import { createStickersDashboardCard } from '../stickers/stickers-launcher.js';
import { createRolodexDashboardCard } from '../rolodex/rolodex-launcher.js';
import { createNotificationsDashboardCard } from '../notifications/notifications-launcher.js';

export const DASHBOARD_MODULES = {
  wallet: createWalletDashboardCard,
  chat: createChatDashboardCard,
  ppv: createPpvDashboardCard,
  subscriptions: createSubscriptionsDashboardCard,
  liveShows: createLiveShowsDashboardCard,
  gifts: createGiftsDashboardCard,
  marketplace: createMarketplaceDashboardCard,
  stickers: createStickersDashboardCard,
  rolodex: createRolodexDashboardCard,
  notifications: createNotificationsDashboardCard,
};

export const ROLE_DASHBOARD_MODULES = {
  HEADMISTRESS: [
    'notifications',
    'wallet',
    'chat',
    'ppv',
    'subscriptions',
    'liveShows',
    'gifts',
    'marketplace',
    'stickers',
    'rolodex',
  ],
  ADMIN: [
    'notifications',
    'wallet',
    'chat',
    'ppv',
    'subscriptions',
    'liveShows',
    'gifts',
    'marketplace',
    'stickers',
    'rolodex',
  ],
  MISTRESS: [
    'notifications',
    'wallet',
    'chat',
    'ppv',
    'subscriptions',
    'liveShows',
    'gifts',
    'marketplace',
    'stickers',
    'rolodex',
  ],
  SUB: [
    'notifications',
    'wallet',
    'chat',
    'subscriptions',
    'liveShows',
    'gifts',
    'marketplace',
    'stickers',
    'rolodex',
    'ppv',
  ],
};

export function createDashboardModuleGrid({ role = 'SUB', appElement, modules } = {}) {
  const grid = document.createElement('div');
  grid.className = 'dashboard-card-grid dashboard-module-grid';
  grid.dataset.role = role;

  const moduleKeys = modules || ROLE_DASHBOARD_MODULES[role] || ROLE_DASHBOARD_MODULES.SUB;

  moduleKeys.forEach((moduleKey) => {
    const createCard = DASHBOARD_MODULES[moduleKey];
    if (typeof createCard === 'function') {
      grid.appendChild(createCard({ appElement }));
    }
  });

  return grid;
}
