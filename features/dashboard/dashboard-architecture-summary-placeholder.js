import { createCard, createStatCard } from "../ui/card.js";
import { dashboardRegisterRouteManifest } from "./dashboard-register-route-manifest.js";
import { dashboardSafetyGates } from "./dashboard-safety-gates.js";
import { dashboardBuildPriorities, DASHBOARD_PRIORITY_LEVELS } from "./dashboard-build-priorities.js";
import { dashboardRolodexScopeRules } from "./dashboard-rolodex-scope-rules.js";

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function createMiniTable(title, rows) {
  const card = document.createElement("div");
  card.className = "mx-dashboard-summary-table";

  const heading = document.createElement("h3");
  heading.textContent = title;
  card.appendChild(heading);

  rows.forEach((row) => {
    const item = document.createElement("div");
    item.className = "mx-dashboard-summary-row";
    item.innerHTML = `<span>${row.label}</span><strong>${row.value}</strong>`;
    card.appendChild(item);
  });

  return card;
}

export function createDashboardArchitectureSummaryPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const routeCategories = countBy(dashboardRegisterRouteManifest, "category");
  const safetyLevels = countBy(dashboardSafetyGates, "safetyLevel");
  const priorityLevels = countBy(dashboardBuildPriorities, "priority");

  shell.appendChild(createCard({
    eyebrow: "Dashboard Architecture",
    title: "Architecture Summary",
    description: "A single overview of the dashboard register, route manifest, safety gates, build priorities, and Rolodex scope rules before the next feature build phase starts.",
    icon: "🧭",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Route Keys", value: String(dashboardRegisterRouteManifest.length), helper: "Registered dashboard route targets", icon: "🔗", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Safety Gates", value: String(dashboardSafetyGates.length), helper: "Protected dashboard modules", icon: "🛡️", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Priority Items", value: String(dashboardBuildPriorities.length), helper: "Build queue locked", icon: "📌", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Rolodex Scopes", value: String(dashboardRolodexScopeRules.length), helper: "Sub, Mistress, Headmistress", icon: "🗂️", progress: 100 }));
  shell.appendChild(stats);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";
  grid.appendChild(createMiniTable("Route Categories", Object.entries(routeCategories).map(([label, value]) => ({ label, value }))));
  grid.appendChild(createMiniTable("Safety Levels", Object.entries(safetyLevels).map(([label, value]) => ({ label, value }))));
  grid.appendChild(createMiniTable("Build Priority", [
    { label: "Now", value: priorityLevels[DASHBOARD_PRIORITY_LEVELS.NOW] || 0 },
    { label: "Next", value: priorityLevels[DASHBOARD_PRIORITY_LEVELS.NEXT] || 0 },
    { label: "Later", value: priorityLevels[DASHBOARD_PRIORITY_LEVELS.LATER] || 0 },
    { label: "Safety First", value: priorityLevels[DASHBOARD_PRIORITY_LEVELS.SAFETY_FIRST] || 0 },
  ]));
  grid.appendChild(createMiniTable("Rolodex Access", dashboardRolodexScopeRules.map((rule) => ({
    label: rule.rolodexName,
    value: rule.role,
  }))));
  shell.appendChild(grid);

  shell.appendChild(createCard({
    eyebrow: "Recommended Next Phase",
    title: "Move from architecture into Mistress dashboard utility tiles",
    description: "The dashboard map is now structured enough to start visible utility features. Recommended first build: Mistress Quick Check Zone tiles, then Rolodex/contact cards, then wallet/top-up visibility.",
    icon: "🚀",
  }));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-dashboard-summary-table {
      position: relative;
      overflow: hidden;
      padding: var(--mx-space-5);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-lg);
      background: linear-gradient(180deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.035));
      box-shadow: var(--mx-shadow-soft);
    }

    .mx-dashboard-summary-table h3 {
      margin: 0 0 var(--mx-space-4);
      color: var(--mx-gold);
      font-size: var(--mx-text-sm);
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .mx-dashboard-summary-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--mx-space-3);
      padding: var(--mx-space-2) 0;
      border-top: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
    }

    .mx-dashboard-summary-row strong {
      color: var(--mx-text);
      text-transform: capitalize;
    }
  `;
  shell.appendChild(styles);

  return shell;
}
