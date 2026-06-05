import type { MxMessageWrapPack, MxWrappedMessageQuote } from './messageWrapTypes';

export const mxMessageWrapPacks: MxMessageWrapPack[] = [
  {
    id: 'love-note-wraps',
    name: 'Love Note Wraps',
    description: 'Soft heart, ribbon and note-card wrappers for warm messages and affectionate send effects.',
    access: 'free',
    baseCostCredits: 0,
    freeForMistress: true,
    animation: 'soft-pop',
    themeId: 'mx-pink-chrome',
    previewText: 'Love You ❤️',
    tags: ['love', 'hearts', 'soft', 'chat'],
    compatibleSurfaces: ['chat', 'live-chat', 'profile-message'],
  },
  {
    id: 'gold-seal-wraps',
    name: 'Gold Seal Wraps',
    description: 'Premium gold seal and formal-card wrappers for high-impact paid messages.',
    access: 'paid',
    baseCostCredits: 25,
    freeForMistress: true,
    animation: 'seal-stamp',
    themeId: 'mx-gold-noir',
    previewText: 'Sealed Message',
    tags: ['gold', 'seal', 'premium', 'formal'],
    compatibleSurfaces: ['chat', 'bookings', 'live-chat'],
  },
  {
    id: 'neon-pulse-wraps',
    name: 'Neon Pulse Wraps',
    description: 'Animated neon glow wrappers for live-room shoutouts and high-visibility chat moments.',
    access: 'app-market',
    baseCostCredits: 40,
    freeForMistress: false,
    animation: 'neon-pulse',
    themeId: 'mx-neon-stage',
    previewText: 'Notice Me',
    tags: ['neon', 'live', 'shoutout', 'animated'],
    compatibleSurfaces: ['live-chat', 'watch-room', 'stage-overlay'],
  },
  {
    id: 'ribbon-gift-wraps',
    name: 'Ribbon Gift Wraps',
    description: 'Gift-ribbon message skins that unwrap when opened by the receiver.',
    access: 'reward',
    baseCostCredits: 15,
    freeForMistress: true,
    animation: 'ribbon-unfold',
    themeId: 'mx-soft-cream-gold',
    previewText: 'Wrapped For You',
    tags: ['gift', 'ribbon', 'reward', 'unlock'],
    compatibleSurfaces: ['chat', 'gifts', 'goals'],
  },
];

export function quoteWrappedMessage(input: {
  wrapPackId: string;
  senderRole: MxWrappedMessageQuote['senderRole'];
  baseMessageCostCredits?: number;
}): MxWrappedMessageQuote {
  const wrap = mxMessageWrapPacks.find((pack) => pack.id === input.wrapPackId) || mxMessageWrapPacks[0];
  const baseMessageCostCredits = input.baseMessageCostCredits ?? 0;
  const isFreeForSender = wrap.access === 'free' || (input.senderRole === 'mistress' && wrap.freeForMistress) || input.senderRole === 'headmistress' || input.senderRole === 'admin';
  const wrapCostCredits = isFreeForSender ? 0 : wrap.baseCostCredits;

  return {
    wrapPackId: wrap.id,
    senderRole: input.senderRole,
    baseMessageCostCredits,
    wrapCostCredits,
    totalCostCredits: baseMessageCostCredits + wrapCostCredits,
    isFreeForSender,
  };
}
