export type ContentBundleItemKind = 'video' | 'gallery' | 'audio' | 'document' | 'replay';

export type ContentBundleAccessStatus = 'locked' | 'unlocked' | 'timed-access' | 'included' | 'expired';

export type ContentBundleVisibility = 'public-store' | 'members-only' | 'vip-only' | 'private-link' | 'creator-preview';

export type ContentBundleItem = {
  id: string;
  title: string;
  subtitle: string;
  kind: ContentBundleItemKind;
  accessStatus: ContentBundleAccessStatus;
  visibility: ContentBundleVisibility;
  priceCredits: number;
  originalPriceCredits?: number;
  durationMinutes?: number;
  unlockCount: number;
  expiresAt?: string;
  previewLabel: string;
  tags: string[];
  description: string;
};

export type ContentBundlePack = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  priceCredits: number;
  visibility: ContentBundleVisibility;
  items: ContentBundleItem[];
  checklist: ContentBundleChecklistItem[];
};

export type ContentBundleChecklistItem = {
  id: string;
  label: string;
  complete: boolean;
};

export type ContentBundleSummary = {
  totalItems: number;
  lockedItems: number;
  unlockedItems: number;
  timedAccessItems: number;
  totalUnlocks: number;
  totalBundleValue: number;
  checklistComplete: number;
  checklistTotal: number;
};
