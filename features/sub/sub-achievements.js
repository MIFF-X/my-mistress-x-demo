export const SUB_ACHIEVEMENTS = [
  {
    id: "devotion-streak",
    title: "Devotion Streak",
    status: "Active",
    detail: "Tracks ritual, booking, live-room, and journal participation over time.",
  },
  {
    id: "trusted-supporter",
    title: "Trusted Supporter",
    status: "Earned",
    detail: "Recognition from verified spend, respectful conduct, and follow-through.",
  },
  {
    id: "collector-path",
    title: "Collector Path",
    status: "In progress",
    detail: "Stickers, gifts, cards, marketplace items, and live-show keepsakes.",
  },
];

export function getSubAchievements(overrides = []) {
  return overrides.length > 0 ? overrides : SUB_ACHIEVEMENTS;
}

export function createSubAchievementsPanel({ achievements = SUB_ACHIEVEMENTS } = {}) {
  const section = document.createElement("section");
  section.className = "panel sub-achievements-panel";

  const title = document.createElement("h2");
  title.innerText = "Sub Achievements";

  const list = document.createElement("ul");
  list.className = "sub-feature-list";

  getSubAchievements(achievements).forEach((achievement) => {
    const item = document.createElement("li");
    item.dataset.achievementId = achievement.id;
    item.innerText = `${achievement.title}: ${achievement.status} - ${achievement.detail}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
