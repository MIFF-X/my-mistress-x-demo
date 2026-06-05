export const HEADMISTRESS_USER_CONTROL_LANES = [
  {
    id: "members",
    label: "Member controls",
    action: "Review access",
    detail: "Admin, Mistress, and Sub roles remain separated by route and entitlement.",
  },
  {
    id: "moderation",
    label: "Moderation controls",
    action: "Escalate",
    detail: "Appeals, disputes, and relationship controls route to governed review.",
  },
  {
    id: "visibility",
    label: "Visibility controls",
    action: "Audit",
    detail: "Homepage, marketplace, channel, and external modules stay policy-owned.",
  },
];

export function getHeadmistressUserControlLanes(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_USER_CONTROL_LANES;
}

export function createHeadmistressUserControlsPanel({ lanes = HEADMISTRESS_USER_CONTROL_LANES } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-user-controls-panel";

  const title = document.createElement("h2");
  title.innerText = "User Controls";

  const list = document.createElement("ul");
  list.className = "headmistress-control-list";

  getHeadmistressUserControlLanes(lanes).forEach((lane) => {
    const item = document.createElement("li");
    item.dataset.controlId = lane.id;
    item.innerText = `${lane.label}: ${lane.action} - ${lane.detail}`;
    list.appendChild(item);
  });

  section.appendChild(title);
  section.appendChild(list);

  return section;
}
