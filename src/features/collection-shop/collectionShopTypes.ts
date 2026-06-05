export type CollectionShopItemKind = 'single' | 'pack' | 'card' | 'drop' | 'set';

export type CollectionShopItemState = 'available' | 'owned' | 'locked' | 'unavailable' | 'soon';

export type CollectionShopRarity = 'common' | 'rare' | 'premium' | 'limited' | 'legendary';

export type CollectionShopAction = 'get-item' | 'open-pack' | 'view-owned' | 'watch-list' | 'open-builder';

export type CollectionShopItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: CollectionShopItemKind;
  state: CollectionShopItemState;
  rarity: CollectionShopRarity;
  creditValue: number;
  ownedCount: number;
  totalCount: number;
  previewLabel: string;
  tags: string[];
  description: string;
  linkedSetId?: string;
  action: CollectionShopAction;
};

export type CollectionProgress = {
  collectionId: string;
  title: string;
  ownedCount: number;
  totalCount: number;
  rewardLabel: string;
};

export type CollectionShopSummary = {
  totalItems: number;
  availableItems: number;
  ownedItems: number;
  lockedItems: number;
  totalCreditValue: number;
  totalOwnedCount: number;
  totalCollectibleCount: number;
};
