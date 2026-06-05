export const SUB_MANAGEMENT_LANES = [
  {
    id: "privacy",
    label: "Privacy and consent",
    state: "Private by default",
    detail: "Journal, vault, profile labels, and identity details stay Sub-owned unless shared.",
  },
  {
    id: "relationships",
    label: "Relationship controls",
    state: "Guarded",
    detail: "Mistress links, blocks, mute states, and safety appeals remain policy-aware.",
  },
  {
    id: "economy",
    label: "Wallet and access",
    state: "Viewer-safe",
    detail: "Top-ups, unlocks, gifts, bookings, and purchases stay on Sub-owned spend paths.",
  },
];

export function getSubManagementLanes(overrides = []) {
  return overrides.length > 0 ? overrides : SUB_MANAGEMENT_LANES;
}

export function createSubManagementPanel({ lanes = SUB_MANAGEMENT_LANES } = {}) {
  const section = document.createElement("section");
  section.className = "panel sub-management-panel";

  const title = document.createElement("h2");
  title.innerText = "Sub Management";

  const list = document.createElement("ul");
  list.className = "sub-feature-list";

  getSubManagementLanes(lanes).forEach((lane) => {
    const item = document.createElement("li");
    item.dataset.laneId = lane.id;
    item.innerText = `${lane.label}: ${lane.state} - ${lane.detail}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
