import { pluginRegistry, PLUGIN_STATUS } from "./plugin-registry.js";
import { createPluginCatalogScreen } from "./plugin-catalog-screen.js";

export function createPluginDashboardWidget({ title = "Plugin System" } = {}) {
  const panel = document.createElement("section");
  panel.className = "plugin-dashboard-widget";

  const scaffolded = pluginRegistry.filter(
    plugin => plugin.status === PLUGIN_STATUS.SCAFFOLDED || plugin.status === PLUGIN_STATUS.ACTIVE
  );
  const planned = pluginRegistry.filter(plugin => plugin.status === PLUGIN_STATUS.PLANNED);

  panel.innerHTML = `
    <div class="plugin-widget-card">
      <div class="plugin-widget-header">
        <div>
          <p class="plugin-eyebrow">System Assembly</p>
          <h2>${title}</h2>
        </div>
        <span class="plugin-widget-count">${pluginRegistry.length} plugins</span>
      </div>
      <div class="plugin-widget-stats">
        <div><strong>${scaffolded.length}</strong><span>Active / Scaffolded</span></div>
        <div><strong>${planned.length}</strong><span>Planned</span></div>
      </div>
      <div class="plugin-widget-list">
        ${pluginRegistry.slice(0, 6).map(plugin => `
          <div class="plugin-widget-row">
            <span>${plugin.icon || "🔌"}</span>
            <div>
              <strong>${plugin.name}</strong>
              <small>${plugin.status}</small>
            </div>
          </div>
        `).join("")}
      </div>
      <button id="open-plugin-catalog" class="button-primary">Open Plugin Catalog</button>
    </div>
  `;

  panel.querySelector("#open-plugin-catalog").onclick = () => {
    const app = document.getElementById("app");
    if (!app) return;
    app.innerHTML = "";
    app.appendChild(createPluginCatalogScreen());
  };

  return panel;
}
