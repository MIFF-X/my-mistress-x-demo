import type { StickerCollectorProgress, StickerPurchaseItem, StickerPurchaseSummary } from './stickerPurchaseTypes';

export const starterStickerPurchaseItems: StickerPurchaseItem[] = [
  {
    id: 'luxury-key-sticker',
    name: 'Luxury Key Sticker',
    subtitle: 'A premium key collectible linked to luxury gift bundles.',
    description: 'A single premium sticker that can be purchased alone or collected through a bundle-linked drop.',
    kind: 'single-sticker',
    status: 'available',
    rarity: 'premium',
    priceCredits: 18,
    owned: false,
    totalSupply: 500,
    soldCount: 176,
    previewLabel: '🗝️',
    tags: ['key', 'luxury', 'single'],
    linkedBundleId: 'luxury-locks-set',
  },
  {
    id: 'gold-lock-icon',
    name: 'Gold Lock Icon',
    subtitle: 'Gold utility sticker for collector and interface packs.',
    description: 'A gold lock collectible that supports digital gift and sticker pack experiences.',
    kind: 'bundle-linked-sticker',
    status: 'owned',
    rarity: 'rare',
    priceCredits: 12,
    owned: true,
    totalSupply: 750,
    soldCount: 221,
    previewLabel: '🔒',
    tags: ['gold', 'lock', 'owned'],
    linkedGiftId: 'luxury-locks-set',
  },
  {
    id: 'collector-card-cover',
    name: 'Collector Card Cover',
    subtitle: 'Limited card-cover sticker for premium collections.',
    description: 'A limited sticker designed to feel like a collectible card cover attached to store packs.',
    kind: 'collector-drop',
    status: 'limited-drop',
    rarity: 'limited',
    priceCredits: 35,
    owned: false,
    totalSupply: 100,
    soldCount: 83,
    previewLabel: '🃏',
    tags: ['collector', 'card', 'limited'],
    linkedBundleId: 'gold-ui-essentials',
  },
  {
    id: 'velvet-bow-sticker-pack',
    name: 'Velvet Bow Sticker Pack',
    subtitle: 'Soft bow-themed sticker pack for gifting and albums.',
    description: 'A sticker pack with multiple bow designs for album progress and gifting moments.',
    kind: 'sticker-pack',
    status: 'available',
    rarity: 'common',
    priceCredits: 45,
    owned: false,
    totalSupply: 1000,
    soldCount: 308,
    previewLabel: '🎀',
    tags: ['bow', 'pack', 'album'],
  },
  {
    id: 'christmas-icon-sticker',
    name: 'Christmas Icon Sticker',
    subtitle: 'Seasonal sticker linked to the Christmas Icon Pack.',
    description: 'A seasonal limited sticker that can become unavailable after the seasonal window closes.',
    kind: 'bundle-linked-sticker',
    status: 'sold-out',
    rarity: 'limited',
    priceCredits: 22,
    owned: false,
    totalSupply: 300,
    soldCount: 300,
    previewLabel: '🎄',
    tags: ['christmas', 'seasonal', 'sold-out'],
    linkedBundleId: 'christmas-icon-pack',
  },
];

export const starterStickerCollectorProgress: StickerCollectorProgress[] = [
  {
    collectionId: 'luxury-locks-collection',
    collectionName: 'Luxury Locks Collection',
    ownedCount: 2,
    totalCount: 5,
    nextRewardLabel: 'Unlock gold profile badge at 4/5',
  },
  {
    collectionId: 'holiday-collection',
    collectionName: 'Holiday Collection',
    ownedCount: 1,
    totalCount: 4,
    nextRewardLabel: 'Unlock festive frame at 3/4',
  },
];

export function buildStickerPurchaseSummary(items: StickerPurchaseItem[], progress: StickerCollectorProgress[]): StickerPurchaseSummary {
  const totalPossible = progress.reduce((sum, entry) => sum + entry.totalCount, 0);
  const totalOwned = progress.reduce((sum, entry) => sum + entry.ownedCount, 0);

  return {
    totalItems: items.length,
    ownedItems: items.filter((item) => item.owned || item.status === 'owned').length,
    availableItems: items.filter((item) => item.status === 'available' || item.status === 'limited-drop').length,
    lockedItems: items.filter((item) => item.status === 'locked').length,
    limitedItems: items.filter((item) => item.status === 'limited-drop' || item.rarity === 'limited').length,
    totalCollectionProgress: totalPossible ? Math.round((totalOwned / totalPossible) * 100) : 0,
  };
}
