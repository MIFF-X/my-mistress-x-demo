export const STYLING_PACK_TYPES = Object.freeze({
  ICONS: "icons",
  FONTS: "fonts",
  SEALS: "seals",
  STAMPS: "stamps",
  LOGOS: "logos",
  BADGES: "badges",
  CARD_FRAMES: "card_frames",
  HOUSE_THEMES: "house_themes",
  FAVICON: "favicon",
  GIF_DECKS: "gif_decks",
});

export const STYLING_PACK_TIERS = Object.freeze({
  FREE: "free",
  PAID: "paid",
  CUSTOM: "custom",
});

export const STYLING_PACK_STATUS = Object.freeze({
  DRAFT: "draft",
  REVIEW: "review",
  APPROVED: "approved",
  FEATURED: "featured",
  RETIRED: "retired",
});

export function createStylingPack({
  id,
  name,
  type,
  tier = STYLING_PACK_TIERS.FREE,
  status = STYLING_PACK_STATUS.DRAFT,
  description = "",
  preview = "",
  assets = [],
  tags = [],
  priceCredits = 0,
  createdBy = "Headmistress",
} = {}) {
  return {
    id,
    name,
    type,
    tier,
    status,
    description,
    preview,
    assets,
    tags,
    priceCredits,
    createdBy,
    createdAt: new Date().toISOString(),
  };
}
