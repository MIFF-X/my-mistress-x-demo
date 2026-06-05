import { createCard, createStatCard } from "../ui/card.js";

const gamifyLanes = [
  {
    id: "leaderboards",
    label: "Leaderboards",
    icon: "🏆",
    count: 6,
    status: "planned",
    note: "Per-Mistress rankings, site-wide rankings, seasonal boards, weekly winners, and configurable categories.",
  },
  {
    id: "badges-trophies",
    label: "Badges + Trophies",
    icon: "🥇",
    count: 12,
    status: "scaffolded",
    note: "Badges, trophies, trophy cabinets, award unlocks, profile display options, and Hall of Fame routes.",
  },
  {
    id: "streaks-xp",
    label: "Streaks + XP",
    icon: "🔥",
    count: 8,
    status: "planned",
    note: "Login streaks, watch points, XP points, viewing points, task streaks, and repeat supporter rewards.",
  },
  {
    id: "game-overlays",
    label: "Game Overlays",
    icon: "🎮",
    count: 5,
    status: "planned",
    note: "Live game overlays, buzzer/first-response tools, control overlays, screen split, and gameshow widgets.",
  },
  {
    id: "reward-rules",
    label: "Reward Rules",
    icon: "🎁",
    count: 4,
    status: "safety_review",
    note: "Mistress-configured reward rules, redemptions, prize eligibility, disputes, and platform limits.",
  },
];

function createGamifyLaneGrid(lanes) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  lanes.forEach((lane) => {
    const detail = document.createElement("div");
    detail.className = "mx-gamify-lane-detail";
    detail.innerHTML = `
      <span class="mx-gamify-pill mx-gamify-pill--${lane.status}">${lane.status.replaceAll("_", " ")}</span>
      <strong>${lane.count}</strong>
      <p>${lane.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: "Gamify Lane",
      title: lane.label,
      description: "A gamification and rewards lane for the Mistress dashboard.",
      icon: lane.icon,
      meta: lane.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressGamifyPanelPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const totalItems = gamifyLanes.reduce((sum, lane) => sum + lane.count, 0);
  const plannedCount = gamifyLanes.filter((lane) => lane.status === "planned").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "Gamify Panel",
    description: "A safe placeholder for Mistress-controlled leaderboards, badges, trophies, XP, streaks, live game overlays, and reward rules before real point automation is wired.",
    icon: "🏆",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Gamify Lanes", value: String(gamifyLanes.length), helper: "Rewards/control sections", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Demo Items", value: String(totalItems), helper: "Placeholder gamify count", icon: "🏆", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Planned", value: String(plannedCount), helper: "Needs deeper feature screens", icon: "🧱", progress: 45 }));
  stats.appendChild(createStatCard({ label: "Rules", value: "Needed", helper: "Anti-abuse/reward limits before launch", icon: "🛡️", progress: 35 }));
  shell.appendChild(stats);

  shell.appendChild(createGamifyLaneGrid(gamifyLanes));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-gamify-lane-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-gamify-lane-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-gamify-lane-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-gamify-pill {
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

    .mx-gamify-pill--scaffolded {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-gamify-pill--planned {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-gamify-pill--safety_review {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
