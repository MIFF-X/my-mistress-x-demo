export const HEADMISTRESS_PRIZE_POOL = [
  {
    id: "daily-games",
    label: "Daily games",
    allocation: "Credit rewards",
    guard: "Wallet settlement review",
  },
  {
    id: "creator-events",
    label: "Creator events",
    allocation: "Premium placement",
    guard: "Headmistress approval",
  },
  {
    id: "asset-packs",
    label: "Asset packs",
    allocation: "Digital prize bundle",
    guard: "Marketplace entitlement check",
  },
];

export function getHeadmistressPrizePool(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_PRIZE_POOL;
}

export function createHeadmistressPrizePoolPanel({ prizes = HEADMISTRESS_PRIZE_POOL } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-prize-pool-panel";

  const title = document.createElement("h2");
  title.innerText = "Prize Pool";

  const list = document.createElement("ul");
  list.className = "headmistress-control-list";

  getHeadmistressPrizePool(prizes).forEach((prize) => {
    const item = document.createElement("li");
    item.dataset.prizeId = prize.id;
    item.innerText = `${prize.label}: ${prize.allocation} - ${prize.guard}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
