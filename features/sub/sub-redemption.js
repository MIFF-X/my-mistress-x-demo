export const SUB_REDEMPTION_OPTIONS = [
  {
    id: "booking-credit",
    label: "Booking credit",
    cost: "Earned credit",
    detail: "Apply approved rewards toward after-live phone or video bookings.",
  },
  {
    id: "collector-drop",
    label: "Collector drop",
    cost: "Badge gated",
    detail: "Redeem achievement status for sticker, gift, or digital keepsake drops.",
  },
  {
    id: "mistress-perk",
    label: "Mistress perk",
    cost: "Relationship gated",
    detail: "Request a configured perk without bypassing Mistress approval.",
  },
];

export function getSubRedemptionOptions(overrides = []) {
  return overrides.length > 0 ? overrides : SUB_REDEMPTION_OPTIONS;
}

export function createSubRedemptionPanel({ options = SUB_REDEMPTION_OPTIONS } = {}) {
  const section = document.createElement("section");
  section.className = "panel sub-redemption-panel";

  const title = document.createElement("h2");
  title.innerText = "Redemption";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid";

  getSubRedemptionOptions(options).forEach((option) => {
    const card = document.createElement("article");
    card.className = "panel stat-card sub-redemption-card";
    card.dataset.redemptionId = option.id;

    const heading = document.createElement("h3");
    heading.innerText = option.label;

    const cost = document.createElement("strong");
    cost.innerText = option.cost;

    const detail = document.createElement("p");
    detail.innerText = option.detail;

    card.appendChild(heading);
    card.appendChild(cost);
    card.appendChild(detail);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}
