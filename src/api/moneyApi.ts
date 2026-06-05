import { apiRequest, apiTextRequest } from './apiClient';

export type EarningsVaultOption = {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  recommended?: boolean;
  requiresAdminApproval?: boolean;
};

export type EarningsVaultSummary = {
  pendingBalance?: number | string;
  availableBalance?: number | string;
  lifetimeEarnings?: number | string;
  reserveBalance?: number | string;
  minimumCashout?: number | string;
  currency?: string;
  nextPayoutDate?: string | null;
};

export type PayoutAccount = {
  id: string;
  userId?: string;
  provider: string;
  accountLabel?: string | null;
  isDefault?: boolean;
  isVerified?: boolean;
  maskedDestination?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type PayoutRequest = {
  id: string;
  userId?: string;
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
};

export type ReserveHold = {
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
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SavePayoutAccountInput = {
  provider: string;
  accountLabel?: string;
  bankAccountName?: string;
  bsb?: string;
  accountNumber?: string;
  payIdType?: string;
  payIdValue?: string;
  metadata?: Record<string, unknown>;
};

export type CreatePayoutRequestInput = {
  amount: number;
  currency?: string;
  payoutAccountId: string;
  note?: string;
};

export function getEarningsVaultOptions() {
  return apiRequest<{ items: EarningsVaultOption[] }>('/earnings-vault/options');
}

export function getEarningsVaultSummary() {
  return apiRequest<EarningsVaultSummary>('/earnings-vault/summary');
}

export function getEarningsVaultStatementCsv() {
  return apiTextRequest('/earnings-vault/statement.csv');
}

export function listPayoutAccounts() {
  return apiRequest<{ items: PayoutAccount[] }>('/earnings-vault/payout-accounts');
}

export function savePayoutAccount(input: SavePayoutAccountInput) {
  return apiRequest<PayoutAccount>('/earnings-vault/payout-accounts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listPayoutRequests() {
  return apiRequest<{ items: PayoutRequest[] }>('/earnings-vault/payout-requests');
}

export function createPayoutRequest(input: CreatePayoutRequestInput) {
  return apiRequest<PayoutRequest>('/earnings-vault/payout-requests', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listReserveHolds() {
  return apiRequest<{ items: ReserveHold[] }>('/earnings-vault/reserve-holds');
}
