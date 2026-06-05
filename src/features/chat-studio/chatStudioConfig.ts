import type { MxChatStudioSection, MxChatStudioSurface } from './chatStudioTypes';

export const mxChatStudioSurfaces: MxChatStudioSurface[] = [
  'headmistress-dashboard',
  'mistress-dashboard',
  'chat-settings',
  'asset-generator',
  'app-market',
  'live-stage-setup',
  'stream-deck',
];

export const mxChatStudioSections: MxChatStudioSection[] = [
  {
    id: 'communication',
    title: 'Text / Audio / Video Communication',
    subtitle: 'Paid chat, calls, video sessions, live rooms, access rules, timers and bookings.',
    items: ['Paid Chat', 'Audio Calls', 'Video Calls', 'Live Rooms', 'Message Composer', 'Access Rules'],
    relatedSystems: ['wallet', 'bookings', 'calendar', 'live-stage', 'chat-backend'],
  },
  {
    id: 'expression-assets',
    title: 'Emoji / Virtual Gift / Asset Studio',
    subtitle: 'Emoji, stickers, avatar packs, GIFs, send effects, wrappers, gifts and asset packs.',
    items: ['Emoji Packs', 'Sticker Packs', 'Avatar Packs', 'GIF Packs', 'Send Effects', 'Virtual Gifts', 'Asset Packs'],
    relatedSystems: ['asset-generator', 'icon-forge', 'sticker-store', 'avatar-maker', 'app-market'],
  },
  {
    id: 'wrappers-effects',
    title: 'Wrappers and Send Effects',
    subtitle: 'Message skins that can be free, paid, won, unlocked, or attached to subscription tiers.',
    items: ['Love Note Wraps', 'Gold Seal Wraps', 'Neon Pulse Wraps', 'Ribbon Gift Wraps'],
    relatedSystems: ['wallet', 'chat-composer', 'rewards', 'app-market'],
  },
  {
    id: 'sticker-store',
    title: 'Sticker Store Manager',
    subtitle: 'Featured, all and installed sticker packs with edit, reorder, remove and save order.',
    items: ['Featured Packs', 'All Packs', 'Your Stickers', 'Search', 'Install', 'Edit Order'],
    relatedSystems: ['sticker-store', 'layout-reorder', 'chat-expression-suite'],
  },
  {
    id: 'avatar-maker',
    title: 'Avatar Maker',
    subtitle: 'All users can create personal avatar, emoji, mood and reaction packs.',
    items: ['Base', 'Hair', 'Outfit', 'Expression', 'Pose', 'Background', 'Generate Stickers'],
    relatedSystems: ['profile', 'chat-expression-suite', 'sticker-store', 'app-market'],
  },
  {
    id: 'layout-reorder',
    title: 'Drag, Snap and Save Layouts',
    subtitle: 'Universal drag-and-drop ordering for modules, widgets, packs, panels and trays.',
    items: ['Edit Mode', 'Drag Items', 'Snap Into Place', 'Save Order', 'Cancel', 'Lock Layout'],
    relatedSystems: ['dashboard-widgets', 'profile-sections', 'live-stage', 'app-market'],
  },
];

export const mxChatStudioBuildOrder = [
  'Static Chat Studio screen with tabs',
  'Expression tray config panel',
  'Sticker store manager panel',
  'Message wrapper picker and price quote panel',
  'Universal reorder component',
  'Avatar maker scaffold',
  'Hook wrappers into chat composer',
  'Hook paid wrappers to wallet quote and charge',
  'Hook calls, video and live rooms into Communication drawer',
  'Publish packs through app market',
] as const;
