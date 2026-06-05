export const MISTRESS_MANAGEMENT_LANES = [
  {
    id: "relationships",
    title: "Relationship controls",
    owner: "Mistress",
    state: "mapped",
    detail: "Private Sub cards, notes, labels, pins, access rules, and follow-up prompts.",
  },
  {
    id: "bookings",
    title: "Bookings and calls",
    owner: "Mistress",
    state: "active",
    detail: "Approve, decline, complete, and follow up on paid calls, video sessions, and after-show offers.",
  },
  {
    id: "privacy",
    title: "Privacy and locks",
    owner: "Mistress",
    state: "mapped",
    detail: "Code locks, visibility rules, private lists, follower scopes, and restricted contact paths.",
  },
  {
    id: "economy",
    title: "Creator economy",
    owner: "Mistress",
    state: "active",
    detail: "Tributes, PPV prompts, gift wall, booking pricing, store offers, and provider queue review.",
  },
];

export function getMistressManagementLanes(overrides = []) {
  return overrides.length > 0 ? overrides : MISTRESS_MANAGEMENT_LANES;
}

function createLaneCard(lane) {
  const card = document.createElement("article");
  card.className = "panel stat-card mistress-management-lane";
  card.dataset.laneId = lane.id;

  const title = document.createElement("h3");
  title.innerText = lane.title;

  const meta = document.createElement("p");
  meta.innerText = `${lane.owner} - ${lane.state}`;

  const detail = document.createElement("p");
  detail.innerText = lane.detail;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(detail);

  return card;
}

export function createMistressManagementPanel({ lanes = MISTRESS_MANAGEMENT_LANES } = {}) {
  const panel = document.createElement("section");
  panel.className = "panel mistress-management-panel";

  const title = document.createElement("h2");
  title.innerText = "Mistress Management";

  const intro = document.createElement("p");
  intro.innerText = "Creator-owned controls for relationships, scheduling, privacy, and monetised access.";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-management-lanes";

  getMistressManagementLanes(lanes).forEach((lane) => {
    grid.appendChild(createLaneCard(lane));
  });

  panel.appendChild(title);
  panel.appendChild(intro);
  panel.appendChild(grid);

  return panel;
}
