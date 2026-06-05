import type { MxGameIconPack, MxGameSkinPack, MxGameVisualBundle } from './gameSkinTypes';

export const mxGameSkinPacks: MxGameSkinPack[] = [
  {
    id: 'gold-noir-slot-skin',
    name: 'Gold Noir Slot Skin',
    gameType: 'slot',
    themeId: 'mx-gold-noir',
    description: 'Premium dark cabinet, gold reel frame, glowing prize panel, and soft animated light accents.',
    requiredSlots: [
      { id: 'symbol-common-1', label: 'Common Symbol 1', meaning: 'common', required: true },
      { id: 'symbol-common-2', label: 'Common Symbol 2', meaning: 'common', required: true },
      { id: 'symbol-rare', label: 'Rare Symbol', meaning: 'rare', required: true },
      { id: 'symbol-jackpot', label: 'Jackpot Symbol', meaning: 'jackpot', required: true },
      { id: 'symbol-bonus', label: 'Bonus Symbol', meaning: 'bonus', required: false },
    ],
    tags: ['slot', 'gold', 'premium', 'game'],
  },
  {
    id: 'collector-scratch-card-skin',
    name: 'Collector Scratch Card Skin',
    gameType: 'scratch-card',
    themeId: 'mx-collector-card-classic',
    description: 'Card-style scratch surface with reveal windows, sticker album framing, and reward result panels.',
    requiredSlots: [
      { id: 'reveal-common', label: 'Common Reveal', meaning: 'common', required: true },
      { id: 'reveal-reward', label: 'Reward Reveal', meaning: 'reward', required: true },
      { id: 'reveal-rare', label: 'Rare Reveal', meaning: 'rare', required: false },
      { id: 'reveal-retry', label: 'Retry Reveal', meaning: 'retry', required: false },
    ],
    tags: ['scratch-card', 'collector', 'reward', 'sticker'],
  },
  {
    id: 'neon-stage-wheel-skin',
    name: 'Neon Stage Wheel Skin',
    gameType: 'wheel',
    themeId: 'mx-neon-stage',
    description: 'Live-room prize wheel skin with neon segments, pointer glow, and animated event panel.',
    requiredSlots: [
      { id: 'segment-common', label: 'Common Segment', meaning: 'common', required: true },
      { id: 'segment-bonus', label: 'Bonus Segment', meaning: 'bonus', required: true },
      { id: 'segment-special', label: 'Special Segment', meaning: 'special', required: false },
    ],
    tags: ['wheel', 'live', 'neon', 'events'],
  },
];

export const mxGameIconPacks: MxGameIconPack[] = [
  {
    id: 'money-reward-symbols',
    name: 'Money Reward Symbols',
    description: 'Coins, gems, wallet, dollar, vault, reward, boost, and progress icons for game surfaces.',
    compatibleGameTypes: ['slot', 'scratch-card', 'wheel', 'mystery-box'],
    iconCount: 24,
    tags: ['money', 'wallet', 'rewards', 'goals'],
    exportFormats: ['svg', 'svg-sprite', 'png', 'json'],
  },
  {
    id: 'live-gift-symbols',
    name: 'Live Gift Symbols',
    description: 'Gift, heart, star, chat, stage, viewer, timer, and sparkle icons for live event games.',
    compatibleGameTypes: ['slot', 'scratch-card', 'wheel', 'raffle'],
    iconCount: 32,
    tags: ['live', 'gifts', 'chat', 'events'],
    exportFormats: ['svg', 'svg-sprite', 'png', 'json'],
  },
  {
    id: 'collector-badge-symbols',
    name: 'Collector Badge Symbols',
    description: 'Album, sticker, badge, trophy, rarity, ticket, pack, and progress icons.',
    compatibleGameTypes: ['scratch-card', 'wheel', 'mystery-box', 'raffle'],
    iconCount: 28,
    tags: ['collector', 'badges', 'stickers', 'albums'],
    exportFormats: ['svg', 'svg-sprite', 'png', 'json'],
  },
];

export const mxDemoGameVisualBundles: MxGameVisualBundle[] = [
  {
    id: 'gold-noir-money-slot',
    name: 'Gold Noir Money Slot',
    gameType: 'slot',
    skinPackId: 'gold-noir-slot-skin',
    iconPackId: 'money-reward-symbols',
    themeId: 'mx-gold-noir',
    compatiblePlugins: ['mini-games', 'rewards', 'live-stage-commerce'],
    exportFormats: ['svg-sprite', 'png', 'json'],
    iconMap: {
      'symbol-common-1': 'coin',
      'symbol-common-2': 'heart',
      'symbol-rare': 'gem',
      'symbol-jackpot': 'crown',
      'symbol-bonus': 'spark',
    },
  },
  {
    id: 'collector-badge-scratch',
    name: 'Collector Badge Scratch',
    gameType: 'scratch-card',
    skinPackId: 'collector-scratch-card-skin',
    iconPackId: 'collector-badge-symbols',
    themeId: 'mx-collector-card-classic',
    compatiblePlugins: ['badges', 'stickers', 'daily-rewards'],
    exportFormats: ['png', 'json', 'svg-sprite'],
    iconMap: {
      'reveal-common': 'sticker',
      'reveal-reward': 'badge',
      'reveal-rare': 'trophy',
      'reveal-retry': 'ticket',
    },
  },
];

export const mxAnimatedIconCategories = [
  'money-wallet',
  'gifts-rewards',
  'live-stage',
  'chat-messages',
  'profile-status',
  'goals-progress',
  'store-inventory',
  'collector-albums',
  'stickers-emotes',
  'badges-trophies',
  'app-market-tools',
  'dashboard-analytics',
  'calendar-bookings',
  'rooms-events',
  'games-mini-tools',
  'slot-symbols',
  'scratch-rewards',
  'mystery-drops',
  'service-tasks',
] as const;
