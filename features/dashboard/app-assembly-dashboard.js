import { createPluginDashboardWidget } from "../../plugins/registry/plugin-dashboard-widget.js";
import { createPluginCatalogScreen } from "../../plugins/registry/plugin-catalog-screen.js";
import { createMvpLoopPanel } from "../mvp/mvp-loop-panel.js";

export function createAppAssemblyDashboard() {
  const shell = document.createElement("main");
  shell.className = "app-assembly-dashboard";

  shell.innerHTML = `
    <section class="assembly-hero">
      <p class="assembly-eyebrow">Mistress-X App Build</p>
      <h1>System Assembly Dashboard</h1>
      <p>This dashboard connects the current frontend simulation layer: MVP loop, plugin registry, and future NestJS backend handoff.</p>
    </section>

    <section class="assembly-action-grid">
      <button id="open-mvp-loop" class="button-primary">Open MVP Core Loop</button>
      <button id="open-plugin-widget" class="button-secondary">Open Plugin Widget</button>
      <button id="open-plugin-catalog" class="button-secondary">Open Plugin Catalog</button>
    </section>

    <section id="assembly-output" class="assembly-output"></section>
  `;

  const output = shell.querySelector("#assembly-output");

  shell.querySelector("#open-mvp-loop").onclick = () => {
    output.innerHTML = "";
    output.appendChild(createMvpLoopPanel());
  };

  shell.querySelector("#open-plugin-widget").onclick = () => {
    output.innerHTML = "";
    output.appendChild(createPluginDashboardWidget());
  };

  shell.querySelector("#open-plugin-catalog").onclick = () => {
    output.innerHTML = "";
    output.appendChild(createPluginCatalogScreen());
  };

  output.appendChild(createPluginDashboardWidget({ title: "Current Plugin Scaffold" }));

  return shell;
}
