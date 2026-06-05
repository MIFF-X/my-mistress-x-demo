export const MISTRESS_POSITION_LANES = [
  {
    id: "crown-holder",
    title: "Crown holder",
    holder: "Vacant",
    minimumCredits: 250,
    detail: "Top devotion lane with pledge history and visible holder status.",
  },
  {
    id: "throne-seat",
    title: "Throne seat",
    holder: "Vacant",
    minimumCredits: 150,
    detail: "Rotating high-status position for live-room, chat, and profile callouts.",
  },
  {
    id: "shoe-position",
    title: "Shoe position",
    holder: "Vacant",
    minimumCredits: 75,
    detail: "Entry position lane for loyalty challenges, gift prompts, and public-safe bragging rights.",
  },
  {
    id: "league-roster",
    title: "Mistress League roster",
    holder: "Roster managed",
    minimumCredits: 0,
    detail: "Supporter list, trusted helpers, and visible loyalty tiers controlled by the Mistress.",
  },
];

export function getMistressPositionLanes(overrides = []) {
  return overrides.length > 0 ? overrides : MISTRESS_POSITION_LANES;
}

function createPositionCard(position) {
  const card = document.createElement("article");
  card.className = "panel stat-card mistress-position-card";
  card.dataset.positionId = position.id;

  const title = document.createElement("h3");
  title.innerText = position.title;

  const meta = document.createElement("p");
  meta.innerText = `Holder: ${position.holder} - minimum ${position.minimumCredits} credits`;

  const detail = document.createElement("p");
  detail.innerText = position.detail;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(detail);

  return card;
}

export function createMistressPositionsPanel({ positions = MISTRESS_POSITION_LANES } = {}) {
  const panel = document.createElement("section");
  panel.className = "panel mistress-positions-panel";

  const title = document.createElement("h2");
  title.innerText = "Positions";

  const intro = document.createElement("p");
  intro.innerText = "Mistress-owned title, holder, pledge, and loyalty lanes.";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-position-list";

  getMistressPositionLanes(positions).forEach((position) => {
    grid.appendChild(createPositionCard(position));
  });

  panel.appendChild(title);
  panel.appendChild(intro);
  panel.appendChild(grid);

  return panel;
}
