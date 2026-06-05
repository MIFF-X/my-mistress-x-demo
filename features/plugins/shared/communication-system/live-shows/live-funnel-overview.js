import { getDiscoveryAnalyticsSummary } from "./discovery-analytics-store.js";
import { getLiveLaunchAnalyticsSummary } from "./live-launch-analytics-store.js";
import { getLiveCategorySetups } from "./live-category-setup-store.js";

function ensureLiveFunnelOverviewStyles() {
  if (document.getElementById("live-funnel-overview-styles")) return;

  const style = document.createElement("style");
  style.id = "live-funnel-overview-styles";
  style.textContent = `
    .live-funnel-overview {
      border: 1px solid rgba(212,175,55,0.28);
      background: linear-gradient(135deg, rgba(212,175,55,0.12), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.22);
    }

    .live-funnel-overview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      gap: 10px;
      margin-top: 12px;
    }

    .live-funnel-overview-metric {
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06);
      border-radius: 14px;
      padding: 12px;
    }

    .live-funnel-overview-metric strong {
      display: block;
      font-size: 22px;
      color: #d4af37;
      line-height: 1;
    }

    .live-funnel-overview-metric span {
      display: block;
      margin-top: 6px;
      color: rgba(255,255,255,0.72);
      font-size: 12px;
      font-weight: 800;
    }

    .live-funnel-overview-note {
      margin-top: 12px;
      color: rgba(255,255,255,0.72);
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);
}

function createMetric(label, value) {
  const item = document.createElement("div");
  item.className = "live-funnel-overview-metric";

  const number = document.createElement("strong");
  number.innerText = String(value);

  const text = document.createElement("span");
  text.innerText = label;

  item.appendChild(number);
  item.appendChild(text);
  return item;
}

export function createLiveFunnelOverview() {
  ensureLiveFunnelOverviewStyles();

  const discovery = getDiscoveryAnalyticsSummary();
  const launch = getLiveLaunchAnalyticsSummary();
  const setups = getLiveCategorySetups();
  const panel = document.createElement("div");
  panel.className = "panel live-funnel-overview";

  const title = document.createElement("h3");
  title.innerText = "📈 Live Funnel Overview";

  const helper = document.createElement("p");
  helper.innerText = "Combined local metrics for discovery previews, saved setup drafts, and go-live handoff activity.";

  const grid = document.createElement("div");
  grid.className = "live-funnel-overview-grid";

  grid.appendChild(createMetric("Saved Drafts", setups.length));
  grid.appendChild(createMetric("Preview Views", discovery.previews));
  grid.appendChild(createMetric("Saves", discovery.saves));
  grid.appendChild(createMetric("Follows", discovery.follows));
  grid.appendChild(createMetric("Join Clicks", discovery.joins));
  grid.appendChild(createMetric("Handoff Views", launch.handoffViews));
  grid.appendChild(createMetric("Demo Entries", launch.demoEntries));

  const note = document.createElement("p");
  note.className = "live-funnel-overview-note";
  note.innerText = "Next backend pass can replace this local storage data with real analytics events, user IDs, room IDs, conversion rates, and wallet outcomes.";

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(grid);
  panel.appendChild(note);

  return panel;
}
