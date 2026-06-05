import {
  getCodeLockSettings,
  validateCodeLockAttempt,
} from "./code-lock-settings-store.js";
import {
  chargeDemoWallet,
  getDemoWalletBalance,
} from "./code-lock-wallet.js";

function ensureCodeLockGateStyles() {
  if (document.getElementById("code-lock-gate-styles")) return;
  const style = document.createElement("style");
  style.id = "code-lock-gate-styles";
  style.textContent = `
    .code-lock-gate {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      padding: 14px;
      background: rgba(255,255,255,0.04);
    }

    .code-lock-gate.is-unlocked {
      border-color: rgba(29,158,117,0.36);
      background: rgba(29,158,117,0.08);
    }

    .code-lock-gate input {
      width: 100%;
      box-sizing: border-box;
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
      margin: 8px 0;
    }

    .code-lock-gate p {
      color: rgba(255,255,255,0.72);
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);
}

export function createCodeLockGate({
  targetId,
  title = "Code Locked",
  lockedMessage = "Enter the access code to unlock this item.",
  unlockedMessage = "Unlocked.",
  onUnlocked,
} = {}) {
  ensureCodeLockGateStyles();
  const settings = getCodeLockSettings(targetId);
  const gate = document.createElement("div");
  gate.className = "code-lock-gate";

  if (!settings?.enabled) {
    gate.classList.add("is-unlocked");
    const open = document.createElement("p");
    open.innerText = "Code Lock is off for this target.";
    gate.appendChild(open);
    if (onUnlocked) window.setTimeout(() => onUnlocked({ reason: "code-lock-disabled", settings }), 0);
    return gate;
  }

  const heading = document.createElement("h3");
  heading.innerText = title;

  const message = document.createElement("p");
  message.innerText = settings.hint ? `${lockedMessage} Hint: ${settings.hint}` : lockedMessage;

  const input = document.createElement("input");
  input.placeholder = "Enter code";
  input.autocomplete = "off";

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = settings.paidAttemptsEnabled
    ? `Unlock (${settings.attemptCostCredits || 0} credits/attempt)`
    : "Unlock";

  const status = document.createElement("p");
  status.innerText = settings.paidAttemptsEnabled
    ? `Wallet: ${getDemoWalletBalance()} credits.`
    : "Code attempts are free for this lock.";

  button.onclick = () => {
    if (settings.paidAttemptsEnabled && Number(settings.attemptCostCredits || 0) > 0) {
      const charged = chargeDemoWallet(Number(settings.attemptCostCredits || 0));
      if (!charged) {
        status.innerText = `Top-up needed. This attempt costs ${settings.attemptCostCredits} credits, wallet has ${getDemoWalletBalance()} credits.`;
        return;
      }
    }

    const result = validateCodeLockAttempt(targetId, input.value);
    if (!result.ok) {
      status.innerText = result.reason === "code-not-configured" ? "Code is not configured yet." : "Incorrect code.";
      return;
    }

    gate.classList.add("is-unlocked");
    status.innerText = unlockedMessage;
    if (onUnlocked) onUnlocked(result);
  };

  gate.appendChild(heading);
  gate.appendChild(message);
  gate.appendChild(input);
  gate.appendChild(button);
  gate.appendChild(status);
  return gate;
}
