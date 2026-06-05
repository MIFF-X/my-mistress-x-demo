import { getLatestLiveCategorySetup } from "./live-category-setup-store.js";
import { LIVE_LAUNCH_EVENT_TYPES, trackLiveLaunchEvent } from "./live-launch-analytics-store.js";
import { createLiveHubScreen } from "./live-hub-screen.js";
import { createLiveShow } from "../../../../../plugins/shared/communication/live-show-rooms/live-show.js";
import { ensureLiveSessionNavigationStyles, createLiveSessionTopBar } from "./live-session-navigation.js";

function ensureGoLiveHandoffStyles() {
  if (document.getElementById("live-go-live-handoff-styles")) return;

  const style = document.createElement("style");
  style.id = "live-go-live-handoff-styles";
  style.textContent = `
    .live-go-live-handoff-screen {
      padding: 20px;
    }

    .live-go-live-grid {
      display: grid;
      grid-template-columns: minmax(280px, 1fr) minmax(260px, 0.8fr);
      gap: 16px;
      margin-top: 16px;
    }

    .live-go-live-panel {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-go-live-summary {
      display: grid;
      gap: 8px;
      margin-top: 12px;
    }

    .live-go-live-summary div {
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      padding: 10px;
    }

    .live-go-live-summary strong {
      color: #d4af37;
    }

    .live-go-live-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 14px;
    }

    @media (max-width: 780px) {
      .live-go-live-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  document.head.appendChild(style);
}

function openScreen(factory) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(factory());
}

function createChecklistPanel(setup) {
  trackLiveLaunchEvent(LIVE_LAUNCH_EVENT_TYPES.LAUNCH_CHECKLIST_VIEWED, {
    setupId: setup?.id || null,
    category: setup?.categoryLabel || null
  });

  const panel = document.createElement("div");
  panel.className = "panel live-go-live-panel";
  panel.innerHTML = `
    <h3>Launch Checklist</h3>
    <div class="live-go-live-summary">
      <div><strong>Category:</strong> Confirm the show label and fallback category.</div>
      <div><strong>Layout:</strong> Confirm single, split, grid, or strip view.</div>
      <div><strong>Free Preview:</strong> Confirm preview minutes and tier rules.</div>
      <div><strong>Monetisation:</strong> Confirm gifts, requests, bookings, and join prompts.</div>
      <div><strong>Privacy:</strong> Confirm room visibility, location safety, and access rules.</div>
    </div>
  `;
  return panel;
}

export function createGoLiveHandoffScreen() {
  ensureGoLiveHandoffStyles();
  ensureLiveSessionNavigationStyles();

  const setup = getLatestLiveCategorySetup();

  trackLiveLaunchEvent(LIVE_LAUNCH_EVENT_TYPES.HANDOFF_VIEWED, {
    setupId: setup?.id || null,
    category: setup?.categoryLabel || null,
    hasDraft: Boolean(setup)
  });

  const shell = document.createElement("div");
  shell.className = "page-shell live-go-live-handoff-screen";

  const intro = document.createElement("p");
  intro.innerText = "Launch-prep screen for turning the latest saved setup draft into a live room.";

  const grid = document.createElement("div");
  grid.className = "live-go-live-grid";

  const panel = document.createElement("div");
  panel.className = "panel live-go-live-panel";

  if (!setup) {
    trackLiveLaunchEvent(LIVE_LAUNCH_EVENT_TYPES.NO_DRAFT_WARNING_SHOWN, {});
    panel.innerHTML = `
      <h3>No setup draft found</h3>
      <p>Save a room setup first, then return here to prepare the live handoff.</p>
    `;
  } else {
    panel.innerHTML = `
      <h3>Ready Setup</h3>
      <div class="live-go-live-summary">
        <div><strong>Room:</strong> ${setup.roomTitle}</div>
        <div><strong>Category:</strong> ${setup.categoryLabel}</div>
        <div><strong>Layout:</strong> ${setup.layoutLabel}</div>
        <div><strong>Free Preview:</strong> ${setup.freePreviewLabel}</div>
        <div><strong>Tier Rule:</strong> ${setup.tierPreview} gets ${setup.tierPreviewMinutes} min</div>
        <div><strong>Status:</strong> ${setup.status}</div>
      </div>
    `;
  }

  const actions = document.createElement("div");
  actions.className = "live-go-live-actions";

  const backBtn = document.createElement("button");
  backBtn.className = "button-secondary";
  backBtn.innerText = "Back to Hub";
  backBtn.onclick = () => openScreen(createLiveHubScreen);

  const launchBtn = document.createElement("button");
  launchBtn.className = setup ? "button-primary" : "button-secondary";
  launchBtn.innerText = setup ? "Enter Demo Live Room" : "No Draft to Launch";
  launchBtn.disabled = !setup;
  launchBtn.onclick = () => {
    if (!setup) return;

    trackLiveLaunchEvent(LIVE_LAUNCH_EVENT_TYPES.DEMO_LIVE_ENTERED, {
      setupId: setup.id,
      category: setup.categoryLabel,
      layout: setup.layoutLabel,
      freePreview: setup.freePreviewLabel
    });

    openScreen(() =>
      createLiveShow({
        room: {
          id: setup.id,
          title: setup.roomTitle,
          host: "Mistress X",
          status: "Draft launch",
          accessType: "public",
          viewers: 1,
          description: `${setup.categoryLabel} · ${setup.layoutLabel} · ${setup.freePreviewLabel}`
        }
      })
    );
  };

  actions.appendChild(backBtn);
  actions.appendChild(launchBtn);
  panel.appendChild(actions);

  grid.appendChild(panel);
  grid.appendChild(createChecklistPanel(setup));

  shell.appendChild(createLiveSessionTopBar("🚦 Go Live Handoff", createLiveHubScreen, "Live Hub"));
  shell.appendChild(intro);
  shell.appendChild(grid);

  return shell;
}
