import type { MxAvatarPack, MxAvatarStyleOption } from './avatarMakerTypes';

export const mxAvatarStyleOptions: MxAvatarStyleOption[] = [
  { id: 'base-soft-round', label: 'Soft Round Base', category: 'base', free: true },
  { id: 'base-glossy-cartoon', label: 'Glossy Cartoon Base', category: 'base', free: false },
  { id: 'hair-short', label: 'Short Hair', category: 'hair', free: true },
  { id: 'hair-long-wave', label: 'Long Wave Hair', category: 'hair', free: true },
  { id: 'outfit-dark-luxe', label: 'Dark Luxe Outfit', category: 'outfit', free: false },
  { id: 'expression-smile', label: 'Smile', category: 'expression', free: true },
  { id: 'expression-heart-eyes', label: 'Heart Eyes', category: 'expression', free: false },
  { id: 'pose-wave', label: 'Wave', category: 'pose', free: true },
  { id: 'background-gold-noir', label: 'Gold Noir Background', category: 'background', free: false },
];

export const mxAvatarPacks: MxAvatarPack[] = [
  {
    id: 'personal-avatar-starter',
    name: 'Personal Avatar Starter',
    type: 'personal-avatar',
    ownerRole: 'supporter',
    stickerCount: 12,
    animatedCount: 2,
    compatibleSurfaces: ['profile', 'chat', 'reactions', 'stickers'],
    styleOptions: ['base-soft-round', 'hair-short', 'hair-long-wave', 'expression-smile', 'pose-wave'],
  },
  {
    id: 'creator-brand-avatar-pack',
    name: 'Creator Brand Avatar Pack',
    type: 'creator-brand-pack',
    ownerRole: 'creator',
    stickerCount: 24,
    animatedCount: 6,
    compatibleSurfaces: ['profile', 'chat', 'store', 'app-market', 'live-stage'],
    styleOptions: ['base-glossy-cartoon', 'outfit-dark-luxe', 'expression-heart-eyes', 'background-gold-noir'],
  },
];

export const mxAvatarMakerFlow = [
  'choose-base',
  'choose-hair',
  'choose-outfit',
  'choose-expression',
  'choose-pose',
  'choose-background',
  'generate-sticker-pack',
  'save-avatar-pack',
  'publish-or-install',
] as const;
