import { paymentStore } from "../payments/payment-store";
import { notificationStore, getUnreadCount } from "../notifications/notification-store";
import { positionStore } from "../positions/position-store";
import { chatStore } from "../chat/chat-store";
import { sendGiftFlow, unlockChatFlow, sendMessageFlow } from "./mvp-core-loop";

const DEMO_SUB_ID = "demo-sub";
const DEMO_TARGET_ID = "demo-mistress";

export function createMvpCoreLoopPanel() {
  const shell = document.createElement("section");
  shell.className = "mvp-core-loop-panel";
  shell.style.padding = "20px";
  shell.style.border = "1px solid rgba(255,255,255,0.12)";
  shell.style.borderRadius = "16px";
  shell.style.background = "#111827";
  shell.style.color = "white";
  shell.style.maxWidth = "760px";

  const render = () => {
    const convo = chatStore.conversations[`${DEMO_SUB_ID}-${DEMO_TARGET_ID}`];
    const crown = positionStore.positions.find(
      p => p.name === "Crown Holder" && p.mistressId === DEMO_TARGET_ID
    );

    shell.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:16px;align-items:flex-start;">
        <div>
          <h2 style="margin:0 0 6px;">MVP Core Loop</h2>
          <p style="margin:0;color:#cbd5e1;">Wallet → Gift → Chat Unlock → Message → Position → Notification</p>
        </div>
        <div style="text-align:right;">
          <strong>Wallet</strong><br />
          <span style="font-size:24px;color:#facc15;">$${paymentStore.walletBalance}</span>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0;">
        <div style="background:#1f2937;padding:12px;border-radius:12px;">
          <strong>Creator Revenue</strong><br />$${paymentStore.mistressRevenue}
        </div>
        <div style="background:#1f2937;padding:12px;border-radius:12px;">
          <strong>Platform Revenue</strong><br />$${paymentStore.platformRevenue}
        </div>
        <div style="background:#1f2937;padding:12px;border-radius:12px;">
          <strong>Unread</strong><br />${getUnreadCount(DEMO_TARGET_ID)}
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px;">
        <button data-action="gift" style="padding:10px 14px;border:0;border-radius:10px;background:#ec4899;color:white;cursor:pointer;">Send $10 Gift</button>
        <button data-action="unlock" style="padding:10px 14px;border:0;border-radius:10px;background:#8b5cf6;color:white;cursor:pointer;">Unlock Chat $15</button>
        <button data-action="message" style="padding:10px 14px;border:0;border-radius:10px;background:#06b6d4;color:white;cursor:pointer;">Send Message</button>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div style="background:#1f2937;padding:12px;border-radius:12px;">
          <h3 style="margin-top:0;">Position</h3>
          <p><strong>Crown Holder:</strong> ${crown?.holderId || "None yet"}</p>
          <p><strong>Value:</strong> $${crown?.value || 0}</p>
        </div>
        <div style="background:#1f2937;padding:12px;border-radius:12px;">
          <h3 style="margin-top:0;">Chat</h3>
          <p><strong>Status:</strong> ${convo?.isUnlocked ? "Unlocked" : "Locked"}</p>
          <p><strong>Messages:</strong> ${convo?.messages?.length || 0}</p>
        </div>
      </div>
    `;

    shell.querySelector('[data-action="gift"]').onclick = () => {
      try { sendGiftFlow({ subId: DEMO_SUB_ID, targetId: DEMO_TARGET_ID, amount: 10 }); } catch (error) { alert(error.message); }
      render();
    };

    shell.querySelector('[data-action="unlock"]').onclick = () => {
      try { unlockChatFlow({ subId: DEMO_SUB_ID, targetId: DEMO_TARGET_ID, price: 15 }); } catch (error) { alert(error.message); }
      render();
    };

    shell.querySelector('[data-action="message"]').onclick = () => {
      try { sendMessageFlow({ subId: DEMO_SUB_ID, targetId: DEMO_TARGET_ID, text: "MVP loop message sent." }); } catch (error) { alert(error.message); }
      render();
    };
  };

  render();
  return shell;
}
