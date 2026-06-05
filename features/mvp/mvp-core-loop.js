import { paymentStore, spendCredits } from "../payments/payment-store";
import { createNotification } from "../notifications/notification-store";
import { updateSupporterSpend, updateCrownHolder } from "../positions/position-store";
import { unlockChat, sendMessage } from "../chat/chat-store";

export function sendGiftFlow({ subId, targetId, amount }) {
  const transaction = spendCredits({
    amount,
    source: "gift",
    subId,
    mistressId: targetId,
    label: "Gift"
  });

  updateSupporterSpend({ subId, mistressId: targetId, amount });
  const crown = updateCrownHolder(targetId);

  createNotification({
    userId: targetId,
    type: "gift",
    message: `Gift received: $${amount}`
  });

  return { transaction, crown };
}

export function unlockChatFlow({ subId, targetId, price }) {
  return unlockChat({
    subId,
    mistressId: targetId,
    price,
    spendCredits,
    notify: createNotification
  });
}

export function sendMessageFlow({ subId, targetId, text }) {
  return sendMessage({
    subId,
    mistressId: targetId,
    text,
    notify: createNotification
  });
}
