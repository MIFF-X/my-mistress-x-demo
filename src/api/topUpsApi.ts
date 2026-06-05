import { apiRequest } from './apiClient';

export type TopUpProvider =
  | 'card'
  | 'google_pay'
  | 'apple_pay'
  | 'payid'
  | 'manual_bank'
  | 'stripe_creator_monetization'
  | 'adult_friendly_processor'
  | string;

export type TopUpPurpose =
  | 'wallet_top_up'
  | 'subscription_upgrade'
  | 'room_access_unlock'
  | 'paid_entry_unlock'
  | 'tribute_unlock'
  | 'manual_adjustment'
  | string;

export type TopUpIntentStatus =
  | 'pending_manual_verification'
  | 'pending_provider'
  | 'credited'
  | 'confirmed'
  | 'failed'
  | 'cancelled'
  | string;

export type TopUpProviderMode = 'provider_confirmation' | 'manual_verification' | string;

export type CreateTopUpIntentInput = {
  amountCredits: number;
  provider: TopUpProvider;
  purpose?: TopUpPurpose;
  currency?: string;
  roomId?: string;
  roomKind?: string;
  requiredTier?: string;
  hostUserId?: string;
  returnTo?: string;
  metadataJson?: Record<string, unknown>;
};

export type ConfirmTopUpIntentInput = {
  providerReference?: string;
  status?: 'confirmed' | 'failed' | 'cancelled';
  metadataJson?: Record<string, unknown>;
};

export type TopUpIntent = {
  id: string;
  userId?: string;
  amountCredits: number;
  currency: string;
  provider: TopUpProvider;
  providerReference?: string;
  status: TopUpIntentStatus;
  purpose: TopUpPurpose;
  roomId?: string;
  roomKind?: string;
  requiredTier?: string;
  hostUserId?: string;
  returnTo?: string;
  walletTransactionId?: string;
  receiptId?: string;
  metadataJson?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type TopUpNextAction = {
  type: 'manual_verification_required' | 'provider_confirmation_required' | string;
  provider?: TopUpProvider;
  providerMode?: TopUpProviderMode;
  providerReference?: string;
  clientSecret?: string;
  redirectUrl?: string;
  instructions?: string;
  intentStatusUrl?: string;
  receiptUrl?: string;
  webhookUrl?: string;
  manualVerificationUrl?: string;
  returnTo?: string;
  resumeUrl?: string;
  resumeLabel?: string;
  amountCredits?: number;
  amountMinor?: number;
  currency?: string;
  expiresAt?: string;
  webhookTestPayload?: Record<string, unknown>;
};

export type TopUpIntentResponse = {
  intent: TopUpIntent;
  nextAction?: TopUpNextAction;
};

export type TopUpReceipt = {
  id: string;
  intentId: string;
  userId?: string;
  walletTransactionId?: string;
  amountCredits: number;
  currency: string;
  provider: TopUpProvider;
  providerReference?: string;
  status: string;
  metadataJson?: Record<string, unknown>;
  createdAt?: string;
};

export type TopUpReceiptResponse = {
  receipt: TopUpReceipt;
};

export type ManualTopUpVerificationInput = {
  intentId: string;
  paymentReference?: string;
  proofUrl?: string;
  notes?: string;
  metadataJson?: Record<string, unknown>;
};

export type ManualTopUpVerificationStatus = 'pending' | 'approved' | 'rejected' | string;

export type ManualTopUpVerification = {
  id: string;
  intentId: string;
  userId?: string;
  amountCredits: number;
  provider: TopUpProvider;
  paymentReference?: string;
  proofUrl?: string;
  notes?: string;
  status: ManualTopUpVerificationStatus;
  reviewedByUserId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  metadataJson?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type ManualTopUpVerificationResponse = {
  verification: ManualTopUpVerification;
};

export type ManualTopUpVerificationReviewInput = {
  reviewNotes?: string;
  metadataJson?: Record<string, unknown>;
};

export type ManualTopUpVerificationReviewResponse = {
  intent: TopUpIntent;
  verification: ManualTopUpVerification;
  receipt?: TopUpReceipt;
  alreadyCredited?: boolean;
};

export type ListManualTopUpVerificationsInput = {
  status?: ManualTopUpVerificationStatus;
  limit?: number;
};

export type ManualTopUpVerificationListResponse = {
  verifications: ManualTopUpVerification[];
};

export type TopUpProviderReadinessProvider = {
  provider: TopUpProvider;
  mode: TopUpProviderMode;
  configured: boolean;
  webhookSecretConfigured: boolean;
  signatureHeaders?: string[];
  timestampHeaders?: string[];
  status: string;
  [key: string]: unknown;
};

export type TopUpProviderReadinessCheck = {
  key: string;
  status: 'PASS' | 'WARN' | 'FAIL' | string;
  detail: string;
};

export type TopUpProviderReadiness = {
  contractPack: string;
  generatedAt: string;
  mode: 'production' | 'scaffold_or_test' | string;
  status: 'READY_FOR_SANDBOX' | 'LOCAL_SCAFFOLD' | 'BLOCKED' | string;
  summary: {
    providers: number;
    signedWebhookProviders: number;
    manualProviders: number;
    missingWebhookSecretProviders: number;
  };
  webhookPolicy: {
    signatureRequiredInProduction: boolean;
    acceptedSignatureHeaders: string[];
    acceptedTimestampHeaders: string[];
    toleranceSeconds: number;
  };
  checks: TopUpProviderReadinessCheck[];
  providers: TopUpProviderReadinessProvider[];
};

function manualVerificationQuery(input: ListManualTopUpVerificationsInput = {}) {
  const params = [
    input.status?.trim() ? `status=${encodeURIComponent(input.status.trim())}` : '',
    Number.isFinite(input.limit) ? `limit=${encodeURIComponent(String(input.limit))}` : '',
  ].filter(Boolean);

  return params.length ? `?${params.join('&')}` : '';
}

export function createTopUpIntent(input: CreateTopUpIntentInput) {
  return apiRequest<TopUpIntentResponse>('/top-ups/intents', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getTopUpIntent(intentId: string) {
  return apiRequest<{ intent: TopUpIntent }>(`/top-ups/intents/${encodeURIComponent(intentId)}`);
}

export function confirmTopUpIntent(intentId: string, input: ConfirmTopUpIntentInput = {}) {
  return apiRequest<{ intent: TopUpIntent; receipt?: TopUpReceipt; alreadyCredited?: boolean }>(
    `/top-ups/intents/${encodeURIComponent(intentId)}/confirm`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function createManualTopUpVerification(input: ManualTopUpVerificationInput) {
  return apiRequest<ManualTopUpVerificationResponse>('/top-ups/manual-verifications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listManualTopUpVerifications(input: ListManualTopUpVerificationsInput = {}) {
  return apiRequest<ManualTopUpVerificationListResponse>(
    `/top-ups/admin/manual-verifications${manualVerificationQuery(input)}`,
  );
}

export function approveManualTopUpVerification(
  verificationId: string,
  input: ManualTopUpVerificationReviewInput = {},
) {
  return apiRequest<ManualTopUpVerificationReviewResponse>(
    `/top-ups/admin/manual-verifications/${encodeURIComponent(verificationId)}/approve`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function rejectManualTopUpVerification(
  verificationId: string,
  input: ManualTopUpVerificationReviewInput = {},
) {
  return apiRequest<ManualTopUpVerificationReviewResponse>(
    `/top-ups/admin/manual-verifications/${encodeURIComponent(verificationId)}/reject`,
    {
      method: 'POST',
      body: JSON.stringify(input),
    },
  );
}

export function getTopUpReceipt(receiptId: string) {
  return apiRequest<TopUpReceiptResponse>(`/top-ups/receipts/${encodeURIComponent(receiptId)}`);
}

export function getTopUpReceiptForIntent(intentId: string) {
  return apiRequest<TopUpReceiptResponse>(`/top-ups/intents/${encodeURIComponent(intentId)}/receipt`);
}

export function getTopUpProviderReadiness() {
  return apiRequest<TopUpProviderReadiness>('/top-ups/admin/provider-readiness');
}
