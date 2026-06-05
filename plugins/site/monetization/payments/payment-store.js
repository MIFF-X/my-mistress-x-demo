export const paymentStore = {
  walletBalance: 250,
  platformRevenue: 0,
  mistressRevenue: 0,
  tributeOptions: [
    { id: 'gift-rose', label: 'Rose Gift', amount: 5, type: 'gift' },
    { id: 'gift-diamond', label: 'Diamond Gift', amount: 25, type: 'gift' },
    { id: 'chat-unlock', label: 'Unlock Chat', amount: 15, type: 'chat_unlock' },
    { id: 'tribute-10', label: '$10 Tribute', amount: 10, type: 'tribute' },
    { id: 'tribute-25', label: '$25 Tribute', amount: 25, type: 'tribute' },
    { id: 'tribute-50', label: '$50 Tribute', amount: 50, type: 'tribute' },
    { id: 'tribute-100', label: '$100 Tribute', amount: 100, type: 'tribute' },
  ],
  subscriptions: [
    { id: 's1', label: 'Weekly Tribute Plan', amount: 25, status: 'Available' },
    { id: 's2', label: 'Premium Supporter Plan', amount: 50, status: 'Available' },
  ],
  history: [],
};

export function canSpend(amount) {
  return Number(amount) > 0 && paymentStore.walletBalance >= Number(amount);
}

export function splitRevenue(amount, mistressPercent = 0.7) {
  const gross = Number(amount);
  const mistressAmount = Math.round(gross * mistressPercent * 100) / 100;
  const platformAmount = Math.round((gross - mistressAmount) * 100) / 100;

  return { gross, mistressAmount, platformAmount };
}

export function spendCredits({ amount, source, subId = 'demo-sub', mistressId = 'demo-mistress', label = 'Spend' }) {
  const gross = Number(amount);

  if (!canSpend(gross)) {
    throw new Error('Insufficient wallet balance');
  }

  const split = splitRevenue(gross);

  paymentStore.walletBalance = Math.round((paymentStore.walletBalance - gross) * 100) / 100;
  paymentStore.mistressRevenue = Math.round((paymentStore.mistressRevenue + split.mistressAmount) * 100) / 100;
  paymentStore.platformRevenue = Math.round((paymentStore.platformRevenue + split.platformAmount) * 100) / 100;

  const transaction = {
    id: `txn-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    type: source,
    source,
    subId,
    mistressId,
    label,
    amount: gross,
    mistressAmount: split.mistressAmount,
    platformAmount: split.platformAmount,
    timestamp: new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
  };

  paymentStore.history.unshift(transaction);

  return transaction;
}

export function topUpWallet(amount) {
  const value = Number(amount);

  if (!value || value <= 0) {
    throw new Error('Top up amount must be greater than zero');
  }

  paymentStore.walletBalance = Math.round((paymentStore.walletBalance + value) * 100) / 100;

  const transaction = {
    id: `topup-${Date.now()}`,
    type: 'topup',
    source: 'wallet_top_up',
    label: 'Wallet top up',
    toUserId: null,
    toUserName: 'Wallet Top Up',
    amount: value,
    mistressAmount: 0,
    platformAmount: 0,
    timestamp: new Date().toLocaleString(),
    createdAt: new Date().toISOString(),
  };

  paymentStore.history.unshift(transaction);
  return transaction;
}
