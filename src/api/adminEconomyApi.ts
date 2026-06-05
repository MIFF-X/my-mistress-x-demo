import { apiRequest } from './apiClient';
import type {
  AdminCreatePayoutBatchPayload,
  AdminManualTopUpRequest,
  AdminPayoutBatch,
  AdminPayoutBatchReconciliation,
  AdminPayoutBatchSettlementResult,
  AdminPayoutDecisionPayload,
  AdminPayoutRequest,
  AdminRecordPayoutBatchSettlementPayload,
  AdminReserveHold,
} from './adminCommandApi';

export type AdminEconomyCheckStatus = 'PASS' | 'WARN' | 'FAIL' | string;
export type AdminEconomyMode = 'production' | 'scaffold_or_test' | string;
export type AdminEconomyReadinessStatus = 'READY_FOR_PROVIDER_TEST' | 'LOCAL_SCAFFOLD' | 'BLOCKED' | string;

export type AdminEconomyCheck = {
  key: string;
  status: AdminEconomyCheckStatus;
  detail: string;
};

export type AdminBankSummary = {
  contractPack: 'Headmistress Control Centre::Bank' | string;
  generatedAt: string;
  currency: string;
  totals: {
    topUpRequestCount: number;
    openTopUpReviewCount: number;
    payoutRequestCount: number;
    pendingPayoutCount: number;
    pendingCashoutAmount: number;
    payoutBatchCount: number;
    payoutBatchesNeedingReview: number;
    reserveHoldCount: number;
    heldReserveAmount: number;
    financeDecisionCount: number;
  };
  checks: AdminEconomyCheck[];
  routes: {
    topUps: string;
    payoutBatches: string;
    reserves: string;
    payoutHealth: string;
  };
};

export type AdminEconomyProviderCheck = {
  key: string;
  rail: 'top_up' | 'payout' | string;
  credentialConfigured: boolean;
  webhookSecretConfigured: boolean;
  productionReady: boolean;
  requiredEnv: string[];
  status: 'configured' | 'missing_deployment_secret' | string;
  detail: string;
};

export type AdminEconomyProviderReadiness = {
  contractPack: 'Headmistress Control Centre::Bank / Cash-In / Cash-Out' | string;
  generatedAt: string;
  mode: AdminEconomyMode;
  status: AdminEconomyReadinessStatus;
  webhookPolicy: {
    signatureRequiredInProduction: boolean;
    secretConfigured: boolean;
    acceptedSignatureHeaders: string[];
    acceptedTimestampHeaders: string[];
    toleranceSeconds: number;
    legacySecretAllowed: boolean;
  };
  summary: {
    providerChecks: number;
    configuredCount: number;
    missingCount: number;
    requiredManualReady: boolean;
  };
  checks: AdminEconomyCheck[];
  providers: AdminEconomyProviderCheck[];
  routes: {
    readiness: string;
    signedSettlementWebhook: string;
    adminSettlementWebhook: string;
  };
};

export type AdminPayoutHealth = {
  contractPack: 'Headmistress Control Centre::Cash-In / Cash-Out' | string;
  generatedAt: string;
  summary: {
    openPayoutRequests: number;
    readyForProviderBatches: number;
    settledBatches: number;
    batchesNeedingReview: number;
    reserveHoldCount: number;
    financeDecisionCount: number;
  };
  payoutRequests: AdminPayoutRequest[];
  batchHealth: AdminPayoutBatchReconciliation[];
  reserveHolds: AdminReserveHold[];
};

export type AdminEconomyPayoutReviewPayload = AdminPayoutDecisionPayload & {
  status?: 'APPROVED' | 'REJECTED' | 'PAID' | 'BATCHED' | 'APPROVE' | 'REJECT' | 'MARK_PAID' | string;
  action?: 'APPROVE' | 'REJECT' | 'MARK_PAID' | 'SETTLED' | string;
};

export function getAdminEconomyBankSummary() {
  return apiRequest<AdminBankSummary>('/admin/economy/bank');
}

export function listAdminEconomyReserves() {
  return apiRequest<{ items: AdminReserveHold[] }>('/admin/economy/reserves');
}

export function getAdminEconomyPayoutHealth() {
  return apiRequest<AdminPayoutHealth>('/admin/economy/payout-health');
}

export function getAdminEconomyProviderReadiness() {
  return apiRequest<AdminEconomyProviderReadiness>('/admin/economy/provider-readiness');
}

export function listAdminEconomyTopUps() {
  return apiRequest<{ items: AdminManualTopUpRequest[] }>('/admin/economy/top-ups');
}

export function createAdminEconomyPayoutBatch(body: AdminCreatePayoutBatchPayload) {
  return apiRequest<AdminPayoutBatch>('/admin/economy/payout-batches', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function recordAdminEconomyPayoutBatchProviderSettlement(
  batchId: string,
  body: AdminRecordPayoutBatchSettlementPayload,
) {
  return apiRequest<AdminPayoutBatchSettlementResult>(
    `/admin/economy/payout-batches/${encodeURIComponent(batchId)}/provider-settlement-webhook`,
    {
      method: 'POST',
      body: JSON.stringify(body),
    },
  );
}

export function reviewAdminEconomyPayout(payoutRequestId: string, body: AdminEconomyPayoutReviewPayload) {
  return apiRequest<AdminPayoutRequest>(`/admin/economy/payouts/${encodeURIComponent(payoutRequestId)}/review`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}
