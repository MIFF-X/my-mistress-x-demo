export const HEADMISTRESS_AWARD_QUEUE = [
  {
    id: "creator-standing",
    title: "Creator standing",
    state: "Ready",
    detail: "Review creator status, premium titles, and platform recognition.",
  },
  {
    id: "sub-devotion",
    title: "Sub devotion",
    state: "Draft",
    detail: "Keep public awards separate from private obedience or safety records.",
  },
  {
    id: "event-winners",
    title: "Event winners",
    state: "Needs settlement",
    detail: "Confirm game or campaign winners before rewards publish.",
  },
];

export function getHeadmistressAwardQueue(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_AWARD_QUEUE;
}

export function createHeadmistressAwardsPanel({ awards = HEADMISTRESS_AWARD_QUEUE } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-awards-panel";

  const title = document.createElement("h2");
  title.innerText = "Awards Queue";

  const list = document.createElement("ul");
  list.className = "headmistress-control-list";

  getHeadmistressAwardQueue(awards).forEach((award) => {
    const item = document.createElement("li");
    item.dataset.awardId = award.id;
    item.innerText = `${award.title}: ${award.state} - ${award.detail}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
