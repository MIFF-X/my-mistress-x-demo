import { createSubProfileViewModel, renderSubProfileSummary } from "./sub-profile.js";

export function createSubCard({
  sub = {},
  publicStats = {},
  actions = [],
} = {}) {
  const viewModel = createSubProfileViewModel({ sub, publicStats });
  const summary = renderSubProfileSummary(viewModel);

  const card = document.createElement("article");
  card.className = "panel stat-card sub-profile-card";
  card.dataset.subId = viewModel.profile.id;

  const title = document.createElement("h3");
  title.innerText = summary.header;

  const meta = document.createElement("p");
  meta.innerText = `Member since ${summary.memberSince} - ${summary.badgeCount} badge(s)`;

  const stats = document.createElement("p");
  stats.innerText = `Tributes: ${summary.stats.totalTributes} - Streak: ${summary.stats.streakDays} days - Tasks: ${summary.stats.tasksCompleted}`;

  const tagLine = document.createElement("p");
  tagLine.innerText = summary.tags.length > 0
    ? `Tags: ${summary.tags.join(", ")}`
    : "Tags: none selected";

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(stats);
  card.appendChild(tagLine);

  actions.forEach((action) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = action.className || "button-secondary";
    button.innerText = action.label;
    if (typeof action.onClick === "function") {
      button.onclick = () => action.onClick({ sub, viewModel, summary });
    }
    card.appendChild(button);
  });

  return card;
}

export function createSubCardList({ subs = [], actions = [] } = {}) {
  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid sub-card-list";

  subs.forEach((sub) => {
    grid.appendChild(createSubCard({ sub, publicStats: sub.publicStats, actions }));
  });

  return grid;
}
