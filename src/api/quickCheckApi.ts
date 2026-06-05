import { apiRequest } from './apiClient';

export type QuickCheckIntakeKind = 'CONFESSION' | 'AFFIRMATION' | 'SECRET' | 'CUSTOM_REQUEST';
export type QuickCheckIntakeStatus = 'NEW' | 'IN_REVIEW' | 'RESOLVED' | 'DISMISSED';
export type QuickCheckPolicyGuardSeverity = 'INFO' | 'CLEAR' | 'WARNING' | 'BLOCKED' | 'ESCALATED';

export type QuickCheckPolicyGuardSnapshot = {
  id: string;
  label: string;
  status: string;
  detail: string;
  severity: QuickCheckPolicyGuardSeverity;
  blocksClosure?: boolean;
  reasons?: string[];
};

export type QuickCheckIntakeAuditEntry = {
  id: string;
  itemId: string;
  actorUserId?: string;
  action: string;
  fromStatus?: QuickCheckIntakeStatus;
  toStatus?: QuickCheckIntakeStatus;
  note?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

export type QuickCheckIntakeItem = {
  id: string;
  kind: QuickCheckIntakeKind;
  status: QuickCheckIntakeStatus;
  requesterUserId: string;
  hostUserId: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
  reviewNote?: string;
  reviewedByUserId?: string;
  reviewedAt?: string;
  auditHistory?: QuickCheckIntakeAuditEntry[];
  policyGuards?: QuickCheckPolicyGuardSnapshot[];
  createdAt: string;
  updatedAt: string;
};

export type QuickCheckPolicyGuardRollup = {
  generatedAt: string;
  totals: {
    items: number;
    guardedOpen: number;
    closureBlocked: number;
    unsafeTerm: number;
    escalated: number;
  };
  byKind: Record<QuickCheckIntakeKind, number>;
  items: QuickCheckIntakeItem[];
};

export type CreateQuickCheckIntakeInput = {
  hostUserId: string;
  kind: QuickCheckIntakeKind;
  title?: string;
  message: string;
  metadata?: Record<string, unknown>;
};

export type ReviewQuickCheckIntakeInput = {
  status: QuickCheckIntakeStatus;
  reviewNote?: string;
};

export type QuickCheckPolicyGuardHandoffInput = {
  label?: string;
  requestedAt?: string;
  source?: string;
  note?: string;
};

export function createQuickCheckIntake(input: CreateQuickCheckIntakeInput) {
  return apiRequest<QuickCheckIntakeItem>('/quick-check/intake', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function listHostQuickCheckIntake(includeClosed = false) {
  const query = includeClosed ? '?includeClosed=true' : '';
  return apiRequest<QuickCheckIntakeItem[]>(`/quick-check/intake/host${query}`);
}

export function listAdminQuickCheckReviewQueue(includeClosed = false) {
  const query = includeClosed ? '?includeClosed=true' : '';
  return apiRequest<QuickCheckIntakeItem[]>(`/quick-check/intake/admin/review-queue${query}`);
}

export function listMyQuickCheckIntake() {
  return apiRequest<QuickCheckIntakeItem[]>('/quick-check/intake/mine');
}

export function listQuickCheckPolicyGuardRollup() {
  return apiRequest<QuickCheckPolicyGuardRollup>('/quick-check/intake/admin/policy-guard-rollup');
}

export function reviewQuickCheckIntake(itemId: string, input: ReviewQuickCheckIntakeInput) {
  return apiRequest<QuickCheckIntakeItem>(`/quick-check/intake/${encodeURIComponent(itemId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function recordQuickCheckPolicyGuardHandoff(itemId: string, input: QuickCheckPolicyGuardHandoffInput) {
  return apiRequest<QuickCheckIntakeItem>(`/quick-check/intake/${encodeURIComponent(itemId)}/policy-handoff`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
