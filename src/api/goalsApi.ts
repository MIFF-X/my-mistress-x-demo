import { apiRequest, apiTextRequest } from './apiClient';

export type GoalFundUser = {
  id: string;
  username?: string | null;
  displayName?: string | null;
  role?: string | null;
  avatarUrl?: string | null;
};

export type GoalFund = {
  id: string;
  mistressUserId: string;
  title: string;
  description?: string | null;
  category: string;
  targetAmount: number | string;
  currentAmount: number | string;
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'ARCHIVED' | string;
  visibility: 'PUBLIC' | 'PRIVATE' | string;
  metadata?: Record<string, unknown> | null;
  createdAt?: string;
  updatedAt?: string;
  progressPercent?: number;
  estimatedMistressNet?: number;
  estimatedPlatformShare?: number;
  mistress?: GoalFundUser | null;
  _count?: {
    contributions?: number;
  };
};

export type GoalContributionReceipt = {
  id?: string;
  goalFundId?: string;
  contributorUserId?: string;
  amount: number | string;
  platformAmount: number | string;
  mistressAmount: number | string;
  message?: string | null;
  receiptNumber: string;
  createdAt?: string;
  metadata?: Record<string, unknown> | null;
  contributor?: GoalFundUser | null;
  goalFund?: {
    id: string;
    title: string;
    category: string;
    mistressUserId?: string;
    mistress?: GoalFundUser | null;
  } | null;
};

export type GoalContributionResponse = {
  contribution: GoalContributionReceipt;
  fund: GoalFund;
  receipt: {
    receiptNumber: string;
    grossAmount: number | string;
    platformAmount: number | string;
    mistressAmount: number | string;
    walletTransactionId?: string;
  };
};

export type CreateGoalFundPayload = {
  title: string;
  targetAmount: number;
  category?: string;
  description?: string;
  visibility?: 'PUBLIC' | 'PRIVATE';
  metadata?: Record<string, unknown>;
};

export function listPublicGoalFunds() {
  return apiRequest<GoalFund[]>('/goals/funds/public');
}

export function listMyGoalFunds() {
  return apiRequest<GoalFund[]>('/goals/funds/mine');
}

export function createGoalFund(body: CreateGoalFundPayload) {
  return apiRequest<GoalFund>('/goals/funds', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function activateGoalFund(fundId: string) {
  return apiRequest<GoalFund>(`/goals/funds/${encodeURIComponent(fundId)}/activate`, {
    method: 'POST',
  });
}

export function pauseGoalFund(fundId: string) {
  return apiRequest<GoalFund>(`/goals/funds/${encodeURIComponent(fundId)}/pause`, {
    method: 'POST',
  });
}

export function archiveGoalFund(fundId: string) {
  return apiRequest<GoalFund>(`/goals/funds/${encodeURIComponent(fundId)}/archive`, {
    method: 'POST',
  });
}

export function contributeGoalFund(fundId: string, amount: number, message?: string) {
  return apiRequest<GoalContributionResponse>(`/goals/funds/${encodeURIComponent(fundId)}/contribute`, {
    method: 'POST',
    body: JSON.stringify({ amount, message }),
  });
}

export function listGoalFundReceipts(fundId: string) {
  return apiRequest<GoalContributionReceipt[]>(`/goals/funds/${encodeURIComponent(fundId)}/receipts`);
}

export function listMyGoalFundReceipts() {
  return apiRequest<GoalContributionReceipt[]>('/goals/funds/receipts/mine');
}

export function exportMyGoalFundReceiptsCsv() {
  return apiTextRequest('/goals/funds/receipts/mine/export.csv');
}
