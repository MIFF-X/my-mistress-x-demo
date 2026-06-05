import { paymentStore } from "./payment-store.js";

export function sendTribute(toUser, amount) {
  paymentStore.walletBalance -= amount;

  paymentStore.history.push({
    id: `${toUser.id}-${amount}-${Date.now()}`,
    type: "tribute",
    toUserId: toUser.id,
    toUserName: toUser.name,
    amount,
    timestamp: new Date().toLocaleString()
  });
}
