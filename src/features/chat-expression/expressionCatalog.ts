export type ExpressionAssetType =
  | 'emoji'
  | 'reaction'
  | 'sticker'
  | 'animated_sticker'
  | 'gif'
  | 'send_effect'
  | 'digital_gift'
  | 'marketplace_pack';

export type ExpressionTrayTabKey =
  | 'favorites'
  | 'emojis'
  | 'reactions'
  | 'stickers'
  | 'gifs'
  | 'effects'
  | 'gifts'
  | 'shop';

export type ExpressionAsset = {
  id: string;
  type: ExpressionAssetType;
  tab: ExpressionTrayTabKey;
  label: string;
  glyph: string;
  description: string;
  packName: string;
  rarity?: 'starter' | 'common' | 'rare' | 'legendary' | 'limited';
  priceCredits?: number;
  marketplaceCategory?: string;
};

export type ExpressionTrayTab = {
  key: ExpressionTrayTabKey;
  label: string;
  glyph: string;
  description: string;
};

export type ExpressionMarketplaceCategory = {
  id: string;
  title: string;
  description: string;
  assetTypes: ExpressionAssetType[];
  shopLabel: string;
  releaseCadence: string;
};

export type HeadmistressExpressionGeneratorOption = {
  id: string;
  title: string;
  description: string;
  defaultAssetType: ExpressionAssetType;
  outputPackType: string;
  checklist: string[];
};

export const CHAT_EXPRESSION_TABS: ExpressionTrayTab[] = [
  { key: 'favorites', label: 'Favorites', glyph: '★', description: 'Recently used and pinned expressions.' },
  { key: 'emojis', label: 'Emojis', glyph: '😊', description: 'Native emoji quick picks for every chat.' },
  { key: 'reactions', label: 'Reactions', glyph: '❤️', description: 'Fast message reactions for bubbles and replies.' },
  { key: 'stickers', label: 'Stickers', glyph: '💬', description: 'Static and animated sticker packs.' },
  { key: 'gifs', label: 'GIFs', glyph: 'GIF', description: 'Motion reactions and looped chat clips.' },
  { key: 'effects', label: 'Effects', glyph: '🔥', description: 'Send effects for heart bursts, flames and sparkle sends.' },
  { key: 'gifts', label: 'Gifts', glyph: '🎁', description: 'Digital gifts, premium drops and tribute moments.' },
  { key: 'shop', label: 'Shop', glyph: '🛒', description: 'Expression marketplace categories and featured packs.' },
];

export const DEFAULT_EXPRESSION_ASSETS: ExpressionAsset[] = [
  { id: 'fav-heart-burst', type: 'reaction', tab: 'favorites', label: 'Heart Burst', glyph: '💖', description: 'Pinned starter reaction.', packName: 'MX Starter Reactions', rarity: 'starter' },
  { id: 'fav-velvet-flame', type: 'send_effect', tab: 'favorites', label: 'Velvet Flame', glyph: '🔥', description: 'Pinned send effect.', packName: 'MX Flame Effects', rarity: 'rare' },
  { id: 'emoji-red-heart', type: 'emoji', tab: 'emojis', label: 'Red Heart', glyph: '❤️', description: 'Classic heart emoji.', packName: 'Native Emojis', rarity: 'starter' },
  { id: 'emoji-laugh', type: 'emoji', tab: 'emojis', label: 'Laugh', glyph: '😂', description: 'Laugh emoji.', packName: 'Native Emojis', rarity: 'starter' },
  { id: 'emoji-heel', type: 'emoji', tab: 'emojis', label: 'Heel', glyph: '👠', description: 'MX themed emoji.', packName: 'Native Emojis', rarity: 'starter' },
  { id: 'emoji-sparkle-heart', type: 'emoji', tab: 'emojis', label: 'Sparkle Heart', glyph: '💖', description: 'Glowing heart emoji.', packName: 'Native Emojis', rarity: 'starter' },
  { id: 'reaction-adore', type: 'reaction', tab: 'reactions', label: 'Adore', glyph: '😍', description: 'Quick bubble reaction.', packName: 'MX Starter Reactions', rarity: 'starter' },
  { id: 'reaction-fire', type: 'reaction', tab: 'reactions', label: 'Fire', glyph: '🔥', description: 'High-energy reaction.', packName: 'MX Starter Reactions', rarity: 'starter' },
  { id: 'reaction-sparkle', type: 'reaction', tab: 'reactions', label: 'Sparkle', glyph: '✨', description: 'Sparkle reaction.', packName: 'MX Starter Reactions', rarity: 'starter' },
  { id: 'reaction-kiss', type: 'reaction', tab: 'reactions', label: 'Kiss', glyph: '💋', description: 'Quick kiss reaction.', packName: 'MX Starter Reactions', rarity: 'starter' },
  { id: 'sticker-awww', type: 'sticker', tab: 'stickers', label: 'Awww Sticker', glyph: '🐾', description: 'Cute reaction sticker.', packName: 'MX Starter Stickers', rarity: 'common', priceCredits: 0 },
  { id: 'sticker-diamond-heart', type: 'animated_sticker', tab: 'stickers', label: 'Diamond Heart', glyph: '💎', description: 'Animated premium sticker placeholder.', packName: 'Velvet Diamond Drop', rarity: 'rare', priceCredits: 25 },
  { id: 'gif-sparkle-hi', type: 'gif', tab: 'gifs', label: 'Sparkle Hi', glyph: '✨', description: 'Looped greeting GIF placeholder.', packName: 'Starter GIF Loops', rarity: 'common' },
  { id: 'gif-celebrate', type: 'gif', tab: 'gifs', label: 'Celebrate', glyph: '🎉', description: 'Looped celebration GIF placeholder.', packName: 'Starter GIF Loops', rarity: 'common' },
  { id: 'effect-heart-burst', type: 'send_effect', tab: 'effects', label: 'Heart Burst', glyph: '💞', description: 'Bubble send with floating hearts.', packName: 'MX Send Effects', rarity: 'common' },
  { id: 'effect-gift-wrap', type: 'send_effect', tab: 'effects', label: 'Gift Wrap', glyph: '🎀', description: 'Wrap the next message like a gift.', packName: 'MX Send Effects', rarity: 'rare' },
  { id: 'effect-rose-drop', type: 'send_effect', tab: 'effects', label: 'Rose Drop', glyph: '🌹', description: 'Rose petal drop send animation.', packName: 'MX Send Effects', rarity: 'rare' },
  { id: 'gift-red-rose', type: 'digital_gift', tab: 'gifts', label: 'Red Rose', glyph: '🌹', description: 'Starter digital gift moment.', packName: 'MX Gift Drops', rarity: 'common', priceCredits: 10 },
  { id: 'gift-golden-crown', type: 'digital_gift', tab: 'gifts', label: 'Golden Crown', glyph: '👑', description: 'Premium crown gift placeholder.', packName: 'MX Gift Drops', rarity: 'legendary', priceCredits: 250 },
  { id: 'shop-monthly-sticker-drops', type: 'marketplace_pack', tab: 'shop', label: 'Monthly Sticker Drops', glyph: '📦', description: 'Creator sticker collections and collect-to-complete albums.', packName: 'Expression Marketplace', rarity: 'limited', marketplaceCategory: 'Sticker Packs' },
  { id: 'shop-send-effects', type: 'marketplace_pack', tab: 'shop', label: 'Send Effects Packs', glyph: '🔥', description: 'Premium bubble animations, flames, hearts and gift-wrap effects.', packName: 'Expression Marketplace', rarity: 'rare', marketplaceCategory: 'Send Effects' },
  { id: 'shop-digital-gifts', type: 'marketplace_pack', tab: 'shop', label: 'Digital Gift Drops', glyph: '🎁', description: 'Animated gifts, limited drops, badges and collectible gift moments.', packName: 'Expression Marketplace', rarity: 'legendary', marketplaceCategory: 'Digital Gifts' },
];

export const EXPRESSION_MARKETPLACE_CATEGORIES: ExpressionMarketplaceCategory[] = [
  { id: 'emoji-reaction-packs', title: 'Emoji & Reaction Packs', description: 'Native-style emojis and quick message reactions for every chat.', assetTypes: ['emoji', 'reaction'], shopLabel: 'Chat Expression Assets', releaseCadence: 'Starter, seasonal and creator-branded drops' },
  { id: 'sticker-packs', title: 'Sticker Packs', description: 'Static and animated stickers, including image-to-sticker collections.', assetTypes: ['sticker', 'animated_sticker'], shopLabel: 'Sticker Packs', releaseCadence: 'Monthly drops and limited collector sets' },
  { id: 'send-effects', title: 'Send Effects', description: 'Message bubble effects such as flame send, heart burst, sparkle send and gift wrap.', assetTypes: ['send_effect'], shopLabel: 'Send Effects', releaseCadence: 'Premium bundles and event drops' },
  { id: 'digital-gifts', title: 'Digital Gifts', description: 'Animated gift moments, premium badges and collectible gift drops.', assetTypes: ['digital_gift'], shopLabel: 'Digital Gifts', releaseCadence: 'Always-on gifts plus limited releases' },
  { id: 'gif-loops', title: 'GIF & Motion Loops', description: 'Short motion reactions and chat-safe GIF loops.', assetTypes: ['gif'], shopLabel: 'GIF Packs', releaseCadence: 'Curated packs and creator sets' },
];

export const HEADMISTRESS_EXPRESSION_GENERATOR_OPTIONS: HeadmistressExpressionGeneratorOption[] = [
  { id: 'create-emoji-pack', title: 'Create Emoji Pack', description: 'Generate a named native-style emoji set for all chats or a specific creator brand.', defaultAssetType: 'emoji', outputPackType: 'emoji_pack', checklist: ['Pack name', 'Mood/theme', 'Glyph list', 'Usage scope', 'Marketplace visibility'] },
  { id: 'create-reaction-pack', title: 'Create Reaction Pack', description: 'Build long-press quick reactions for chat bubbles and message replies.', defaultAssetType: 'reaction', outputPackType: 'reaction_pack', checklist: ['Reaction labels', 'Bubble preview', 'Sort order', 'Default/free flags', 'Moderation notes'] },
  { id: 'create-sticker-pack', title: 'Create Sticker Pack', description: 'Turn images or generated art into static or animated sticker packs.', defaultAssetType: 'sticker', outputPackType: 'sticker_pack', checklist: ['Source image', 'Crop/cutout', 'Collection month', 'Price', 'Album progress rules'] },
  { id: 'create-send-effect', title: 'Create Send Effect', description: 'Design effects such as heart bursts, flame sends, rose drops and gift-wrap sends.', defaultAssetType: 'send_effect', outputPackType: 'send_effect_pack', checklist: ['Animation name', 'Particle style', 'Duration', 'Preview text', 'Unlock rule'] },
  { id: 'create-digital-gift', title: 'Create Digital Gift', description: 'Create premium digital gifts, gift overlays and collectible gift drops.', defaultAssetType: 'digital_gift', outputPackType: 'digital_gift_pack', checklist: ['Gift name', 'Credit price', 'Overlay copy', 'Rarity', 'Revenue split tracking'] },
];

export function getExpressionAssetsForTab(tab: ExpressionTrayTabKey) {
  return DEFAULT_EXPRESSION_ASSETS.filter((asset) => asset.tab === tab);
}

export function expressionTabLabel(tab: ExpressionTrayTabKey) {
  return CHAT_EXPRESSION_TABS.find((item) => item.key === tab)?.label || tab;
}
