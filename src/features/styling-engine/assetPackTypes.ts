export type AssetPackTier = 'free' | 'paid' | 'premium' | 'custom' | 'subscription';

export type AssetPackFormat = 'svg' | 'png' | 'webp' | 'tsx' | 'jsx' | 'json';

export type AssetPackCategory =
  | 'all'
  | 'icons'
  | 'seals'
  | 'stamps'
  | 'badges'
  | 'awards'
  | 'certificates'
  | 'contracts'
  | 'contract-cards'
  | 'fonts'
  | 'rolodex-cards'
  | 'flyer-cards'
  | 'overlays'
  | 'stickers'
  | 'digital-gifts'
  | 'emotes'
  | 'themes'
  | 'texture-kits';

export type AssetPackQualityMode = 'flat-vector' | 'embossed-vector' | 'photo-to-gift' | 'theme-pack' | 'document-pack' | 'typography-pack';

export type AssetPackItem = {
  id: string;
  name: string;
  category: AssetPackCategory;
  tier: AssetPackTier;
  formats: AssetPackFormat[];
  tags: string[];
  svgPath?: string;
  pngPath?: string;
  webpPath?: string;
  jsxPath?: string;
  previewPath?: string;
};

export type StylingEngineThemeToken = {
  id: string;
  name: string;
  mood: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  panelColor: string;
  textColor: string;
  borderColor: string;
  glowColor: string;
  texturePrompt?: string;
};

export type AssetPackManifest = {
  id: string;
  name: string;
  engineName: 'Mistress-X Styling Engine';
  description: string;
  tier: AssetPackTier;
  category: AssetPackCategory;
  qualityMode: AssetPackQualityMode;
  formats: AssetPackFormat[];
  coverImage?: string;
  menuCardImage?: string;
  createdAt: string;
  updatedAt?: string;
  price?: number;
  currency?: string;
  theme: StylingEngineThemeToken;
  included: string[];
  items: AssetPackItem[];
  license: {
    label: string;
    summary: string;
    commercialUse: boolean;
    resaleAllowed: boolean;
    platformUseOnly: boolean;
  };
};

export type StylingEnginePackCard = {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  tier: AssetPackTier;
  category: AssetPackCategory;
  qualityMode: AssetPackQualityMode;
  priceLabel: string;
  assetCountLabel: string;
  description: string;
  previewItems: string[];
  included: string[];
  ctaLabel: 'Buy Now' | 'Add to Cart' | 'Download Free' | 'Request Custom';
};

export type StylingEngineCartAction = {
  packId: string;
  action: 'buy-now' | 'add-to-cart' | 'download-free' | 'request-custom';
  requestedAt: string;
};