import { createButton } from "../../features/ui/button.js";
import { createCard, createStatCard } from "../../features/ui/card.js";
import { platformPluginRegistry } from "./platform-plugin-registry.js";
import { mergePluginNextTasks } from "./platform-plugin-next-tasks.js";

function collectTasksByArea() {
  const areas = {
    backend: [],
    database: [],
    admin: [],
    safety: [],
  };

  platformPluginRegistry.forEach((plugin) => {
    const taskGroups = mergePluginNextTasks(plugin);

    Object.keys(areas).forEach((area) => {
      taskGroups[area].forEach((task) => {
        areas[area].push({
          pluginId: plugin.id,
          pluginName: plugin.name,
          category: plugin.category,
          area,
          task,
        });
      });
    });
  });

  return areas;
}

function flattenTasks(areas) {
  return Object.values(areas).flat();
}

function filterTasks(tasks, filter) {
  if (filter === "all") return tasks;
  if (["backend", "database", "admin", "safety"].includes(filter)) return tasks.filter((item) => item.area === filter);
  return tasks.filter((item) => item.category === filter);
}

function formatTasksForExport(tasks, title = "Mistress-X Backend Workload") {
  if (!tasks.length) return `${title}\n\nNo tasks found.`;

  const grouped = tasks.reduce((acc, item) => {
    const key = `${item.area.toUpperCase()} — ${item.category}`;
    acc[key] = acc[key] || [];
    acc[key].push(item);
    return acc;
  }, {});

  return [
    `# ${title}`,
    "",
    ...Object.entries(grouped).flatMap(([group, items]) => [
      `## ${group}`,
      "",
      ...items.map((item) => `- [ ] ${item.pluginName}: ${item.task}`),
      "",
    ]),
  ].join("\n");
}

async function copyText(text, onCopied) {
  try {
    await navigator.clipboard.writeText(text);
    onCopied?.("Copied to clipboard");
  } catch (error) {
    onCopied?.("Copy failed — select text manually");
  }
}

function taskListCard(title, icon, tasks = []) {
  const card = document.createElement("article");
  card.className = "mx-card mx-stack";

  const listItems = tasks.length
    ? tasks
        .map(
          (item) => `
            <li>
              <strong>${item.pluginName}</strong>
              <span class="mx-muted">(${item.category} · ${item.area})</span><br />
              <span>${item.task}</span>
            </li>
          `,
        )
        .join("")
    : `<li class="mx-muted">No tasks listed yet.</li>`;

  card.innerHTML = `
    <div class="mx-card__eyebrow">${icon} ${title}</div>
    <ul class="mx-backend-task-list">${listItems}</ul>
  `;

  return card;
}

function categoryFiltersFromTasks(tasks) {
  return [...new Set(tasks.map((task) => task.category))].sort();
}

export function createBackendTaskDashboardPlaceholder({ initialFilter = "all" } = {}) {
  const tasks = collectTasksByArea();
  const allTasks = flattenTasks(tasks);
  const totalBackend = tasks.backend.length;
  const totalDatabase = tasks.database.length;
  const totalAdmin = tasks.admin.length;
  const totalSafety = tasks.safety.length;
  const total = totalBackend + totalDatabase + totalAdmin + totalSafety;

  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  const filters = [
    { id: "all", label: "All" },
    { id: "backend", label: "Backend" },
    { id: "database", label: "Database" },
    { id: "admin", label: "Admin" },
    { id: "safety", label: "Safety" },
    ...categoryFiltersFromTasks(allTasks).map((category) => ({ id: category, label: category.charAt(0).toUpperCase() + category.slice(1) })),
  ];

  const safeInitialFilter = filters.some((filter) => filter.id === initialFilter) ? initialFilter : "all";
  let activeFilter = safeInitialFilter;

  const exportOutput = document.createElement("textarea");
  exportOutput.className = "mx-backend-export-output";
  exportOutput.readOnly = true;
  exportOutput.setAttribute("aria-label", "Backend task export output");

  const exportStatus = document.createElement("span");
  exportStatus.className = "mx-muted";
  exportStatus.textContent = `Showing ${filters.find((filter) => filter.id === activeFilter)?.label || "All"}.`;

  function currentFilteredTasks() {
    return filterTasks(allTasks, activeFilter);
  }

  function updateExportOutput() {
    const label = filters.find((filter) => filter.id === activeFilter)?.label || activeFilter;
    exportOutput.value = formatTasksForExport(currentFilteredTasks(), `Mistress-X Backend Workload — ${label}`);
  }

  shell.appendChild(
    createCard({
      eyebrow: "Backend / Database / Admin Queue",
      title: "Universal plugin work dashboard",
      description: "This dashboard pulls next tasks from every registered plugin and groups them by backend, database, admin, and safety/compliance workload.",
      icon: "🗄️",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Total Tasks", value: String(total), helper: "Across all plugin systems", icon: "📋", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Backend", value: String(totalBackend), helper: "API/service/integration tasks", icon: "🗄️", progress: Math.min(100, totalBackend * 4) }));
  stats.appendChild(createStatCard({ label: "Database", value: String(totalDatabase), helper: "Schema/table/index tasks", icon: "🧱", progress: Math.min(100, totalDatabase * 4) }));
  stats.appendChild(createStatCard({ label: "Admin", value: String(totalAdmin), helper: "Command-centre/review tasks", icon: "👑", progress: Math.min(100, totalAdmin * 4) }));
  stats.appendChild(createStatCard({ label: "Safety", value: String(totalSafety), helper: "Compliance/review tasks", icon: "🛡️", progress: Math.min(100, totalSafety * 6) }));
  shell.appendChild(stats);

  const filterRow = document.createElement("div");
  filterRow.className = "mx-button-row";
  shell.appendChild(filterRow);

  const exportActions = document.createElement("div");
  exportActions.className = "mx-button-row";
  exportActions.appendChild(
    createButton({
      label: "Copy Current Filter",
      variant: "gold",
      onClick: () => copyText(exportOutput.value, (message) => {
        exportStatus.textContent = message;
      }),
    }),
  );
  exportActions.appendChild(
    createButton({
      label: "Copy All Tasks",
      variant: "secondary",
      onClick: () => copyText(formatTasksForExport(allTasks, "Mistress-X Backend Workload — All Tasks"), (message) => {
        exportStatus.textContent = message;
      }),
    }),
  );
  exportActions.appendChild(exportStatus);
  shell.appendChild(exportActions);
  shell.appendChild(exportOutput);

  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";
  shell.appendChild(grid);

  function renderFilters() {
    filterRow.innerHTML = "";
    filters.forEach((filter) => {
      filterRow.appendChild(
        createButton({
          label: filter.label,
          variant: activeFilter === filter.id ? "gold" : "secondary",
          onClick: () => {
            activeFilter = filter.id;
            renderFilters();
            renderGrid();
            updateExportOutput();
            exportStatus.textContent = `Showing ${filter.label}.`;
          },
        }),
      );
    });
  }

  function renderGrid() {
    const filteredTasks = filterTasks(allTasks, activeFilter);
    grid.innerHTML = "";

    if (!filteredTasks.length) {
      grid.appendChild(taskListCard("No matching tasks", "🔎", []));
      return;
    }

    if (activeFilter === "all") {
      grid.appendChild(taskListCard("Backend Tasks", "🗄️", tasks.backend));
      grid.appendChild(taskListCard("Database Tasks", "🧱", tasks.database));
      grid.appendChild(taskListCard("Admin Tasks", "👑", tasks.admin));
      grid.appendChild(taskListCard("Safety / Compliance Tasks", "🛡️", tasks.safety));
      return;
    }

    const label = filters.find((filter) => filter.id === activeFilter)?.label || activeFilter;
    grid.appendChild(taskListCard(`${label} Tasks`, "📋", filteredTasks));
  }

  renderFilters();
  renderGrid();
  updateExportOutput();

  return shell;
}

const backendTaskStyles = document.createElement("style");
backendTaskStyles.textContent = `
  .mx-backend-task-list {
    position: relative;
    z-index: 1;
    display: grid;
    gap: var(--mx-space-3);
    margin: 0;
    padding-left: 1.2rem;
    color: var(--mx-text-muted);
    line-height: 1.55;
  }

  .mx-backend-task-list strong {
    color: var(--mx-text);
  }

  .mx-backend-export-output {
    width: 100%;
    min-height: 220px;
    padding: var(--mx-space-4);
    border: 1px solid var(--mx-border);
    border-radius: var(--mx-radius-lg);
    background: rgba(255, 255, 255, 0.06);
    color: var(--mx-text);
    font-family: var(--mx-font-mono);
    line-height: 1.5;
    resize: vertical;
  }
`;

document.head.appendChild(backendTaskStyles);
