import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";
import {
  FEATURE_PROGRESS_STATUS,
  getFeatureProgressSummary,
  featureProgressRegistry,
} from "./feature-progress-registry.js";

function statusIcon(status) {
  return {
    done: "✅",
    in_progress: "🟡",
    locked: "📌",
    not_started: "⬜",
    blocked: "🔴",
    needs_review: "🛡️",
  }[status] || "📍";
}

function progressText(progress) {
  const filled = Math.round(progress / 10);
  return `${"█".repeat(filled)}${"░".repeat(10 - filled)} ${progress}%`;
}

function getFilteredItems(filter) {
  if (filter === "journey") return featureProgressRegistry.filter((item) => item.source === "conversation-progress-report");
  if (filter === "core") return featureProgressRegistry.filter((item) => item.source !== "platform-plugin-registry" && item.source !== "conversation-progress-report");
  if (filter === "plugins") return featureProgressRegistry.filter((item) => item.source === "platform-plugin-registry");
  if (filter === "blocked") return featureProgressRegistry.filter((item) => item.status === FEATURE_PROGRESS_STATUS.BLOCKED);
  if (filter === "done") return featureProgressRegistry.filter((item) => item.status === FEATURE_PROGRESS_STATUS.DONE);
  if (filter === "review") return featureProgressRegistry.filter((item) => item.status === FEATURE_PROGRESS_STATUS.NEEDS_REVIEW);
  return featureProgressRegistry;
}

function formatProgressForExport(items, title = "Mistress-X Journey Progress") {
  if (!items.length) return `# ${title}\n\nNo progress items found.`;

  const grouped = items.reduce((acc, item) => {
    acc[item.category] = acc[item.category] || [];
    acc[item.category].push(item);
    return acc;
  }, {});

  return [
    `# ${title}`,
    "",
    ...Object.entries(grouped).flatMap(([category, categoryItems]) => [
      `## ${category}`,
      "",
      ...categoryItems.flatMap((item) => [
        `- ${statusIcon(item.status)} **${item.title}** — ${progressText(item.progress)} — ${item.summary}`,
        ...(item.done?.length ? ["  - Done:"] : []),
        ...(item.done || []).map((entry) => `    - ${entry}`),
        ...(item.remaining?.length ? ["  - Still to do:"] : []),
        ...(item.remaining || []).map((entry) => `    - ${entry}`),
      ]),
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

export function createFeatureProgressDashboardPlaceholder() {
  const summary = getFeatureProgressSummary();
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";

  let activeFilter = "all";
  const exportOutput = document.createElement("textarea");
  exportOutput.className = "mx-progress-export-output";
  exportOutput.readOnly = true;
  exportOutput.setAttribute("aria-label", "Journey progress export output");

  const exportStatus = document.createElement("span");
  exportStatus.className = "mx-muted";
  exportStatus.textContent = "Export ready.";

  function currentFilteredItems() {
    return getFilteredItems(activeFilter);
  }

  function updateExportOutput() {
    const label = filters.find((filter) => filter.id === activeFilter)?.label || activeFilter;
    exportOutput.value = formatProgressForExport(currentFilteredItems(), `Mistress-X Journey Progress — ${label}`);
  }

  shell.appendChild(
    createCard({
      eyebrow: "Journey Progress",
      title: "Mistress-X feature progress dashboard",
      description: "Central progress view generated from the base journey registry plus plugin-derived progress.",
      icon: "📊",
    }),
  );

  const stats = document.createElement("div");
  stats.className = "mx-grid mx-grid--cards";
  stats.appendChild(createStatCard({ label: "Tracked Items", value: String(summary.total), helper: "Feature systems in registry", icon: "📋", progress: 100 }));
  stats.appendChild(createStatCard({ label: "Average Progress", value: `${summary.average}%`, helper: "Across all tracked systems", icon: "📈", progress: summary.average }));
  stats.appendChild(createStatCard({ label: "Plugin Average", value: `${summary.pluginAverage}%`, helper: `${summary.pluginCount} plugin-derived systems`, icon: "🧩", progress: summary.pluginAverage }));
  stats.appendChild(createStatCard({ label: "Complete", value: String(summary.complete), helper: "Finished/scaffolded systems", icon: "✅", progress: Math.round((summary.complete / summary.total) * 100) }));
  stats.appendChild(createStatCard({ label: "Blocked", value: String(summary.blocked), helper: "Waiting on runtime/assets/backend", icon: "🔴", progress: summary.blocked ? 25 : 0 }));
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
      label: "Copy Full Progress",
      variant: "secondary",
      onClick: () => copyText(formatProgressForExport(featureProgressRegistry, "Mistress-X Journey Progress — Full Report"), (message) => {
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

  const filters = [
    { id: "all", label: "All" },
    { id: "journey", label: "Journey" },
    { id: "core", label: "Core" },
    { id: "plugins", label: "Plugins" },
    { id: "blocked", label: "Blocked" },
    { id: "done", label: "Done" },
    { id: "review", label: "Needs Review" },
  ];

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
    const items = getFilteredItems(activeFilter);
    grid.innerHTML = "";

    if (!items.length) {
      grid.appendChild(
        createCard({
          eyebrow: "Empty Filter",
          title: "No progress items found",
          description: "This filter has no matching systems yet.",
          icon: "🔎",
        }),
      );
      return;
    }

    items.forEach((item) => {
      const progress = document.createElement("div");
      progress.className = "mx-stack";
      progress.innerHTML = `
        <div class="mx-progress-track" aria-label="${item.title} progress">
          <div class="mx-progress-fill" style="width:${item.progress}%"></div>
        </div>
        <small class="mx-muted">${progressText(item.progress)}</small>
      `;

      const details = document.createElement("div");
      details.className = "mx-progress-details";

      if (item.done?.length) {
        const doneTitle = document.createElement("strong");
        doneTitle.textContent = "Done";
        const doneList = document.createElement("ul");
        item.done.forEach((entry) => {
          const listItem = document.createElement("li");
          listItem.textContent = entry;
          doneList.appendChild(listItem);
        });
        details.appendChild(doneTitle);
        details.appendChild(doneList);
      }

      if (item.remaining?.length) {
        const remainingTitle = document.createElement("strong");
        remainingTitle.textContent = "Still to do";
        const remainingList = document.createElement("ul");
        item.remaining.forEach((entry) => {
          const listItem = document.createElement("li");
          listItem.textContent = entry;
          remainingList.appendChild(listItem);
        });
        details.appendChild(remainingTitle);
        details.appendChild(remainingList);
      }

      const children = [progress];
      if (details.childNodes.length) children.push(details);

      grid.appendChild(
        createCard({
          eyebrow: `${statusIcon(item.status)} ${item.category}`,
          title: item.title,
          description: item.summary,
          icon: statusIcon(item.status),
          meta: `${item.status}${item.source ? ` · ${item.source}` : ""}`,
          children,
        }),
      );
    });
  }

  renderFilters();
  renderGrid();
  updateExportOutput();

  return shell;
}

const progressExportStyles = document.createElement("style");
progressExportStyles.textContent = `
  .mx-progress-export-output {
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

  .mx-progress-details {
    display: grid;
    gap: var(--mx-space-2);
    color: var(--mx-muted);
    font-size: var(--mx-font-size-sm);
  }

  .mx-progress-details strong {
    color: var(--mx-text);
  }

  .mx-progress-details ul {
    margin: 0;
    padding-left: var(--mx-space-5);
  }

  .mx-progress-details li + li {
    margin-top: var(--mx-space-1);
  }
`;

document.head.appendChild(progressExportStyles);
