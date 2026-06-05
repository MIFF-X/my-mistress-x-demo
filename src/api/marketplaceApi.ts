import { apiRequest, apiTextRequest } from './apiClient';

export type MarketplaceWorld = 'STANDARD' | 'VENDING_MACHINE' | 'LAUNDRY_HAMPER' | 'MYSTERY_BOX' | 'PRIVATE_VAULT';
export type ProductVisibility = 'PUBLIC' | 'PRIVATE' | 'UNLISTED';
export type ProductRevealMode = 'IMMEDIATE' | 'AFTER_PURCHASE' | 'MANUAL_APPROVAL';
export type MarketplaceFulfilmentStatus =
  | 'FULFILMENT_PENDING'
  | 'FULFILLED'
  | 'COMPLETED'
  | 'PROCESSING'
  | 'PACKED'
  | 'SHIPPED'
  | 'READY_FOR_PICKUP'
  | 'DELIVERED'
  | 'CANCELLED'
  | 'REFUNDED'
  | 'CHARGEBACK';

export type MarketplaceWorldPolicy = {
  world: MarketplaceWorld;
  label: string;
  description: string;
  defaultVisibility: ProductVisibility;
  defaultRevealMode: ProductRevealMode;
  requiresApproval: boolean;
  supportsPhysicalStock: boolean;
  supportsMysteryReveal: boolean;
  supportsManualApproval: boolean;
  isLegacyRestrictedListing?: boolean;
  architectureNote?: string;
};

export type MarketplaceProductMediaMetadata = {
  coverImageUrl?: string;
  galleryImageUrls?: string[];
  previewUrl?: string;
  altText?: string;
};

export type MarketplaceProductMetadata = Record<string, unknown> & {
  media?: MarketplaceProductMediaMetadata;
};

export type MarketplaceProduct = {
  id: string;
  mistressId: string;
  title: string;
  description?: string | null;
  price: number | string;
  type: string;
  world: MarketplaceWorld;
  visibility: ProductVisibility | string;
  revealMode: ProductRevealMode | string;
  requiresApproval: boolean;
  metadata?: MarketplaceProductMetadata | null;
  stock: number;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceUserSummary = {
  id: string;
  username: string;
  displayName?: string | null;
  role: string;
};

export type MarketplaceOrder = {
  id: string;
  buyerId: string;
  productId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
};

export type MarketplaceSellerOrder = MarketplaceOrder & {
  product?: {
    id: string;
    title: string;
    description?: string | null;
    price: number | string;
    world: MarketplaceWorld;
    visibility: string;
    revealMode: string;
    requiresApproval: boolean;
    stock: number;
    mistressId?: string;
    mistress?: MarketplaceUserSummary | null;
  } | null;
  buyer?: MarketplaceUserSummary | null;
};

export type MarketplaceApprovalOrder = MarketplaceOrder & {
  product?: {
    id: string;
    title: string;
    description?: string | null;
    price: number | string;
    world: MarketplaceWorld;
    visibility: string;
    revealMode: string;
    requiresApproval: boolean;
    stock: number;
    mistress?: MarketplaceUserSummary | null;
  } | null;
};

export type MarketplaceBuyerOrder = MarketplaceApprovalOrder;

export type MarketplaceOrderTimelineItem = {
  key: string;
  label: string;
  status: string;
  occurredAt: string;
  actorUserId?: string | null;
  targetUserId?: string | null;
  note?: string | null;
  metadata?: Record<string, unknown>;
};

export type MarketplaceOrderTimeline = {
  order: MarketplaceSellerOrder;
  timeline: MarketplaceOrderTimelineItem[];
};

export type MarketplaceOrderReceipt = {
  receiptNumber: string;
  orderId: string;
  productId: string;
  productTitle: string;
  world: MarketplaceWorld;
  buyerId: string;
  sellerId: string;
  status: string;
  grossCredits: number;
  platformAmount: number;
  mistressAmount: number;
  adjustmentType: string;
  adjustmentAmount: number;
  adjustedPlatformAmount: number;
  adjustedMistressAmount: number;
  netReceiptAmount: number;
  platformPercent: number;
  mistressPercent: number;
  currency: string;
  issuedAt: string;
  order: MarketplaceSellerOrder;
  statementText: string;
  adjustmentNote?: string;
  complianceNote: string;
};

export type MarketplaceWorldAnalytics = {
  world: MarketplaceWorld;
  label: string;
  productCount: number;
  totalStock: number;
  reservedStockCount: number;
  availableStockCount: number;
  soldOutCount: number;
  orderCount: number;
  pendingApprovalCount: number;
  approvedPendingPaymentCount: number;
  paidOrderCount: number;
  fulfilmentQueueCount: number;
  fulfilledOrderCount: number;
  grossCredits: number;
};

export type MarketplaceFulfilmentAnalyticsRow = {
  status: string;
  label: string;
  count: number;
  grossCredits: number;
  oldestOrderId?: string;
  oldestOrderUpdatedAt?: string;
  oldestOrderAgeHours: number;
};

export type MarketplaceFulfilmentSlaAlert = {
  key: string;
  label: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  thresholdHours: number;
  count: number;
  oldestOrder?: {
    id: string;
    status: string;
    productTitle: string;
    world: MarketplaceWorld;
    updatedAt: string;
    ageHours: number;
  };
  recommendedAction: string;
};

export type MarketplaceFulfilmentSlaSeverity = 'INFO' | 'WARNING' | 'CRITICAL';

export type MarketplaceFulfilmentSlaPolicyRule = {
  key: string;
  label: string;
  statuses: string[];
  thresholdHours: number;
  severity: MarketplaceFulfilmentSlaSeverity;
  recommendedAction: string;
  enabled: boolean;
  source: 'GLOBAL' | 'WORLD_OVERRIDE';
  world?: MarketplaceWorld;
};

export type MarketplaceFulfilmentSlaPolicyAuditRecord = {
  id: string;
  world: 'GLOBAL' | MarketplaceWorld;
  actorUserId: string;
  actorRole?: string;
  updatedAt: string;
  updatedRuleKeys: string[];
  activeRuleCount: number;
  note?: string;
};

export type MarketplaceFulfilmentSlaPolicy = {
  scope: 'marketplace_fulfilment';
  world: 'GLOBAL' | MarketplaceWorld;
  persistenceMode: 'database_backed' | 'scaffold_memory';
  editable: boolean;
  updatedAt?: string;
  updatedByUserId?: string;
  activeRuleCount: number;
  overrides: Array<{ world: MarketplaceWorld; activeRuleCount: number }>;
  auditHistory: MarketplaceFulfilmentSlaPolicyAuditRecord[];
  rules: MarketplaceFulfilmentSlaPolicyRule[];
};

export type MarketplaceFulfilmentSlaAlertJobResult = {
  jobId: string;
  source: 'manual' | 'scheduler';
  dryRun: boolean;
  status: 'SUCCESS' | 'FAILED';
  generatedAt: string;
  durationMs: number;
  scannedOrderCount: number;
  candidateAlertCount: number;
  deliveredCount: number;
  skippedDuplicateCount: number;
  skippedLimitCount: number;
  escalatedCount: number;
  providerWebhookDispatchCount: number;
  providerWebhookFailureCount: number;
  maxNotifications: number;
  errorMessage?: string;
  alerts: Array<{
    id: string;
    orderId: string;
    alertKey: string;
    ruleKey: string;
    world: MarketplaceWorld;
    status: string;
    sellerUserId: string;
    buyerId?: string;
    severity: MarketplaceFulfilmentSlaSeverity;
    thresholdHours: number;
    ageHours: number;
    orderUpdatedAt: string;
    notifiedAt: string;
    notificationId?: string;
  }>;
};

export type MarketplaceFulfilmentSlaAlertJobRunSummary = Omit<MarketplaceFulfilmentSlaAlertJobResult, 'alerts'>;

export type MarketplaceFulfilmentSlaProviderWebhookDispatch = {
  id: string;
  providerName: string;
  endpointConfigured: boolean;
  secretConfigured: boolean;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  statusCode?: number;
  orderId: string;
  alertKey: string;
  ruleKey: string;
  dispatchedAt: string;
  errorMessage?: string;
  retryOfDispatchId?: string;
  retryCount: number;
  nextRetryAt?: string;
  deadLetteredAt?: string;
  deadLetterReviewedAt?: string;
  deadLetterReviewedByUserId?: string;
  deadLetterReviewNote?: string;
  supersededAt?: string;
  supersededByDispatchId?: string;
};

export type MarketplaceFulfilmentSlaProviderIncidentHandoff = {
  id: string;
  providerName: string;
  dispatchId: string;
  orderId: string;
  alertKey: string;
  ruleKey: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'CLOSED';
  priority: 'HIGH' | 'CRITICAL';
  externalTicketId?: string;
  ticketUrl?: string;
  providerAction?: 'CREATE' | 'ACKNOWLEDGE' | 'CLOSE';
  providerStatus?: 'SCAFFOLD' | 'PENDING' | 'SENT' | 'FAILED' | 'ACKNOWLEDGED' | 'CLOSED';
  providerStatusCode?: number;
  providerErrorMessage?: string;
  acknowledgedAt?: string;
  closedAt?: string;
  lastProviderSyncAt?: string;
  createdAt: string;
};

export type MarketplaceFulfilmentSlaProviderIncidentConfigCheck = {
  generatedAt?: string;
  enabled: boolean;
  providerName: string;
  baseUrlConfigured: boolean;
  installUrlConfigured: boolean;
  oauthConfigured: boolean;
  sandboxMode: boolean;
  endpointConfigured: boolean;
  closeEndpointConfigured: boolean;
  callbackSecretConfigured: boolean;
  dispatchMode: 'linear_api' | 'jira_api' | 'pagerduty_api' | 'opsgenie_api' | 'generic_webhook_api' | 'scaffold_ticket';
  closeDispatchMode: 'linear_api' | 'jira_api' | 'pagerduty_api' | 'opsgenie_api' | 'generic_webhook_api' | 'scaffold_ticket';
  create: {
    ready: boolean;
    missingEnv: string[];
  };
  close: {
    ready: boolean;
    missingEnv: string[];
  };
  callback: {
    ready: boolean;
    missingEnv: string[];
  };
  install: {
    ready: boolean;
    installUrlConfigured: boolean;
    oauthConfigured: boolean;
    missingEnv: string[];
  };
  sandbox: {
    ready: boolean;
    modeEnabled: boolean;
    missingEnv: string[];
  };
  fieldMapping: {
    ready: boolean;
    source: 'default' | 'env' | 'invalid_env';
    fields: Record<string, string>;
    missingKeys: string[];
    errorMessage?: string;
  };
  env: Record<string, string>;
};

export type MarketplaceFulfilmentSlaProviderIncidentSandboxValidation = {
  generatedAt: string;
  status: 'PASS' | 'WARN' | 'FAIL';
  liveTestSent: boolean;
  providerName: string;
  configCheck: MarketplaceFulfilmentSlaProviderIncidentConfigCheck;
  testHandoff: MarketplaceFulfilmentSlaProviderIncidentHandoff;
  blockingGaps: string[];
  recommendations: string[];
};

export type MarketplaceFulfilmentSlaProviderWebhookRetryQueueItem = MarketplaceFulfilmentSlaProviderWebhookDispatch & {
  queueState: 'READY' | 'WAITING' | 'DEAD_LETTER' | 'REVIEWED';
  canRetry: boolean;
  maxAttempts: number;
  retryDelayMinutes: number;
  reviewed: boolean;
};

export type MarketplaceFulfilmentSlaProviderWebhookRetryQueue = {
  generatedAt: string;
  config: {
    maxAttempts: number;
    baseMinutes: number;
    maxMinutes: number;
    batchSize: number;
    env: Record<string, string>;
  };
  summary: {
    readyCount: number;
    waitingCount: number;
    deadLetterCount: number;
  };
  items: MarketplaceFulfilmentSlaProviderWebhookRetryQueueItem[];
};

export type MarketplaceFulfilmentSlaProviderWebhookRetryQueueRun = {
  generatedAt: string;
  scannedCount: number;
  attemptedCount: number;
  sentCount: number;
  failedCount: number;
  skippedCount: number;
  deadLetterCount: number;
  incidentHandoffCount: number;
  results: Array<{
    dispatchId: string;
    status: string;
    retryDispatchId?: string;
    retryCount?: number;
    errorMessage?: string;
  }>;
  incidentHandoffs: MarketplaceFulfilmentSlaProviderIncidentHandoff[];
};

export type MarketplaceFulfilmentSlaAlertJobStatus = {
  scheduler: {
    enabled: boolean;
    intervalMinutes: number;
    maxNotifications: number;
    env: {
      interval: string;
      maxNotifications: string;
    };
  };
  escalation: {
    enabled: boolean;
    roles: string[];
    env: {
      enabled: string;
      roles: string;
    };
  };
  persistence: {
    deliveryMode: 'database_backed' | 'memory_fallback';
    policyMode: 'database_backed' | 'memory_fallback';
    runHistoryMode: 'database_backed' | 'memory_fallback';
    providerWebhookMode: 'database_backed' | 'memory_fallback';
  };
  monitoring: {
    ready: boolean;
    lastRunAt: string | null;
    lastSuccessAt: string | null;
    lastFailureAt: string | null;
    lastFailureMessage: string | null;
    recentFailureCount: number;
  };
  providerWebhook: {
    providerName: string;
    enabled: boolean;
    endpointConfigured: boolean;
    secretConfigured: boolean;
    dispatchMode: 'provider_webhook' | 'scaffold';
    webhookHeader: string;
    env: {
      url: string;
      secret: string;
      provider: string;
    };
    retryQueue: {
      maxAttempts: number;
      baseMinutes: number;
      maxMinutes: number;
      batchSize: number;
      workerEnabled: boolean;
      workerIntervalMinutes: number;
      lastRunAt: string | null;
      recentRuns: MarketplaceFulfilmentSlaProviderWebhookRetryQueueRun[];
      env: Record<string, string>;
    };
    incidentHandoff: {
      enabled: boolean;
      providerName: string;
      baseUrl: string;
      apiConfigured: boolean;
      closeApiConfigured: boolean;
      endpointConfigured: boolean;
      closeEndpointConfigured: boolean;
      dispatchMode: 'linear_api' | 'jira_api' | 'pagerduty_api' | 'opsgenie_api' | 'generic_webhook_api' | 'scaffold_ticket';
      closeDispatchMode: 'linear_api' | 'jira_api' | 'pagerduty_api' | 'opsgenie_api' | 'generic_webhook_api' | 'scaffold_ticket';
      webhookSecretConfigured: boolean;
      configCheck?: MarketplaceFulfilmentSlaProviderIncidentConfigCheck;
      env: Record<string, string>;
      recentHandoffs: MarketplaceFulfilmentSlaProviderIncidentHandoff[];
    };
    recentDispatches: MarketplaceFulfilmentSlaProviderWebhookDispatch[];
  };
  recentRuns: MarketplaceFulfilmentSlaAlertJobRunSummary[];
};

export type UpdateMarketplaceFulfilmentSlaPolicyInput = {
  world?: MarketplaceWorld;
  note?: string;
  rules: Array<{
    key: string;
    thresholdHours?: number;
    severity?: MarketplaceFulfilmentSlaSeverity;
    enabled?: boolean;
    label?: string;
    recommendedAction?: string;
  }>;
};

export type MarketplaceFulfilmentAnalytics = {
  scope: 'seller' | 'all_sellers';
  generatedAt: string;
  orderCount: number;
  queueCount: number;
  inProgressCount: number;
  completedCount: number;
  exceptionCount: number;
  grossOpenCredits: number;
  oldestOpenOrder?: {
    id: string;
    status: string;
    productTitle: string;
    world: MarketplaceWorld;
    updatedAt: string;
    ageHours: number;
  };
  statusBreakdown: MarketplaceFulfilmentAnalyticsRow[];
  slaAlerts: MarketplaceFulfilmentSlaAlert[];
  slaPolicy?: MarketplaceFulfilmentSlaPolicy;
};

export type MarketplaceFulfilmentEvent = {
  id: string;
  eventId?: string;
  orderId: string;
  productId: string;
  productTitle: string;
  world: MarketplaceWorld;
  buyerId: string;
  sellerId: string;
  actorUserId: string;
  actorRole?: string;
  previousStatus: string;
  status: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  fulfilmentNote?: string;
  sellerNote?: string;
  trackingReference?: string;
  trackingUrl?: string;
  internalNote?: string;
  createdAt: string;
  updatedOrderAt: string;
};

export type MarketplaceFulfilmentEventList = {
  items: MarketplaceFulfilmentEvent[];
};

export type MarketplaceStoreReceiptExportBatch = {
  id: string;
  status: 'DRAFT';
  scope: 'seller' | 'all_sellers';
  createdByUserId: string;
  createdByRole?: string;
  createdAt: string;
  updatedAt: string;
  filters: ListMarketplaceSellerOrdersInput;
  rowCount: number;
  grossCredits: number;
  platformAmount: number;
  mistressAmount: number;
  adjustmentAmount: number;
  netReceiptAmount: number;
  receiptNumbers: string[];
  csvText: string;
  note: string;
};

export type MarketplaceStoreReceiptExportBatchList = {
  items: MarketplaceStoreReceiptExportBatch[];
};

export type MarketplaceProcessorReconciliationRow = {
  receiptNumber: string;
  orderId: string;
  productTitle: string;
  status: string;
  grossCredits: number;
  platformAmount: number;
  mistressAmount: number;
  adjustmentType: string;
  adjustmentAmount: number;
  adjustedPlatformAmount: number;
  adjustedMistressAmount: number;
  netReceiptAmount: number;
  estimatedProcessorFee: number;
  platformNetAfterAdjustmentsAndProcessorFee: number;
};

export type MarketplaceProcessorReconciliation = {
  scope: 'seller' | 'all_sellers';
  generatedAt: string;
  filters: ListMarketplaceSellerOrdersInput;
  rowCount: number;
  grossCredits: number;
  platformAmount: number;
  mistressAmount: number;
  adjustmentAmount: number;
  adjustedPlatformAmount: number;
  adjustedMistressAmount: number;
  netReceiptAmount: number;
  estimatedProcessorFee: number;
  platformNetAfterProcessorFee: number;
  platformNetAfterAdjustmentsAndProcessorFee: number;
  processorRatePercent: number;
  processorFixedCredits: number;
  currency: string;
  note: string;
  rows: MarketplaceProcessorReconciliationRow[];
};

export type CreateMarketplaceProductInput = {
  title: string;
  description?: string;
  price: number;
  type?: string;
  world?: MarketplaceWorld;
  visibility?: ProductVisibility;
  revealMode?: ProductRevealMode;
  requiresApproval?: boolean;
  metadata?: MarketplaceProductMetadata;
  stock?: number;
};

export type UpdateMarketplaceProductInput = Partial<CreateMarketplaceProductInput>;

export type UpdateMarketplaceOrderFulfilmentInput = {
  status: MarketplaceFulfilmentStatus;
  fulfilmentNote?: string;
  sellerNote?: string;
  trackingReference?: string;
  trackingUrl?: string;
  internalNote?: string;
};

export type ListMarketplaceSellerOrdersInput = {
  status?: string;
  world?: MarketplaceWorld | 'ALL';
  dateFrom?: string;
  dateTo?: string;
};

function marketplaceSellerOrdersQuery(input: ListMarketplaceSellerOrdersInput = {}) {
  const params = [
    input.status?.trim() && input.status !== 'ALL' ? `status=${encodeURIComponent(input.status.trim())}` : '',
    input.world?.trim() && input.world !== 'ALL' ? `world=${encodeURIComponent(input.world.trim())}` : '',
    input.dateFrom?.trim() ? `dateFrom=${encodeURIComponent(input.dateFrom.trim())}` : '',
    input.dateTo?.trim() ? `dateTo=${encodeURIComponent(input.dateTo.trim())}` : '',
  ].filter(Boolean);

  return params.length ? `?${params.join('&')}` : '';
}

export function listMarketplaceWorldPolicies() {
  return apiRequest<MarketplaceWorldPolicy[]>('/marketplace/world-policies');
}

export function listMarketplaceProducts() {
  return apiRequest<MarketplaceProduct[]>('/marketplace/products');
}

export function listMarketplaceProductsByWorld(world: MarketplaceWorld) {
  return apiRequest<MarketplaceProduct[]>(`/marketplace/products/world/${encodeURIComponent(world)}`);
}

export function listSellerMarketplaceProductsByWorld(world: MarketplaceWorld) {
  return apiRequest<MarketplaceProduct[]>(`/marketplace/products/seller/world/${encodeURIComponent(world)}`);
}

export function listMarketplaceSellerOrders(input: ListMarketplaceSellerOrdersInput = {}) {
  return apiRequest<MarketplaceSellerOrder[]>(`/marketplace/orders/seller${marketplaceSellerOrdersQuery(input)}`);
}

export function exportMarketplaceSellerOrderReceiptsCsv(input: ListMarketplaceSellerOrdersInput = {}) {
  return apiTextRequest(`/marketplace/orders/seller/export.csv${marketplaceSellerOrdersQuery(input)}`);
}

export function createMarketplaceSellerOrderReceiptExportBatch(input: ListMarketplaceSellerOrdersInput = {}) {
  return apiRequest<MarketplaceStoreReceiptExportBatch>('/marketplace/orders/seller/export-batches', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listMarketplaceSellerOrderReceiptExportBatches() {
  return apiRequest<MarketplaceStoreReceiptExportBatchList>('/marketplace/orders/seller/export-batches');
}

export function reconcileMarketplaceSellerOrderProcessorFees(input: ListMarketplaceSellerOrdersInput = {}) {
  return apiRequest<MarketplaceProcessorReconciliation>(
    `/marketplace/orders/seller/processor-reconciliation${marketplaceSellerOrdersQuery(input)}`,
  );
}

export function listMyMarketplaceApprovalOrders() {
  return apiRequest<MarketplaceApprovalOrder[]>('/marketplace/approval-orders/mine');
}

export function listMyMarketplaceOrders() {
  return apiRequest<MarketplaceBuyerOrder[]>('/marketplace/orders/mine');
}

export function listMarketplaceOrderTimeline(orderId: string) {
  return apiRequest<MarketplaceOrderTimeline>(`/marketplace/order/${encodeURIComponent(orderId)}/timeline`);
}

export function getMarketplaceOrderReceipt(orderId: string) {
  return apiRequest<MarketplaceOrderReceipt>(`/marketplace/order/${encodeURIComponent(orderId)}/receipt`);
}

export function listSellerMarketplaceOrders(input: ListMarketplaceSellerOrdersInput = {}) {
  return listMarketplaceSellerOrders(input);
}

export function listMarketplaceWorldAnalytics() {
  return apiRequest<MarketplaceWorldAnalytics[]>('/marketplace/analytics/worlds');
}

export function listMarketplaceFulfilmentAnalytics() {
  return apiRequest<MarketplaceFulfilmentAnalytics>('/marketplace/analytics/fulfilment');
}

export function listMarketplaceFulfilmentSlaPolicy(input: { world?: MarketplaceWorld | 'ALL' } = {}) {
  const world = input.world && input.world !== 'ALL' ? `?world=${encodeURIComponent(input.world)}` : '';
  return apiRequest<MarketplaceFulfilmentSlaPolicy>(`/marketplace/fulfilment-sla-policy${world}`);
}

export function updateMarketplaceFulfilmentSlaPolicy(input: UpdateMarketplaceFulfilmentSlaPolicyInput) {
  return apiRequest<MarketplaceFulfilmentSlaPolicy>('/marketplace/fulfilment-sla-policy', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function runMarketplaceFulfilmentSlaAlertJob(input: { dryRun?: boolean; maxNotifications?: number } = {}) {
  return apiRequest<MarketplaceFulfilmentSlaAlertJobResult>('/marketplace/fulfilment-sla-alerts/run', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listMarketplaceFulfilmentSlaAlertJobStatus() {
  return apiRequest<MarketplaceFulfilmentSlaAlertJobStatus>('/marketplace/fulfilment-sla-alerts/status');
}

export function retryMarketplaceFulfilmentSlaProviderWebhookDispatch(dispatchId: string) {
  return apiRequest<MarketplaceFulfilmentSlaProviderWebhookDispatch>(
    `/marketplace/fulfilment-sla-alerts/provider-webhook/${encodeURIComponent(dispatchId)}/retry`,
    { method: 'POST' },
  );
}

export function listMarketplaceFulfilmentSlaProviderWebhookRetryQueue() {
  return apiRequest<MarketplaceFulfilmentSlaProviderWebhookRetryQueue>('/marketplace/fulfilment-sla-alerts/provider-webhook/retry-queue');
}

export function runMarketplaceFulfilmentSlaProviderWebhookRetryQueue(maxDispatches?: number) {
  return apiRequest<MarketplaceFulfilmentSlaProviderWebhookRetryQueueRun>(
    '/marketplace/fulfilment-sla-alerts/provider-webhook/retry-queue/run',
    {
      method: 'POST',
      body: JSON.stringify({ maxDispatches }),
    },
  );
}

export function reviewMarketplaceFulfilmentSlaProviderWebhookDeadLetter(dispatchId: string, note?: string) {
  return apiRequest<MarketplaceFulfilmentSlaProviderWebhookRetryQueueItem>(
    `/marketplace/fulfilment-sla-alerts/provider-webhook/${encodeURIComponent(dispatchId)}/dead-letter-review`,
    {
      method: 'POST',
      body: JSON.stringify({ note }),
    },
  );
}

export function inspectMarketplaceFulfilmentSlaProviderIncidentTicketConfig() {
  return apiRequest<MarketplaceFulfilmentSlaProviderIncidentConfigCheck>(
    '/marketplace/fulfilment-sla-alerts/provider-incident/config-check',
  );
}

export function testMarketplaceFulfilmentSlaProviderIncidentTicket(input: {
  orderId?: string;
  dispatchId?: string;
  alertKey?: string;
  ruleKey?: string;
  priority?: 'HIGH' | 'CRITICAL';
  note?: string;
  dryRun?: boolean;
} = {}) {
  return apiRequest<MarketplaceFulfilmentSlaProviderIncidentHandoff>(
    '/marketplace/fulfilment-sla-alerts/provider-incident/test-send',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function validateMarketplaceFulfilmentSlaProviderIncidentSandbox(input: {
  sendLiveTest?: boolean;
  note?: string;
} = {}) {
  return apiRequest<MarketplaceFulfilmentSlaProviderIncidentSandboxValidation>(
    '/marketplace/fulfilment-sla-alerts/provider-incident/sandbox-validate',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function closeMarketplaceFulfilmentSlaProviderIncidentTicket(dispatchId: string, note?: string) {
  return apiRequest<MarketplaceFulfilmentSlaProviderIncidentHandoff>(
    `/marketplace/fulfilment-sla-alerts/provider-incident/${encodeURIComponent(dispatchId)}/close`,
    {
      method: 'POST',
      body: JSON.stringify({ note }),
    },
  );
}

export function receiveMarketplaceFulfilmentSlaProviderIncidentWebhook(input: {
  action?: 'acknowledged' | 'closed' | 'resolved';
  status?: string;
  externalTicketId?: string;
  dispatchId?: string;
  orderId?: string;
  ticketUrl?: string;
  note?: string;
  secret?: string;
  payload?: Record<string, unknown>;
}) {
  return apiRequest<MarketplaceFulfilmentSlaProviderIncidentHandoff>(
    '/marketplace/fulfilment-sla-alerts/provider-incident-webhook',
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function listMarketplaceFulfilmentEvents(input: { orderId?: string; status?: string } = {}) {
  const params = [
    input.orderId?.trim() ? `orderId=${encodeURIComponent(input.orderId.trim())}` : '',
    input.status?.trim() && input.status !== 'ALL' ? `status=${encodeURIComponent(input.status.trim())}` : '',
  ].filter(Boolean);
  const query = params.length ? `?${params.join('&')}` : '';

  return apiRequest<MarketplaceFulfilmentEventList>(`/marketplace/orders/seller/fulfilment-events${query}`);
}

export function createMarketplaceProduct(input: CreateMarketplaceProductInput) {
  return apiRequest<MarketplaceProduct>('/marketplace/product', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function updateMarketplaceProduct(productId: string, input: UpdateMarketplaceProductInput) {
  return apiRequest<MarketplaceProduct>(`/marketplace/product/${encodeURIComponent(productId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function updateMarketplaceOrderFulfilment(orderId: string, input: UpdateMarketplaceOrderFulfilmentInput) {
  return apiRequest<MarketplaceOrder>(`/marketplace/order/${encodeURIComponent(orderId)}/fulfilment`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function updateMarketplaceOrderStatus(orderId: string, status: MarketplaceFulfilmentStatus) {
  return apiRequest<MarketplaceSellerOrder>(`/marketplace/order/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function requestMarketplaceProductApproval(productId: string) {
  return apiRequest<MarketplaceOrder>('/marketplace/approval-request', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}

export function approveMarketplaceApprovalRequest(orderId: string) {
  return apiRequest<MarketplaceOrder>(`/marketplace/approval-request/${encodeURIComponent(orderId)}/approve`, {
    method: 'POST',
  });
}

export function declineMarketplaceApprovalRequest(orderId: string) {
  return apiRequest<MarketplaceOrder>(`/marketplace/approval-request/${encodeURIComponent(orderId)}/decline`, {
    method: 'POST',
  });
}

export function purchaseApprovedMarketplaceOrder(orderId: string) {
  return apiRequest<MarketplaceOrder>(`/marketplace/approval-order/${encodeURIComponent(orderId)}/purchase`, {
    method: 'POST',
  });
}

export function purchaseMarketplaceProduct(productId: string) {
  return apiRequest<MarketplaceOrder>('/marketplace/purchase', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });
}
