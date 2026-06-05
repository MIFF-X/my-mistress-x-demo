import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { mistressUtilityTiles } from "./mistress-utility-tiles.js";
import { createMistressQuickCheckTilePlaceholder } from "./mistress-quick-check-tile-placeholder.js";
import { createMistressQuickCheckLaneDetailPlaceholder } from "./mistress-quick-check-lane-detail-placeholder.js";
import { createMistressRolodexTilePlaceholder } from "./mistress-rolodex-tile-placeholder.js";
import { createMistressRolodexCardDetailPlaceholder } from "./mistress-rolodex-card-detail-placeholder.js";
import { createMistressBookingRequestsTilePlaceholder } from "./mistress-booking-requests-tile-placeholder.js";
import { createMistressPpvContentManagerPlaceholder } from "./mistress-ppv-content-manager-placeholder.js";
import { createMistressLiveRoomControlPlaceholder } from "./mistress-live-room-control-placeholder.js";
import { createMistressInventoryFulfilmentPlaceholder } from "./mistress-inventory-fulfilment-placeholder.js";
import { createMistressGamifyPanelPlaceholder } from "./mistress-gamify-panel-placeholder.js";

const utilityScreens = {
  "quick-check-zone": createMistressQuickCheckTilePlaceholder,
  "mistress-rolodex": createMistressRolodexTilePlaceholder,
  "booking-requests": createMistressBookingRequestsTilePlaceholder,
  "ppv-content-manager": createMistressPpvContentManagerPlaceholder,
  "live-room-control": createMistressLiveRoomControlPlaceholder,
  "inventory-fulfilment": createMistressInventoryFulfilmentPlaceholder,
  "gamify-panel": createMistressGamifyPanelPlaceholder,
};

const utilityDetailScreens = {
  "quick-check-zone": createMistressQuickCheckLaneDetailPlaceholder,
  "mistress-rolodex": createMistressRolodexCardDetailPlaceholder,
};

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function createUtilityCard(tile, openUtility, openDetail) {
  const details = document.createElement("div");
  details.className = "mx-utility-hub-details";

  const priority = document.createElement("span");
  priority.className = `mx-utility-hub-pill mx-utility-hub-pill--${tile.priority}`;
  priority.textContent = tile.priority;

  const status = document.createElement("span");
  status.className = `mx-utility-hub-pill mx-utility-hub-pill--${tile.status}`;
  status.textContent = tile.status.replaceAll("_", " ");

  const firstBuild = document.createElement("p");
  firstBuild.textContent = tile.firstBuild;

  details.appendChild(priority);
  details.appendChild(status);
  details.appendChild(firstBuild);

  const actions = [];
  if (utilityScreens[tile.id]) {
    actions.push(createButton({ label: "Open Tile", variant: "gold", onClick: () => openUtility(tile.id) }));
  }
  if (utilityDetailScreens[tile.id]) {
    actions.push(createButton({ label: "Detail Map", variant: "secondary", onClick: () => openDetail(tile.id) }));
  }
  if (!actions.length) {
    actions.push(createButton({ label: "Queued", variant: "ghost", disabled: true }));
  }

  return createCard({
    eyebrow: `Mistress Utility · ${tile.routeKey}`,
    title: tile.title,
    description: tile.description,
    icon: tile.icon,
    meta: tile.id,
    children: [details],
    actions,
  });
}

function appendHubStyles(shell) {
  const styles = document.createElement("style");
  styles.textContent = `
    .mx-utility-hub-details {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-utility-hub-details p {
      margin: var(--mx-space-2) 0 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-utility-hub-pill {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-utility-hub-pill--now,
    .mx-utility-hub-pill--scaffolded {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-utility-hub-pill--next,
    .mx-utility-hub-pill--planned {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-utility-hub-pill--later,
    .mx-utility-hub-pill--safety_gated {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);
}

export function createMistressUtilityHubPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  function renderHub() {
    shell.innerHTML = "";
    const byPriority = countBy(mistressUtilityTiles, "priority");
    const openableCount = mistressUtilityTiles.filter((tile) => utilityScreens[tile.id]).length;
    const detailCount = mistressUtilityTiles.filter((tile) => utilityDetailScreens[tile.id]).length;

    shell.appendChild(createCard({
      eyebrow: "Mistress Dashboard",
      title: "Utility Hub",
      description: "A launch pad for the first Mistress dashboard utility tiles. Every first-pass Mistress utility tile now has a dedicated safe placeholder screen.",
      icon: "👑",
    }));

    const stats = document.createElement("div");
    stats.className = "mx-grid mx-grid--cards";
    stats.appendChild(createStatCard({ label: "Utilities", value: String(mistressUtilityTiles.length), helper: "Mapped Mistress tiles", icon: "🧩", progress: 100 }));
    stats.appendChild(createStatCard({ label: "Openable", value: String(openableCount), helper: "Dedicated placeholder screens", icon: "🔗", progress: Math.round((openableCount / mistressUtilityTiles.length) * 100) }));
    stats.appendChild(createStatCard({ label: "Detail Maps", value: String(detailCount), helper: "Deeper utility rules", icon: "🗺️", progress: Math.round((detailCount / mistressUtilityTiles.length) * 100) }));
    stats.appendChild(createStatCard({ label: "Now", value: String(byPriority.now || 0), helper: "Highest priority", icon: "⚡", progress: 100 }));
    shell.appendChild(stats);

    const grid = document.createElement("div");
    grid.className = "mx-grid mx-grid--cards";
    mistressUtilityTiles.forEach((tile) => {
      grid.appendChild(createUtilityCard(tile, openUtility, openDetail));
    });
    shell.appendChild(grid);
    appendHubStyles(shell);
  }

  function openScreen(factory) {
    shell.innerHTML = "";
    const backRow = document.createElement("div");
    backRow.className = "mx-button-row";
    backRow.appendChild(createButton({ label: "Back to Utility Hub", variant: "secondary", onClick: renderHub }));
    shell.appendChild(backRow);
    shell.appendChild(factory());
  }

  function openUtility(tileId) {
    const factory = utilityScreens[tileId];
    if (factory) openScreen(factory);
  }

  function openDetail(tileId) {
    const factory = utilityDetailScreens[tileId];
    if (factory) openScreen(factory);
  }

  renderHub();
  return shell;
}
