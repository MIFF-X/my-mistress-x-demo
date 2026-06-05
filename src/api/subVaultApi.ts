import { apiRequest } from './apiClient';

export type SubVaultItemStatus = 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REVOKED';
export type SubVaultItemCategory =
  | 'IDENTITY_VERIFICATION'
  | 'AGE_VERIFICATION'
  | 'CONSENT_DOCUMENT'
  | 'TRIBUTE_RECEIPT'
  | 'CUSTOM_ATTESTATION';
export type SubVaultPolicyGuardSeverity = 'INFO' | 'CLEAR' | 'WARNING' | 'BLOCKED';

export type SubVaultPolicyGuardSnapshot = {
  id: string;
  label: string;
  status: string;
  detail: string;
  severity: SubVaultPolicyGuardSeverity;
  blocksShare?: boolean;
  blocksSubmit?: boolean;
  blocksReview?: boolean;
};

export type SubVaultAuditEntry = {
  id: string;
  itemId: string;
  actorUserId?: string;
  action: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type SubVaultItem = {
  id: string;
  ownerUserId: string;
  title: string;
  category: SubVaultItemCategory | string;
  redactedSummary?: string | null;
  evidenceRef?: string | null;
  status: SubVaultItemStatus | string;
  sharedWithUserIds: string[];
  consentGranted: boolean;
  consentVersion: string;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  revokedAt?: string;
  reviewedAt?: string;
  reviewedByUserId?: string;
  reviewNotes?: string;
  auditHistory?: SubVaultAuditEntry[];
  policyGuards?: SubVaultPolicyGuardSnapshot[];
};

export type SubVaultPolicyGuardRollup = {
  generatedAt: string;
  totals: {
    items: number;
    submitted: number;
    reviewWarning: number;
    shareBlocked: number;
    revoked: number;
  };
  byStatus: Record<SubVaultItemStatus, number>;
  items: SubVaultItem[];
};

export type CreateSubVaultItemInput = {
  title: string;
  category: SubVaultItemCategory;
  redactedSummary?: string;
  evidenceRef?: string;
  consentGranted: boolean;
};

export type SubVaultPolicyGuardHandoffInput = {
  label?: string;
  requestedAt?: string;
  source?: string;
  note?: string;
};

export function listMySubVaultItems() {
  return apiRequest<SubVaultItem[]>('/sub-vault/mine');
}

export function listSharedSubVaultItems() {
  return apiRequest<SubVaultItem[]>('/sub-vault/shared-with-me');
}

export function listSubVaultReviewQueue() {
  return apiRequest<SubVaultItem[]>('/sub-vault/review-queue');
}

export function listSubVaultPolicyGuardRollup() {
  return apiRequest<SubVaultPolicyGuardRollup>('/sub-vault/admin/policy-guard-rollup');
}

export function createSubVaultItem(input: CreateSubVaultItemInput) {
  return apiRequest<SubVaultItem>('/sub-vault/items', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function shareSubVaultItem(itemId: string, sharedWithUserIds: string[]) {
  return apiRequest<SubVaultItem>(`/sub-vault/items/${encodeURIComponent(itemId)}/share`, {
    method: 'PATCH',
    body: JSON.stringify({ sharedWithUserIds }),
  });
}

export function submitSubVaultItem(itemId: string) {
  return apiRequest<SubVaultItem>(`/sub-vault/items/${encodeURIComponent(itemId)}/submit`, {
    method: 'POST',
  });
}

export function revokeSubVaultItem(itemId: string) {
  return apiRequest<SubVaultItem>(`/sub-vault/items/${encodeURIComponent(itemId)}/revoke`, {
    method: 'POST',
  });
}

export function recordSubVaultPolicyGuardHandoff(itemId: string, input: SubVaultPolicyGuardHandoffInput) {
  return apiRequest<SubVaultItem>(`/sub-vault/items/${encodeURIComponent(itemId)}/policy-handoff`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function reviewSubVaultItem(itemId: string, decision: 'VERIFY' | 'REJECT', reviewNotes?: string) {
  return apiRequest<SubVaultItem>(`/sub-vault/items/${encodeURIComponent(itemId)}/review`, {
    method: 'POST',
    body: JSON.stringify({ decision, reviewNotes }),
  });
}
