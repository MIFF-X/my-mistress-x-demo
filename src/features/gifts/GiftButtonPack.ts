import { GiftItem } from '../../api/giftsApi';

export type GiftButtonPackItem = {
  key: string;
  label: string;
  fallbackGlyph: string;
  pngAssetPath: string;
  keywords: string[];
};

const premiumGiftButtonPack: GiftButtonPackItem[] = [
  {
    key: 'crown-tribute',
    label: 'Crown',
    fallbackGlyph: 'CR',
    pngAssetPath: 'frontend/assets/gifts/crown-tribute.png',
    keywords: ['crown', 'tribute', 'royal'],
  },
  {
    key: 'red-bottom-offering',
    label: 'Heels',
    fallbackGlyph: 'RB',
    pngAssetPath: 'frontend/assets/gifts/red-bottom-offering.png',
    keywords: ['red bottom', 'heels', 'shoe'],
  },
  {
    key: 'diamond-collar',
    label: 'Collar',
    fallbackGlyph: 'DC',
    pngAssetPath: 'frontend/assets/gifts/diamond-collar.png',
    keywords: ['diamond', 'collar', 'ice'],
  },
  {
    key: 'black-card-blessing',
    label: 'Black Card',
    fallbackGlyph: 'BC',
    pngAssetPath: 'frontend/assets/gifts/black-card-blessing.png',
    keywords: ['black card', 'card', 'platinum'],
  },
  {
    key: 'throne-offering',
    label: 'Throne',
    fallbackGlyph: 'TO',
    pngAssetPath: 'frontend/assets/gifts/throne-offering.png',
    keywords: ['throne', 'offering', 'seat'],
  },
  {
    key: 'house-goddess-seal',
    label: 'Seal',
    fallbackGlyph: 'HG',
    pngAssetPath: 'frontend/assets/gifts/house-goddess-seal.png',
    keywords: ['house goddess', 'goddess', 'seal'],
  },
];

function searchableGiftText(gift: GiftItem) {
  const metadataText = Object.values(gift.metadata || {})
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ');

  return `${gift.name} ${gift.animation || ''} ${metadataText}`.toLowerCase();
}

export function findGiftButtonPackItem(gift: GiftItem) {
  const text = searchableGiftText(gift);
  return premiumGiftButtonPack.find((item) => item.keywords.some((keyword) => text.includes(keyword)));
}

export function getGiftButtonGlyph(gift: GiftItem) {
  return findGiftButtonPackItem(gift)?.fallbackGlyph || gift.emoji || 'Gift';
}

export function getGiftButtonLabel(gift: GiftItem) {
  return findGiftButtonPackItem(gift)?.label || gift.name;
}

export function getPremiumGiftButtonPack() {
  return premiumGiftButtonPack;
}
