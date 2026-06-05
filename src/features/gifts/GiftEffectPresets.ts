import { GiftItem } from '../../api/giftsApi';
import { GiftEffect } from './GiftEffectOverlay';

type GiftEffectPreset = {
  badge: string;
  accentColor: string;
  keywords: string[];
};

const premiumGiftPresets: GiftEffectPreset[] = [
  {
    badge: 'Crown Tribute',
    accentColor: '#d4af37',
    keywords: ['crown', 'tribute', 'royal'],
  },
  {
    badge: 'Red Bottom',
    accentColor: '#c1121f',
    keywords: ['red bottom', 'heels', 'shoe'],
  },
  {
    badge: 'Diamond Collar',
    accentColor: '#7dd3fc',
    keywords: ['diamond', 'collar', 'ice'],
  },
  {
    badge: 'Black Card',
    accentColor: '#f5f5f5',
    keywords: ['black card', 'card', 'platinum'],
  },
  {
    badge: 'Throne Offering',
    accentColor: '#b7791f',
    keywords: ['throne', 'offering', 'seat'],
  },
  {
    badge: 'House Goddess',
    accentColor: '#c084fc',
    keywords: ['house goddess', 'goddess', 'seal'],
  },
];

function searchableGiftText(gift: GiftItem) {
  const metadataText = Object.values(gift.metadata || {})
    .filter((value) => typeof value === 'string' || typeof value === 'number')
    .join(' ');

  return `${gift.name} ${gift.animation || ''} ${metadataText}`.toLowerCase();
}

export function findGiftEffectPreset(gift: GiftItem) {
  const text = searchableGiftText(gift);
  return premiumGiftPresets.find((preset) => preset.keywords.some((keyword) => text.includes(keyword)));
}

export function getGiftEffectAccentColor(gift: GiftItem, fallback = '#d4af37') {
  return findGiftEffectPreset(gift)?.accentColor || fallback;
}

export function createGiftEffectFromGift(
  gift: GiftItem,
  options: {
    recipientLabel?: string;
    detail?: string;
    fallbackBadge?: string;
    fallbackAccentColor?: string;
  } = {},
): Omit<GiftEffect, 'id'> {
  const preset = findGiftEffectPreset(gift);
  const recipient = options.recipientLabel || 'recipient';

  return {
    badge: preset?.badge || gift.emoji || options.fallbackBadge || 'Gift sent',
    title: gift.name,
    detail: options.detail || `${recipient} received a premium gift.`,
    accentColor: preset?.accentColor || options.fallbackAccentColor || '#d4af37',
  };
}
