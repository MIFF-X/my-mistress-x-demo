import { createCodeLockSettingsPanel } from "../../plugins/shared/code-lock/code-lock-settings-panel.js";
import { listCodeLockSettings } from "../../plugins/shared/code-lock/code-lock-settings-store.js";

function ensureMistressCodeLockScreenStyles() {
  if (document.getElementById("mistress-code-lock-settings-screen-styles")) return;

  const style = document.createElement("style");
  style.id = "mistress-code-lock-settings-screen-styles";
  style.textContent = `
    .mistress-code-lock-settings-screen {
      display: grid;
      gap: 14px;
    }

    .code-lock-saved-list {
      display: grid;
      gap: 8px;
    }

    .code-lock-saved-card {
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 14px;
      padding: 10px;
      background: rgba(255, 255, 255, 0.04);
    }

    .code-lock-saved-card p {
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      margin: 6px 0 0;
    }
  `;
  document.head.appendChild(style);
}

function createSavedList() {
  const wrap = document.createElement("div");
  wrap.className = "panel code-lock-saved-list";

  const title = document.createElement("h3");
  title.innerText = "Saved Code Locks";
  wrap.appendChild(title);

  const settings = listCodeLockSettings();
  if (!settings.length) {
    const empty = document.createElement("p");
    empty.innerText = "No Code Lock settings saved yet.";
    wrap.appendChild(empty);
    return wrap;
  }

  settings.forEach((item) => {
    const card = document.createElement("div");
    card.className = "code-lock-saved-card";
    card.innerHTML = `
      <strong>${item.targetId}</strong>
      <p>${item.enabled ? "Enabled" : "Off"} · ${item.targetType || "custom"} · ${item.paidAttemptsEnabled ? `${item.attemptCostCredits || 0} credits/attempt` : "free attempts"}</p>
    `;
    wrap.appendChild(card);
  });

  return wrap;
}

export function createMistressCodeLockSettingsScreen() {
  ensureMistressCodeLockScreenStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell mistress-code-lock-settings-screen";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "Code Lock Settings";

  const intro = document.createElement("p");
  intro.innerText = "Create toggleable access codes for rooms, content, mystery boxes, store items, games, or custom access gates.";

  const targetInput = document.createElement("input");
  targetInput.placeholder = "Target ID, e.g. room:vip-aftercare or box:mystery-001";
  targetInput.value = "custom:demo-code-lock";
  targetInput.style.padding = "10px";
  targetInput.style.borderRadius = "12px";
  targetInput.style.background = "#101016";
  targetInput.style.color = "white";
  targetInput.style.border = "1px solid rgba(255,255,255,0.12)";

  const panelSlot = document.createElement("div");
  const listSlot = document.createElement("div");

  const render = () => {
    panelSlot.innerHTML = "";
    listSlot.innerHTML = "";
    panelSlot.appendChild(
      createCodeLockSettingsPanel({
        targetId: targetInput.value.trim() || "custom:demo-code-lock",
        title: "Mistress Code Lock",
        onSaved: render,
      })
    );
    listSlot.appendChild(createSavedList());
  };

  targetInput.onchange = render;
  render();

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(targetInput);
  shell.appendChild(panelSlot);
  shell.appendChild(listSlot);

  return shell;
}
