import { pluginRegistry, PLUGIN_STATUS, PLUGIN_AREAS, canActivatePlugin } from "./plugin-registry.js";

const areaLabels = {
  [PLUGIN_AREAS.MISTRESS]: "Mistress",
  [PLUGIN_AREAS.SUB]: "Sub",
  [PLUGIN_AREAS.HEADMISTRESS]: "Headmistress",
  [PLUGIN_AREAS.SHARED]: "Shared",
  [PLUGIN_AREAS.SITE]: "Site"
};

const statusLabels = {
  [PLUGIN_STATUS.PLANNED]: "Planned",
  [PLUGIN_STATUS.SCAFFOLDED]: "Scaffolded",
  [PLUGIN_STATUS.ACTIVE]: "Active",
  [PLUGIN_STATUS.DISABLED]: "Disabled"
};

export function createPluginCatalogScreen() {
  const shell = document.createElement("section");
  shell.className = "plugin-catalog-screen";

  const activePluginIds = pluginRegistry
    .filter(plugin => plugin.status === PLUGIN_STATUS.ACTIVE || plugin.status === PLUGIN_STATUS.SCAFFOLDED)
    .map(plugin => plugin.id);

  const grouped = pluginRegistry.reduce((acc, plugin) => {
    if (!acc[plugin.area]) acc[plugin.area] = [];
    acc[plugin.area].push(plugin);
    return acc;
  }, {});

  shell.innerHTML = `
    <div class="plugin-catalog-header">
      <p class="plugin-eyebrow">Mistress-X App Scaffold</p>
      <h2>Plugin Registry</h2>
      <p>One controlled catalog for PPV, live shows, gifts, stickers, Rolodex, inventory worlds, content worlds, and future add-ons.</p>
    </div>

    <div class="plugin-summary-grid">
      <div class="plugin-summary-card"><strong>${pluginRegistry.length}</strong><span>Total Plugins</span></div>
      <div class="plugin-summary-card"><strong>${activePluginIds.length}</strong><span>Active / Scaffolded</span></div>
      <div class="plugin-summary-card"><strong>${pluginRegistry.filter(p => p.status === PLUGIN_STATUS.PLANNED).length}</strong><span>Planned</span></div>
    </div>

    <div class="plugin-area-list">
      ${Object.entries(grouped).map(([area, plugins]) => `
        <div class="plugin-area-section">
          <h3>${areaLabels[area] || area} Plugins</h3>
          <div class="plugin-card-grid">
            ${plugins.map(plugin => renderPluginCard(plugin, activePluginIds)).join("")}
          </div>
        </div>
      `).join("")}
    </div>
  `;

  return shell;
}

function renderPluginCard(plugin, activePluginIds) {
  const activation = canActivatePlugin(plugin.id, activePluginIds);
  const dependencyText = plugin.dependencies.length ? plugin.dependencies.join(", ") : "None";

  return `
    <article class="plugin-card plugin-card--${plugin.status}">
      <div class="plugin-card-top">
        <span class="plugin-icon">${plugin.icon || "🔌"}</span>
        <span class="plugin-status">${statusLabels[plugin.status] || plugin.status}</span>
      </div>
      <h4>${plugin.name}</h4>
      <p>${plugin.description}</p>
      <div class="plugin-meta">
        <span><strong>ID:</strong> ${plugin.id}</span>
        <span><strong>Area:</strong> ${areaLabels[plugin.area] || plugin.area}</span>
        <span><strong>Dependencies:</strong> ${dependencyText}</span>
        <span><strong>Activation:</strong> ${activation.ok ? "Ready" : activation.reason}</span>
      </div>
    </article>
  `;
}
