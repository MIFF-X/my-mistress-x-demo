export const SUB_SERVICE_BOARD_ITEMS = [
  {
    id: "watch-room",
    label: "Watch room",
    state: "Available",
    detail: "Enter viewer-safe live rooms and co-viewing sessions.",
  },
  {
    id: "bookings",
    label: "After-live bookings",
    state: "Tracked",
    detail: "Review pending, approved, declined, and completed private access.",
  },
  {
    id: "tasks",
    label: "Tasks and rituals",
    state: "Queued",
    detail: "Track service tasks without exposing Mistress-only controls.",
  },
];

export function getSubServiceBoardItems(overrides = []) {
  return overrides.length > 0 ? overrides : SUB_SERVICE_BOARD_ITEMS;
}

export function createSubServiceBoard({ items = SUB_SERVICE_BOARD_ITEMS } = {}) {
  const section = document.createElement("section");
  section.className = "panel sub-service-board";

  const title = document.createElement("h2");
  title.innerText = "Service Board";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid";

  getSubServiceBoardItems(items).forEach((item) => {
    const card = document.createElement("article");
    card.className = "panel stat-card sub-service-card";
    card.dataset.serviceId = item.id;

    const heading = document.createElement("h3");
    heading.innerText = item.label;

    const state = document.createElement("strong");
    state.innerText = item.state;

    const detail = document.createElement("p");
    detail.innerText = item.detail;

    card.appendChild(heading);
    card.appendChild(state);
    card.appendChild(detail);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}
