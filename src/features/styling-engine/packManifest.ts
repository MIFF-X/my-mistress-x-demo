import type { AssetPackCategory, AssetPackFormat, AssetPackItem, AssetPackManifest, AssetPackQualityMode, AssetPackTier, StylingEnginePackCard, StylingEngineThemeToken } from './assetPackTypes';

export const STYLING_ENGINE_NAME = 'Mistress-X Styling Engine' as const;

export const ROYAL_NOIR_THEME: StylingEngineThemeToken = {
  id: 'royal-noir',
  name: 'Royal Noir',
  mood: 'black velvet, antique gold, burgundy wax, premium digital packaging',
  primaryColor: '#d4af37',
  secondaryColor: '#8b0000',
  backgroundColor: '#050505',
  panelColor: '#11100d',
  textColor: '#f1dfad',
  borderColor: '#6f4c16',
  glowColor: '#f9d976',
  texturePrompt: 'flat vector luxury with gold bevels, dark satin panels, wax seal accents and crisp SVG readability',
};

export function createPackManifest(input: {
  id: string;
  name: string;
  description: string;
  tier: AssetPackTier;
  category: AssetPackCategory;
  qualityMode?: AssetPackQualityMode;
  formats: AssetPackFormat[];
  items: AssetPackItem[];
  included?: string[];
  theme?: StylingEngineThemeToken;
  coverImage?: string;
  menuCardImage?: string;
  price?: number;
  currency?: string;
}): AssetPackManifest {
  const now = new Date().toISOString();
  const isFree = input.tier === 'free';

  return {
    id: input.id,
    name: input.name,
    engineName: STYLING_ENGINE_NAME,
    description: input.description,
    tier: input.tier,
    category: input.category,
    qualityMode: input.qualityMode || 'embossed-vector',
    formats: input.formats,
    coverImage: input.coverImage,
    menuCardImage: input.menuCardImage,
    createdAt: now,
    updatedAt: now,
    price: input.price,
    currency: input.currency,
    theme: input.theme || ROYAL_NOIR_THEME,
    included: input.included || [
      `${input.items.length} generated digital assets`,
      `${input.formats.join(', ').toUpperCase()} export formats`,
      'SVGO-clean vector source',
      'Marketplace-ready manifest',
      'Premium flyer/menu-card presentation',
    ],
    items: input.items,
    license: {
      label: isFree ? 'Free Platform License' : 'Premium Digital Asset License',
      summary: 'Licensed for approved Mistress-X marketplace, app, web, profile, plugin and pack-preview surfaces.',
      commercialUse: !isFree || input.category !== 'texture-kits',
      resaleAllowed: false,
      platformUseOnly: true,
    },
  };
}

export function manifestToPackCard(manifest: AssetPackManifest): StylingEnginePackCard {
  const previewItems = manifest.items.slice(0, 8).map((item) => item.name);

  return {
    id: manifest.id,
    title: manifest.name,
    subtitle: STYLING_ENGINE_NAME,
    badge: manifest.tier.toUpperCase(),
    tier: manifest.tier,
    category: manifest.category,
    qualityMode: manifest.qualityMode,
    priceLabel: manifest.price ? `${manifest.currency || '$'}${manifest.price}` : 'Free',
    assetCountLabel: `${manifest.items.length} assets`,
    description: manifest.description,
    previewItems,
    included: manifest.included,
    ctaLabel: manifest.tier === 'free' ? 'Download Free' : manifest.tier === 'custom' ? 'Request Custom' : 'Add to Cart',
  };
}

function packItem(id: string, name: string, category: AssetPackCategory, tier: AssetPackTier, formats: AssetPackFormat[], tags: string[]): AssetPackItem {
  return { id, name, category, tier, formats, tags };
}

function iconItem(id: string, name: string, tags: string[]): AssetPackItem {
  return packItem(id, name, 'icons', 'free', ['svg', 'png', 'jsx'], tags);
}

export const demoGeneralIconsManifest = createPackManifest({
  id: 'general-icons-free-pack',
  name: 'General Icons Free Pack',
  description: 'A starter pack of crisp SVG icons for common Mistress-X interface actions, marketplace surfaces, chat tools, favourite hearts and profile controls.',
  tier: 'free',
  category: 'icons',
  qualityMode: 'flat-vector',
  formats: ['svg', 'png', 'jsx', 'json'],
  items: [
    iconItem('notifications', 'Notifications', ['bell', 'alerts', 'dashboard']),
    iconItem('favourite', 'Favourite', ['star', 'save', 'profile']),
    iconItem('heart-like', 'Heart / Like', ['heart', 'love', 'reaction']),
    iconItem('note-memo', 'Note / Memo', ['notes', 'journal', 'admin']),
    iconItem('add-to-rolodex', 'Add To Rolodex', ['contacts', 'rolodex', 'follow']),
    iconItem('view', 'View', ['eye', 'preview', 'visibility']),
    iconItem('hidden', 'Hidden', ['privacy', 'invisible', 'stealth']),
    iconItem('online', 'Online', ['presence', 'green-dot', 'live']),
    iconItem('verified-user', 'Verified User', ['verified', 'trust', 'shield']),
    iconItem('privacy-lock', 'Privacy / Lock', ['lock', 'vault', 'access']),
    iconItem('warning', 'Warning', ['safety', 'alert', 'moderation']),
    iconItem('blocked', 'Blocked', ['ban', 'block', 'control']),
    iconItem('timeout', 'Timeout', ['clock', 'restriction', 'moderation']),
    iconItem('expand-enlarge', 'Expand / Enlarge', ['fullscreen', 'view', 'layout']),
    iconItem('folder', 'Folder', ['files', 'library', 'packs']),
    iconItem('settings', 'Settings', ['gear', 'controls', 'admin']),
    iconItem('search', 'Search', ['find', 'discovery', 'filter']),
    iconItem('download', 'Download', ['export', 'asset', 'file']),
    iconItem('upload', 'Upload', ['import', 'creator', 'asset']),
    iconItem('share', 'Share', ['send', 'social', 'link']),
    iconItem('filter', 'Filter', ['sort', 'discovery', 'search']),
    iconItem('menu', 'Menu', ['navigation', 'burger', 'app']),
    iconItem('delete', 'Delete', ['trash', 'remove', 'admin']),
    iconItem('bookmark', 'Bookmark', ['save', 'library', 'collection']),
    iconItem('link', 'Link', ['url', 'connect', 'share']),
  ],
});

export const demoPremiumSealsManifest = createPackManifest({
  id: 'premium-seals-pack',
  name: 'Premium Seals Pack',
  description: 'Embossed-style SVG seals, badges, approval stamps and wax-mark style assets for luxury pack packaging.',
  tier: 'paid',
  category: 'seals',
  qualityMode: 'embossed-vector',
  formats: ['svg', 'png', 'webp', 'json'],
  price: 29.99,
  currency: '$',
  items: [
    packItem('official-seal', 'Official Seal', 'seals', 'paid', ['svg', 'png', 'webp'], ['official', 'seal', 'premium']),
    packItem('wax-seal', 'Wax Seal', 'seals', 'paid', ['svg', 'png', 'webp'], ['wax', 'stamp', 'luxury']),
    packItem('verified-crest', 'Verified Crest', 'badges', 'paid', ['svg', 'png', 'webp'], ['crest', 'verified', 'badge']),
    packItem('approved-stamp', 'Approved Stamp', 'stamps', 'paid', ['svg', 'png', 'webp'], ['approved', 'stamp', 'contract']),
  ],
});

export const demoAwardsManifest = createPackManifest({
  id: 'royal-awards-pack',
  name: 'Royal Awards Pack',
  description: 'Luxury award medals, loyalty marks, milestone achievements and leaderboard-style SVG award assets.',
  tier: 'paid',
  category: 'awards',
  qualityMode: 'embossed-vector',
  formats: ['svg', 'png', 'webp', 'json'],
  price: 34.99,
  currency: '$',
  items: [
    packItem('loyalty-award', 'Loyalty Award', 'awards', 'paid', ['svg', 'png', 'webp'], ['loyalty', 'award', 'rank']),
    packItem('service-medal', 'Service Medal', 'awards', 'paid', ['svg', 'png', 'webp'], ['service', 'medal', 'milestone']),
    packItem('leaderboard-crown', 'Leaderboard Crown', 'awards', 'paid', ['svg', 'png', 'webp'], ['leaderboard', 'crown', 'top']),
  ],
});

export const demoCertificatesManifest = createPackManifest({
  id: 'luxury-certificates-pack',
  name: 'Luxury Certificates Pack',
  description: 'Certificate templates for completions, ownership proof cards, service milestones and premium downloadable proof assets.',
  tier: 'premium',
  category: 'certificates',
  qualityMode: 'document-pack',
  formats: ['svg', 'png', 'webp', 'json'],
  price: 44.99,
  currency: '$',
  items: [
    packItem('completion-certificate', 'Completion Certificate', 'certificates', 'premium', ['svg', 'png', 'webp'], ['completion', 'certificate']),
    packItem('ownership-proof', 'Ownership Proof', 'certificates', 'premium', ['svg', 'png', 'webp'], ['proof', 'ownership']),
    packItem('milestone-certificate', 'Milestone Certificate', 'certificates', 'premium', ['svg', 'png', 'webp'], ['milestone', 'certificate']),
  ],
});

export const demoContractsManifest = createPackManifest({
  id: 'digital-contracts-pack',
  name: 'Digital Contracts Pack',
  description: 'Digital contract templates, terms cards, signed/sealed document assets and contract menu-card package inserts.',
  tier: 'premium',
  category: 'contracts',
  qualityMode: 'document-pack',
  formats: ['svg', 'png', 'webp', 'json'],
  price: 49.99,
  currency: '$',
  items: [
    packItem('digital-contract', 'Digital Contract', 'contracts', 'premium', ['svg', 'png', 'webp'], ['contract', 'terms']),
    packItem('contract-card', 'Contract Card', 'contract-cards', 'premium', ['svg', 'png', 'webp'], ['card', 'package']),
    packItem('signed-sealed-page', 'Signed Sealed Page', 'contracts', 'premium', ['svg', 'png', 'webp'], ['signed', 'sealed']),
  ],
});

export const demoFontsManifest = createPackManifest({
  id: 'royal-fonts-preview-pack',
  name: 'Royal Fonts Preview Pack',
  description: 'Typography preview cards and font pairing sheets for luxury Mistress-X themes and digital product packaging.',
  tier: 'custom',
  category: 'fonts',
  qualityMode: 'typography-pack',
  formats: ['svg', 'png', 'json'],
  items: [
    packItem('display-font-preview', 'Display Font Preview', 'fonts', 'custom', ['svg', 'png'], ['display', 'font']),
    packItem('signature-font-preview', 'Signature Font Preview', 'fonts', 'custom', ['svg', 'png'], ['signature', 'font']),
    packItem('pairing-sheet', 'Font Pairing Sheet', 'fonts', 'custom', ['svg', 'png'], ['pairing', 'typography']),
  ],
});

export const demoDigitalGiftManifest = createPackManifest({
  id: 'digital-gifts-royal-noir-pack',
  name: 'Royal Noir Digital Gifts',
  description: 'Marketplace-ready digital gift pack concept with icon, preview card, menu-card listing, SVG source and PNG/WebP exports.',
  tier: 'premium',
  category: 'digital-gifts',
  qualityMode: 'photo-to-gift',
  formats: ['png', 'webp', 'svg', 'json'],
  price: 49.99,
  currency: '$',
  items: [
    packItem('velvet-crown-gift', 'Velvet Crown Gift', 'digital-gifts', 'premium', ['png', 'webp', 'svg'], ['crown', 'gift', 'velvet']),
    packItem('gold-lock-gift', 'Gold Lock Gift', 'digital-gifts', 'premium', ['png', 'webp', 'svg'], ['lock', 'gift', 'gold']),
    packItem('satin-heart-gift', 'Satin Heart Gift', 'digital-gifts', 'premium', ['png', 'webp', 'svg'], ['heart', 'gift', 'satin']),
  ],
});

export const STYLING_ENGINE_MARKETPLACE_MANIFESTS = [
  demoGeneralIconsManifest,
  demoPremiumSealsManifest,
  demoAwardsManifest,
  demoCertificatesManifest,
  demoContractsManifest,
  demoFontsManifest,
  demoDigitalGiftManifest,
];
