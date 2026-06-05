import { paymentStore } from "../payments/payment-store";
import { notificationStore } from "../notifications/notification-store";
import { positionStore } from "../positions/position-store";
import { chatStore } from "../chat/chat-store";
import { sendGiftFlow, unlockChatFlow, sendMessageFlow } from "./mvp-core-loop";

const demoSubId = "demo-sub";
const demoTargetId = "demo-mistress";

export function createMvpLoopPanel() {
  const shell = document.createElement("section");
  shell.className = "mvp-loop-panel";

  render(shell);
  return shell;
}

function render(shell) {
  const convoId = `${demoSubId}-${demoTargetId}`;
  const convo = chatStore.conversations[convoId];
  const crown = positionStore.positions.find(
    item => item.name === "Crown Holder" && item.mistressId === demoTargetId
  );

  shell.innerHTML = `
    <div class="mvp-card">
      <div class="mvp-header">
        <div>
          <p class="mvp-eyebrow">MVP Core Loop</p>
          <h2>Wallet → Gift → Chat → Position → Notification</h2>
        </div>
        <div class="mvp-balance">Wallet: $${paymentStore.walletBalance}</div>
      </div>

      <div class="mvp-grid">
        <div class="mvp-box">
          <h3>Send Gift</h3>
          <p>Deducts wallet, records revenue split, updates supporter spend and Crown Holder.</p>
          <button id="mvp-send-gift" class="button-primary">Send $10 Gift</button>
        </div>

        <div class="mvp-box">
          <h3>Unlock Chat</h3>
          <p>Charges the sub wallet and opens the conversation.</p>
          <button id="mvp-unlock-chat" class="button-secondary">Unlock Chat ($15)</button>
        </div>

        <div class="mvp-box">
          <h3>Message</h3>
          <p>Only works after paid unlock.</p>
          <input id="mvp-message-input" placeholder="Type test message" value="Hello Mistress" />
          <button id="mvp-send-message" class="button-secondary">Send Message</button>
        </div>
      </div>

      <div class="mvp-status-grid">
        <div class="mvp-status">
          <strong>Crown Holder</strong>
          <span>${crown?.holderId || "None yet"} ${crown?.value ? `($${crown.value})` : ""}</span>
        </div>
        <div class="mvp-status">
          <strong>Chat Status</strong>
          <span>${convo?.isUnlocked ? "Unlocked" : "Locked"}</span>
        </div>
        <div class="mvp-status">
          <strong>Platform Revenue</strong>
          <span>$${paymentStore.platformRevenue}</span>
        </div>
        <div class="mvp-status">
          <strong>Mistress Revenue</strong>
          <span>$${paymentStore.mistressRevenue}</span>
        </div>
      </div>

      <div class="mvp-log-grid">
        <div>
          <h3>Messages</h3>
          <div class="mvp-log">
            ${(convo?.messages || []).map(msg => `<p>${msg.text}</p>`).join("") || "<p>No messages yet.</p>"}
          </div>
        </div>
        <div>
          <h3>Notifications</h3>
          <div class="mvp-log">
            ${notificationStore.list.map(item => `<p>${item.type}: ${item.message}</p>`).join("") || "<p>No notifications yet.</p>"}
          </div>
        </div>
      </div>
    </div>
  `;

  shell.querySelector("#mvp-send-gift").onclick = () => {
    sendGiftFlow({ subId: demoSubId, targetId: demoTargetId, amount: 10 });
    render(shell);
  };

  shell.querySelector("#mvp-unlock-chat").onclick = () => {
    unlockChatFlow({ subId: demoSubId, targetId: demoTargetId, price: 15 });
    render(shell);
  };

  shell.querySelector("#mvp-send-message").onclick = () => {
    const input = shell.querySelector("#mvp-message-input");
    try {
      sendMessageFlow({ subId: demoSubId, targetId: demoTargetId, text: input.value || "Hello" });
    } catch (error) {
      alert(error.message);
    }
    render(shell);
  };
}
