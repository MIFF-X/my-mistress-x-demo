import { createLiveHubScreen } from "./live-hub-screen.js";

function openLiveHubScreen() {
  const app = document.getElementById("app");
  if (!app) return;

  app.innerHTML = "";
  app.appendChild(createLiveHubScreen());
}

function ensureLiveHubShortcutStyles() {
  if (document.getElementById("live-hub-shortcut-card-styles")) return;

  const style = document.createElement("style");
  style.id = "live-hub-shortcut-card-styles";
  style.textContent = `
    .live-hub-shortcut-card {
      border: 1px solid rgba(212, 175, 55, 0.28);
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.12), rgba(33, 21, 39, 0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0, 0, 0, 0.22);
    }

    .live-hub-shortcut-card h3 {
      margin-top: 0;
    }

    .live-hub-shortcut-card p {
      color: rgba(255, 255, 255, 0.72);
    }

    .live-hub-shortcut-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
  `;
  document.head.appendChild(style);
}

export function createLiveHubShortcutCard() {
  ensureLiveHubShortcutStyles();

  const card = document.createElement("div");
  card.className = "panel live-hub-shortcut-card";

  const title = document.createElement("h3");
  title.innerText = "👁 Live Hub";

  const copy = document.createElement("p");
  copy.innerText = "Open the combined live management hub for discovery, setup drafts, launch handoff, room previews, and local metrics.";

  const actions = document.createElement("div");
  actions.className = "live-hub-shortcut-actions";

  const button = document.createElement("button");
  button.className = "button-primary";
  button.type = "button";
  button.innerText = "Open Live Hub";
  button.onclick = openLiveHubScreen;

  actions.appendChild(button);

  card.appendChild(title);
  card.appendChild(copy);
  card.appendChild(actions);

  return card;
}
