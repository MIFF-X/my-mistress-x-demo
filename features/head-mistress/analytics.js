export const HEADMISTRESS_ANALYTICS_METRICS = [
  {
    id: "active-lanes",
    label: "Active lanes",
    value: "12",
    detail: "Live, marketplace, wallet, chat, games, safety, and external modules reporting.",
  },
  {
    id: "review-coverage",
    label: "Review coverage",
    value: "84%",
    detail: "Moderation, fulfilment, provider, and policy queues with owner visibility.",
  },
  {
    id: "risk-signals",
    label: "Risk signals",
    value: "6",
    detail: "Items requiring Headmistress/Admin follow-up before public escalation.",
  },
];

function createMetricCard(metric) {
  const card = document.createElement("article");
  card.className = "panel stat-card headmistress-analytics-card";
  card.dataset.metricId = metric.id;

  const label = document.createElement("h3");
  label.innerText = metric.label;

  const value = document.createElement("strong");
  value.innerText = metric.value;

  const detail = document.createElement("p");
  detail.innerText = metric.detail;

  card.appendChild(label);
  card.appendChild(value);
  card.appendChild(detail);

  return card;
}

export function getHeadmistressAnalyticsMetrics(overrides = []) {
  return overrides.length > 0 ? overrides : HEADMISTRESS_ANALYTICS_METRICS;
}

export function createHeadmistressAnalyticsPanel({ metrics = HEADMISTRESS_ANALYTICS_METRICS } = {}) {
  const section = document.createElement("section");
  section.className = "panel headmistress-analytics-panel";

  const title = document.createElement("h2");
  title.innerText = "Platform Analytics";

  const grid = document.createElement("div");
  grid.className = "dashboard-card-grid";

  getHeadmistressAnalyticsMetrics(metrics).forEach((metric) => {
    grid.appendChild(createMetricCard(metric));
  });

  section.appendChild(title);
  section.appendChild(grid);

  return section;
}
