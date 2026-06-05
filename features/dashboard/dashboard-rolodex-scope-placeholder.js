import { createCard, createStatCard } from "../ui/card.js";
import { dashboardRolodexScopeRules } from "./dashboard-rolodex-scope-rules.js";

function createScopeTable(rules) {
  const table = document.createElement("div");
  table.className = "mx-rolodex-scope-table";

  const header = document.createElement("div");
  header.className = "mx-rolodex-scope-row mx-rolodex-scope-row--header";
  header.innerHTML = "<strong>Role</strong><strong>Rolodex</strong><strong>Can See</strong><strong>Cannot See</strong>";
  table.appendChild(header);

  rules.forEach((rule) => {
    const row = document.createElement("div");
    row.className = `mx-rolodex-scope-row mx-rolodex-scope-row--${rule.role}`;
    row.innerHTML = `
      <span><strong>${rule.dashboardName}</strong><small>${rule.scope}</small></span>
      <span>${rule.rolodexName}</span>
      <span>${rule.canSee}</span>
      <span>${rule.cannotSee}</span>
    `;
    table.appendChild(row);
  });

  return table;
}

function createPurposeCards(rules) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  rules.forEach((rule) => {
    grid.appendChild(createCard({
      eyebrow: rule.role,
      title: rule.rolodexName,
      description: rule.purpose,
      icon: rule.role === "headmistress" ? "👑" : rule.role === "mistress" ? "🗂️" : "📓",
      meta: rule.scope,
    }));
  });

  return grid;
}

export function createDashboardRolodexScopePlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(createCard({
    eyebrow: "Dashboard Scope Rules",
    title: "Rolodex Visibility Rules",
    description: "Defines the difference between the Headmistress Master Rolodex, each Mistress's private Sub Rolodex, and each Sub's Little Black Book of collected Mistresses.",
    icon: "🗂️",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Scope Types", value: String(dashboardRolodexScopeRules.length), helper: "Sub, Mistress, Headmistress", icon: "🧭", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Master Access", value: "1", helper: "Headmistress only", icon: "👑", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Private Networks", value: "2", helper: "Sub and Mistress scoped views", icon: "🔒", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Backend Rule", value: "Role Guard", helper: "Queries must be scoped by role", icon: "🛡️", progress: 65 }));
  shell.appendChild(stats);

  shell.appendChild(createPurposeCards(dashboardRolodexScopeRules));
  shell.appendChild(createScopeTable(dashboardRolodexScopeRules));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-rolodex-scope-table {
      display: grid;
      gap: var(--mx-space-2);
    }

    .mx-rolodex-scope-row {
      display: grid;
      grid-template-columns: 0.9fr 0.8fr 1.45fr 1.45fr;
      gap: var(--mx-space-3);
      align-items: start;
      padding: var(--mx-space-3);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-md);
      background: rgba(255, 255, 255, 0.045);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-rolodex-scope-row--header {
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .mx-rolodex-scope-row--headmistress {
      border-color: rgba(212, 175, 55, 0.35);
      background: rgba(212, 175, 55, 0.07);
    }

    .mx-rolodex-scope-row small {
      display: block;
      margin-top: 0.25rem;
      color: var(--mx-text-soft);
      font-size: var(--mx-text-xs);
    }

    @media (max-width: 920px) {
      .mx-rolodex-scope-row,
      .mx-rolodex-scope-row--header {
        grid-template-columns: 1fr;
      }
    }
  `;
  shell.appendChild(styles);

  return shell;
}
