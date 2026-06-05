import { createCard, createStatCard } from "../ui/card.js";

const ppvLanes = [
  {
    id: "upload-draft",
    label: "Upload Draft",
    icon: "⬆️",
    count: 4,
    status: "draft",
    note: "Content upload drafts waiting for title, description, preview, tags, and category selection.",
  },
  {
    id: "pricing-access",
    label: "Pricing + Access",
    icon: "💰",
    count: 6,
    status: "setup_needed",
    note: "Price, unlock duration, buy-to-keep rules, subscription bundle access, and timed availability.",
  },
  {
    id: "moderation-review",
    label: "Moderation Review",
    icon: "🛡️",
    count: 3,
    status: "safety_review",
    note: "Compliance checks, ownership confirmation, access rules, and publication safety review.",
  },
  {
    id: "published",
    label: "Published PPV",
    icon: "🎬",
    count: 11,
    status: "published",
    note: "Live paid items with active access windows, purchases, bundle visibility, and buyer history.",
  },
  {
    id: "expired-access",
    label: "Expired Access",
    icon: "⏳",
    count: 9,
    status: "expired",
    note: "Timed access that has ended and may prompt renewal, repurchase, or subscription upgrade.",
  },
];

function createPpvLaneGrid(lanes) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  lanes.forEach((lane) => {
    const detail = document.createElement("div");
    detail.className = "mx-ppv-lane-detail";
    detail.innerHTML = `
      <span class="mx-ppv-pill mx-ppv-pill--${lane.status}">${lane.status.replaceAll("_", " ")}</span>
      <strong>${lane.count}</strong>
      <p>${lane.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: "PPV Content Lane",
      title: lane.label,
      description: "A content monetisation lane for the Mistress dashboard.",
      icon: lane.icon,
      meta: lane.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressPpvContentManagerPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const totalItems = ppvLanes.reduce((sum, lane) => sum + lane.count, 0);
  const safetyReviewCount = ppvLanes.filter((lane) => lane.status === "safety_review").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "PPV Content Manager",
    description: "A safe placeholder for paid media management: upload drafts, pricing, timed access, buy-to-keep rules, bundle visibility, moderation review, and published PPV history.",
    icon: "🎬",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "PPV Lanes", value: String(ppvLanes.length), helper: "Content lifecycle sections", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Demo Items", value: String(totalItems), helper: "Placeholder content count", icon: "🎬", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Review", value: String(safetyReviewCount), helper: "Moderation lane active", icon: "🛡️", progress: 45 }));
  stats.appendChild(createStatCard({ label: "Access Ledger", value: "Needed", helper: "Required before live PPV wiring", icon: "🔐", progress: 35 }));
  shell.appendChild(stats);

  shell.appendChild(createPpvLaneGrid(ppvLanes));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-ppv-lane-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-ppv-lane-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-ppv-lane-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-ppv-pill {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-ppv-pill--published,
    .mx-ppv-pill--expired {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-ppv-pill--draft,
    .mx-ppv-pill--setup_needed {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-ppv-pill--safety_review {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
