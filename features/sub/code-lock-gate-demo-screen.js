import { createCodeLockGate } from "../../plugins/shared/code-lock/code-lock-gate.js";
import { getCodeLockSettings, listCodeLockSettings } from "../../plugins/shared/code-lock/code-lock-settings-store.js";

function ensureSubCodeLockGateDemoStyles() {
  if (document.getElementById("sub-code-lock-gate-demo-styles")) return;

  const style = document.createElement("style");
  style.id = "sub-code-lock-gate-demo-styles";
  style.textContent = `
    .sub-code-lock-gate-demo-screen {
      display: grid;
      gap: 14px;
    }

    .sub-code-lock-target-row {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      align-items: center;
    }

    .sub-code-lock-target-row input {
      flex: 1;
      min-width: 240px;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }

    .sub-code-lock-saved-targets {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `;
  document.head.appendChild(style);
}

export function createSubCodeLockGateDemoScreen() {
  ensureSubCodeLockGateDemoStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell sub-code-lock-gate-demo-screen";
  shell.style.padding = "20px";

  const title = document.createElement("h2");
  title.innerText = "Code Lock Gate";

  const intro = document.createElement("p");
  intro.innerText = "Enter a saved Code Lock target ID and test the Sub-side unlock gate. Paid attempts use the demo wallet until the real Top-Up Payment Options flow is plugged in.";

  const row = document.createElement("div");
  row.className = "sub-code-lock-target-row";

  const input = document.createElement("input");
  input.placeholder = "Target ID, e.g. custom:demo-code-lock";
  input.value = "custom:demo-code-lock";

  const loadBtn = document.createElement("button");
  loadBtn.className = "button-primary";
  loadBtn.innerText = "Load Gate";

  const savedTargets = document.createElement("div");
  savedTargets.className = "sub-code-lock-saved-targets";

  const gateSlot = document.createElement("div");
  const result = document.createElement("p");
  result.innerText = "Load a target to display the gate.";

  const renderGate = () => {
    const targetId = input.value.trim() || "custom:demo-code-lock";
    const settings = getCodeLockSettings(targetId);
    gateSlot.innerHTML = "";
    gateSlot.appendChild(
      createCodeLockGate({
        targetId,
        title: settings?.enabled ? `Locked: ${targetId}` : `Unlocked: ${targetId}`,
        onUnlocked: (unlockResult) => {
          result.innerText = `Unlocked: ${unlockResult.reason || "access granted"}`;
        },
      })
    );
  };

  const renderSavedTargets = () => {
    savedTargets.innerHTML = "";
    listCodeLockSettings().forEach((item) => {
      const button = document.createElement("button");
      button.className = "button-secondary";
      button.innerText = item.targetId;
      button.onclick = () => {
        input.value = item.targetId;
        renderGate();
      };
      savedTargets.appendChild(button);
    });
  };

  loadBtn.onclick = renderGate;

  row.appendChild(input);
  row.appendChild(loadBtn);

  renderSavedTargets();
  renderGate();

  shell.appendChild(title);
  shell.appendChild(intro);
  shell.appendChild(row);
  shell.appendChild(savedTargets);
  shell.appendChild(gateSlot);
  shell.appendChild(result);

  return shell;
}
