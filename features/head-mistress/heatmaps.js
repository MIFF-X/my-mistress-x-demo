export const HEADMISTRESS_HEATMAP_ZONES = [
  {
    id: "wallet",
    label: "Wallet pressure",
    intensity: "High",
    detail: "Top-up, spend, reserve, and refund events need economy oversight.",
  },
  {
    id: "live",
    label: "Live room demand",
    intensity: "Medium",
    detail: "Host queue, provider SLA, and paid request density.",
  },
  {
    id: "safety",
    label: "Safety review",
    intensity: "Medium",
    detail: "Moderation, appeals, and restricted relationship checks.",
  },
];

export function getHeadmistressHeatmapZones(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_HEATMAP_ZONES;
}

export function createHeadmistressHeatmapsPanel({ zones = HEADMISTRESS_HEATMAP_ZONES } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-heatmaps-panel";

  const title = document.createElement("h2");
  title.innerText = "Risk Heatmaps";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid";

  getHeadmistressHeatmapZones(zones).forEach((zone) => {
    const card = document.createElement("article");
    card.className = "panel stat-card headmistress-heatmap-card";
    card.dataset.zoneId = zone.id;

    const heading = document.createElement("h3");
    heading.innerText = zone.label;

    const intensity = document.createElement("strong");
    intensity.innerText = zone.intensity;

    const detail = document.createElement("p");
    detail.innerText = zone.detail;

    card.appendChild(heading);
    card.appendChild(intensity);
    card.appendChild(detail);
    grid.appendChild(card);
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}
