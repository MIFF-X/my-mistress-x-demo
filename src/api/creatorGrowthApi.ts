import { apiRequest } from './apiClient';

export type CreatorGrowthCampaignDestinationType =
  | 'CREATOR_PROFILE'
  | 'SUBSCRIPTION_TIER'
  | 'LIVE_ROOM'
  | 'PPV_DROP'
  | 'MARKETPLACE_DROP'
  | 'STICKER_DROP'
  | 'LINK_IN_BIO';

export type CreatorGrowthCampaignEventType =
  | 'scan'
  | 'click'
  | 'profile_view'
  | 'follow'
  | 'subscribe'
  | 'tier_view'
  | 'quote'
  | 'show_view'
  | 'ticket_quote'
  | 'ticket_purchase'
  | 'drop_view'
  | 'unlock_quote'
  | 'unlock_purchase'
  | 'product_view'
  | 'approval_request'
  | 'purchase'
  | 'sticker_view'
  | 'collect'
  | 'link_view'
  | 'destination_click';

export type CreatorGrowthCampaignPolicy = {
  type: CreatorGrowthCampaignDestinationType;
  label: string;
  description: string;
  publicSafeLandingRequired: boolean;
  supportsQrCode: boolean;
  supportsExpiry: boolean;
  supportsConversionTracking: boolean;
  suggestedCta: string;
  trackingEvents: string[];
};

export type CreateGrowthCampaignInput = {
  name: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  trafficSource?: string;
  ctaText?: string;
  targetId?: string;
  qrEnabled?: boolean;
  expiryEnabled?: boolean;
  expiresAt?: string;
  metadata?: Record<string, unknown>;
};

export type TrackGrowthCampaignEventInput = {
  eventType: CreatorGrowthCampaignEventType;
  source?: string;
  anonymousSessionId?: string;
  viewerUserId?: string;
  metadata?: Record<string, unknown>;
};

export type CreatorGrowthCampaign = {
  id: string;
  creatorUserId: string;
  name: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  destinationLabel: string;
  trafficSource: string;
  ctaText: string;
  targetId?: string | null;
  publicSafeLandingRequired: boolean;
  qrEnabled: boolean;
  expiryEnabled: boolean;
  expiresAt?: string | null;
  publicPath: string;
  publicUrl: string;
  qrPayload: string;
  trackingEvents: string[];
  metadata?: Record<string, unknown>;
  isActive?: boolean;
  archivedAt?: string | null;
  updatedAt?: string;
  productionReady: boolean;
  note?: string;
  createdAt: string;
};

export type CreatorGrowthCampaignEvent = {
  id: string;
  campaignId: string;
  creatorUserId: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  eventType: CreatorGrowthCampaignEventType;
  source: string;
  anonymousSessionId?: string | null;
  viewerUserId?: string | null;
  metadata?: Record<string, unknown>;
  productionReady: boolean;
  note?: string;
  createdAt: string;
};

export type CreatorGrowthPublicLanding = {
  campaignId: string;
  campaignName: string;
  creatorUserId: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  destinationLabel: string;
  trafficSource: string;
  ctaText: string;
  targetId?: string | null;
  publicPath: string;
  publicUrl: string;
  qrEnabled: boolean;
  expiryEnabled: boolean;
  expiresAt?: string | null;
  publicSafeLandingRequired: true;
  requiresAuthForDestination: true;
  accessRules: {
    loginRequiredBeforePrivateContent: boolean;
    paymentRulesStillApply: boolean;
    verificationRulesStillApply: boolean;
    visibilityRulesStillApply: boolean;
    contentLocksStillApply: boolean;
  };
  allowedTrackingEvents: CreatorGrowthCampaignEventType[];
  productionReady: boolean;
  note?: string;
};

export type CreatorGrowthCampaignAnalytics = {
  campaignId: string;
  creatorUserId: string;
  campaignName: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  trafficSource: string;
  totalEvents: number;
  conversionEvents: number;
  clickLikeEvents: number;
  conversionRate: number;
  byEventType: Partial<Record<CreatorGrowthCampaignEventType, number>>;
  bySource: Record<string, number>;
  latestEventAt?: string | null;
  productionReady: boolean;
  note?: string;
};

export type CreatorGrowthPlatformTopEntry = {
  label: string;
  count: number;
};

export type CreatorGrowthPlatformTopCampaign = {
  campaignId: string;
  campaignName: string;
  creatorUserId: string;
  destinationType: CreatorGrowthCampaignDestinationType;
  trafficSource: string;
  totalEvents: number;
};

export type CreatorGrowthPlatformAnalyticsRollup = {
  totalCreators: number;
  totalCampaigns: number;
  activeCampaigns: number;
  archivedCampaigns: number;
  totalEvents: number;
  conversionEvents: number;
  clickLikeEvents: number;
  conversionRate: number;
  byEventType: Partial<Record<CreatorGrowthCampaignEventType, number>>;
  bySource: Record<string, number>;
  byDestinationType: Partial<Record<CreatorGrowthCampaignDestinationType, number>>;
  topSources: CreatorGrowthPlatformTopEntry[];
  topEventTypes: CreatorGrowthPlatformTopEntry[];
  topDestinationTypes: CreatorGrowthPlatformTopEntry[];
  topCampaigns: CreatorGrowthPlatformTopCampaign[];
  latestEventAt?: string | null;
  productionReady: boolean;
  note?: string;
};

export function listCreatorGrowthCampaignPolicies() {
  return apiRequest<CreatorGrowthCampaignPolicy[]>('/creator-growth/campaign-policies');
}

export function createCreatorGrowthCampaign(input: CreateGrowthCampaignInput) {
  return apiRequest<CreatorGrowthCampaign>('/creator-growth/campaign', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listMyCreatorGrowthCampaigns() {
  return apiRequest<CreatorGrowthCampaign[]>('/creator-growth/campaigns/mine');
}

export function archiveCreatorGrowthCampaign(campaignId: string) {
  return apiRequest<CreatorGrowthCampaign>(`/creator-growth/campaign/${encodeURIComponent(campaignId)}/archive`, {
    method: 'PATCH',
  });
}

export function trackCreatorGrowthCampaignEvent(campaignId: string, input: TrackGrowthCampaignEventInput) {
  return apiRequest<CreatorGrowthCampaignEvent>(`/creator-growth/campaign/${encodeURIComponent(campaignId)}/event`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function resolveCreatorGrowthPublicLanding(destinationSlug: string, campaignSlug: string) {
  return apiRequest<CreatorGrowthPublicLanding>(
    `/creator-growth/landing/${encodeURIComponent(destinationSlug)}/${encodeURIComponent(campaignSlug)}`,
  );
}

export function getCreatorGrowthCampaignAnalytics(campaignId: string) {
  return apiRequest<CreatorGrowthCampaignAnalytics>(`/creator-growth/campaign/${encodeURIComponent(campaignId)}/analytics`);
}

export function getCreatorGrowthPlatformAnalyticsRollup() {
  return apiRequest<CreatorGrowthPlatformAnalyticsRollup>('/creator-growth/analytics/platform');
}
