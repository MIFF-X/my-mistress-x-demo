import { createMistressProfileViewModel } from "./mistress-profile.js";

function createActionButton(action, context) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = action.className || "button-secondary";
  button.innerText = action.label;

  if (typeof action.onClick === "function") {
    button.onclick = () => action.onClick(context);
  }

  return button;
}

export function createMistressCard({
  mistress = {},
  stats = {},
  actions = [],
} = {}) {
  const viewModel = createMistressProfileViewModel({ mistress, stats });

  const card = document.createElement("article");
  card.className = "panel stat-card mistress-profile-card";
  card.dataset.mistressId = viewModel.profile.id;

  const title = document.createElement("h3");
  title.innerText = `${viewModel.profile.displayName} (@${viewModel.profile.username})`;

  const meta = document.createElement("p");
  meta.innerText = `Channel ${viewModel.profile.channelStatus} - ${viewModel.profile.categories.length} category tag(s)`;

  const statsLine = document.createElement("p");
  statsLine.innerText = `Followers: ${viewModel.stats.followers} - Active Subs: ${viewModel.stats.activeSubs} - Bookings: ${viewModel.stats.openBookings}`;

  const categoryLine = document.createElement("p");
  categoryLine.innerText = viewModel.profile.categories.length > 0
    ? `Categories: ${viewModel.profile.categories.join(", ")}`
    : "Categories: none selected";

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(statsLine);
  card.appendChild(categoryLine);

  actions.forEach((action) => {
    card.appendChild(createActionButton(action, { mistress, stats, viewModel }));
  });

  return card;
}

export function createMistressCardList({ mistresses = [], actions = [] } = {}) {
  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-card-list";

  mistresses.forEach((mistress) => {
    grid.appendChild(createMistressCard({
      mistress,
      stats: mistress.stats || {},
      actions,
    }));
  });

  return grid;
}
