import { clearDiscoveryAnalytics, getDiscoveryAnalyticsSummary } from "./discovery-analytics-store.js";

function createMetric(label, value) {
  const item = document.createElement("div");
  item.className = "discovery-analytics-metric";

  const number = document.createElement("strong");
  number.innerText = String(value);

  const text = document.createElement("span");
  text.innerText = label;

  item.appendChild(number);
  item.appendChild(text);
  return item;
}

function ensureAnalyticsSummaryStyles() {
  if (document.getElementById("discovery-analytics-summary-styles")) return;

  const style = document.createElement("style");
  style.id = "discovery-analytics-summary-styles";
  style.textContent = `
    .discovery-analytics-summary {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .discovery-analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .discovery-analytics-metric {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 12px;
    }

    .discovery-analytics-metric strong {
      display: block;
      font-size: 22px;
      color: #d4af37;
      line-height: 1;
    }

    .discovery-analytics-metric span {
      display: block;
      margin-top: 6px;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
    }

    .discovery-analytics-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `;
  document.head.appendChild(style);
}

export function createDiscoveryAnalyticsSummary() {
  ensureAnalyticsSummaryStyles();

  const summary = getDiscoveryAnalyticsSummary();
  const panel = document.createElement("div");
  panel.className = "panel discovery-analytics-summary";

  const title = document.createElement("h3");
  title.innerText = "📊 Discovery Analytics";

  const helper = document.createElement("p");
  helper.innerText = "Starter funnel metrics from the local discovery event store.";

  const grid = document.createElement("div");
  grid.className = "discovery-analytics-grid";

  grid.appendChild(createMetric("Total Events", summary.totalEvents));
  grid.appendChild(createMetric("Previews", summary.previews));
  grid.appendChild(createMetric("Saves", summary.saves));
  grid.appendChild(createMetric("Follows", summary.follows));
  grid.appendChild(createMetric("Skips", summary.skips));
  grid.appendChild(createMetric("Joins", summary.joins));
  grid.appendChild(createMetric("Upgrade Prompts", summary.upgrades));

  const actions = document.createElement("div");
  actions.className = "discovery-analytics-actions";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "button-secondary";
  refreshBtn.innerText = "Refresh";
  refreshBtn.onclick = () => {
    const replacement = createDiscoveryAnalyticsSummary();
    panel.replaceWith(replacement);
  };

  const clearBtn = document.createElement("button");
  clearBtn.className = "button-secondary";
  clearBtn.innerText = "Clear Demo Events";
  clearBtn.onclick = () => {
    clearDiscoveryAnalytics();
    const replacement = createDiscoveryAnalyticsSummary();
    panel.replaceWith(replacement);
  };

  actions.appendChild(refreshBtn);
  actions.appendChild(clearBtn);

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(grid);
  panel.appendChild(actions);

  return panel;
}
