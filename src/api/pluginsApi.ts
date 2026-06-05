import { apiRequest } from './apiClient';

export type PluginArea = 'HEADMISTRESS' | 'MISTRESS' | 'SUB' | 'SHARED' | 'SITE';
export type PluginStatus = 'PLANNED' | 'SCAFFOLDED' | 'ACTIVE' | 'DISABLED';
export type PluginMonetizationMode = 'free' | 'freemium' | 'fixed_price' | 'subscription_bundle' | 'custom_quote';

export type PluginCalendarWindow = {
  startsAt?: string | null;
  endsAt?: string | null;
  timezone: string;
  status: 'always' | 'active' | 'upcoming' | 'expired' | string;
  isAvailableNow: boolean;
};

export type PublicPluginBundle = {
  id: string;
  name: string;
  priceCredits: number;
  billingPeriod: string;
  pluginLimit: number;
  addonLimit: number;
};

export type PublicPluginAddon = {
  id: string;
  name: string;
  description?: string;
  priceCredits: number;
  isEnabled: boolean;
  calendarLimit: PluginCalendarWindow;
};

export type PublicPluginMarketplace = {
  isMarketplaceVisible: boolean;
  isFreemium: boolean;
  monetizationMode: PluginMonetizationMode | string;
  currency: string;
  basePriceCredits: number;
  fixedLifetimePriceCredits: number;
  suggestionBoxEnabled: boolean;
  customRequestEnabled: boolean;
  calendarLimit: PluginCalendarWindow;
  license: {
    type: string;
    pluginLimit: number;
    addonLimit: number;
    fullSuite: boolean;
  };
  subscriptionBundles: PublicPluginBundle[];
  addons: PublicPluginAddon[];
  purchaseOptions: {
    canEnableFree: boolean;
    canBuyFixedLifetime: boolean;
    canSubscribe: boolean;
    canRequestCustom: boolean;
    addonCount: number;
    bundleCount: number;
  };
};

export type PublicPluginPurchaseRequest = {
  id: string;
  status: string;
  optionType: string;
  optionId?: string | null;
  optionName: string;
  priceCredits: number;
  currency: string;
  targetUserId?: string | null;
  requestedAt: string;
};

export type PublicPlugin = {
  id: string;
  name: string;
  area: PluginArea | string;
  status: PluginStatus | string;
  description?: string | null;
  permissions?: unknown;
  dependencies?: unknown;
  marketplace: PublicPluginMarketplace;
  enabledForCurrentUser: boolean;
  currentUserPurchaseRequest?: PublicPluginPurchaseRequest | null;
  currentUserPurchaseRequests?: PublicPluginPurchaseRequest[];
  relationshipScopedTargetUserId?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PluginSuggestionInput = {
  kind?: 'plugin' | 'addon';
  pluginId?: string;
  requestedCategory?: string;
  title: string;
  description: string;
  budgetCredits?: number;
  contactPreference?: string;
  metadata?: Record<string, unknown>;
};

export type PluginPurchaseRequestInput = {
  pluginId: string;
  optionType: 'fixed_lifetime' | 'subscription_bundle' | 'addon' | 'custom_quote';
  bundleId?: string;
  addonId?: string;
  targetUserId?: string;
  note?: string;
  contactPreference?: string;
  metadata?: Record<string, unknown>;
};

export type PluginSuggestionReceipt = {
  id: string;
  status: string;
  kind: 'plugin' | 'addon';
  title: string;
  targetPluginId?: string | null;
};

export type PluginPurchaseRequestReceipt = {
  id: string;
  status: string;
  pluginId: string;
  pluginName: string;
  optionType: string;
  optionId: string;
  optionName: string;
  priceCredits: number;
  currency: string;
  targetUserId?: string | null;
  createdAt: string;
  alreadyRequested?: boolean;
};

export type BackendPluginRegistryItem = {
  key: string;
  queueNames: string[];
  jobNames: string[];
  ownsSensitiveData: boolean;
  requiresAuditLog: boolean;
  notes: string[];
};

export type BackendPluginRegistrySummary = {
  summary: {
    totalPlugins: number;
    queueCount: number;
    jobCount: number;
    auditRequiredCount: number;
    sensitiveDataPluginCount: number;
  };
  queueNames: string[];
  jobNames: string[];
  auditRequiredPluginKeys: string[];
  sensitiveDataPluginKeys: string[];
  plugins: BackendPluginRegistryItem[];
};

export function listPlugins(filters: { area?: string; targetUserId?: string } = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => Boolean(value))
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return apiRequest<PublicPlugin[]>(`/plugins${query ? `?${query}` : ''}`);
}

export function getBackendPluginRegistrySummary() {
  return apiRequest<BackendPluginRegistrySummary>('/plugins/registry/summary');
}

export function enablePlugin(pluginId: string, targetUserId?: string) {
  return apiRequest<{ entitlement: { id: string; enabled: boolean }; relationshipScopedTargetUserId?: string | null }>(
    `/plugins/${encodeURIComponent(pluginId)}/enable`,
    {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    },
  );
}

export function disablePlugin(pluginId: string, targetUserId?: string) {
  return apiRequest<{ entitlement: { id: string; enabled: boolean }; relationshipScopedTargetUserId?: string | null }>(
    `/plugins/${encodeURIComponent(pluginId)}/disable`,
    {
      method: 'POST',
      body: JSON.stringify({ targetUserId }),
    },
  );
}

export function submitPluginSuggestion(body: PluginSuggestionInput) {
  return apiRequest<PluginSuggestionReceipt>('/plugins/suggestions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function requestPluginPurchase(body: PluginPurchaseRequestInput) {
  return apiRequest<PluginPurchaseRequestReceipt>('/plugins/purchase-requests', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
