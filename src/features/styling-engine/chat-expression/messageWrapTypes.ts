export type MxMessageWrapAccess = 'free' | 'paid' | 'mistress-free' | 'subscription' | 'reward' | 'event' | 'app-market';

export type MxMessageWrapAnimation =
  | 'none'
  | 'soft-pop'
  | 'sparkle-sweep'
  | 'ribbon-unfold'
  | 'seal-stamp'
  | 'neon-pulse'
  | 'gift-open'
  | 'card-slide';

export type MxMessageWrapPack = {
  id: string;
  name: string;
  description: string;
  access: MxMessageWrapAccess;
  baseCostCredits: number;
  freeForMistress: boolean;
  animation: MxMessageWrapAnimation;
  themeId: string;
  previewText: string;
  tags: string[];
  compatibleSurfaces: string[];
};

export type MxWrappedMessageQuote = {
  wrapPackId: string;
  senderRole: 'headmistress' | 'mistress' | 'sub' | 'admin';
  baseMessageCostCredits: number;
  wrapCostCredits: number;
  totalCostCredits: number;
  isFreeForSender: boolean;
};
