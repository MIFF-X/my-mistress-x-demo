export type StickerPurchaseItemKind = 'single-sticker' | 'sticker-pack' | 'collector-drop' | 'bundle-linked-sticker';

export type StickerPurchaseStatus = 'available' | 'owned' | 'locked' | 'sold-out' | 'limited-drop';

export type StickerRarity = 'common' | 'rare' | 'premium' | 'limited' | 'legendary';

export type StickerPurchaseItem = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  kind: StickerPurchaseItemKind;
  status: StickerPurchaseStatus;
  rarity: StickerRarity;
  priceCredits: number;
  owned: boolean;
  totalSupply?: number;
  soldCount?: number;
  previewLabel: string;
  tags: string[];
  linkedGiftId?: string;
  linkedBundleId?: string;
};

export type StickerCollectorProgress = {
  collectionId: string;
  collectionName: string;
  ownedCount: number;
  totalCount: number;
  nextRewardLabel: string;
};

export type StickerPurchaseSummary = {
  totalItems: number;
  ownedItems: number;
  availableItems: number;
  lockedItems: number;
  limitedItems: number;
  totalCollectionProgress: number;
};
