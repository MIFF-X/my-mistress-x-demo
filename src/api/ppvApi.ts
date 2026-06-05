import { apiRequest } from './apiClient';

export type PpvAccessType = 'TIMED' | 'BUY_TO_KEEP' | 'SUBSCRIPTION_INCLUDED';
export type PpvMediaType = 'PHOTO' | 'VIDEO' | 'AUDIO' | 'TEXT';
export type PpvVisibility = 'PUBLIC' | 'SUBSCRIBERS' | 'PRIVATE';
export type PpvReviewStatus = 'PENDING_REVIEW' | 'APPROVED' | 'NEEDS_CHANGES';
export type MagneticFeatureRoleSurface = 'admin' | 'headmistress' | 'mistress' | 'sub' | 'system';
export type MagneticFeatureContractStage =
  | 'scaffold'
  | 'service-contract'
  | 'persistence'
  | 'policy'
  | 'payment-ready'
  | 'production-ready';

export type MagneticFeatureContract = {
  id: string;
  title: string;
  featureFamily: string;
  touchedSlice: string;
  stage: MagneticFeatureContractStage;
  roleSurfaces: MagneticFeatureRoleSurface[];
  registryTouchpoints: string[];
  apiSurface: string[];
  persistence: string[];
  auditEvents: string[];
  policyGates: string[];
  paymentHooks: string[];
  verification: string[];
  nextPlugPoints: string[];
};

export type PpvItem = {
  id: string;
  mistressUserId: string;
  title: string;
  description?: string | null;
  mediaUrl?: string | null;
  previewUrl?: string | null;
  mediaType: PpvMediaType;
  visibility: PpvVisibility;
  reviewStatus: PpvReviewStatus;
  price: number | string;
  effectivePrice?: number | string;
  subscriptionIncluded?: boolean;
  subscriptionDiscountPercent?: number;
  subscriptionTier?: string | null;
  subscriptionPlanName?: string | null;
  accessType: PpvAccessType;
  durationMinutes?: number | null;
  isActive: boolean;
  isOwner?: boolean;
  isUnlocked?: boolean;
  mediaLocked?: boolean;
  unlockedAt?: string | null;
  expiresAt?: string | null;
  featureContractId?: string | null;
  magneticRegistryKey?: string | null;
  createdAt: string;
  updatedAt: string;
};

type ServerPpvItem = Partial<Omit<PpvItem, 'id'>> & {
  id: string | number;
  mistressId?: string;
  contentUrl?: string | null;
  type?: string | null;
  isLocked?: boolean;
  hasPurchased?: boolean;
};

export type CreatePpvPayload = {
  title: string;
  description?: string;
  mediaUrl: string;
  previewUrl?: string;
  mediaType?: PpvMediaType;
  visibility?: PpvVisibility;
  price: number;
  accessType?: PpvAccessType;
  durationMinutes?: number;
};

export type UnlockPpvResponse = {
  unlocked: boolean;
  alreadyUnlocked?: boolean;
  isOwner?: boolean;
  expiresAt?: string | null;
  mediaUrl?: string | null;
  effectivePrice?: number;
  originalPrice?: number;
  mediaType?: PpvMediaType;
  visibility?: PpvVisibility;
  reviewStatus?: PpvReviewStatus;
  walletTransactionId?: string | null;
  subscriptionIncluded?: boolean;
  subscriptionDiscountPercent?: number;
  previewUrl?: string | null;
  featureContractId?: string | null;
  magneticRegistryKey?: string | null;
};

type ServerPpvPurchaseResponse = {
  id?: string | number;
  price?: number | string;
  split?: {
    grossAmount?: number;
    mistressAmount?: number;
    platformAmount?: number;
  };
  content?: ServerPpvItem & {
    contentUrl?: string | null;
  };
  unlocked?: boolean;
  mediaUrl?: string | null;
  mediaType?: PpvMediaType | string;
  effectivePrice?: number;
  originalPrice?: number;
  reviewStatus?: PpvReviewStatus | string;
  subscriptionIncluded?: boolean;
  accessType?: PpvAccessType | string;
  durationMinutes?: number | null;
  expiresAt?: string | null;
  featureContractId?: string | null;
  magneticRegistryKey?: string | null;
};

const MEDIA_TO_SERVER_TYPE: Record<PpvMediaType, string> = {
  PHOTO: 'photo',
  VIDEO: 'video',
  AUDIO: 'audio',
  TEXT: 'text',
};

const ACCESS_TO_SERVER_TYPE: Record<PpvAccessType, string> = {
  TIMED: 'timed',
  BUY_TO_KEEP: 'buy_to_keep',
  SUBSCRIPTION_INCLUDED: 'one_time',
};

function normalizeMediaType(value?: string | null): PpvMediaType {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'PHOTO') return 'PHOTO';
  if (normalized === 'AUDIO') return 'AUDIO';
  if (normalized === 'TEXT') return 'TEXT';
  return 'VIDEO';
}

function normalizeReviewStatus(value?: string | null): PpvReviewStatus {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'APPROVED') return 'APPROVED';
  if (normalized === 'NEEDS_CHANGES' || normalized === 'REJECTED' || normalized === 'TAKEDOWN') return 'NEEDS_CHANGES';
  return 'PENDING_REVIEW';
}

function normalizePpvItem(item: ServerPpvItem): PpvItem {
  const isUnlocked = Boolean(item.isUnlocked || item.isOwner || item.hasPurchased || item.isLocked === false);
  const mediaUrl = item.mediaUrl ?? item.contentUrl ?? null;

  return {
    id: String(item.id),
    mistressUserId: item.mistressUserId || item.mistressId || '',
    title: item.title || 'PPV item',
    description: item.description ?? null,
    mediaUrl: isUnlocked ? mediaUrl : null,
    previewUrl: item.previewUrl ?? null,
    mediaType: normalizeMediaType(item.mediaType || item.type),
    visibility: item.visibility || 'PUBLIC',
    reviewStatus: normalizeReviewStatus(item.reviewStatus),
    price: item.price ?? 0,
    effectivePrice: item.effectivePrice ?? item.price ?? 0,
    subscriptionIncluded: Boolean(item.subscriptionIncluded),
    subscriptionDiscountPercent: item.subscriptionDiscountPercent ?? 0,
    subscriptionTier: item.subscriptionTier ?? null,
    subscriptionPlanName: item.subscriptionPlanName ?? null,
    accessType: item.accessType || 'BUY_TO_KEEP',
    durationMinutes: item.durationMinutes ?? null,
    isActive: item.isActive ?? true,
    isOwner: Boolean(item.isOwner),
    isUnlocked,
    mediaLocked: item.mediaLocked ?? !isUnlocked,
    unlockedAt: item.unlockedAt ?? null,
    expiresAt: item.expiresAt ?? null,
    featureContractId: item.featureContractId ?? null,
    magneticRegistryKey: item.magneticRegistryKey ?? null,
    createdAt: item.createdAt || new Date().toISOString(),
    updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
  };
}

export function getPpvMagneticFeatureContract() {
  return apiRequest<MagneticFeatureContract>('/ppv/contract');
}

export function listPpvItems() {
  return apiRequest<ServerPpvItem[]>('/ppv').then((items) => items.map(normalizePpvItem));
}

export function createPpvItem(payload: CreatePpvPayload) {
  return apiRequest<ServerPpvItem>('/ppv/content', {
    method: 'POST',
    body: JSON.stringify({
      title: payload.title,
      description: payload.description,
      contentUrl: payload.mediaUrl,
      price: payload.price,
      type: MEDIA_TO_SERVER_TYPE[payload.mediaType || 'VIDEO'],
      accessType: ACCESS_TO_SERVER_TYPE[payload.accessType || 'BUY_TO_KEEP'],
      durationMinutes: payload.accessType === 'TIMED' ? payload.durationMinutes : undefined,
      timedAccessDays: payload.durationMinutes ? Math.max(1, Math.ceil(payload.durationMinutes / 1440)) : undefined,
      buyToKeep: payload.accessType === 'BUY_TO_KEEP',
      includedInSubscription: payload.accessType === 'SUBSCRIPTION_INCLUDED',
      previewLocked: true,
    }),
  }).then((item) => normalizePpvItem({ ...item, mediaType: payload.mediaType, accessType: payload.accessType }));
}

export function unlockPpvItem(itemId: string): Promise<UnlockPpvResponse> {
  return apiRequest<ServerPpvPurchaseResponse>('/ppv/purchase', {
    method: 'POST',
    body: JSON.stringify({ contentId: Number(itemId) }),
  }).then((response) => {
    const content = response.content;
    const mediaUrl = response.mediaUrl ?? content?.mediaUrl ?? content?.contentUrl ?? null;
    const grossAmount = response.split?.grossAmount ?? Number(response.price ?? content?.price ?? 0);

    return {
      unlocked: response.unlocked ?? true,
      mediaUrl,
      mediaType: normalizeMediaType(response.mediaType || content?.mediaType || content?.type),
      reviewStatus: normalizeReviewStatus(response.reviewStatus || content?.reviewStatus),
      effectivePrice: response.effectivePrice ?? grossAmount,
      originalPrice: response.originalPrice ?? Number(content?.price ?? grossAmount),
      subscriptionIncluded: Boolean(response.subscriptionIncluded),
      previewUrl: content?.previewUrl ?? null,
      accessType: (response.accessType as PpvAccessType) || (content?.accessType as PpvAccessType) || 'BUY_TO_KEEP',
      durationMinutes: response.durationMinutes ?? content?.durationMinutes ?? null,
      expiresAt: response.expiresAt ?? null,
      featureContractId: response.featureContractId ?? null,
      magneticRegistryKey: response.magneticRegistryKey ?? null,
    };
  });
}
