import { createButton } from "../../features/ui/button.js";
import { createCard, createStatCard } from "../../features/ui/card.js";
import { mergePluginNextTasks } from "./platform-plugin-next-tasks.js";

function progressText(progress = 0) {
  const safe = Math.max(0, Math.min(100, progress));
  const filled = Math.round(safe / 10);
  return `${"█".repeat(filled)}${"░".repeat(10 - filled)} ${safe}%`;
}

function listBlock(title, items = [], emptyText = "None listed yet") {
  const block = document.createElement("section");
  block.className = "mx-card mx-stack";

  const listItems = items.length
    ? items.map((item) => `<li>${item}</li>`).join("")
    : `<li class="mx-muted">${emptyText}</li>`;

  block.innerHTML = `
    <div class="mx-card__eyebrow">${title}</div>
    <ul class="mx-plugin-detail__list">${listItems}</ul>
  `;

  return block;
}

export function createPlatformPluginDetailPlaceholder({ plugin, onBack, extraActions = [] } = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  if (!plugin) {
    shell.appendChild(
      createCard({
        eyebrow: "Plugin Detail",
        title: "No plugin selected",
        description: "Open a plugin from the Plugin Registry to see its detail view.",
        icon: "🧩",
        actions: [createButton({ label: "Back to Registry", variant: "gold", onClick: onBack })],
      }),
    );
    return shell;
  }

  const progress = document.createElement("div");
  progress.className = "mx-stack";
  progress.innerHTML = `
    <div class="mx-progress-track" aria-label="${plugin.name} progress">
      <div class="mx-progress-fill" style="width:${plugin.progress}%"></div>
    </div>
    <small class="mx-muted">${progressText(plugin.progress)}</small>
  `;

  shell.appendChild(
    createCard({
      eyebrow: `${plugin.category} · ${plugin.status}`,
      title: plugin.name,
      description: plugin.description,
      icon: "🧩",
      meta: `Plugin ID: ${plugin.id}`,
      children: [progress],
      actions: [
        ...extraActions,
        createButton({ label: "Back to Registry", variant: "secondary", onClick: onBack }),
      ],
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Frontend", value: plugin.frontend || "not_started", helper: "UI/screen/component status", icon: "🖥️", progress: plugin.frontend?.includes("scaffold") || plugin.frontend?.includes("placeholder") ? 45 : 0 }));
  stats.appendChild(createStatCard({ label: "Backend", value: plugin.backend || "not_started", helper: "API/service/integration status", icon: "🗄️", progress: plugin.backend === "done" ? 100 : 0 }));
  stats.appendChild(createStatCard({ label: "Database", value: plugin.database || "not_started", helper: "Schema/table status", icon: "🧱", progress: plugin.database === "done" ? 100 : 0 }));
  stats.appendChild(createStatCard({ label: "Admin", value: plugin.admin || "not_started", helper: "Command-centre/admin status", icon: "👑", progress: plugin.admin?.includes("needed") ? 10 : 40 }));
  shell.appendChild(stats);

  const taskGroups = mergePluginNextTasks(plugin);
  const taskGrid = document.createElement("div");
  taskGrid.className = "mx-grid mx-grid--cards";
  taskGrid.appendChild(listBlock("Next Frontend Tasks", taskGroups.frontend, "No frontend tasks listed"));
  taskGrid.appendChild(listBlock("Next Backend Tasks", taskGroups.backend, "No backend tasks listed"));
  taskGrid.appendChild(listBlock("Next Database Tasks", taskGroups.database, "No database tasks listed"));
  taskGrid.appendChild(listBlock("Next Admin Tasks", taskGroups.admin, "No admin tasks listed"));
  taskGrid.appendChild(listBlock("Next Safety / Compliance Tasks", taskGroups.safety, "No safety tasks listed"));
  shell.appendChild(
    createCard({
      eyebrow: "Build Queue",
      title: "What needs doing next",
      description: "Generated from the plugin metadata plus category-specific task rules.",
      icon: "✅",
    }),
  );
  shell.appendChild(taskGrid);

  const detailGrid = document.createElement("div");
  detailGrid.className = "mx-grid mx-grid--cards";
  detailGrid.appendChild(listBlock("Visibility", plugin.visibility, "No visibility rules listed"));
  detailGrid.appendChild(listBlock("Dependencies", plugin.dependencies, "No dependencies listed"));
  detailGrid.appendChild(listBlock("Routes", plugin.routes, "No routes wired yet"));
  detailGrid.appendChild(listBlock("Docs", plugin.docs, "No docs linked yet"));
  detailGrid.appendChild(listBlock("Safety Notes", plugin.safetyNotes, "No safety notes listed"));
  shell.appendChild(
    createCard({
      eyebrow: "Plugin Metadata",
      title: "Rules, routes, docs, and dependencies",
      description: "Reference data from the central platform plugin registry.",
      icon: "🗂️",
    }),
  );
  shell.appendChild(detailGrid);

  return shell;
}

const detailStyles = document.createElement("style");
detailStyles.textContent = `
  .mx-plugin-detail__list {
    position: relative;
    z-index: 1;
    margin: 0;
    padding-left: 1.2rem;
    color: var(--mx-text-muted);
    line-height: 1.7;
  }
`;

document.head.appendChild(detailStyles);
