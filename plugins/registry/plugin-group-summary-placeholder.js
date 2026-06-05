import { createButton } from "../../features/ui/button.js";
import { createCard, createStatCard } from "../../features/ui/card.js";
import { platformPluginRegistry } from "./platform-plugin-registry.js";

const GROUPS = [
  { id: "money", label: "Money", icon: "💰", description: "Top-ups, wallet, ledger, earnings, cashout, reserves, and payout approvals." },
  { id: "content", label: "Content", icon: "🎬", description: "PPV uploads, timed unlocks, buy-to-keep, subscriptions, and content access." },
  { id: "live", label: "Live", icon: "📡", description: "Live shows, paid calls, bookings, tickets, replays, chat sidebar, and session timers." },
  { id: "collectibles", label: "Collectibles", icon: "🏷️", description: "Stickers, albums, monthly drops, matching item stickers, and completion rewards." },
  { id: "marketplace", label: "Marketplace", icon: "🛍️", description: "Inventory environments, product grids, vending, hamper, stock, drops, and orders." },
  { id: "badges", label: "Badges", icon: "🏆", description: "Verification badges, trust badges, trophies, awards, rankings, and Hall of Fame." },
  { id: "rolodex", label: "Rolodex", icon: "🗂️", description: "Contact cards, Keeper cards, private notes, card frames, contracts, and status icons." },
  { id: "styling", label: "Styling", icon: "🎨", description: "Installable icon, badge, font, seal, stamp, logo, favicon, GIF, and House theme packs." },
  { id: "smm", label: "SMM", icon: "📣", description: "Multi-site command centre, publishing, inboxes, fulfilment, disputes, revenue, and analytics." },
  { id: "admin", label: "Admin", icon: "👑", description: "Headmistress command centre, reports, moderation, approvals, analytics, and oversight." },
  { id: "compliance", label: "Compliance", icon: "🛡️", description: "Consent ledger, safety review, marketplace restrictions, audit logs, and policy controls." },
];

function getGroupPlugins(groupId) {
  return platformPluginRegistry.filter((plugin) => plugin.category === groupId);
}

function getGroupProgress(plugins) {
  if (!plugins.length) return 0;
  return Math.round(plugins.reduce((sum, plugin) => sum + plugin.progress, 0) / plugins.length);
}

function getGroupBackendNeeded(plugins) {
  return plugins.filter((plugin) => plugin.backend && plugin.backend !== "done" && plugin.backend !== "scaffolded").length;
}

export function createPluginGroupSummaryPlaceholder({ onOpenGroup, onOpenBackendTasks } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-stack";

  shell.appendChild(
    createCard({
      eyebrow: "Plugin Groups",
      title: "Feature system summary",
      description: "A high-level view of the main Mistress-X platform systems and their current progress from the central plugin registry.",
      icon: "🧩",
      actions: [
        createButton({ label: "Open Backend Queue", variant: "secondary", onClick: () => onOpenBackendTasks?.("all") }),
      ],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";

  const totalPlugins = platformPluginRegistry.length;
  const average = Math.round(platformPluginRegistry.reduce((sum, plugin) => sum + plugin.progress, 0) / totalPlugins);
  const backendNeeded = platformPluginRegistry.filter((plugin) => plugin.backend && plugin.backend !== "done" && plugin.backend !== "scaffolded").length;
  const safetyReview = platformPluginRegistry.filter((plugin) => plugin.safetyNotes?.length || plugin.status === "safety_review").length;

  stats.appendChild(createStatCard({ label: "Plugin Systems", value: String(totalPlugins), helper: "Registered feature systems", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Average", value: `${average}%`, helper: "Across all plugin systems", icon: "📊", progress: average }));
  stats.appendChild(createStatCard({ label: "Backend Needed", value: String(backendNeeded), helper: "APIs/services/integrations pending", icon: "🗄️", progress: Math.min(100, backendNeeded * 8) }));
  stats.appendChild(createStatCard({ label: "Safety Review", value: String(safetyReview), helper: "Systems with safety/compliance notes", icon: "🛡️", progress: Math.min(100, safetyReview * 20) }));
  shell.appendChild(stats);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  GROUPS.forEach((group) => {
    const plugins = getGroupPlugins(group.id);
    const progress = getGroupProgress(plugins);
    const backendCount = getGroupBackendNeeded(plugins);
    const progressBlock = document.createElement("div");
    progressBlock.className = "mx-stack";
    progressBlock.innerHTML = `
      <div class="mx-progress-track" aria-label="${group.label} progress">
        <div class="mx-progress-fill" style="width:${progress}%"></div>
      </div>
      <small class="mx-muted">${plugins.length} plugins · ${progress}% avg · ${backendCount} backend queues</small>
    `;

    grid.appendChild(
      createCard({
        eyebrow: group.id,
        title: group.label,
        description: group.description,
        icon: group.icon,
        children: [progressBlock],
        actions: [
          createButton({ label: "Open Group", variant: "secondary", onClick: () => onOpenGroup?.(group.id) }),
          createButton({ label: "Backend Queue", variant: "ghost", onClick: () => onOpenBackendTasks?.(group.id) }),
        ],
      }),
    );
  });

  shell.appendChild(grid);
  return shell;
}
