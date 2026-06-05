import { createRolePicker } from "../../styles/dashboard/dashboard-role-picker.js";
import { punishmentStore } from "./punishment-store.js";
import { removePunishment } from "./apply-punishment.js";

export function createPunishmentsScreen() {
  const shell = document.createElement("div");
  shell.className = "page-shell";

  const topRow = document.createElement("div");
  topRow.className = "button-row";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "← Back";
  backBtn.onclick = () => {
    const app = document.getElementById("app");
    app.innerHTML = "";
    app.appendChild(createRolePicker());
  };

  topRow.appendChild(backBtn);

  const title = document.createElement("h2");
  title.innerText = "Punishments";

  const text = document.createElement("p");
  text.innerText = "Manage punishment presets, active restrictions, and history.";

  const presetsPanel = document.createElement("div");
  presetsPanel.className = "panel";

  const presetsTitle = document.createElement("h3");
  presetsTitle.innerText = "Punishment Presets";
  presetsPanel.appendChild(presetsTitle);

  punishmentStore.presets.forEach((preset) => {
    const item = document.createElement("div");
    item.className = "panel punishment-item";

    const name = document.createElement("h3");
    name.innerText = preset.name;

    const desc = document.createElement("p");
    desc.innerText = preset.description;

    const duration = document.createElement("p");
    duration.innerHTML = `<strong>Duration:</strong> ${preset.duration}`;

    const severity = document.createElement("p");
    severity.innerHTML = `<strong>Severity:</strong> ${preset.severity}`;

    item.appendChild(name);
    item.appendChild(desc);
    item.appendChild(duration);
    item.appendChild(severity);
    presetsPanel.appendChild(item);
  });

  const activePanel = document.createElement("div");
  activePanel.className = "panel";
  activePanel.innerHTML = "<h3>Active Punishments</h3>";

  if (punishmentStore.active.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No active punishments.";
    activePanel.appendChild(empty);
  } else {
    punishmentStore.active.forEach((entry) => {
      const item = document.createElement("div");
      item.className = "panel punishment-item";

      const name = document.createElement("h3");
      name.innerText = entry.presetName;

      const user = document.createElement("p");
      user.innerHTML = `<strong>User:</strong> ${entry.userName}`;

      const duration = document.createElement("p");
      duration.innerHTML = `<strong>Duration:</strong> ${entry.duration}`;

      const severity = document.createElement("p");
      severity.innerHTML = `<strong>Severity:</strong> ${entry.severity}`;

      const buttons = document.createElement("div");
      buttons.className = "button-row";
      const removeBtn = document.createElement("button");
      removeBtn.className = "button-secondary";
      removeBtn.innerText = "Remove";
      removeBtn.onclick = () => {
        removePunishment(entry.id);
        const app = document.getElementById("app");
        app.innerHTML = "";
        app.appendChild(createPunishmentsScreen());
      };
      buttons.appendChild(removeBtn);

      item.appendChild(name);
      item.appendChild(user);
      item.appendChild(duration);
      item.appendChild(severity);
      item.appendChild(buttons);
      activePanel.appendChild(item);
    });
  }

  const historyPanel = document.createElement("div");
  historyPanel.className = "panel";
  historyPanel.innerHTML = "<h3>Punishment History</h3>";

  if (punishmentStore.history.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No punishment history yet.";
    historyPanel.appendChild(empty);
  } else {
    punishmentStore.history.slice().reverse().forEach((entry) => {
      const row = document.createElement("div");
      row.className = "panel punishment-item";
      row.innerHTML = `<p><strong>${entry.type.toUpperCase()}</strong> — ${entry.presetName}</p><p><strong>User:</strong> ${entry.userName}</p><p><strong>Severity:</strong> ${entry.severity}</p><p><strong>Time:</strong> ${entry.timestamp}</p>`;
      historyPanel.appendChild(row);
    });
  }

  shell.appendChild(topRow);
  shell.appendChild(title);
  shell.appendChild(text);
  shell.appendChild(presetsPanel);
  shell.appendChild(activePanel);
  shell.appendChild(historyPanel);

  return shell;
}
