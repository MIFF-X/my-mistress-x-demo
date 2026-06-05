import { clearLiveLaunchAnalytics, getLiveLaunchAnalyticsSummary } from "./live-launch-analytics-store.js";

function createMetric(label, value) {
  const item = document.createElement("div");
  item.className = "live-launch-analytics-metric";

  const number = document.createElement("strong");
  number.innerText = String(value);

  const text = document.createElement("span");
  text.innerText = label;

  item.appendChild(number);
  item.appendChild(text);
  return item;
}

function ensureLaunchAnalyticsStyles() {
  if (document.getElementById("live-launch-analytics-summary-styles")) return;

  const style = document.createElement("style");
  style.id = "live-launch-analytics-summary-styles";
  style.textContent = `
    .live-launch-analytics-summary {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-launch-analytics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .live-launch-analytics-metric {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 12px;
    }

    .live-launch-analytics-metric strong {
      display: block;
      font-size: 22px;
      color: #d4af37;
      line-height: 1;
    }

    .live-launch-analytics-metric span {
      display: block;
      margin-top: 6px;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
    }

    .live-launch-analytics-actions {
      margin-top: 12px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
  `;
  document.head.appendChild(style);
}

export function createLiveLaunchAnalyticsSummary() {
  ensureLaunchAnalyticsStyles();

  const summary = getLiveLaunchAnalyticsSummary();
  const panel = document.createElement("div");
  panel.className = "panel live-launch-analytics-summary";

  const title = document.createElement("h3");
  title.innerText = "🚦 Launch Analytics";

  const helper = document.createElement("p");
  helper.innerText = "Starter funnel metrics from the local go-live launch event store.";

  const grid = document.createElement("div");
  grid.className = "live-launch-analytics-grid";

  grid.appendChild(createMetric("Total Events", summary.totalEvents));
  grid.appendChild(createMetric("Handoff Views", summary.handoffViews));
  grid.appendChild(createMetric("Checklist Views", summary.checklistViews));
  grid.appendChild(createMetric("Demo Entries", summary.demoEntries));
  grid.appendChild(createMetric("No Draft Warnings", summary.noDraftWarnings));

  const actions = document.createElement("div");
  actions.className = "live-launch-analytics-actions";

  const refreshBtn = document.createElement("button");
  refreshBtn.className = "button-secondary";
  refreshBtn.type = "button";
  refreshBtn.innerText = "Refresh";
  refreshBtn.onclick = () => panel.replaceWith(createLiveLaunchAnalyticsSummary());

  const clearBtn = document.createElement("button");
  clearBtn.className = "button-secondary";
  clearBtn.type = "button";
  clearBtn.innerText = "Clear Launch Events";
  clearBtn.onclick = () => {
    clearLiveLaunchAnalytics();
    panel.replaceWith(createLiveLaunchAnalyticsSummary());
  };

  actions.appendChild(refreshBtn);
  actions.appendChild(clearBtn);

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(grid);
  panel.appendChild(actions);

  return panel;
}
