import { createCard, createStatCard } from "../ui/card.js";
import { getRolodexScopeForRole } from "./dashboard-rolodex-scope-rules.js";

const demoSubCards = [
  {
    id: "sub-card-001",
    displayName: "Sub Finance 01",
    archetype: "Financial Devotee",
    status: "collected",
    colour: "gold",
    tags: ["tribute", "goals", "keeper"],
    noteState: "private_note",
    visibility: "mistress_only",
  },
  {
    id: "sub-card-002",
    displayName: "Sub Tech 09",
    archetype: "Tech Slave",
    status: "review",
    colour: "purple",
    tags: ["tech", "tasks", "support"],
    noteState: "needs_review",
    visibility: "mistress_only",
  },
  {
    id: "sub-card-003",
    displayName: "Sub Collector 14",
    archetype: "Collector",
    status: "new_card",
    colour: "rose",
    tags: ["stickers", "collections", "live"],
    noteState: "sub_submitted",
    visibility: "mistress_only",
  },
];

function createTagList(tags) {
  return tags.map((tag) => `<span class="mx-rolodex-tag">${tag}</span>`).join("");
}

function createSubCardGrid(cards) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  cards.forEach((card) => {
    const frame = document.createElement("div");
    frame.className = `mx-rolodex-card-frame mx-rolodex-card-frame--${card.colour}`;
    frame.innerHTML = `
      <div class="mx-rolodex-card-top">
        <span>${card.status.replaceAll("_", " ")}</span>
        <strong>${card.visibility.replaceAll("_", " ")}</strong>
      </div>
      <div class="mx-rolodex-avatar">${card.displayName.slice(0, 2).toUpperCase()}</div>
      <div class="mx-rolodex-card-copy">
        <h3>${card.displayName}</h3>
        <p>${card.archetype}</p>
      </div>
      <div class="mx-rolodex-tags">${createTagList(card.tags)}</div>
      <small>${card.noteState.replaceAll("_", " ")}</small>
    `;

    grid.appendChild(frame);
  });

  return grid;
}

export function createMistressRolodexTilePlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";
  const scope = getRolodexScopeForRole("mistress");

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "Mistress Rolodex",
    description: "A role-scoped Sub relationship manager. The Mistress sees only her own collected Subs, while the Headmistress keeps the separate Master Rolodex.",
    icon: "🗂️",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Scope", value: "Private", helper: scope?.scope || "mistress_personal", icon: "🔒", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Demo Cards", value: String(demoSubCards.length), helper: "Collected Sub cards", icon: "🃏", progress: 45 }));
  stats.appendChild(createStatCard({ label: "Review", value: "2", helper: "New/update card checks", icon: "👁️", progress: 35 }));
  stats.appendChild(createStatCard({ label: "Safety", value: "Gated", helper: "Private notes separated from submitted card fields", icon: "🛡️", progress: 50 }));
  shell.appendChild(stats);

  shell.appendChild(createCard({
    eyebrow: "Visibility Rule",
    title: scope?.rolodexName || "Mistress Rolodex",
    description: scope?.canSee || "Only collected Subs belonging to the signed-in Mistress.",
    icon: "🔐",
    meta: scope?.cannotSee || "No master Rolodex access for Mistresses.",
  }));

  shell.appendChild(createSubCardGrid(demoSubCards));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-rolodex-card-frame {
      position: relative;
      overflow: hidden;
      min-height: 22rem;
      padding: var(--mx-space-4);
      border: 2px solid var(--mx-border);
      border-radius: calc(var(--mx-radius-lg) + 0.35rem);
      background:
        radial-gradient(circle at top right, rgba(212, 175, 55, 0.18), transparent 12rem),
        linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.035));
      box-shadow: var(--mx-shadow-soft);
    }

    .mx-rolodex-card-frame--gold {
      border-color: rgba(212, 175, 55, 0.65);
    }

    .mx-rolodex-card-frame--purple {
      border-color: rgba(139, 30, 90, 0.68);
    }

    .mx-rolodex-card-frame--rose {
      border-color: rgba(255, 82, 132, 0.58);
    }

    .mx-rolodex-card-top {
      display: flex;
      justify-content: space-between;
      gap: var(--mx-space-3);
      color: var(--mx-text-soft);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-rolodex-avatar {
      display: grid;
      place-items: center;
      width: 100%;
      min-height: 9rem;
      margin: var(--mx-space-4) 0;
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-lg);
      background: rgba(0, 0, 0, 0.22);
      color: var(--mx-gold);
      font-size: var(--mx-text-2xl);
      font-weight: 900;
    }

    .mx-rolodex-card-copy h3 {
      margin: 0;
      color: var(--mx-text);
    }

    .mx-rolodex-card-copy p,
    .mx-rolodex-card-frame small {
      color: var(--mx-text-muted);
      text-transform: capitalize;
    }

    .mx-rolodex-tags {
      display: flex;
      flex-wrap: wrap;
      gap: var(--mx-space-2);
      margin: var(--mx-space-3) 0;
    }

    .mx-rolodex-tag {
      padding: 0.28rem 0.5rem;
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
