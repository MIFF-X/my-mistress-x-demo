import { paymentStore } from "./payment-store.js";

export function topUpWallet(amount) {
  paymentStore.walletBalance += amount;

  paymentStore.history.push({
    id: `topup-${amount}-${Date.now()}`,
    type: "topup",
    toUserId: null,
    toUserName: "Wallet Top Up",
    amount,
    timestamp: new Date().toLocaleString()
  });
}
