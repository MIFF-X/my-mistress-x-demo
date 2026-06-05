import type { MistressXPluginDefinition, MistressXPluginRegistry } from './pluginTypes';

export const mistressXPluginRegistry: MistressXPluginRegistry = {
  'chat-core': {
    key: 'chat-core',
    name: 'Chat Core',
    description: 'Shared real-time messaging shell for private chat, live show chat sidebars, card shares, stickers, and paid messaging gates.',
    category: 'communication',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['chat', 'socket-events', 'notifications'],
    routes: [
      { key: 'chat', label: 'Messages', screenKey: 'ChatScreen', roles: ['mistress', 'sub'] },
    ],
    dependencies: ['socket.io-client'],
  },
  'ppv-content': {
    key: 'ppv-content',
    name: 'PPV Content',
    description: 'Creator upload, pricing, timed access, buy-to-keep access, bundle inclusion, and wallet unlock rules for paid content.',
    category: 'content-monetisation',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['ppv-content', 'file-upload', 'wallet-spend', 'wallet-earnings', 'countdown-timers'],
    routes: [
      { key: 'ppv-library', label: 'PPV Library', screenKey: 'PpvScreen', roles: ['mistress', 'sub'] },
    ],
    dependencies: ['expo-image-picker', 'date-fns', 'axios'],
  },
  'live-shows': {
    key: 'live-shows',
    name: 'Live Shows',
    description: 'Mistress-led live rooms with chat sidebars, micro-gifts, paid requests, viewer counters, private room access, and live access controls.',
    category: 'live-interaction',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['live-room', 'chat', 'socket-events', 'micro-gifts', 'wallet-spend', 'wallet-earnings', 'notifications'],
    routes: [
      { key: 'live-room', label: 'Live Room', screenKey: 'LiveRoomScreen', roles: ['mistress', 'sub'] },
      { key: 'live-access', label: 'Live Access Stack', screenKey: 'LiveAccessStackScreen', roles: ['headmistress', 'mistress'] },
    ],
    dependencies: ['socket.io-client', 'date-fns'],
  },
  'video-call-bookings': {
    key: 'video-call-bookings',
    name: 'Video Call Bookings',
    description: 'Paid one-on-one video/voice booking slots with Mistress-set prices, durations, extension rules, countdown timers, and calendar reminders.',
    category: 'bookings',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['calendar-bookings', 'countdown-timers', 'wallet-spend', 'wallet-earnings', 'notifications'],
    routes: [
      { key: 'bookings', label: 'Bookings', screenKey: 'BookingsScreen', roles: ['mistress', 'sub'] },
      { key: 'call-scheduling', label: 'Call Scheduling', screenKey: 'CallSchedulingScreen', roles: ['mistress', 'sub'] },
    ],
    dependencies: ['react-native-calendars', 'date-fns', 'expo-notifications'],
  },
  'sticker-collections': {
    key: 'sticker-collections',
    name: 'Sticker Collections',
    description: 'Mistress-created photo stickers, monthly drops, collectible sticker albums, chat sends, purchase rules, and pack collection progress.',
    category: 'collectibles',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['sticker-collections', 'file-upload', 'chat', 'wallet-spend', 'wallet-earnings', 'notifications'],
    routes: [
      { key: 'sticker-studio', label: 'Sticker Studio', screenKey: 'StickerStudioScreen', roles: ['mistress'] },
    ],
    dependencies: ['expo-image-picker', 'react-native-svg', 'lucide-react-native'],
  },
  'rolodex-cards': {
    key: 'rolodex-cards',
    name: 'Rolodex Cards',
    description: 'Pokemon-style Sub/Mistress contact cards with private notes, custom colours, highlighted/greyed icons, consent-aware sharing, and role-based visibility.',
    category: 'rolodex',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['rolodex-cards', 'chat', 'file-upload', 'notifications'],
    routes: [
      { key: 'rolodex', label: 'Rolodex', screenKey: 'RolodexScreen', roles: ['headmistress', 'mistress', 'sub'] },
      { key: 'little-black-book', label: 'Little Black Book', screenKey: 'LittleBlackBookScreen', roles: ['headmistress', 'mistress'] },
    ],
    dependencies: ['react-hook-form', 'zod', 'react-native-svg', 'lucide-react-native'],
  },
  'wallet-economy': {
    key: 'wallet-economy',
    name: 'Wallet Economy',
    description: 'Top-up payment options, credits, spending gates, Mistress earnings, Earnings Vault, payout-readiness, and economy analytics handoff.',
    category: 'economy',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['wallet-spend', 'wallet-earnings', 'admin-approval', 'notifications'],
    routes: [
      { key: 'wallet', label: 'Wallet', screenKey: 'WalletScreen', roles: ['sub'] },
      { key: 'earnings-vault', label: 'Earnings Vault', screenKey: 'EarningsVaultScreen', roles: ['headmistress', 'mistress'] },
    ],
    dependencies: ['axios', 'zustand'],
  },
  'competition-leaderboards': {
    key: 'competition-leaderboards',
    name: 'Competition Leaderboards',
    description: 'Position competitions, gift rankings, task/trophy/sticker collector ranks, and configurable leaderboard categories for Headmistress and Mistresses.',
    category: 'economy',
    status: 'active',
    roles: ['headmistress', 'mistress', 'sub'],
    capabilities: ['leaderboards', 'wallet-spend', 'notifications'],
    routes: [
      { key: 'positions', label: 'Positions', screenKey: 'PositionsScreen', roles: ['mistress', 'sub'] },
    ],
    dependencies: ['date-fns'],
  },
};

export const enabledMistressXPlugins = Object.values(mistressXPluginRegistry);

export function getPluginByKey(key: string): MistressXPluginDefinition | undefined {
  return mistressXPluginRegistry[key];
}

export function getPluginsForRole(role: string): MistressXPluginDefinition[] {
  return enabledMistressXPlugins.filter((plugin) => plugin.roles.includes(role as never));
}

export function getPluginsByCapability(capability: string): MistressXPluginDefinition[] {
  return enabledMistressXPlugins.filter((plugin) => plugin.capabilities.includes(capability as never));
}
