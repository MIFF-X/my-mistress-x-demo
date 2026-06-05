import { createCard, createStatCard } from "../ui/card.js";

const cardSections = [
  {
    title: "Sub-Submitted Card Fields",
    icon: "🃏",
    visibility: "Shared with selected Mistress",
    fields: ["display name", "archetype", "service interests", "preferred contact", "submitted tags", "profile intro"],
    rule: "These fields belong to the Sub-submitted card and may be updated or resent by the Sub.",
  },
  {
    title: "Mistress Private Notes",
    icon: "🔒",
    visibility: "Mistress only",
    fields: ["private notes", "colour code", "group name", "relationship status", "risk markers", "follow-up reminders"],
    rule: "These fields must never be shown back to the Sub or to another Mistress without explicit authorised admin review.",
  },
  {
    title: "Quick Visual Icons",
    icon: "👁️",
    visibility: "Mistress dashboard",
    fields: ["liked interests", "greyed-out dislikes", "task preference", "collector status", "booking status", "tribute status"],
    rule: "Icons are dashboard shortcuts and should be editable by the Mistress within her own scoped Rolodex.",
  },
  {
    title: "Headmistress Audit View",
    icon: "👑",
    visibility: "Headmistress/admin only",
    fields: ["relationship links", "policy flags", "safety review", "audit trail", "report history", "scope owner"],
    rule: "Master Rolodex access is for oversight and compliance, not for replacing Mistress private working views.",
  },
];

function createSectionGrid(sections) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  sections.forEach((section) => {
    const body = document.createElement("div");
    body.className = "mx-card-detail-section";
    body.innerHTML = `
      <p><strong>Visibility:</strong> ${section.visibility}</p>
      <div class="mx-card-detail-fields">
        ${section.fields.map((field) => `<span>${field}</span>`).join("")}
      </div>
      <small>${section.rule}</small>
    `;

    grid.appendChild(createCard({
      eyebrow: "Rolodex Card Detail",
      title: section.title,
      description: "Separates shared card data from private Mistress notes and Headmistress audit fields.",
      icon: section.icon,
      children: [body],
    }));
  });

  return grid;
}

export function createMistressRolodexCardDetailPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  shell.appendChild(createCard({
    eyebrow: "Mistress Rolodex",
    title: "Card Detail Rules",
    description: "A safe placeholder for the future Sub contact card detail screen. It defines what the Sub can submit, what the Mistress can privately add, and what Headmistress can audit.",
    icon: "🃏",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Sections", value: String(cardSections.length), helper: "Card detail zones", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Sub Fields", value: "Shared", helper: "Submitted by Sub", icon: "🃏", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Private Notes", value: "Hidden", helper: "Mistress-only working data", icon: "🔒", progress: 60 }));
  stats.appendChild(createStatCard({ label: "Audit", value: "Admin", helper: "Headmistress oversight", icon: "👑", progress: 55 }));
  shell.appendChild(stats);

  shell.appendChild(createSectionGrid(cardSections));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-card-detail-section { display: grid; gap: var(--mx-space-3); margin-top: var(--mx-space-4); }
    .mx-card-detail-section p { margin: 0; color: var(--mx-text-muted); line-height: 1.5; }
    .mx-card-detail-section small { color: var(--mx-gold); line-height: 1.5; }
    .mx-card-detail-fields { display: flex; flex-wrap: wrap; gap: var(--mx-space-2); }
    .mx-card-detail-fields span {
      padding: 0.32rem 0.55rem;
      border-radius: 999px;
      border: 1px solid rgba(212, 175, 55, 0.35);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      font-weight: 800;
      text-transform: uppercase;
    }
  `;
  shell.appendChild(styles);

  return shell;
}
