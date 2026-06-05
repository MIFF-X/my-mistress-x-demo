export type GiftBundleAssetKind = 'sticker' | 'digital-gift' | 'icon' | 'card' | 'pack-cover';

export type GiftBundleDraftStatus = 'draft' | 'selected' | 'bundled' | 'ready-to-upload';

export type GiftBundleDraftAsset = {
  id: string;
  name: string;
  kind: GiftBundleAssetKind;
  status: GiftBundleDraftStatus;
  rarity?: 'common' | 'rare' | 'premium' | 'limited';
  priceCredits?: number;
  tags: string[];
  previewLabel: string;
};

export type GiftBundleCardTheme = 'dark-luxury' | 'gold-essentials' | 'holiday' | 'collector-card' | 'minimal';

export type GiftBundleManifestItem = {
  assetId: string;
  name: string;
  kind: GiftBundleAssetKind;
  quantity: number;
};

export type GiftBundleDraft = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  theme: GiftBundleCardTheme;
  selectedAssetIds: string[];
  coverAssetId?: string;
  priceCredits?: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export type GiftBundlePreview = {
  id: string;
  name: string;
  subtitle: string;
  description: string;
  theme: GiftBundleCardTheme;
  itemCount: number;
  assetKinds: Record<GiftBundleAssetKind, number>;
  priceLabel: string;
  contentsLabel: string;
  uploadManifest: GiftBundleManifestItem[];
};
