import { createDiscoveryAnalyticsSummary } from "./discovery-analytics-summary.js";
import { createDiscoveryEventsLog } from "./discovery-events-log.js";
import { createDiscoveryShortcutCard } from "./discovery-shortcut-card.js";
import { createGoLiveHandoffScreen } from "./live-go-live-handoff-screen.js";
import { createLiveFunnelOverview } from "./live-funnel-overview.js";
import { createLiveLaunchAnalyticsSummary } from "./live-launch-analytics-summary.js";
import { createLiveLaunchEventsLog } from "./live-launch-events-log.js";
import { createLiveCategorySetupScreen } from "./live-category-setup-screen.js";
import { createLiveCategorySetupsList } from "./live-category-setups-list.js";
import { createLiveLatestSetupCard } from "./live-latest-setup-card.js";
import { createLiveRoomsLobby } from "../../../../../plugins/shared/communication/live-show-rooms/live-rooms.js";
import { ensureLiveSessionNavigationStyles, createLiveSessionTopBar } from "./live-session-navigation.js";
import { FREE_PREVIEW_OPTIONS, LIVE_LAYOUT_OPTIONS, LIVE_SHOW_CATEGORIES, TIER_PREVIEW_OPTIONS } from "./live-show-categories.js";

function createInfoPill(label) {
  const pill = document.createElement("span");
  pill.className = "live-hub-pill";
  pill.innerText = label;
  return pill;
}

function openScreen(factory) {
  const app = document.getElementById("app");
  app.innerHTML = "";
  app.appendChild(factory());
}

function createSetupShortcutCard() {
  const card = document.createElement("div");
  card.className = "panel live-hub-panel";

  const title = document.createElement("h3");
  title.innerText = "⚙️ Category Setup";

  const copy = document.createElement("p");
  copy.innerText = "Prepare a room title, category, custom fallback label, viewing layout, free preview, and tier-preview rule before going live.";

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Open Setup";
  button.onclick = () => openScreen(createLiveCategorySetupScreen);

  card.appendChild(title);
  card.appendChild(copy);
  card.appendChild(button);
  return card;
}

function createGoLiveShortcutCard() {
  const card = document.createElement("div");
  card.className = "panel live-hub-panel";

  const title = document.createElement("h3");
  title.innerText = "🚦 Go Live Handoff";

  const copy = document.createElement("p");
  copy.innerText = "Review the latest saved setup, check launch readiness, and enter the demo live room handoff.";

  const button = document.createElement("button");
  button.className = "button-primary";
  button.innerText = "Prepare Go Live";
  button.onclick = () => openScreen(createGoLiveHandoffScreen);

  card.appendChild(title);
  card.appendChild(copy);
  card.appendChild(button);
  return card;
}

function createListPanel(title, items, getLabel) {
  const panel = document.createElement("div");
  panel.className = "panel live-hub-panel";

  const heading = document.createElement("h3");
  heading.innerText = title;

  const list = document.createElement("div");
  list.className = "live-hub-pill-list";
  items.forEach((item) => list.appendChild(createInfoPill(getLabel(item))));

  panel.appendChild(heading);
  panel.appendChild(list);
  return panel;
}

function ensureLiveHubStyles() {
  if (document.getElementById("live-hub-screen-styles")) return;

  const style = document.createElement("style");
  style.id = "live-hub-screen-styles";
  style.textContent = `
    .live-hub-screen {
      padding: 20px;
    }

    .live-hub-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 16px;
      margin-top: 16px;
    }

    .live-hub-panel {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-hub-pill-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
    }

    .live-hub-pill {
      border: 1px solid rgba(255,255,255,0.12);
      background: rgba(255,255,255,0.06);
      color: rgba(255,255,255,0.78);
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 12px;
      font-weight: 800;
    }

    .live-hub-inline-preview {
      margin-top: 16px;
      border-top: 1px solid rgba(255,255,255,0.1);
      padding-top: 16px;
    }
  `;
  document.head.appendChild(style);
}

export function createLiveHubScreen() {
  ensureLiveHubStyles();
  ensureLiveSessionNavigationStyles();

  const shell = document.createElement("div");
  shell.className = "page-shell live-hub-screen";

  const intro = document.createElement("p");
  intro.innerText = "Combined starter hub for live rooms, discovery previews, categories, layout options, free-preview settings, saved setup drafts, and discovery funnel analytics.";

  const grid = document.createElement("div");
  grid.className = "live-hub-grid";

  grid.appendChild(createLiveFunnelOverview());
  grid.appendChild(createDiscoveryShortcutCard());
  grid.appendChild(createSetupShortcutCard());
  grid.appendChild(createGoLiveShortcutCard());
  grid.appendChild(createLiveLatestSetupCard());
  grid.appendChild(createLiveCategorySetupsList());
  grid.appendChild(createDiscoveryAnalyticsSummary());
  grid.appendChild(createLiveLaunchAnalyticsSummary());
  grid.appendChild(createDiscoveryEventsLog());
  grid.appendChild(createLiveLaunchEventsLog());
  grid.appendChild(createListPanel("Live Categories", LIVE_SHOW_CATEGORIES, (item) => item.label));
  grid.appendChild(createListPanel("Viewing Layouts", LIVE_LAYOUT_OPTIONS, (item) => item.label));
  grid.appendChild(createListPanel("Free Preview Options", FREE_PREVIEW_OPTIONS, (item) => item.label));
  grid.appendChild(createListPanel("Tier Preview Minutes", TIER_PREVIEW_OPTIONS, (item) => `${item.tier}: ${item.minutes} min`));

  const inlinePreview = document.createElement("div");
  inlinePreview.className = "live-hub-inline-preview";
  inlinePreview.appendChild(createLiveRoomsLobby());

  shell.appendChild(createLiveSessionTopBar("👁 Live Hub", createLiveRoomsLobby, "Live Rooms"));
  shell.appendChild(intro);
  shell.appendChild(grid);
  shell.appendChild(inlinePreview);

  return shell;
}
