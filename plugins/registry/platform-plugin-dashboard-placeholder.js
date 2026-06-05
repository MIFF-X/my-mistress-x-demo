import { createButton } from "../../features/ui/button.js";
import { createCard, createStatCard } from "../../features/ui/card.js";
import {
  getPlatformPluginProgressSummary,
  platformPluginRegistry,
} from "./platform-plugin-registry.js";
import {
  PLATFORM_PLUGIN_CATEGORIES,
  PLATFORM_PLUGIN_STATUS,
} from "./platform-plugin-types.js";

function formatProgressBar(progress = 0) {
  const safe = Math.max(0, Math.min(100, progress));
  const filled = Math.round(safe / 10);
  return `${"█".repeat(filled)}${"░".repeat(10 - filled)} ${safe}%`;
}

function getPluginIcon(category) {
  return {
    money: "💰",
    content: "🎬",
    live: "📡",
    communication: "💬",
    marketplace: "🛍️",
    collectibles: "🏷️",
    rolodex: "🗂️",
    badges: "🏆",
    styling: "🎨",
    smm: "📣",
    admin: "👑",
    compliance: "🛡️",
    analytics: "📊",
  }[category] || "🧩";
}

function getFilteredPlugins(filter) {
  if (filter === "backend") {
    return platformPluginRegistry.filter((plugin) => plugin.backend && plugin.backend !== "done" && plugin.backend !== "scaffolded");
  }
  if (filter === "safety") {
    return platformPluginRegistry.filter((plugin) => plugin.status === PLATFORM_PLUGIN_STATUS.SAFETY_REVIEW || plugin.safetyNotes?.length);
  }
  if (filter === "all") return platformPluginRegistry;
  return platformPluginRegistry.filter((plugin) => plugin.category === filter);
}

export function createPlatformPluginDashboardPlaceholder({ onOpenPlugin, initialFilter = "all" } = {}) {
  const summary = getPlatformPluginProgressSummary();
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const filters = [
    { id: "all", label: "All" },
    { id: PLATFORM_PLUGIN_CATEGORIES.MONEY, label: "Money" },
    { id: PLATFORM_PLUGIN_CATEGORIES.CONTENT, label: "Content" },
    { id: PLATFORM_PLUGIN_CATEGORIES.LIVE, label: "Live" },
    { id: PLATFORM_PLUGIN_CATEGORIES.COMMUNICATION, label: "Communication" },
    { id: PLATFORM_PLUGIN_CATEGORIES.MARKETPLACE, label: "Marketplace" },
    { id: PLATFORM_PLUGIN_CATEGORIES.COLLECTIBLES, label: "Collectibles" },
    { id: PLATFORM_PLUGIN_CATEGORIES.ROLODEX, label: "Rolodex" },
    { id: PLATFORM_PLUGIN_CATEGORIES.BADGES, label: "Badges" },
    { id: PLATFORM_PLUGIN_CATEGORIES.STYLING, label: "Styling" },
    { id: PLATFORM_PLUGIN_CATEGORIES.SMM, label: "SMM" },
    { id: PLATFORM_PLUGIN_CATEGORIES.ADMIN, label: "Admin" },
    { id: PLATFORM_PLUGIN_CATEGORIES.COMPLIANCE, label: "Compliance" },
    { id: "backend", label: "Backend Needed" },
    { id: "safety", label: "Safety Review" },
  ];

  const safeInitialFilter = filters.some((filter) => filter.id === initialFilter) ? initialFilter : "all";
  let activeFilter = safeInitialFilter;

  const activeLabel = () => filters.find((filter) => filter.id === activeFilter)?.label || "All";

  shell.appendChild(
    createCard({
      eyebrow: "Platform Plugin Registry",
      title: `${activeLabel()} Plugin Systems`,
      description: "Central dashboard placeholder for PPV, live, money, stickers, Rolodex, inventory, badges, SMM, styling, compliance, and admin modules.",
      icon: "🧩",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Plugins", value: String(summary.total), helper: "Registered systems", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Average Progress", value: `${summary.average}%`, helper: "Across registered plugins", icon: "📊", progress: summary.average }));
  stats.appendChild(createStatCard({ label: "Frontend", value: "Scaffold", helper: "Registry-driven screens started", icon: "🖥️", progress: 45 }));
  stats.appendChild(createStatCard({ label: "Backend", value: "Pending", helper: "Universal task list ready", icon: "🗄️", progress: 0 }));
  shell.appendChild(stats);

  const filterRow = document.createElement("div");
  filterRow.className = "mx-button-row";
  shell.appendChild(filterRow);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";
  shell.appendChild(grid);

  function renderFilters() {
    filterRow.innerHTML = "";
    filters.forEach((filter) => {
      filterRow.appendChild(
        createButton({
          label: filter.label,
          variant: activeFilter === filter.id ? "gold" : "secondary",
          onClick: () => {
            activeFilter = filter.id;
            renderFilters();
            renderGrid();
          },
        }),
      );
    });
  }

  function renderGrid() {
    const plugins = getFilteredPlugins(activeFilter);
    grid.innerHTML = "";

    if (!plugins.length) {
      grid.appendChild(
        createCard({
          eyebrow: "Empty Filter",
          title: "No plugins found",
          description: "This filter has no matching plugin systems yet.",
          icon: "🔎",
        }),
      );
      return;
    }

    plugins.forEach((plugin) => {
      const progress = document.createElement("div");
      progress.className = "mx-stack";
      progress.innerHTML = `
        <div class="mx-progress-track" aria-label="${plugin.name} progress">
          <div class="mx-progress-fill" style="width:${plugin.progress}%"></div>
        </div>
        <small class="mx-muted">${formatProgressBar(plugin.progress)}</small>
        ${plugin.safetyNotes?.length ? `<small class="mx-badge mx-badge--gold">Safety notes: ${plugin.safetyNotes.length}</small>` : ""}
      `;

      grid.appendChild(
        createCard({
          eyebrow: `${plugin.category} · ${plugin.status}`,
          title: plugin.name,
          description: plugin.description,
          icon: getPluginIcon(plugin.category),
          meta: `Frontend: ${plugin.frontend} · Backend: ${plugin.backend} · DB: ${plugin.database}`,
          children: [progress],
          actions: [
            createButton({ label: "Open", variant: "secondary", onClick: () => onOpenPlugin?.(plugin) }),
          ],
        }),
      );
    });
  }

  renderFilters();
  renderGrid();

  return shell;
}
