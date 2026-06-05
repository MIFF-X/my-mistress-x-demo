import { getLatestLiveCategorySetup } from "./live-category-setup-store.js";
import { createGoLiveHandoffScreen } from "./live-go-live-handoff-screen.js";

function openScreen(factory) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(factory());
}

function ensureLatestSetupCardStyles() {
  if (document.getElementById("live-latest-setup-card-styles")) return;

  const style = document.createElement("style");
  style.id = "live-latest-setup-card-styles";
  style.textContent = `
    .live-latest-setup-card {
      border: 1px solid rgba(212,175,55,0.26);
      background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.22);
    }

    .live-latest-setup-card strong {
      color: #d4af37;
    }

    .live-latest-setup-card small {
      display: block;
      color: rgba(255,255,255,0.68);
      margin-top: 4px;
    }

    .live-latest-setup-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }
  `;
  document.head.appendChild(style);
}

export function createLiveLatestSetupCard() {
  ensureLatestSetupCardStyles();

  const setup = getLatestLiveCategorySetup();
  const card = document.createElement("div");
  card.className = "panel live-latest-setup-card";

  const title = document.createElement("h3");
  title.innerText = "🚦 Latest Setup Draft";

  const body = document.createElement("div");

  if (!setup) {
    body.innerHTML = `
      <p>No setup draft saved yet.</p>
      <small>Open Category Setup, choose a room category, preview rules, and save a draft.</small>
    `;
  } else {
    body.innerHTML = `
      <strong>${setup.roomTitle}</strong>
      <small>${setup.categoryLabel} · ${setup.layoutLabel}</small>
      <small>${setup.freePreviewLabel} · ${setup.tierPreview} preview: ${setup.tierPreviewMinutes} min</small>
      <small>Status: ${setup.status} · Updated: ${new Date(setup.updatedAt).toLocaleString()}</small>
    `;
  }

  const actions = document.createElement("div");
  actions.className = "live-latest-setup-actions";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "button-secondary";
  refreshBtn.type = "button";
  refreshBtn.innerText = "Refresh";
  refreshBtn.onclick = () => card.replaceWith(createLiveLatestSetupCard());

  const goLiveBtn = document.createElement("button");
  goLiveBtn.className = setup ? "button-primary" : "button-secondary";
  goLiveBtn.type = "button";
  goLiveBtn.innerText = setup ? "Prepare Go Live" : "No Draft Yet";
  goLiveBtn.disabled = !setup;
  goLiveBtn.onclick = () => {
    if (!setup) return;
    openScreen(createGoLiveHandoffScreen);
  };

  actions.appendChild(refreshBtn);
  actions.appendChild(goLiveBtn);

  card.appendChild(title);
  card.appendChild(body);
  card.appendChild(actions);

  return card;
}
