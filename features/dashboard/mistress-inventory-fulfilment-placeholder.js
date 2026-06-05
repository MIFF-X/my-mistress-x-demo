import { createCard, createStatCard } from "../ui/card.js";

const inventoryLanes = [
  {
    id: "catalogue",
    label: "Catalogue",
    icon: "🛍️",
    count: 14,
    status: "catalogue",
    note: "Store listings, vending machine items, hamper categories, digital items, and future limited drops.",
  },
  {
    id: "stock-drops",
    label: "Stock + Drops",
    icon: "📦",
    count: 7,
    status: "stock",
    note: "Stock counts, weekly reloads, scheduled drops, limited quantities, and sold-out states.",
  },
  {
    id: "orders",
    label: "Orders",
    icon: "🧾",
    count: 9,
    status: "active",
    note: "Purchases waiting for confirmation, fulfilment, dispatch, completion, or buyer update.",
  },
  {
    id: "custom-requests",
    label: "Custom Requests",
    icon: "📝",
    count: 5,
    status: "review",
    note: "Custom order requests, special instructions, price quotes, approval, and decline flows.",
  },
  {
    id: "fulfilment",
    label: "Fulfilment",
    icon: "🚚",
    count: 6,
    status: "fulfilment",
    note: "Pack, prepare, deliver/send, mark complete, and store tracking or delivery notes safely.",
  },
  {
    id: "disputes-refunds",
    label: "Disputes + Refunds",
    icon: "🛡️",
    count: 2,
    status: "policy_review",
    note: "Refund requests, dispute handling, category policy checks, and admin escalation lanes.",
  },
];

function createInventoryLaneGrid(lanes) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  lanes.forEach((lane) => {
    const detail = document.createElement("div");
    detail.className = "mx-inventory-lane-detail";
    detail.innerHTML = `
      <span class="mx-inventory-pill mx-inventory-pill--${lane.status}">${lane.status.replaceAll("_", " ")}</span>
      <strong>${lane.count}</strong>
      <p>${lane.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: "Inventory Lane",
      title: lane.label,
      description: "A marketplace and fulfilment lane for the Mistress dashboard.",
      icon: lane.icon,
      meta: lane.id,
      children: [detail],
    }));
  });

  return grid;
}

export function createMistressInventoryFulfilmentPlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const totalItems = inventoryLanes.reduce((sum, lane) => sum + lane.count, 0);
  const policyLanes = inventoryLanes.filter((lane) => lane.status === "policy_review" || lane.status === "review").length;

  shell.appendChild(createCard({
    eyebrow: "Mistress Dashboard Utility",
    title: "Inventory + Fulfilment",
    description: "A safe placeholder for store listings, vending/hamper catalogue items, stock drops, orders, custom requests, fulfilment, refunds, and dispute-sensitive marketplace workflows.",
    icon: "🛍️",
  }));

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Inventory Lanes", value: String(inventoryLanes.length), helper: "Marketplace sections", icon: "🧩", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Demo Items", value: String(totalItems), helper: "Placeholder activity count", icon: "🛍️", progress: 70 }));
  stats.appendChild(createStatCard({ label: "Policy Lanes", value: String(policyLanes), helper: "Review/dispute sensitive", icon: "🛡️", progress: 45 }));
  stats.appendChild(createStatCard({ label: "Order Ledger", value: "Needed", helper: "Required before live marketplace wiring", icon: "🧾", progress: 35 }));
  shell.appendChild(stats);

  shell.appendChild(createInventoryLaneGrid(inventoryLanes));

  const styles = document.createElement("style");
  styles.textContent = `
    .mx-inventory-lane-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-inventory-lane-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-inventory-lane-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-inventory-pill {
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

    .mx-inventory-pill--catalogue,
    .mx-inventory-pill--stock,
    .mx-inventory-pill--active,
    .mx-inventory-pill--fulfilment {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-inventory-pill--review {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-inventory-pill--policy_review {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }
  `;
  shell.appendChild(styles);

  return shell;
}
