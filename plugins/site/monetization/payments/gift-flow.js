import { spendCredits } from './payment-store.js';

export function sendGift({ giftId, label = 'Gift', amount, subId, mistressId }) {
  return spendCredits({
    amount,
    source: 'gift',
    subId,
    mistressId,
    label: `${label}${giftId ? ` (${giftId})` : ''}`,
  });
}

export const defaultGiftOptions = [
  { id: 'rose', label: 'Rose Gift', amount: 5 },
  { id: 'crown', label: 'Crown Gift', amount: 25 },
  { id: 'diamond', label: 'Diamond Gift', amount: 100 },
];
