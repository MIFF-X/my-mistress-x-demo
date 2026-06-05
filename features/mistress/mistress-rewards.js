export const MISTRESS_REWARD_LANES = [
  {
    id: "tribute-thanks",
    title: "Tribute recognition",
    state: "ready",
    detail: "Private and public-safe thank-you cards tied to tribute and wallet receipt history.",
  },
  {
    id: "gift-wall",
    title: "Gift wall",
    state: "active",
    detail: "Pinned approved gifts, featured reactions, and live-room gift-wall visibility.",
  },
  {
    id: "wishlist-perks",
    title: "Wishlist perks",
    state: "mapped",
    detail: "Wishlist purchase acknowledgements, fulfilment notes, and follow-up prompts.",
  },
  {
    id: "loyalty-rewards",
    title: "Loyalty rewards",
    state: "mapped",
    detail: "Badge callouts, position holder perks, league recognition, and private reward queues.",
  },
];

export function getMistressRewardLanes(overrides = []) {
  return overrides.length > 0 ? overrides : MISTRESS_REWARD_LANES;
}

function createRewardCard(reward) {
  const card = document.createElement("article");
  card.className = "panel stat-card mistress-reward-card";
  card.dataset.rewardId = reward.id;

  const title = document.createElement("h3");
  title.innerText = reward.title;

  const meta = document.createElement("p");
  meta.innerText = `State: ${reward.state}`;

  const detail = document.createElement("p");
  detail.innerText = reward.detail;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(detail);

  return card;
}

export function createMistressRewardsPanel({ rewards = MISTRESS_REWARD_LANES } = {}) {
  const panel = document.createElement("section");
  panel.className = "panel mistress-rewards-panel";

  const title = document.createElement("h2");
  title.innerText = "Rewards";

  const intro = document.createElement("p");
  intro.innerText = "Recognition, gift, wishlist, and loyalty lanes owned by the creator surface.";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid mistress-reward-list";

  getMistressRewardLanes(rewards).forEach((reward) => {
    grid.appendChild(createRewardCard(reward));
  });

  panel.appendChild(title);
  panel.appendChild(intro);
  panel.appendChild(grid);

  return panel;
}
