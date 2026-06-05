export const HEADMISTRESS_REVENUE_LANES = [
  {
    id: "splits",
    label: "Revenue splits",
    owner: "Headmistress",
    detail: "Platform category split policy, audit trail, and defaults.",
  },
  {
    id: "payouts",
    label: "Payout review",
    owner: "Admin/Headmistress",
    detail: "Creator payout queue, reserves, holds, and manual approvals.",
  },
  {
    id: "marketplace",
    label: "Marketplace shelves",
    owner: "Headmistress",
    detail: "Public visibility, default pricing, and role entitlements.",
  },
];

export function getHeadmistressRevenueLanes(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_REVENUE_LANES;
}

export function createHeadmistressRevenuePanel({ lanes = HEADMISTRESS_REVENUE_LANES } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-revenue-panel";

  const title = document.createElement("h2");
  title.innerText = "Revenue Controls";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid";

  getHeadmistressRevenueLanes(lanes).forEach((lane) => {
    const card = document.createElement("article");
    card.className = "panel stat-card headmistress-revenue-card";
    card.dataset.laneId = lane.id;

    const heading = document.createElement("h3");
    heading.innerText = lane.label;

    const owner = document.createElement("strong");
    owner.innerText = lane.owner;

    const detail = document.createElement("p");
    detail.innerText = lane.detail;

    card.appendChild(heading);
    card.appendChild(owner);
    card.appendChild(detail);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}
