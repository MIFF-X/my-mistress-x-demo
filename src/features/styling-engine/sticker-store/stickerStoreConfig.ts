import type { MxStickerPack } from './stickerStoreTypes';

export const mxStickerStoreTabs = [
  { id: 'featured', label: 'FEATURED' },
  { id: 'all', label: 'ALL' },
  { id: 'your-stickers', label: 'YOUR STICKERS' },
] as const;

export const mxDemoStickerPacks: MxStickerPack[] = [
  {
    id: 'mx-love-rabbits',
    name: 'MX Love Rabbits',
    creatorName: 'Mistress-X',
    description: 'Soft cute reaction stickers for affection, teasing, and chat warmth.',
    installState: 'installed',
    coverIcon: '🐰',
    stickerCount: 18,
    tags: ['cute', 'love', 'reaction'],
    order: 1,
  },
  {
    id: 'mx-moodies',
    name: 'MX Moodies',
    creatorName: 'Mistress-X',
    description: 'Mood face stickers for quick chat expression.',
    installState: 'installed',
    coverIcon: '🙂',
    stickerCount: 24,
    tags: ['mood', 'face', 'reaction'],
    order: 2,
  },
  {
    id: 'mx-gold-badges',
    name: 'MX Gold Badges',
    creatorName: 'Headmistress',
    description: 'Badge and seal stickers for status, daily challenges, and achievements.',
    installState: 'owned',
    coverIcon: '◇',
    stickerCount: 16,
    tags: ['badge', 'gold', 'status'],
    order: 3,
  },
  {
    id: 'mx-sweet-qoobee-style',
    name: 'MX Sweet Reactions',
    creatorName: 'Mistress-X',
    description: 'Original soft character reactions for smiles, waves, hearts, and silly moments.',
    installState: 'installed',
    coverIcon: '💛',
    stickerCount: 20,
    tags: ['character', 'reaction', 'soft'],
    order: 4,
  },
];

export function reorderStickerPackOrder(packs: MxStickerPack[], fromIndex: number, toIndex: number): MxStickerPack[] {
  const next = [...packs].sort((a, b) => a.order - b.order);
  const [moved] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, moved);
  return next.map((pack, index) => ({ ...pack, order: index + 1 }));
}
