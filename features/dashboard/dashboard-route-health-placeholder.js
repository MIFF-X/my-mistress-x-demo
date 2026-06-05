import { createCard, createStatCard } from "../ui/card.js";
import { dashboardRegisterRouteManifest } from "./dashboard-register-route-manifest.js";

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function createRouteTable(routes) {
  const table = document.createElement("div");
  table.className = "mx-route-health-table";

  const header = document.createElement("div");
  header.className = "mx-route-health-row mx-route-health-row--header";
  header.innerHTML = "<strong>Route</strong><strong>Target</strong><strong>Category</strong><strong>Status</strong>";
  table.appendChild(header);

  routes.forEach((route) => {
    const row = document.createElement("div");
    row.className = "mx-route-health-row";
    row.innerHTML = `
      <span>${route.label}<small>${route.key}</small></span>
      <span>${route.target}</span>
      <span>${route.category}</span>
      <span class="mx-route-health-status">${route.status}</span>
    `;
    table.appendChild(row);
  });

  return table;
}

export function createDashboardRouteHealthPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const byCategory = countBy(dashboardRegisterRouteManifest, "category");
  const scaffoldedCount = dashboardRegisterRouteManifest.filter((route) => route.status === "scaffolded").length;

  shell.appendChild(
    createCard({
      eyebrow: "Dashboard Routing",
      title: "Route Health Map",
      description: "A safe visibility screen for the dashboard route manifest. This shows which dashboard tile route keys already point to scaffolded placeholder systems.",
      icon: "🔗",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Route Keys", value: String(dashboardRegisterRouteManifest.length), helper: "Registered dashboard routes", icon: "🧭", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Scaffolded", value: String(scaffoldedCount), helper: "Routes with safe placeholder targets", icon: "🧱", progress: Math.round((scaffoldedCount / dashboardRegisterRouteManifest.length) * 100) }));
  stats.appendChild(createStatCard({ label: "Categories", value: String(Object.keys(byCategory).length), helper: "Money, live, content, admin, safety, and more", icon: "🗂️", progress: 75 }));
  stats.appendChild(createStatCard({ label: "Next", value: "Wire", helper: "Connect route manifest to app shell helpers", icon: "⚙️", progress: 35 }));
  shell.appendChild(stats);

  shell.appendChild(createRouteTable(dashboardRegisterRouteManifest));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-route-health-table {
      display: grid;
      gap: var(--mx-space-2);
    }

    .mx-route-health-row {
      display: grid;
      grid-template-columns: 1.2fr 1.3fr 0.8fr 0.7fr;
      gap: var(--mx-space-3);
      align-items: center;
      padding: var(--mx-space-3);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-md);
      background: rgba(255, 255, 255, 0.045);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
    }

    .mx-route-health-row--header {
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .mx-route-health-row span {
      min-width: 0;
      overflow-wrap: anywhere;
    }

    .mx-route-health-row small {
      display: block;
      margin-top: 0.25rem;
      color: var(--mx-text-soft);
      font-size: var(--mx-text-xs);
    }

    .mx-route-health-status {
      justify-self: start;
      padding: 0.35rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(212, 175, 55, 0.36);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    @media (max-width: 820px) {
      .mx-route-health-row,
      .mx-route-health-row--header {
        grid-template-columns: 1fr;
      }
    }
  `;
  shell.appendChild(styles);

  return shell;
}
