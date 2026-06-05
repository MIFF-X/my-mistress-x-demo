import { apiRequest, apiTextRequest } from './apiClient';
import { AdminPanelUser, AdminUser } from './adminApi';

export type AdminModerationItem = {
  id: string;
  type: string;
  area: string;
  priority: number | string;
  status: string;
  title: string;
  description?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  targetUserId?: string | null;
  reporterUserId?: string | null;
  assignedToId?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: AdminPanelUser | null;
  assigned?: AdminPanelUser | null;
};

export type AdminPluginStatus = 'PLANNED' | 'SCAFFOLDED' | 'ACTIVE' | 'DISABLED';
export type AdminPluginMonetizationMode = 'free' | 'freemium' | 'fixed_price' | 'subscription_bundle' | 'custom_quote';
export type AdminPluginLicenseType = 'full_suite' | 'pick_plugins' | 'pick_plugins_and_addons' | 'fixed_lifetime' | 'custom';
export type AdminPluginSuggestionStatus = 'new' | 'triaged' | 'approved' | 'declined' | 'planned' | 'built';
export type AdminPluginSuggestionRequestType = 'suggestion' | 'purchase';

export type AdminPluginMarketplaceBundle = {
  id?: string;
  name: string;
  priceCredits: number;
  billingPeriod: string;
  pluginLimit: number;
  addonLimit: number;
};

export type AdminPluginMarketplaceAddon = {
  id?: string;
  name: string;
  description?: string;
  priceCredits: number;
  isEnabled: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  calendarLimit?: {
    startsAt?: string | null;
    endsAt?: string | null;
    timezone?: string | null;
    status?: string;
    isAvailableNow?: boolean;
  } | null;
};

export type AdminPluginMarketplaceSettings = {
  isMarketplaceVisible: boolean;
  isFreemium: boolean;
  monetizationMode: AdminPluginMonetizationMode;
  currency: string;
  basePriceCredits: number;
  fixedLifetimePriceCredits: number;
  suggestionBoxEnabled: boolean;
  customRequestEnabled: boolean;
  adminToolsEnabled: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
  timezone?: string;
  licenseType: AdminPluginLicenseType;
  pluginLimit: number;
  addonLimit: number;
  subscriptionBundles: AdminPluginMarketplaceBundle[];
  addons: AdminPluginMarketplaceAddon[];
};

export type AdminPlugin = {
  id: string;
  name: string;
  area: string;
  status: AdminPluginStatus | string;
  description?: string | null;
  permissions?: unknown;
  dependencies?: unknown;
  createdAt: string;
  updatedAt: string;
  entitlements: Array<{
    id: string;
    userId: string;
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
};

export type AdminPluginSuggestion = {
  id: string;
  status: AdminPluginSuggestionStatus;
  kind: 'plugin' | 'addon' | string;
  title: string;
  description?: string | null;
  requestedCategory?: string | null;
  budgetCredits?: number | null;
  contactPreference?: string | null;
  pluginId?: string | null;
  requestType?: string | null;
  purchase?: {
    pluginId?: string;
    pluginName?: string;
    optionType?: string;
    optionId?: string;
    optionName?: string;
    priceCredits?: number;
    currency?: string;
    targetUserId?: string | null;
  } | null;
  submittedByUserId?: string | null;
  submittedAt: string;
  assignedToUserId?: string | null;
  latestReview?: {
    id: string;
    status: AdminPluginSuggestionStatus;
    note?: string | null;
    assignedToUserId?: string | null;
    reviewedByUserId?: string | null;
    reviewedAt: string;
  } | null;
  fulfillment?: {
    id: string;
    fulfilledByUserId?: string | null;
    fulfilledAt: string;
    entitlementId?: string | null;
    walletTransactionId?: string | null;
    charged: boolean;
    priceCredits?: number | null;
    currency?: string | null;
    optionType?: string | null;
    optionName?: string | null;
  } | null;
  metadata?: unknown;
};

export type AdminPluginSuggestionList = {
  items: AdminPluginSuggestion[];
  summary: Record<
    AdminPluginSuggestionStatus
    | 'total'
    | 'plugin'
    | 'addon'
    | 'suggestions'
    | 'purchaseRequests'
    | 'fulfilled'
    | 'unfulfilled',
    number
  >;
};

export type AdminPluginSuggestionFilters = {
  status?: AdminPluginSuggestionStatus;
  kind?: string;
  pluginId?: string;
  requestType?: AdminPluginSuggestionRequestType;
  submittedByUserId?: string;
  assignedToUserId?: string;
  dateFrom?: string;
  dateTo?: string;
  includeFulfilled?: boolean;
};

export type AdminPpvItem = {
  id: string;
  title: string;
  description?: string | null;
  mediaUrl: string;
  previewUrl?: string | null;
  price: number | string;
  accessType: string;
  durationMinutes?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  mistress?: AdminPanelUser | null;
  unlocks: Array<{
    id: string;
    userId: string;
    expiresAt?: string | null;
    createdAt: string;
  }>;
};

export type AdminLiveShow = {
  id: string;
  title: string;
  description?: string | null;
  ticketPrice: number | string;
  scheduledAt?: string | null;
  durationMinutes?: number | null;
  status: string;
  chatEnabled: boolean;
  giftsEnabled: boolean;
  startedAt?: string | null;
  endedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  mistress?: AdminPanelUser | null;
  tickets: Array<{
    id: string;
    buyerId: string;
    price: number | string;
    status: string;
    usedAt?: string | null;
    createdAt: string;
  }>;
};

export type AdminBooking = {
  id: string;
  type: 'PHONE' | 'VIDEO';
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  durationMinutes: number;
  price: number | string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  subUser?: AdminPanelUser | null;
  hostUser?: AdminPanelUser | null;
};

export type AdminBookingReview = AdminModerationItem & {
  metadata?: Record<string, unknown> | null;
  resolutionNote?: string | null;
  resolvedAt?: string | null;
};

export type AdminBookingReviewFilters = {
  status?: string;
  type?: string;
  reviewKind?: string;
  bookingId?: string;
  targetUserId?: string;
  limit?: number;
};

export type AdminBookingReviewWorkflowPayload = {
  status?: AdminModerationStatus;
  assignedToId?: string;
  note?: string;
  resolutionNote?: string;
  metadata?: Record<string, unknown>;
};

export type AdminBookingReviewBatchWorkflowPayload = AdminBookingReviewWorkflowPayload & {
  reviewIds: string[];
};

export type AdminBookingReviewBatchHistoryFilters = {
  limit?: number;
  outcome?: string;
  alertStatus?: string;
  assignedToId?: string;
  reminderStatus?: string;
};

export type AdminBookingReviewBatchWorkflowResult = {
  batchId: string;
  sourceBatchId?: string;
  replayBatchId?: string;
  summary: {
    requested: number;
    updated: number;
    failed: number;
  };
  items: AdminBookingReview[];
  failures: Array<{ reviewId: string; message: string }>;
};

export type AdminBookingReviewBatchHistory = {
  id: string;
  action: string;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  actor?: AdminPanelUser | null;
};

export type AdminBookingReviewBatchReplayDetail = {
  generatedAt: string;
  batchId: string;
  sourceBatchId: string;
  sourceAudit: AdminBookingReviewBatchHistory;
  replayAudits: AdminBookingReviewBatchHistory[];
  alertAudits: AdminBookingReviewBatchHistory[];
  summary: {
    batchId: string;
    requested: number;
    updated: number;
    failed: number;
    status?: unknown;
    assignedToId?: unknown;
    note?: unknown;
    reviewIds: string[];
    updatedReviewIds: unknown[];
    failedReviewIds: string[];
    replayAction: boolean;
    sourceBatchId?: unknown;
    replayBatchId?: unknown;
    replayCount: number;
    replayBatchIds: string[];
    unreplayedFailedReviewIds: string[];
    failedRowAgeHours: number | null;
    staleFailedRowThresholdHours: number;
    hasStaleFailedRows: boolean;
    latestAlertStatus?: string | null;
    latestAlertAction?: string | null;
    latestAlertNote?: string | null;
    latestAlertAt?: string | null;
    latestAlertAssignedToId?: string | null;
    alertEscalated: boolean;
    alertAcknowledged: boolean;
    retryReminderDueAt?: string | null;
    retryReminderOverdue?: boolean | null;
  };
};

export type AdminBookingReviewAction = {
  id: string;
  action: string;
  note?: string | null;
  metadata?: unknown;
  createdAt: string;
  actor?: AdminPanelUser | null;
};

export type AdminBookingReviewDetail = {
  review: AdminBookingReview;
  booking?: AdminBooking | null;
  relatedReviews: AdminBookingReview[];
  refunds: AdminBookingReconciliation['refunds'];
  auditLogs: AdminBookingReconciliation['recentAuditLogs'];
  actions: AdminBookingReviewAction[];
};

export type AdminBookingReviewPayload = {
  reason?: string;
  note?: string;
  amount?: number;
  requestedAmount?: number;
  metadata?: Record<string, unknown>;
};

export type AdminBookingActionResult = {
  booking: AdminBooking;
  review?: AdminBookingReview;
  refund?: {
    success: boolean;
    transaction?: {
      id: string;
      type: string;
      amount?: number | string;
    };
  };
  clawback?: {
    success: boolean;
    transaction?: {
      id: string;
      type: string;
      amount?: number | string;
    };
  };
};

export type AdminFinanceQueueDecisionStatus = 'PROVIDER_HANDOFF' | 'HOLD_REVIEW' | 'EXPORT_READY';

export type AdminFinanceQueueDecision = {
  id: string;
  itemId: string;
  status: AdminFinanceQueueDecisionStatus;
  actorId?: string | null;
  actor?: AdminPanelUser | null;
  amount?: number | string;
  currency?: string;
  sourceType?: string | null;
  sourceId?: string | null;
  mistressId?: string | null;
  note?: string | null;
  reserveHoldId?: string | null;
  reserveHold?: unknown;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

export type AdminReserveHold = {
  id: string;
  mistressId?: string | null;
  payoutRequestId?: string | null;
  sourceType?: string | null;
  sourceId?: string | null;
  status: string;
  amount?: number | string | null;
  currency?: string | null;
  reason?: string | null;
  heldAt?: string | null;
  releasedAt?: string | null;
  expiresAt?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminManualTopUpRequest = {
  source?: string;
  id: string;
  userId: string;
  amount?: number | string | null;
  amountCredits?: number | string | null;
  creditsToAdd?: number | string | null;
  currency?: string | null;
  provider?: string | null;
  status: string;
  reference?: Record<string, unknown> | null;
  metadata?: Record<string, unknown> | null;
  walletTransactionId?: string | null;
  reviewedByUserId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type AdminWishlistReservation = {
  id: string;
  itemId: string;
  buyerUserId: string;
  mistressUserId: string;
  message?: string | null;
  status: 'active' | 'expired' | 'purchased' | 'cancelled' | string;
  expiresAt: string;
  auditNote?: string | null;
  reviewNote?: string | null;
  reviewedByUserId?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  itemTitle?: string | null;
  itemStatus?: string | null;
};

export type AdminWishlistReservationReviewPayload = {
  action: 'cancel' | 'expire';
  note?: string;
};

export type AdminWishlistReservationSweepResult = {
  expiredCount: number;
  items: AdminWishlistReservation[];
};

export type AdminFinanceQueueDecisionPayload = {
  itemId: string;
  status: AdminFinanceQueueDecisionStatus;
  sourceType?: string;
  sourceId?: string;
  mistressId?: string;
  amount?: number;
  currency?: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export type AdminReserveHoldReleasePayload = {
  reason?: string;
  metadata?: Record<string, unknown>;
};

export type AdminManualTopUpReviewPayload = {
  note?: string;
  reason?: string;
};

export type AdminPayoutRequest = {
  id: string;
  userId: string;
  amount?: number | string | null;
  currency?: string | null;
  provider?: string | null;
  status: string;
  payoutAccountId?: string | null;
  batchId?: string | null;
  note?: string | null;
  reason?: string | null;
  reserveAmount?: number | string | null;
  feeAmount?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  processedAt?: string | null;
  requestedAt?: string | null;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  approvedById?: string | null;
  rejectedById?: string | null;
};

export type AdminPayoutDecisionPayload = {
  note?: string;
  reason?: string;
  batchId?: string;
  processorReference?: string;
  metadata?: Record<string, unknown>;
};

export type AdminPayoutBatchStatus = 'DRAFT' | 'SCHEDULED' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED';

export type AdminPayoutBatch = {
  id: string;
  status: AdminPayoutBatchStatus | string;
  method?: string | null;
  scheduledAt?: string | null;
  processedAt?: string | null;
  totalAmount: number | string;
  currency: string;
  createdById?: string | null;
  approvedById?: string | null;
  payoutRequestCount?: number;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
};

export type AdminPayoutBatchReconciliation = {
  batchId: string;
  status: string;
  method: string;
  currency: string;
  totalAmount: number;
  exportedAmount: number;
  difference: number;
  exportedRows: number;
  totalMatches: boolean;
  hasExportRows: boolean;
  hasSettlementEvidence: boolean;
  settlementAmountMatches: boolean;
  readyForProvider: boolean;
  settled: boolean;
  needsReview: boolean;
  checks: Array<{
    key: string;
    label: string;
    status: 'PASS' | 'WARN' | 'FAIL' | string;
    detail: string;
  }>;
  settlement?: {
    status?: string;
    providerReference?: string;
    amount: number;
    feeAmount: number;
    netAmount: number;
    settledAt?: string;
  } | null;
  recommendation: string;
  generatedAt: string;
};

export type AdminPayoutBatchSettlementStatus = 'SETTLED' | 'PARTIAL' | 'FAILED' | 'RETURNED';

export type AdminPayoutBatchSettlement = {
  id: string;
  status: AdminPayoutBatchSettlementStatus | string;
  amount: number;
  feeAmount: number;
  netAmount: number;
  currency: string;
  providerReference: string;
  settledAt: string;
  recordedById: string;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type AdminRecordPayoutBatchSettlementPayload = {
  status?: AdminPayoutBatchSettlementStatus;
  amount?: number;
  feeAmount?: number;
  providerReference?: string;
  settledAt?: string;
  note?: string;
  metadata?: Record<string, unknown>;
};

export type AdminPayoutBatchSettlementResult = {
  batch: AdminPayoutBatch;
  settlement: AdminPayoutBatchSettlement;
  reconciliation: AdminPayoutBatchReconciliation;
};

export type AdminImportPayoutBatchSettlementPayload = {
  importText: string;
  providerName?: string;
  metadata?: Record<string, unknown>;
};

export type AdminPayoutBatchSettlementImportSummary = {
  rowCount: number;
  matched: boolean;
  matchedRow: Record<string, unknown>;
  unmatchedRows: Array<Record<string, unknown>>;
};

export type AdminPayoutBatchSettlementImportResult = AdminPayoutBatchSettlementResult & {
  importSummary: AdminPayoutBatchSettlementImportSummary;
};

export type AdminStripeReadinessCheck = {
  key: string;
  label: string;
  required: boolean;
  configured: boolean;
  status: 'pass' | 'warn' | 'fail' | string;
  detail: string;
};

export type AdminStripeProviderReadiness = {
  provider: string;
  status: 'ready' | 'blocked' | string;
  ready: boolean;
  environment: string;
  accountMode: 'missing' | 'test' | 'live' | 'configured' | string;
  webhookPath: string;
  webhookSecretRequired: boolean;
  webhookSecretConfigured: boolean;
  missingRequired: string[];
  checklist: AdminStripeReadinessCheck[];
};

export type AdminStripeWebhookHealth = {
  generatedAt: string;
  status: 'healthy' | 'attention' | 'critical' | string;
  providerReadiness: AdminStripeProviderReadiness;
  totals: {
    alertCount: number;
    unprocessedWebhookCount: number;
    unmatchedPayoutEventCount: number;
    payoutDriftCount: number;
  };
  alerts: Array<Record<string, unknown>>;
  recentWebhookEvents: Array<Record<string, unknown>>;
  payoutDrift: Array<Record<string, unknown>>;
};

export type AdminCreatePayoutBatchPayload = {
  method?: string;
  scheduledAt?: string;
  payoutRequestIds?: string[];
  metadata?: Record<string, unknown>;
};

export type AdminUpdatePayoutBatchStatusPayload = {
  status: AdminPayoutBatchStatus;
  processedAt?: string;
  metadata?: Record<string, unknown>;
};

export type AdminBookingProviderReadiness = {
  provider?: string;
  providerName?: string;
  providerConfigStatus?: string;
  webhookSecretConfigured?: boolean;
  webhookPath?: string;
  callbackHeader?: string;
  expiresAtField?: string;
  callbackUrl?: string | null;
  ready: boolean;
  checklist: Array<{
    key: string;
    label: string;
    ready: boolean;
    required: boolean;
  }>;
  remaining: string[];
};

export type AdminBookingLedgerRow = {
  id: string;
  type: string;
  direction: string;
  amount: number | string;
  platformAmount?: number | string | null;
  mistressAmount?: number | string | null;
  reason?: string | null;
  metadata?: Record<string, unknown> | null;
  senderUserId?: string | null;
  receiverUserId?: string | null;
  createdAt: string;
  sender?: AdminPanelUser | null;
  receiver?: AdminPanelUser | null;
};

export type AdminPpmReconciliationTotals = {
  rows: number;
  holdRows: number;
  refundRows: number;
  overageRows: number;
  holdTotal: number;
  refundTotal: number;
  overageTotal: number;
  netAdjustmentTotal: number;
  billableSecondsTotal: number;
};

export type AdminBookingReconciliation = {
  counts: {
    openDisputes: number;
    openRefundReviews: number;
    providerFollowUps: number;
    chargebackReviews: number;
    executedRefunds: number;
    refundAmountTotal: number;
    executedChargebackClawbacks: number;
    chargebackClawbackAmountTotal: number;
    receiptRows: number;
    ppmRows: number;
    ppmHoldRows: number;
    ppmRefundRows: number;
    ppmOverageRows: number;
    ppmHoldTotal: number;
    ppmRefundTotal: number;
    ppmOverageTotal: number;
    ppmNetAdjustmentTotal: number;
    ppmBillableSecondsTotal: number;
    bridgeConnected: number;
    bridgeExpired: number;
    providerNeedsConfig: number;
  };
  provider: {
    provider?: string;
    providerName?: string;
    providerConfigStatus?: string;
    webhookSecretConfigured?: boolean;
    webhookPath?: string;
  };
  providerReadiness?: AdminBookingProviderReadiness;
  bridgeCounts: Record<string, number>;
  reviews: AdminBookingReview[];
  refunds: Array<{
    id: string;
    type: string;
    direction: string;
    amount: number | string;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
    receiverUserId?: string | null;
    createdAt: string;
    receiver?: AdminPanelUser | null;
  }>;
  chargebackClawbacks: Array<{
    id: string;
    type: string;
    direction: string;
    amount: number | string;
    reason?: string | null;
    metadata?: Record<string, unknown> | null;
    senderUserId?: string | null;
    createdAt: string;
    sender?: AdminPanelUser | null;
  }>;
  receiptRows: AdminBookingLedgerRow[];
  ppmRows: AdminBookingLedgerRow[];
  ppmSummary: {
    totals: AdminPpmReconciliationTotals;
    bySessionKind: Array<AdminPpmReconciliationTotals & { sessionKind: string }>;
  };
  recentAuditLogs: Array<{
    id: string;
    action: string;
    targetId?: string | null;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    actor?: AdminPanelUser | null;
  }>;
};

export type AdminGiftsGoals = {
  counts: {
    giftDefinitions: number;
    activeGiftDefinitions: number;
    premiumGiftDefinitions: number;
    virtualGiftTransactions: number;
    virtualGiftGrossTotal: number;
    virtualGiftPlatformTotal: number;
    virtualGiftMistressTotal: number;
    goalFunds: number;
    activeGoalFunds: number;
    publicGoalFunds: number;
    goalContributions: number;
    goalGrossTotal: number;
    goalPlatformTotal: number;
    goalMistressTotal: number;
  };
  splitPolicy: {
    virtualGiftMistressPercent: number;
    virtualGiftPlatformPercent: number;
    goalMistressPercent: number;
    goalPlatformPercent: number;
  };
  giftDefinitions: Array<{
    id: string;
    name: string;
    emoji?: string | null;
    price: number | string;
    animation?: string | null;
    isActive: boolean;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    _count?: { ownedGifts: number };
  }>;
  giftTransactions: AdminBookingReconciliation['receiptRows'];
  goalFunds: Array<{
    id: string;
    title: string;
    description?: string | null;
    category: string;
    targetAmount: number | string;
    currentAmount: number | string;
    status: string;
    visibility: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    updatedAt: string;
    mistress?: AdminPanelUser | null;
    _count?: { contributions: number };
  }>;
  goalContributions: Array<{
    id: string;
    goalFundId: string;
    contributorUserId: string;
    amount: number | string;
    platformAmount: number | string;
    mistressAmount: number | string;
    message?: string | null;
    receiptNumber: string;
    metadata?: Record<string, unknown> | null;
    createdAt: string;
    contributor?: AdminPanelUser | null;
    goalFund?: {
      id: string;
      title: string;
      category: string;
      mistress?: AdminPanelUser | null;
    } | null;
  }>;
  goalTransactions: AdminBookingReconciliation['receiptRows'];
};

export type AdminStickerPack = {
  id: string;
  title: string;
  description?: string | null;
  theme?: string | null;
  price?: number | string | null;
  isActive: boolean;
  metadata?: unknown;
  createdAt: string;
  updatedAt: string;
  creator?: AdminPanelUser | null;
  items: Array<{
    id: string;
    stickerId: string;
    sortOrder: number;
    rarity: string;
    sticker?: {
      id: string;
      title: string;
      imageUrl: string;
      price?: number | string | null;
    } | null;
  }>;
  userProgress: Array<{
    id: string;
    userId: string;
    collectedCount: number;
    completedAt?: string | null;
    updatedAt: string;
  }>;
};

export type AdminMarketplaceWorld = 'STANDARD' | 'VENDING_MACHINE' | 'LAUNDRY_HAMPER' | 'MYSTERY_BOX' | 'PRIVATE_VAULT';

export type AdminMarketplaceApproval = {
  id: string;
  buyerId: string;
  productId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  buyer?: AdminPanelUser | null;
  product?: {
    id: string;
    title: string;
    price: number | string;
    world: AdminMarketplaceWorld;
    visibility: string;
    revealMode: string;
    requiresApproval: boolean;
    mistressId?: string | null;
    mistress?: AdminPanelUser | null;
  } | null;
};

export type AdminMarketplaceStoreReviewSummary = {
  queueCount: number;
  pendingApprovalCount: number;
  approvedPendingPaymentCount: number;
  fulfilmentQueueCount: number;
  inProgressCount: number;
  exceptionCount: number;
  grossCredits: number;
};

export type AdminMarketplaceWorlds = {
  summary: Array<{
    world: AdminMarketplaceWorld;
    _count: { _all: number };
    _sum: { stock?: number | null };
  }>;
  products: Array<{
    id: string;
    title: string;
    description?: string | null;
    price: number | string;
    type: string;
    world: AdminMarketplaceWorld;
    visibility: string;
    revealMode: string;
    requiresApproval: boolean;
    metadata?: unknown;
    stock: number;
    createdAt: string;
    updatedAt: string;
    mistress?: AdminPanelUser | null;
    orders: Array<{
      id: string;
      buyerId: string;
      status: string;
      createdAt: string;
    }>;
  }>;
  pendingApprovals: AdminMarketplaceApproval[];
  storeReviewQueue: AdminMarketplaceApproval[];
  storeReviewSummary: AdminMarketplaceStoreReviewSummary;
};

export type AdminComplianceOverview = {
  counts: {
    moderationOpen: number;
    moderationEscalated: number;
    bannedUsers: number;
    suspendedUsers: number;
  };
  recentAuditLogs: Array<{
    id: string;
    action: string;
    targetId?: string | null;
    metadata?: unknown;
    createdAt: string;
    actor?: AdminPanelUser | null;
  }>;
};

export type AdminModerationStatus = 'OPEN' | 'IN_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'DISMISSED';
export type AdminUserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING_VERIFICATION';
export type AdminLiveShowStatus = 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED';

export function listAdminModeration() {
  return apiRequest<AdminModerationItem[]>('/admin/moderation');
}

export function updateAdminModerationStatus(itemId: string, status: AdminModerationStatus) {
  return apiRequest<AdminModerationItem>(`/admin/moderation-actions/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateAdminUserStatus(userId: string, status: AdminUserStatus) {
  return apiRequest<AdminUser>(`/admin/user-actions/${encodeURIComponent(userId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function listAdminPlugins() {
  return apiRequest<AdminPlugin[]>('/admin/plugins');
}

export function createAdminPlugin(body: {
  id?: string;
  name: string;
  area: string;
  status: AdminPluginStatus;
  description?: string;
  marketplaceSettings: AdminPluginMarketplaceSettings;
}) {
  return apiRequest<AdminPlugin>('/admin/plugin-actions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdminPluginStatus(pluginId: string, status: AdminPluginStatus) {
  return apiRequest<AdminPlugin>(`/admin/plugin-actions/${encodeURIComponent(pluginId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function updateAdminPluginMarketplaceSettings(pluginId: string, marketplaceSettings: AdminPluginMarketplaceSettings) {
  return apiRequest<AdminPlugin>(`/admin/plugin-actions/${encodeURIComponent(pluginId)}/marketplace-settings`, {
    method: 'PATCH',
    body: JSON.stringify({ marketplaceSettings }),
  });
}

export function listAdminPluginSuggestions(filters: AdminPluginSuggestionFilters = {}) {
  const query = Object.entries(filters)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&');

  return apiRequest<AdminPluginSuggestionList>(`/admin/plugin-actions/suggestions${query ? `?${query}` : ''}`);
}

export function reviewAdminPluginSuggestion(
  suggestionId: string,
  body: {
    status: Exclude<AdminPluginSuggestionStatus, 'new'>;
    note?: string;
    assignedToUserId?: string;
    linkedPluginId?: string;
    grantEntitlement?: boolean;
  },
) {
  return apiRequest<{
    id: string;
    status: AdminPluginSuggestionStatus;
    reviewId: string;
    reviewedAt: string;
    linkedPluginId?: string | null;
    entitlementGranted?: boolean;
    entitlementId?: string | null;
    purchaseCharged?: boolean;
    walletTransactionId?: string | null;
    alreadyFulfilled?: boolean;
  }>(`/admin/plugin-actions/suggestions/${encodeURIComponent(suggestionId)}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function listAdminPpv() {
  return apiRequest<AdminPpvItem[]>('/admin/ppv');
}

export function updateAdminPpvActive(ppvId: string, isActive: boolean) {
  return apiRequest<AdminPpvItem>(`/admin/ppv-actions/${encodeURIComponent(ppvId)}/active`, {
    method: 'PATCH',
    body: JSON.stringify({ isActive }),
  });
}

export function listAdminLiveShows() {
  return apiRequest<AdminLiveShow[]>('/admin/live-shows');
}

export function updateAdminLiveShowStatus(showId: string, status: AdminLiveShowStatus) {
  return apiRequest<AdminLiveShow>(`/admin/live-show-actions/${encodeURIComponent(showId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function listAdminBookings() {
  return apiRequest<AdminBooking[]>('/admin/bookings');
}

function adminBookingReviewQuery(filters: AdminBookingReviewFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function listAdminBookingReviews(filters: AdminBookingReviewFilters = {}) {
  return apiRequest<AdminBookingReview[]>(`/admin/booking-reviews${adminBookingReviewQuery(filters)}`);
}

export function exportAdminBookingReviewsCsv(filters: AdminBookingReviewFilters = {}) {
  return apiTextRequest(`/admin/booking-reviews/export.csv${adminBookingReviewQuery(filters)}`);
}

export function getAdminBookingReviewDetail(reviewId: string) {
  return apiRequest<AdminBookingReviewDetail>(`/admin/booking-reviews/${encodeURIComponent(reviewId)}`);
}

export function updateAdminBookingReviewWorkflow(reviewId: string, body: AdminBookingReviewWorkflowPayload) {
  return apiRequest<AdminBookingReview>(`/admin/booking-reviews/${encodeURIComponent(reviewId)}/workflow`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function updateAdminBookingReviewWorkflowBatch(body: AdminBookingReviewBatchWorkflowPayload) {
  return apiRequest<AdminBookingReviewBatchWorkflowResult>('/admin/booking-reviews/batch/workflow', {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function listAdminBookingReviewBatchHistory(filters: AdminBookingReviewBatchHistoryFilters | number = 10) {
  const filterShape = typeof filters === 'number' ? { limit: filters } : filters;
  const params = new URLSearchParams();
  Object.entries(filterShape).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return apiRequest<AdminBookingReviewBatchHistory[]>(`/admin/booking-reviews/batches${query ? `?${query}` : ''}`);
}

export function exportAdminBookingReviewBatchPacket(batchId: string) {
  return apiTextRequest(`/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/export.json`);
}

export function getAdminBookingReviewBatchReplayDetail(batchId: string) {
  return apiRequest<AdminBookingReviewBatchReplayDetail>(`/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/replay-detail`);
}

export function exportAdminBookingReviewBatchReplayReportCsv(batchId: string) {
  return apiTextRequest(`/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/replay-report.csv`);
}

function bookingReviewBatchHistoryQuery(filters: AdminBookingReviewBatchHistoryFilters = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '' || value === 'ALL') return;
    params.set(key, String(value));
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export function exportAdminBookingReviewBatchReplayAlertsCsv(filters: AdminBookingReviewBatchHistoryFilters = {}) {
  return apiTextRequest(`/admin/booking-reviews/batches/replay-alerts.csv${bookingReviewBatchHistoryQuery(filters)}`);
}

export function exportAdminBookingReviewBatchReplayAlertHandoff(filters: AdminBookingReviewBatchHistoryFilters = {}) {
  return apiTextRequest(`/admin/booking-reviews/batches/replay-alert-handoff.json${bookingReviewBatchHistoryQuery(filters)}`);
}

export function handleAdminBookingReviewBatchReplayAlert(
  batchId: string,
  body: {
    action: 'ACKNOWLEDGE' | 'ESCALATE' | 'SCHEDULE_RETRY_REMINDER' | 'SNOOZE_RETRY_REMINDER' | 'CLEAR_RETRY_REMINDER';
    note?: string;
    assignedToId?: string;
    notifyOwner?: boolean;
    deliveryChannel?: string;
    reminderDueAt?: string;
    reminderOverdueThresholdHours?: number;
  },
) {
  return apiRequest<{
    alertAudit: AdminBookingReviewBatchHistory;
    ownerNotification?: { id?: string } | null;
    detail: AdminBookingReviewBatchReplayDetail;
  }>(
    `/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/replay-alert`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export function replayAdminBookingReviewBatch(batchId: string, body: Partial<AdminBookingReviewBatchWorkflowPayload> = {}) {
  return apiRequest<AdminBookingReviewBatchWorkflowResult>(`/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/replay`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function retryFailedAdminBookingReviewBatchRows(batchId: string, body: Partial<AdminBookingReviewBatchWorkflowPayload> = {}) {
  return apiRequest<AdminBookingReviewBatchWorkflowResult>(`/admin/booking-reviews/batches/${encodeURIComponent(batchId)}/retry-failed`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function exportAdminBookingReviewPacket(reviewId: string) {
  return apiTextRequest(`/admin/booking-reviews/${encodeURIComponent(reviewId)}/export.json`);
}

export function getAdminBookingReconciliation() {
  return apiRequest<AdminBookingReconciliation>('/admin/booking-reconciliation');
}

export function getAdminBookingProviderReadiness() {
  return apiRequest<AdminBookingProviderReadiness>('/admin/booking-bridge/provider-readiness');
}

export function openAdminBookingDispute(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/dispute`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function openAdminBookingRefundReview(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/refund-review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function openAdminBookingProviderFollowUp(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/provider-follow-up`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function openAdminBookingChargebackReview(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/chargeback-review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function executeAdminBookingChargebackClawback(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/execute-chargeback-clawback`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function executeAdminBookingRefund(bookingId: string, body: AdminBookingReviewPayload) {
  return apiRequest<AdminBookingActionResult>(`/admin/booking-actions/${encodeURIComponent(bookingId)}/execute-refund`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getAdminGiftsGoals() {
  return apiRequest<AdminGiftsGoals>('/admin/gifts-goals');
}

export function seedAdminPremiumGiftCatalogue() {
  return apiRequest<{ seeded: number }>('/gifts/premium-catalogue/seed', {
    method: 'POST',
  });
}

export function listAdminStickerPacks() {
  return apiRequest<AdminStickerPack[]>('/admin/sticker-packs');
}

export function getAdminMarketplaceWorlds() {
  return apiRequest<AdminMarketplaceWorlds>('/admin/marketplace-worlds');
}

export function getAdminComplianceOverview() {
  return apiRequest<AdminComplianceOverview>('/admin/compliance');
}

export function listAdminFinanceQueueDecisions() {
  return apiRequest<{ items: AdminFinanceQueueDecision[] }>('/earnings-vault/finance-queue-decisions');
}

export function createAdminFinanceQueueDecision(body: AdminFinanceQueueDecisionPayload) {
  return apiRequest<AdminFinanceQueueDecision>('/earnings-vault/finance-queue-decisions', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listAdminReserveHolds() {
  return apiRequest<{ items: AdminReserveHold[] }>('/earnings-vault/reserve-holds');
}

export function listAdminWishlistReservations() {
  return apiRequest<AdminWishlistReservation[]>('/wishlist/admin/reservations');
}

export function reviewAdminWishlistReservation(id: string, body: AdminWishlistReservationReviewPayload) {
  return apiRequest<AdminWishlistReservation>(`/wishlist/admin/reservations/${encodeURIComponent(id)}/review`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function expireStaleAdminWishlistReservations() {
  return apiRequest<AdminWishlistReservationSweepResult>('/wishlist/admin/reservations/expire-stale', {
    method: 'POST',
  });
}

export function releaseAdminReserveHold(id: string, body: AdminReserveHoldReleasePayload) {
  return apiRequest<AdminReserveHold>(`/earnings-vault/reserve-holds/${id}/release`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listAdminManualTopUpRequests() {
  return apiRequest<{ items: AdminManualTopUpRequest[] }>('/top-up-payment-options/admin/requests');
}

export function approveAdminManualTopUpRequest(id: string, body: AdminManualTopUpReviewPayload) {
  return apiRequest<AdminManualTopUpRequest>(`/top-up-payment-options/admin/requests/${id}/approve`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function rejectAdminManualTopUpRequest(id: string, body: AdminManualTopUpReviewPayload) {
  return apiRequest<AdminManualTopUpRequest>(`/top-up-payment-options/admin/requests/${id}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listAdminPayoutRequests() {
  return apiRequest<{ items: AdminPayoutRequest[] }>('/earnings-vault/payout-requests');
}

export function getAdminStripeWebhookHealth(limit = 20) {
  return apiRequest<AdminStripeWebhookHealth>(`/admin/payments/webhooks/stripe/health?limit=${encodeURIComponent(String(limit))}`);
}

export function approveAdminPayoutRequest(id: string, body: AdminPayoutDecisionPayload) {
  return apiRequest<AdminPayoutRequest>(`/earnings-vault/payout-requests/${encodeURIComponent(id)}/approve`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function rejectAdminPayoutRequest(id: string, body: AdminPayoutDecisionPayload) {
  return apiRequest<AdminPayoutRequest>(`/earnings-vault/payout-requests/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function markAdminPayoutRequestPaid(id: string, body: AdminPayoutDecisionPayload) {
  return apiRequest<AdminPayoutRequest>(`/earnings-vault/payout-requests/${encodeURIComponent(id)}/mark-paid`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function listAdminPayoutBatches() {
  return apiRequest<{ items: AdminPayoutBatch[] }>('/earnings-vault/payout-batches');
}

export function createAdminPayoutBatch(body: AdminCreatePayoutBatchPayload) {
  return apiRequest<AdminPayoutBatch>('/earnings-vault/payout-batches', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateAdminPayoutBatchStatus(batchId: string, body: AdminUpdatePayoutBatchStatusPayload) {
  return apiRequest<AdminPayoutBatch>(`/earnings-vault/payout-batches/${encodeURIComponent(batchId)}/status`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function exportAdminPayoutBatchCsv(batchId: string) {
  return apiTextRequest(`/earnings-vault/payout-batches/${encodeURIComponent(batchId)}/export.csv`);
}

export function getAdminPayoutBatchReconciliation(batchId: string) {
  return apiRequest<AdminPayoutBatchReconciliation>(`/earnings-vault/payout-batches/${encodeURIComponent(batchId)}/reconciliation`);
}

export function recordAdminPayoutBatchSettlement(batchId: string, body: AdminRecordPayoutBatchSettlementPayload) {
  return apiRequest<AdminPayoutBatchSettlementResult>(`/earnings-vault/payout-batches/${encodeURIComponent(batchId)}/settlement`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function importAdminPayoutBatchSettlement(batchId: string, body: AdminImportPayoutBatchSettlementPayload) {
  return apiRequest<AdminPayoutBatchSettlementImportResult>(`/earnings-vault/payout-batches/${encodeURIComponent(batchId)}/settlement/import`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
