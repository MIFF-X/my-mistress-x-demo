import { createHeadmistressAnalyticsPanel } from "./analytics.js";
import { createHeadmistressAwardsPanel } from "./awards.js";
import { createHeadmistressHeatmapsPanel } from "./heatmaps.js";
import { createHeadmistressPrizePoolPanel } from "./prize-pool.js";
import { createHeadmistressRevenuePanel } from "./revenue.js";
import { createHeadmistressTrafficPanel } from "./traffic.js";
import { createHeadmistressUserControlsPanel } from "./user-controls.js";

export const HEADMISTRESS_CONTROL_MODULES = [
  { id: "analytics", label: "Platform Analytics", createPanel: createHeadmistressAnalyticsPanel },
  { id: "traffic", label: "Traffic Oversight", createPanel: createHeadmistressTrafficPanel },
  { id: "revenue", label: "Revenue Controls", createPanel: createHeadmistressRevenuePanel },
  { id: "awards", label: "Awards Queue", createPanel: createHeadmistressAwardsPanel },
  { id: "prize-pool", label: "Prize Pool", createPanel: createHeadmistressPrizePoolPanel },
  { id: "heatmaps", label: "Risk Heatmaps", createPanel: createHeadmistressHeatmapsPanel },
  { id: "user-controls", label: "User Controls", createPanel: createHeadmistressUserControlsPanel },
];

export function createHeadmistressControlDashboard({
  modules = HEADMISTRESS_CONTROL_MODULES,
} = {}) {
  const shell = document.createElement("section");
  shell.className = "page-shell headmistress-control-dashboard";
  shell.dataset.role = "HEADMISTRESS";

  const title = document.createElement("h1");
  title.innerText = "Headmistress Control Dashboard";

  const helper = document.createElement("p");
  helper.innerText = "A marker-clean control pocket for analytics, traffic, money, awards, prize pools, heatmaps, and governed user controls.";

  const grid = document.createElement("div");
  grid.className = "headmistress-control-dashboard__modules";

  modules.forEach((module) => {
    if (typeof module.createPanel === "function") {
      grid.appendChild(module.createPanel());
    }
  });

  shell.appendChild(title);
  shell.appendChild(helper);
  shell.appendChild(grid);

  return shell;
}

export function mountHeadmistressControlDashboard({
  appElement = document.getElementById("app"),
  modules = HEADMISTRESS_CONTROL_MODULES,
} = {}) {
  if (!appElement) {
    throw new Error('Mistress-X app mount element was not found. Expected an element with id="app".');
  }

  appElement.innerHTML = "";
  appElement.appendChild(createHeadmistressControlDashboard({ modules }));

  return {
    id: "headmistress-control-dashboard",
    label: "Headmistress Control Dashboard",
    role: "HEADMISTRESS",
  };
}
