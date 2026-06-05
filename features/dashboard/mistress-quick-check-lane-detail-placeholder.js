import { createCard, createStatCard } from "../ui/card.js";

const laneDetails = [
  { id: "messages", title: "Messages", icon: "💬", visibility: "Mistress + approved admin", guard: "account", action: "Open unread, paid, priority, and follow-up chat signals." },
  { id: "bookings", title: "Bookings", icon: "📅", visibility: "Mistress + approved admin", guard: "account", action: "Review paid call/video requests, confirmations, countdown state, and cancellations." },
  { id: "requests", title: "Requests", icon: "📝", visibility: "Mistress + approved admin", guard: "moderation", action: "Sort custom asks, paid tasks, content requests, and special instructions by urgency." },
  { id: "confessions", title: "Confessions", icon: "🕯️", visibility: "Mistress + Headmistress escalation", guard: "moderation", action: "Review confessional booth intake with report/escalation controls before any automation." },
  { id: "affirmations", title: "Affirmations", icon: "✨", visibility: "Mistress", guard: "account", action: "See praise, confirmations, ritual replies, and positive follow-up prompts." },
  { id: "secrets", title: "Secrets", icon: "🔐", visibility: "Mistress + consent scope", guard: "consent", action: "Keep sensitive private submissions behind consent, expiry, revoke, and audit controls." },
  { id: "contracts", title: "Contracts", icon: "📜", visibility: "Mistress + consent scope", guard: "consent", action: "Track promises, pledges, keeper agreements, expiry, and review notes." },
  { id: "fulfilment", title: "Fulfilment", icon: "📦", visibility: "Mistress + fulfilment helper", guard: "moderation", action: "Track store orders, custom items, inventory state, delivery status, and disputes." },
  { id: "rolodex-review", title: "Rolodex Review", icon: "🗂️", visibility: "Mistress only", guard: "consent", action: "Review new Sub cards, tags, profile updates, relationship changes, and private notes." },
  { id: "contributions", title: "Contributions", icon: "💎", visibility: "Mistress + finance view", guard: "account", action: "Surface goals, gifts, top-ups, subscriptions, and contribution signals." },
];

function createLaneTable(lanes) {
  const table = document.createElement("div");
  table.className = "mx-lane-detail-table";

  const header = document.createElement("div");
  header.className = "mx-lane-detail-row mx-lane-detail-row--header";
  header.innerHTML = "<strong>Lane</strong><strong>Visibility</strong><strong>Guard</strong><strong>Action</strong>";
  table.appendChild(header);

  lanes.forEach((lane) => {
    const row = document.createElement("div");
    row.className = `mx-lane-detail-row mx-lane-detail-row--${lane.guard}`;
    row.innerHTML = `
      <span><strong>${lane.icon} ${lane.title}</strong><small>${lane.id}</small></span>
      <span>${lane.visibility}</span>
      <span class="mx-lane-guard mx-lane-guard--${lane.guard}">${lane.guard}</span>
      <span>${lane.action}</span>
    `;
    table.appendChild(row);
  });

  return table;
}

export function createMistressQuickCheckLaneDetailPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const consentCount = laneDetails.filter((lane) => lane.guard === "consent").length;
  const moderationCount = laneDetails.filter((lane) => lane.guard === "moderation").length;
  const accountCount = laneDetails.filter((lane) => lane.guard === "account").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Quick Check",
    title: "Lane Detail Map",
    description: "A deeper map of the Quick Check Zone so each daily attention lane has visibility rules, guard level, and a first action path before backend wiring.",
    icon: "⚡",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Lanes", value: String(laneDetails.length), helper: "Quick Check sources", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Account", value: String(accountCount), helper: "Owner-scoped views", icon: "🔒", progress: 75 }));
  stats.appendChild(createStatCard({ label: "Consent", value: String(consentCount), helper: "Needs explicit permissions", icon: "✍️", progress: 55 }));
  stats.appendChild(createStatCard({ label: "Moderation", value: String(moderationCount), helper: "Needs review/dispute paths", icon: "🚦", progress: 55 }));
  shell.appendChild(stats);

  shell.appendChild(createLaneTable(laneDetails));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-lane-detail-table { display: grid; gap: var(--mx-space-2); }
    .mx-lane-detail-row {
      display: grid;
      grid-template-columns: 0.9fr 1fr 0.65fr 1.4fr;
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
    .mx-lane-detail-row--header {
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .mx-lane-detail-row small { display: block; margin-top: 0.25rem; color: var(--mx-text-soft); font-size: var(--mx-text-xs); }
    .mx-lane-guard {
      justify-self: start;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
    }
    .mx-lane-guard--consent { border-color: rgba(212, 175, 55, 0.4); color: var(--mx-gold); background: rgba(212, 175, 55, 0.08); }
    .mx-lane-guard--moderation { border-color: rgba(255, 176, 32, 0.42); color: #ffcf73; background: rgba(255, 176, 32, 0.1); }
    .mx-lane-guard--account { border-color: rgba(255, 255, 255, 0.24); color: var(--mx-text); background: rgba(255, 255, 255, 0.07); }
    @media (max-width: 920px) { .mx-lane-detail-row, .mx-lane-detail-row--header { grid-template-columns: 1fr; } }
  `;
  shell.appendChild(styles);

  return shell;
}
