export const positionStore = {
  positions: [
    {
      name: "Crown Holder",
      mistressId: "demo-mistress",
      holderId: null,
      value: 0
    }
  ],
  supporterStats: {}
};

export function updateSupporterSpend({ subId, mistressId, amount }) {
  const key = `${subId}-${mistressId}`;

  if (!positionStore.supporterStats[key]) {
    positionStore.supporterStats[key] = {
      subId,
      mistressId,
      totalSpent: 0
    };
  }

  positionStore.supporterStats[key].totalSpent += amount;

  return positionStore.supporterStats[key];
}

export function updateCrownHolder(mistressId) {
  const stats = Object.values(positionStore.supporterStats)
    .filter(s => s.mistressId === mistressId)
    .sort((a, b) => b.totalSpent - a.totalSpent);

  if (!stats.length) return null;

  const top = stats[0];

  const crown = positionStore.positions.find(
    p => p.name === "Crown Holder" && p.mistressId === mistressId
  );

  if (crown) {
    crown.holderId = top.subId;
    crown.value = top.totalSpent;
  }

  return crown;
}
