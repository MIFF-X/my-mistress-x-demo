export type DigitalGiftKind = 'single-gift' | 'sticker' | 'icon' | 'card' | 'bundle' | 'seasonal-pack';

export type DigitalGiftRarity = 'common' | 'rare' | 'premium' | 'limited' | 'legendary';

export type DigitalGiftUploadStatus = 'draft' | 'ready-to-upload' | 'listed' | 'paused' | 'sold-out';

export type DigitalGiftAccessRule = 'public-store' | 'subscribers-only' | 'vip-only' | 'private-link' | 'creator-only-preview';

export type DigitalGiftAsset = {
  id: string;
  name: string;
  kind: DigitalGiftKind;
  rarity: DigitalGiftRarity;
  status: DigitalGiftUploadStatus;
  accessRule: DigitalGiftAccessRule;
  priceCredits: number;
  stockLimit?: number;
  soldCount?: number;
  tags: string[];
  previewLabel: string;
  description: string;
  bundleManifestId?: string;
  uploadFileName?: string;
};

export type DigitalGiftUploadDraft = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  kind: DigitalGiftKind;
  rarity: DigitalGiftRarity;
  accessRule: DigitalGiftAccessRule;
  priceCredits: number;
  tags: string[];
  sourceManifest?: string;
  uploadChecklist: DigitalGiftUploadChecklistItem[];
};

export type DigitalGiftUploadChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
};

export type DigitalGiftStoreSummary = {
  totalAssets: number;
  listedAssets: number;
  draftAssets: number;
  readyToUploadAssets: number;
  soldOutAssets: number;
  totalStockLimit: number;
  totalSoldCount: number;
};
