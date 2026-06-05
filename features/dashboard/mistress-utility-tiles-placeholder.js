import { createCard, createStatCard } from "../ui/card.js";
import { mistressUtilityTiles } from "./mistress-utility-tiles.js";

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function createTileGrid(tiles) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  tiles.forEach((tile) => {
    const detail = document.createElement("div");
    detail.className = "mx-mistress-utility-detail";
    detail.innerHTML = `
      <span class="mx-mistress-utility-pill mx-mistress-utility-pill--${tile.priority}">${tile.priority}</span>
      <span class="mx-mistress-utility-pill mx-mistress-utility-pill--${tile.status}">${tile.status.replaceAll("_", " ")}</span>
      <p><strong>First build:</strong> ${tile.firstBuild}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: `Mistress Utility · ${tile.routeKey}`,
      title: tile.title,
      description: tile.description,
      icon: tile.icon,
      meta: tile.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressUtilityTilesPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const byPriority = countBy(mistressUtilityTiles, "priority");
  const byStatus = countBy(mistressUtilityTiles, "status");

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard",
    title: "Utility Tiles",
    description: "The first visible operating tiles for the Mistress Dashboard. This moves the architecture pass into actual daily-use dashboard surfaces.",
    icon: "👑",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Utility Tiles", value: String(mistressUtilityTiles.length), helper: "First Mistress control tiles", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Now", value: String(byPriority.now || 0), helper: "Immediate build priority", icon: "⚡", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Next", value: String(byPriority.next || 0), helper: "Second-pass utilities", icon: "➡️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Safety Gated", value: String(byStatus.safety_gated || 0), helper: "Needs consent/moderation/admin rules", icon: "🛡️", progress: 55 }));
  shell.appendChild(stats);

  shell.appendChild(createTileGrid(mistressUtilityTiles));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-mistress-utility-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-mistress-utility-detail p {
      margin: var(--mx-space-2) 0 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-mistress-utility-pill {
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

    .mx-mistress-utility-pill--now,
    .mx-mistress-utility-pill--scaffolded {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-mistress-utility-pill--next,
    .mx-mistress-utility-pill--planned {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-mistress-utility-pill--later,
    .mx-mistress-utility-pill--safety_gated {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
