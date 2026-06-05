import { createCard, createStatCard } from "../ui/card.js";
import { DASHBOARD_SAFETY_LEVELS, dashboardSafetyGates } from "./dashboard-safety-gates.js";

function countBy(items, key) {
  return items.reduce((acc, item) => {
    const value = item[key] || "unknown";
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

function safetyLabel(level) {
  return {
    [DASHBOARD_SAFETY_LEVELS.OPEN]: "Open",
    [DASHBOARD_SAFETY_LEVELS.ACCOUNT]: "Account",
    [DASHBOARD_SAFETY_LEVELS.CONSENT]: "Consent",
    [DASHBOARD_SAFETY_LEVELS.MODERATION]: "Moderation",
    [DASHBOARD_SAFETY_LEVELS.ADMIN]: "Admin",
  }[level] || level;
}

function createSafetyTable(gates) {
  const table = document.createElement("div");
  table.className = "mx-safety-gate-table";

  const header = document.createElement("div");
  header.className = "mx-safety-gate-row mx-safety-gate-row--header";
  header.innerHTML = "<strong>Module</strong><strong>Safety</strong><strong>Reason</strong><strong>Launch Rule</strong>";
  table.appendChild(header);

  gates.forEach((gate) => {
    const row = document.createElement("div");
    row.className = "mx-safety-gate-row";
    row.innerHTML = `
      <span><strong>${gate.moduleName}</strong><small>${gate.routeKey}</small></span>
      <span class="mx-safety-gate-pill mx-safety-gate-pill--${gate.safetyLevel}">${safetyLabel(gate.safetyLevel)}</span>
      <span>${gate.reason}</span>
      <span>${gate.launchRule}</span>
    `;
    table.appendChild(row);
  });

  return table;
}

export function createDashboardSafetyGatesPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const byLevel = countBy(dashboardSafetyGates, "safetyLevel");
  const adminCount = byLevel[DASHBOARD_SAFETY_LEVELS.ADMIN] || 0;
  const consentCount = byLevel[DASHBOARD_SAFETY_LEVELS.CONSENT] || 0;
  const moderationCount = byLevel[DASHBOARD_SAFETY_LEVELS.MODERATION] || 0;

  shell.appendChild(
    createCard({
      eyebrow: "Dashboard Safety",
      title: "Safety Gates Register",
      description: "A visible checklist for dashboard modules that must stay behind consent, moderation, account, or admin controls before connecting to real private data, payments, or media.",
      icon: "🛡️",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Protected Modules", value: String(dashboardSafetyGates.length), helper: "Safety gates recorded", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Consent", value: String(consentCount), helper: "Require consent/revoke/audit", icon: "✍️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Moderation", value: String(moderationCount), helper: "Require reports/disputes/review", icon: "🚦", progress: 60 }));
  stats.appendChild(createStatCard({ label: "Admin", value: String(adminCount), helper: "Require Headmistress/admin guard", icon: "👑", progress: 75 }));
  shell.appendChild(stats);

  shell.appendChild(createSafetyTable(dashboardSafetyGates));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-safety-gate-table {
      display: grid;
      gap: var(--mx-space-2);
    }

    .mx-safety-gate-row {
      display: grid;
      grid-template-columns: 0.9fr 0.7fr 1.45fr 1.45fr;
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

    .mx-safety-gate-row--header {
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .mx-safety-gate-row small {
      display: block;
      margin-top: 0.25rem;
      color: var(--mx-text-soft);
      font-size: var(--mx-text-xs);
    }

    .mx-safety-gate-pill {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 6.25rem;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-safety-gate-pill--consent {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-safety-gate-pill--moderation {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }

    .mx-safety-gate-pill--admin {
      border-color: rgba(216, 90, 48, 0.42);
      color: #ff9a78;
      background: rgba(216, 90, 48, 0.1);
    }

    .mx-safety-gate-pill--account {
      border-color: rgba(255, 255, 255, 0.22);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    @media (max-width: 920px) {
      .mx-safety-gate-row,
      .mx-safety-gate-row--header {
        grid-template-columns: 1fr;
      }
    }
  `;
  shell.appendChild(styles);

  return shell;
}
