import {
  getCodeLockSettings,
  saveCodeLockSettings,
} from "./code-lock-settings-store.js";

const TARGET_TYPES = [
  { value: "room", label: "Room" },
  { value: "content", label: "Content" },
  { value: "mystery-box", label: "Mystery Box" },
  { value: "store-item", label: "Store Item" },
  { value: "game", label: "Game" },
  { value: "custom-access-gate", label: "Custom Access Gate" },
];

function createTextInput(value = "", placeholder = "") {
  const input = document.createElement("input");
  input.value = value;
  input.placeholder = placeholder;
  return input;
}

function createNumberInput(value = 0, placeholder = "0") {
  const input = document.createElement("input");
  input.type = "number";
  input.min = "0";
  input.value = String(value || 0);
  input.placeholder = placeholder;
  return input;
}

function createSelect(value) {
  const select = document.createElement("select");
  TARGET_TYPES.forEach((item) => {
    const option = document.createElement("option");
    option.value = item.value;
    option.innerText = item.label;
    option.selected = item.value === value;
    select.appendChild(option);
  });
  return select;
}

function createField(labelText, control) {
  const label = document.createElement("label");
  label.className = "code-lock-settings-field";
  const span = document.createElement("span");
  span.innerText = labelText;
  label.appendChild(span);
  label.appendChild(control);
  return label;
}

function ensureCodeLockSettingsStyles() {
  if (document.getElementById("code-lock-settings-panel-styles")) return;
  const style = document.createElement("style");
  style.id = "code-lock-settings-panel-styles";
  style.textContent = `
    .code-lock-settings-panel {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 18px;
      padding: 14px;
      background: rgba(255,255,255,0.04);
    }

    .code-lock-toggle-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }

    .code-lock-settings-grid {
      display: none;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .code-lock-settings-grid.is-visible {
      display: grid;
    }

    .code-lock-settings-field {
      display: flex;
      flex-direction: column;
      gap: 6px;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
    }

    .code-lock-settings-field input,
    .code-lock-settings-field select {
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 12px;
      background: #101016;
      color: white;
      padding: 10px;
    }

    .code-lock-settings-status {
      color: rgba(255,255,255,0.72);
      font-size: 13px;
      margin: 10px 0 0;
    }
  `;
  document.head.appendChild(style);
}

export function createCodeLockSettingsPanel({ targetId, targetType = "custom-access-gate", title = "Code Lock" } = {}) {
  ensureCodeLockSettingsStyles();
  const settings = getCodeLockSettings(targetId) || { enabled: false, targetType };

  const panel = document.createElement("div");
  panel.className = "code-lock-settings-panel";

  const toggleRow = document.createElement("div");
  toggleRow.className = "code-lock-toggle-row";

  const heading = document.createElement("h3");
  heading.innerText = title;

  const toggleLabel = document.createElement("label");
  toggleLabel.className = "code-lock-settings-field";
  const toggleText = document.createElement("span");
  toggleText.innerText = "Enable Code Lock";
  const toggle = document.createElement("input");
  toggle.type = "checkbox";
  toggle.checked = Boolean(settings.enabled);
  toggleLabel.appendChild(toggleText);
  toggleLabel.appendChild(toggle);

  toggleRow.appendChild(heading);
  toggleRow.appendChild(toggleLabel);

  const grid = document.createElement("div");
  grid.className = settings.enabled ? "code-lock-settings-grid is-visible" : "code-lock-settings-grid";

  const codeInput = createTextInput(settings.code || "", "Set access code");
  const hintInput = createTextInput(settings.hint || "", "Optional hint");
  const typeSelect = createSelect(settings.targetType || targetType);
  const paidToggle = document.createElement("input");
  paidToggle.type = "checkbox";
  paidToggle.checked = Boolean(settings.paidAttemptsEnabled);
  const costInput = createNumberInput(settings.attemptCostCredits || 0, "Attempt cost");
  const limitInput = createNumberInput(settings.attemptLimit || 0, "Attempt limit");

  grid.appendChild(createField("Code", codeInput));
  grid.appendChild(createField("Hint", hintInput));
  grid.appendChild(createField("Lock Target", typeSelect));
  grid.appendChild(createField("Paid Attempts", paidToggle));
  grid.appendChild(createField("Attempt Cost Credits", costInput));
  grid.appendChild(createField("Attempt Limit", limitInput));

  const saveBtn = document.createElement("button");
  saveBtn.className = "button-primary";
  saveBtn.innerText = "Save Code Lock Settings";

  const status = document.createElement("p");
  status.className = "code-lock-settings-status";
  status.innerText = settings.enabled ? "Code Lock is enabled." : "Code Lock is off.";

  toggle.onchange = () => {
    grid.className = toggle.checked ? "code-lock-settings-grid is-visible" : "code-lock-settings-grid";
    status.innerText = toggle.checked ? "Code settings are visible. Save to apply." : "Code Lock will be off after saving.";
  };

  saveBtn.onclick = () => {
    const saved = saveCodeLockSettings(targetId, {
      enabled: toggle.checked,
      code: codeInput.value,
      hint: hintInput.value,
      targetType: typeSelect.value,
      paidAttemptsEnabled: paidToggle.checked,
      attemptCostCredits: Number(costInput.value || 0),
      attemptLimit: Number(limitInput.value || 0),
    });
    status.innerText = saved.enabled ? "Code Lock settings saved and enabled." : "Code Lock settings saved as off.";
  };

  panel.appendChild(toggleRow);
  panel.appendChild(grid);
  panel.appendChild(saveBtn);
  panel.appendChild(status);
  return panel;
}
