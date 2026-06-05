import { createStylingPack, STYLING_PACK_STATUS, STYLING_PACK_TIERS, STYLING_PACK_TYPES } from "./styling-pack-types.js";

export const stylingPackRegistry = [
  createStylingPack({
    id: "mx-brand-gold-emblem",
    name: "MX Gold Crown Emblem",
    type: STYLING_PACK_TYPES.LOGOS,
    tier: STYLING_PACK_TIERS.FREE,
    status: STYLING_PACK_STATUS.REVIEW,
    description: "Gold MX emblem with crown for favicon, profile badges, and premium branding.",
    tags: ["mx", "gold", "crown", "emblem", "favicon"],
    assets: ["frontend/assets/brand/", "frontend/assets/favicon/"],
  }),
  createStylingPack({
    id: "mx-pink-signature-crown",
    name: "MX Pink Signature Crown",
    type: STYLING_PACK_TYPES.LOGOS,
    tier: STYLING_PACK_TIERS.FREE,
    status: STYLING_PACK_STATUS.REVIEW,
    description: "Pink handwritten MX signature with crown for creator signatures, stickers, and social graphics.",
    tags: ["mx", "pink", "signature", "crown", "transparent"],
    assets: ["frontend/assets/brand/"],
  }),
  createStylingPack({
    id: "mx-core-icons-free",
    name: "Mistress-X Core Icons",
    type: STYLING_PACK_TYPES.ICONS,
    tier: STYLING_PACK_TIERS.FREE,
    status: STYLING_PACK_STATUS.DRAFT,
    description: "Starter icon set for navigation, wallet, chat, live, store, Rolodex, and settings.",
    tags: ["icons", "navigation", "wallet", "chat", "store"],
    assets: ["frontend/assets/icons/"],
  }),
  createStylingPack({
    id: "mx-badge-core-set",
    name: "Mistress-X Badge Core Set",
    type: STYLING_PACK_TYPES.BADGES,
    tier: STYLING_PACK_TIERS.FREE,
    status: STYLING_PACK_STATUS.DRAFT,
    description: "Verification, trust, trophy, position-holder, and Hall of Fame badge placeholders.",
    tags: ["badges", "trophies", "trust", "verification", "awards"],
    assets: ["frontend/assets/badges/"],
  }),
  createStylingPack({
    id: "mx-card-deck-starter",
    name: "MX Card Deck Starter Pack",
    type: STYLING_PACK_TYPES.GIF_DECKS,
    tier: STYLING_PACK_TIERS.PAID,
    status: STYLING_PACK_STATUS.DRAFT,
    description: "Starter animated card deck family for Daily Challenge, Word of the Day, Mistress Tarot, Dare Cards, and Awards.",
    tags: ["cards", "gif", "deck", "challenge", "tarot"],
    priceCredits: 250,
    assets: ["frontend/assets/gif-decks/"],
  }),
];

export function getStylingPacks({ type, tier, status } = {}) {
  return stylingPackRegistry.filter((pack) => {
    if (type && pack.type !== type) return false;
    if (tier && pack.tier !== tier) return false;
    if (status && pack.status !== status) return false;
    return true;
  });
}

export function getStylingPackById(id) {
  return stylingPackRegistry.find((pack) => pack.id === id) || null;
}
