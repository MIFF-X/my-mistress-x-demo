import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import { getSafetyGateForModule } from "./dashboard-safety-gates.js";

const dashboardGroups = [
  {
    id: "sub-dashboard",
    eyebrow: "Sub Dashboard",
    title: "Sub Account Tools",
    icon: "🐾",
    summary: "Personal account hub for wallet, vault, collections, games, live schedule, records, profile points, and Mistress relationships.",
    modules: [
      { name: "Little Black Book", status: "planned", routeKey: "rolodex", note: "Favourite Mistresses, relationship tabs, prior interactions, and Mistress cards." },
      { name: "Locked Vault", status: "planned", routeKey: "compliance", note: "Consent-based private verification storage with share/revoke controls and trust badge progression." },
      { name: "Wallet", status: "scaffolded", routeKey: "topUp", note: "Balance, points, top-ups, purchases, subscriptions, and spend visibility." },
      { name: "TV Guide", status: "planned", routeKey: "live", note: "Live shows, saved show reminders, weekly/monthly schedules, and add-to-calendar flow." },
      { name: "Achievements", status: "planned", routeKey: "badges", note: "Badges, trophies, awards, leaderboards, wins, XP points, watch points, and profile display toggles." },
      { name: "Collections Book", status: "planned", routeKey: "stickers", note: "Sticker, picture, video, ebook, reward, and per-Mistress collectible collections." },
      { name: "Games Hub", status: "planned", routeKey: "badges", note: "Favourite games, game history, hangman, quizzes, mini-games, and Mistress game logs." },
      { name: "To-Do Schedule", status: "planned", routeKey: "backend", note: "Daily/weekly tasks, challenges, promises, countdowns, and reward milestones." },
    ],
  },
  {
    id: "mistress-dashboard",
    eyebrow: "Mistress Dashboard",
    title: "Money + Interaction Control Panel",
    icon: "👑",
    summary: "Creator operating hub for quick checks, chat, live rooms, paid calls, PPV content, store items, stickers, goals, bookings, and Rolodex management.",
    modules: [
      { name: "Quick Check Zone", status: "planned", routeKey: "backend", note: "Pulls messages, bookings, requests, confessions, affirmations, secrets, contracts, and contributions into one attention queue." },
      { name: "Rolodex", status: "planned", routeKey: "rolodex", note: "Pokemon-style Sub cards, private notes, colour coding, groups, and quick-interest icons." },
      { name: "Live Shows", status: "scaffolded", routeKey: "live", note: "Live rooms with sidebar chat, viewer count, micro-gifts, requests, access codes, and ticketed entry." },
      { name: "Paid Calls", status: "planned", routeKey: "calls", note: "Voice/video sessions with Mistress-set time, price, countdown timer, extension flow, and bookings." },
      { name: "PPV Content", status: "planned", routeKey: "ppv", note: "Upload, set price, set view duration, buy-to-keep, always-available, and subscription bundle access." },
      { name: "Content Library", status: "planned", routeKey: "ppv", note: "Photo albums, video library, ebooks, music playlists, sticker sets, and gated content zones." },
      { name: "Store / Vending / Hamper", status: "planned", routeKey: "inventory", note: "Interactive inventory worlds, weekly reloads, scheduled drops, limited stock, and fulfilment." },
      { name: "Gamify Panel", status: "planned", routeKey: "badges", note: "Leaderboards, badges, trophies, streaks, awards, overlays, screen tools, and game tools." },
    ],
  },
  {
    id: "headmistress-dashboard",
    eyebrow: "Headmistress Control Centre",
    title: "Platform Command Layer",
    icon: "🛡️",
    summary: "Global admin layer for money reporting, oversight, plugin marketplace, content zones, analytics, moderation, compliance, and system-wide controls.",
    modules: [
      { name: "Bank", status: "planned", routeKey: "earnings", note: "Total revenue, money made, reserves, payouts, and platform financial visibility." },
      { name: "Oversight", status: "planned", routeKey: "command", note: "Reports, moderation, audit queues, user control, safety checks, and escalation paths." },
      { name: "The Books", status: "planned", routeKey: "earnings", note: "Platform ledger, accounting categories, money-in, money-out, and revenue source breakdowns." },
      { name: "Plugin Marketplace", status: "planned", routeKey: "plugins", note: "Enable, disable, configure, price, and document all dashboard modules and add-ons." },
      { name: "Master Rolodex", status: "planned", routeKey: "rolodex", note: "Admin-only relationship overview and safety visibility across the platform." },
      { name: "Content Zones", status: "planned", routeKey: "ppv", note: "Load content, set monthly gates, create access zones, and manage global content rules." },
      { name: "Leaderboard Master", status: "planned", routeKey: "badges", note: "Configure ranking categories, seasons, awards, trophy rules, and per-Mistress leaderboards." },
      { name: "Compliance Shield", status: "planned", routeKey: "compliance", note: "Consent ledger, permissions, audit logs, marketplace category controls, and privacy-safe review rules." },
    ],
  },
];

function statusLabel(status) {
  return {
    planned: "Planned",
    scaffolded: "Scaffolded",
    wired: "Wired",
    live: "Live",
  }[status] || status;
}

function safetyLabel(level) {
  return {
    account: "Account Gate",
    admin: "Admin Gate",
    consent: "Consent Gate",
    moderation: "Moderation Gate",
    open: "Open",
  }[level] || "Safety Gate";
}

function createModuleList(modules, routes) {
  const list = document.createElement("div");
  list.className = "mx-dashboard-module-list";

  modules.forEach((module) => {
    const gate = getSafetyGateForModule(module.name);
    const row = document.createElement("div");
    row.className = gate ? "mx-dashboard-module-row mx-dashboard-module-row--gated" : "mx-dashboard-module-row";

    const content = document.createElement("div");
    content.innerHTML = `
      <strong>${module.name}</strong>
      <p>${module.note}</p>
      ${gate ? `<small class="mx-dashboard-safety-note">${gate.launchRule}</small>` : ""}
    `;

    const actionStack = document.createElement("div");
    actionStack.className = "mx-dashboard-module-actions";

    const status = document.createElement("span");
    status.className = `mx-dashboard-module-status mx-dashboard-module-status--${module.status}`;
    status.textContent = statusLabel(module.status);
    actionStack.appendChild(status);

    if (gate) {
      const gatePill = document.createElement("span");
      gatePill.className = `mx-dashboard-safety-pill mx-dashboard-safety-pill--${gate.safetyLevel}`;
      gatePill.textContent = safetyLabel(gate.safetyLevel);
      actionStack.appendChild(gatePill);
    }

    if (module.routeKey && typeof routes[module.routeKey] === "function") {
      actionStack.appendChild(createButton({
        label: "Open",
        variant: module.status === "scaffolded" ? "gold" : "secondary",
        size: "sm",
        onClick: routes[module.routeKey],
      }));
    } else {
      actionStack.appendChild(createButton({
        label: "Queued",
        variant: "ghost",
        size: "sm",
        disabled: true,
      }));
    }

    row.appendChild(content);
    row.appendChild(actionStack);
    list.appendChild(row);
  });

  return list;
}

function createGroupCard(group, routes) {
  return createCard({
    eyebrow: group.eyebrow,
    title: group.title,
    description: group.summary,
    icon: group.icon,
    meta: `${group.modules.length} dashboard tiles mapped`,
    children: [createModuleList(group.modules, routes)],
    actions: [
      createButton({
        label: "Open Docs Register",
        variant: "secondary",
        onClick: () => alert("See docs/DASHBOARD_MODULE_REGISTER.md for the full build register."),
      }),
    ],
  });
}

export function createDashboardModuleRegisterPlaceholder({ routes = {} } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Dashboard Architecture",
      title: "Dashboard Module Register",
      description: "Role-based dashboard map created from the hand-drawn Sub, Mistress, and Headmistress dashboard sketches. This keeps every feature visible before backend wiring starts.",
      icon: "🧭",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Role Surfaces", value: "3", helper: "Sub, Mistress, Headmistress", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Tiles Mapped", value: "24", helper: "First-pass dashboard modules", icon: "🗂️", progress: 80 }));
  stats.appendChild(createStatCard({ label: "Scaffold Status", value: "Started", helper: "UI register + docs committed", icon: "🧱", progress: 35 }));
  stats.appendChild(createStatCard({ label: "Quick Routes", value: "Live", helper: "Mapped tiles now open matching placeholder screens", icon: "🔗", progress: 55 }));
  stats.appendChild(createStatCard({ label: "Safety Layer", value: "Visible", helper: "Gated modules now marked in the register", icon: "🛡️", progress: 45 }));
  shell.appendChild(stats);

  const filterRow = document.createElement("div");
  filterRow.className = "mx-button-row";
  shell.appendChild(filterRow);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";
  shell.appendChild(grid);

  const filters = [
    { id: "all", label: "All Dashboards" },
    { id: "sub-dashboard", label: "Sub" },
    { id: "mistress-dashboard", label: "Mistress" },
    { id: "headmistress-dashboard", label: "Headmistress" },
  ];
  let activeFilter = "all";

  function renderFilters() {
    filterRow.innerHTML = "";
    filters.forEach((filter) => {
      filterRow.appendChild(createButton({
        label: filter.label,
        variant: activeFilter === filter.id ? "gold" : "secondary",
        onClick: () => {
          activeFilter = filter.id;
          renderFilters();
          renderGrid();
        },
      }));
    });
  }

  function renderGrid() {
    grid.innerHTML = "";
    dashboardGroups
      .filter((group) => activeFilter === "all" || group.id === activeFilter)
      .forEach((group) => grid.appendChild(createGroupCard(group, routes)));
  }

  renderFilters();
  renderGrid();

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-dashboard-module-list {
      position: relative;
      display: grid;
      gap: var(--mx-space-3);
      margin-top: var(--mx-space-5);
    }

    .mx-dashboard-module-row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) auto;
      gap: var(--mx-space-3);
      align-items: start;
      padding: var(--mx-space-3);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-md);
      background: rgba(0, 0, 0, 0.16);
    }

    .mx-dashboard-module-row--gated {
      border-color: rgba(212, 175, 55, 0.22);
      background: rgba(212, 175, 55, 0.045);
    }

    .mx-dashboard-module-row p {
      margin-top: var(--mx-space-1);
      font-size: var(--mx-text-sm);
    }

    .mx-dashboard-module-actions {
      display: grid;
      gap: var(--mx-space-2);
      justify-items: end;
      min-width: 6.4rem;
    }

    .mx-dashboard-module-status,
    .mx-dashboard-safety-pill {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 5.8rem;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-dashboard-module-status--scaffolded,
    .mx-dashboard-module-status--wired,
    .mx-dashboard-module-status--live {
      border-color: rgba(212, 175, 55, 0.38);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-dashboard-safety-pill--admin,
    .mx-dashboard-safety-pill--moderation,
    .mx-dashboard-safety-pill--consent {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }

    .mx-dashboard-safety-pill--account {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-dashboard-safety-note {
      display: block;
      margin-top: var(--mx-space-2);
      color: var(--mx-gold);
      font-size: var(--mx-text-xs);
      line-height: 1.45;
    }

    @media (max-width: 720px) {
      .mx-dashboard-module-row {
        grid-template-columns: 1fr;
      }

      .mx-dashboard-module-actions {
        justify-items: start;
      }
    }
  `;
  shell.appendChild(styles);

  return shell;
}
