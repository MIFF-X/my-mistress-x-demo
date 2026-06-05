import { createCard, createStatCard } from "../ui/card.js";
import { createButton } from "../ui/button.js";

export function createAdminPanelPlaceholder({ onOpenQueue, onOpenReports } = {}) {
  const panel = document.createElement("section");
  panel.className = "mx-page mx-stack";

  const hero = createCard({
    eyebrow: "Headmistress Command Centre",
    title: "Admin panel placeholder",
    description: "Central shell for users, plugins, money flows, content, live rooms, compliance queues, badges, and feature progress.",
    icon: "👑",
    actions: [
      createButton({ label: "Open Review Queue", variant: "gold", onClick: onOpenQueue }),
      createButton({ label: "View Reports", variant: "secondary", onClick: onOpenReports }),
    ],
  });

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  [
    { label: "Users", value: "—", helper: "Mistress/Sub/Headmistress accounts", icon: "👥" },
    { label: "Plugins", value: "—", helper: "Installed, pending, disabled", icon: "🧩" },
    { label: "Ledger", value: "—", helper: "Top-ups, spends, payouts", icon: "💰" },
    { label: "Moderation", value: "—", helper: "Reports, flags, review items", icon: "🛡️" },
  ].forEach((item) => stats.appendChild(createStatCard(item)));

  panel.appendChild(hero);
  panel.appendChild(stats);
  return panel;
}
