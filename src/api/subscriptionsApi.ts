import { apiRequest } from './apiClient';

export type SubscriptionTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'VIP';
export type BillingCycle = 'WEEKLY' | 'MONTHLY';
export type CreatorSubscriptionStableTierKey = 'creator_tier_1' | 'creator_tier_2' | 'creator_tier_3' | 'creator_tier_4';

export type CreatorSubscriptionTierSlot = {
  slot: 1 | 2 | 3 | 4;
  key: SubscriptionTier;
  stableKey: CreatorSubscriptionStableTierKey;
  defaultLabel: string;
  defaultDescription: string;
  suggestedMonthlyPrice: number;
  recommendedPerks: string[];
  growthUse: string;
};

export type SubscriptionPlan = {
  id: string;
  mistressUserId: string;
  name: string;
  tier: SubscriptionTier;
  price: number | string;
  billingCycle: BillingCycle;
  chatIncluded: boolean;
  ppvIncluded: boolean;
  ppvDiscountPercent: number;
  giftDiscountPercent: number;
  perks?: unknown;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Subscription = {
  id: string;
  userId: string;
  planId: string;
  status: string;
  startedAt: string;
  nextBillingAt: string;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSubscriptionPlanInput = {
  name?: string;
  price: number;
  tier?: SubscriptionTier;
  chatIncluded?: boolean;
  ppvIncluded?: boolean;
  ppvDiscountPercent?: number;
  giftDiscountPercent?: number;
  perks?: unknown;
};

export function listCreatorSubscriptionTierSlots() {
  return apiRequest<CreatorSubscriptionTierSlot[]>('/subscriptions/tier-slots');
}

export function listSubscriptionPlans(mistressUserId?: string) {
  const query = mistressUserId ? `?mistressUserId=${encodeURIComponent(mistressUserId)}` : '';
  return apiRequest<SubscriptionPlan[]>(`/subscriptions/plans${query}`);
}

export function createSubscriptionPlan(input: CreateSubscriptionPlanInput) {
  return apiRequest<SubscriptionPlan>('/subscriptions/plan', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function subscribeToPlan(planId: string) {
  return apiRequest<Subscription>('/subscriptions/subscribe', {
    method: 'POST',
    body: JSON.stringify({ planId }),
  });
}

export function checkSubscription(mistressUserId: string) {
  return apiRequest<{ subscribed: boolean }>(`/subscriptions/check?mistressUserId=${encodeURIComponent(mistressUserId)}`);
}
