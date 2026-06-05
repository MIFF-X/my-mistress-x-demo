import { apiRequest } from './apiClient';
import { createTopUpIntent } from './topUpsApi';
export type { TopUpIntentResponse } from './topUpsApi';

export type WalletBalanceResponse = {
  balance: number | string;
};

export type WalletTransaction = {
  id: string;
  type: string;
  direction: 'IN' | 'OUT';
  amount: number | string;
  platformAmount?: number | string;
  mistressAmount?: number | string;
  senderUserId?: string | null;
  receiverUserId?: string | null;
  reason?: string | null;
  description?: string | null;
  referenceType?: string | null;
  referenceId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
};

type WalletLedgerRow = Omit<WalletTransaction, 'direction'> & {
  direction?: unknown;
  description?: string | null;
};

type WalletLedgerResponse = WalletLedgerRow[] | {
  items?: WalletLedgerRow[];
};

export function getWalletBalance() {
  return apiRequest<WalletBalanceResponse>('/wallet');
}

export function topUpWallet(amount: number) {
  return createTopUpIntent({
    amountCredits: amount,
    provider: 'manual_bank',
    purpose: 'wallet_top_up',
    currency: 'AUD',
    metadataJson: {
      source: 'wallet_screen',
    },
  });
}

function normalizeWalletDirection(direction: unknown): 'IN' | 'OUT' {
  const value = String(direction || '').toUpperCase();
  return value === 'IN' || value === 'CREDIT' ? 'IN' : 'OUT';
}

function normalizeWalletTransaction(tx: WalletLedgerRow): WalletTransaction {
  return {
    ...tx,
    direction: normalizeWalletDirection(tx.direction),
    reason: tx.reason ?? tx.description ?? null,
  };
}

export async function listWalletTransactions() {
  const response = await apiRequest<WalletLedgerResponse>('/wallet/ledger');
  const rows = Array.isArray(response) ? response : response.items || [];
  return rows.map(normalizeWalletTransaction);
}
