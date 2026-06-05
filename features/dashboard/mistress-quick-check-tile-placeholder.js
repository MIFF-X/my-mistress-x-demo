import { createButton } from "../ui/button.js";
import { createCard, createStatCard } from "../ui/card.js";

const quickCheckLanes = [
  { id: "messages", label: "Messages", icon: "💬", status: "scaffolded", count: 12, note: "Unread chats, priority pings, and paid-message signals." },
  { id: "bookings", label: "Bookings", icon: "📅", status: "scaffolded", count: 4, note: "Phone/video booking requests, approvals, declines, and follow-ups." },
  { id: "requests", label: "Requests", icon: "📝", status: "planned", count: 7, note: "Custom requests, paid tasks, content asks, and special instructions." },
  { id: "confessions", label: "Confessions", icon: "🕯️", status: "planned", count: 3, note: "Confessional booth submissions and red-flag review items." },
  { id: "affirmations", label: "Affirmations", icon: "✨", status: "planned", count: 5, note: "Positive responses, praise notes, and ritual confirmations." },
  { id: "secrets", label: "Secrets", icon: "🔐", status: "safety_gated", count: 2, note: "Sensitive Sub-submitted private items requiring consent and audit rules." },
  { id: "contracts", label: "Contracts", icon: "📜", status: "safety_gated", count: 2, note: "Keeper agreements, promises, pledges, expiry dates, and consent records." },
  { id: "fulfilment", label: "Fulfilment", icon: "📦", status: "planned", count: 6, note: "Store orders, vending/hamper purchases, custom items, and delivery status." },
  { id: "rolodex-review", label: "Rolodex Review", icon: "🗂️", status: "safety_gated", count: 8, note: "New Sub cards, updates, tags, private notes, and relationship status checks." },
  { id: "contributions", label: "Contributions", icon: "💎", status: "scaffolded", count: 9, note: "Goals, gifts, top-ups, subscriptions, and contribution activity." },
];

const quickCheckRows = [
  { id: "qc-001", laneId: "messages", title: "Paid message waiting", source: "Chat", priority: "urgent", guard: "account", action: "Reply or pin for follow-up", age: "4 min", details: "Demo chat signal showing a paid message that needs a timely reply, possible pinning, or follow-up note.", nextStep: "Open the message thread, reply, or pin it to the Mistress follow-up queue." },
  { id: "qc-002", laneId: "bookings", title: "Video call request", source: "Bookings", priority: "urgent", guard: "account", action: "Approve, suggest time, or decline", age: "12 min", details: "Demo booking signal for a paid video request awaiting scheduling, approval, or alternate time proposal.", nextStep: "Approve the booking, suggest another slot, or decline with a policy-safe note." },
  { id: "qc-003", laneId: "requests", title: "Custom content request", source: "Request Inbox", priority: "review", guard: "moderation", action: "Quote, clarify, or send to review", age: "21 min", details: "Demo custom request with pricing and category checks still required before acceptance.", nextStep: "Quote, ask for clarification, or escalate to moderation if the request crosses a rule." },
  { id: "qc-004", laneId: "confessions", title: "New confession submitted", source: "Confessional", priority: "review", guard: "moderation", action: "Open safely and mark review state", age: "34 min", details: "Demo confession intake that should be opened through a controlled review state before any reply.", nextStep: "Open in review mode, scan for red flags, then resolve or escalate." },
  { id: "qc-005", laneId: "secrets", title: "Secret note received", source: "Secret Box", priority: "gated", guard: "consent", action: "Check consent and audit before opening", age: "1 hr", details: "Demo secret/private note requiring visible consent state and audit logging before full access.", nextStep: "Verify consent and access scope, then open or keep locked." },
  { id: "qc-006", laneId: "contracts", title: "Keeper promise update", source: "Contracts", priority: "gated", guard: "consent", action: "Review expiry and consent trail", age: "2 hr", details: "Demo contract/promise update with expiry, pledge status, and consent trail checks required.", nextStep: "Check expiry, review notes, then accept, renew, or escalate." },
  { id: "qc-007", laneId: "fulfilment", title: "Order needs fulfilment", source: "Inventory", priority: "review", guard: "moderation", action: "Pack, update status, or escalate dispute", age: "3 hr", details: "Demo store order that needs fulfilment state, order notes, and possible dispute checks.", nextStep: "Mark packed, update fulfilment status, or escalate a dispute lane." },
  { id: "qc-008", laneId: "rolodex-review", title: "New Sub card submitted", source: "Rolodex", priority: "gated", guard: "consent", action: "Review shared fields before private notes", age: "today", details: "Demo Sub card update that separates shared Sub-submitted fields from Mistress-private notes.", nextStep: "Review shared fields, accept the card update, then add private notes separately." },
  { id: "qc-009", laneId: "contributions", title: "Goal contribution received", source: "Wallet", priority: "standard", guard: "account", action: "Acknowledge or add to supporter log", age: "today", details: "Demo contribution event that can be acknowledged and added to supporter history.", nextStep: "Acknowledge, apply to goal progress, or add to the supporter log." },
];

function createLaneGrid(lanes, activeLaneId, onSelectLane) {
  const grid = document.createElement("div");
  grid.className = "mx-grid mx-grid--cards";

  lanes.forEach((lane) => {
    const detail = document.createElement("div");
    detail.className = "mx-quick-check-lane-detail";
    detail.innerHTML = `
      <span class="mx-quick-check-pill mx-quick-check-pill--${lane.status}">${lane.status.replaceAll("_", " ")}</span>
      <strong>${lane.count}</strong>
      <p>${lane.note}</p>
    `;

    grid.appendChild(createCard({
      eyebrow: activeLaneId === lane.id ? "Selected Lane" : "Quick Check Lane",
      title: lane.label,
      description: "A daily attention lane for the Mistress dashboard.",
      icon: lane.icon,
      meta: lane.id,
      children: [detail],
      actions: [createButton({
        label: activeLaneId === lane.id ? "Selected" : "Filter Lane",
        variant: activeLaneId === lane.id ? "gold" : "secondary",
        onClick: () => onSelectLane(lane.id),
      })],
    }));
  });

  return grid;
}

function createDetailPanel(row, status, onAction, onClose) {
  if (!row) {
    return createCard({
      eyebrow: "Selected Signal",
      title: "No signal selected",
      description: "Use Open on a Quick Check row to preview the selected signal details here.",
      icon: "🔎",
    });
  }

  const lane = quickCheckLanes.find((item) => item.id === row.laneId);
  const body = document.createElement("div");
  body.className = "mx-quick-check-detail-panel";
  body.innerHTML = `
    <div class="mx-quick-check-detail-grid">
      <span><strong>Lane</strong>${lane?.label || row.laneId}</span>
      <span><strong>Source</strong>${row.source}</span>
      <span><strong>Priority</strong>${row.priority}</span>
      <span><strong>Guard</strong>${row.guard}</span>
      <span><strong>Status</strong>${status.replaceAll("_", " ")}</span>
      <span><strong>Age</strong>${row.age}</span>
    </div>
    <p>${row.details}</p>
    <small>${row.nextStep}</small>
  `;

  return createCard({
    eyebrow: "Selected Signal Detail",
    title: `${lane?.icon || "⚡"} ${row.title}`,
    description: row.action,
    icon: "🔎",
    children: [body],
    actions: [
      createButton({ label: "Mark Review", variant: "secondary", onClick: () => onAction(row.id, "in_review") }),
      createButton({ label: "Resolve", variant: "gold", onClick: () => onAction(row.id, "resolved") }),
      createButton({ label: "Escalate", variant: "secondary", onClick: () => onAction(row.id, "escalated") }),
      createButton({ label: "Close Detail", variant: "secondary", onClick: onClose }),
    ],
  });
}

function createSignalRows(rows, actionStates, selectedRowId, onAction, onSelect) {
  const table = document.createElement("div");
  table.className = "mx-quick-check-table";

  const header = document.createElement("div");
  header.className = "mx-quick-check-row mx-quick-check-row--header";
  header.innerHTML = "<strong>Signal</strong><strong>Source</strong><strong>Guard</strong><strong>Action</strong><strong>Status</strong><strong>Controls</strong>";
  table.appendChild(header);

  rows.forEach((row) => {
    const lane = quickCheckLanes.find((item) => item.id === row.laneId);
    const status = actionStates[row.id] || "open";
    const item = document.createElement("div");
    item.className = `mx-quick-check-row mx-quick-check-row--${row.priority} ${selectedRowId === row.id ? "mx-quick-check-row--selected" : ""}`;

    const signal = document.createElement("span");
    signal.innerHTML = `<strong>${lane?.icon || "⚡"} ${row.title}</strong><small>${lane?.label || row.laneId} · ${row.age}</small>`;

    const source = document.createElement("span");
    source.textContent = row.source;

    const guard = document.createElement("span");
    guard.className = `mx-quick-check-guard mx-quick-check-guard--${row.guard}`;
    guard.textContent = row.guard;

    const action = document.createElement("span");
    action.textContent = row.action;

    const statusPill = document.createElement("span");
    statusPill.className = `mx-quick-check-status mx-quick-check-status--${status}`;
    statusPill.textContent = status.replaceAll("_", " ");

    const controls = document.createElement("div");
    controls.className = "mx-quick-check-controls";
    controls.appendChild(createButton({ label: "Open", variant: selectedRowId === row.id ? "gold" : "secondary", size: "sm", onClick: () => onSelect(row.id) }));
    controls.appendChild(createButton({ label: "Review", variant: "secondary", size: "sm", onClick: () => onAction(row.id, "in_review") }));
    controls.appendChild(createButton({ label: "Resolve", variant: "gold", size: "sm", onClick: () => onAction(row.id, "resolved") }));
    controls.appendChild(createButton({ label: "Escalate", variant: "secondary", size: "sm", onClick: () => onAction(row.id, "escalated") }));

    item.appendChild(signal);
    item.appendChild(source);
    item.appendChild(guard);
    item.appendChild(action);
    item.appendChild(statusPill);
    item.appendChild(controls);
    table.appendChild(item);
  });

  return table;
}

export function createMistressQuickCheckTilePlaceholder() {
  const shell = document.createElement("section");
  shell.className = "mx-page mx-stack";
  let activeLaneId = "all";
  let activePriority = "all";
  let selectedRowId = null;
  const actionStates = {};

  const totalSignals = quickCheckLanes.reduce((sum, lane) => sum + lane.count, 0);
  const gatedCount = quickCheckLanes.filter((lane) => lane.status === "safety_gated").length;
  const scaffoldedCount = quickCheckLanes.filter((lane) => lane.status === "scaffolded").length;

  function getFilteredRows() {
    return quickCheckRows.filter((row) => {
      const laneMatch = activeLaneId === "all" || row.laneId === activeLaneId;
      const priorityMatch = activePriority === "all" || row.priority === activePriority;
      return laneMatch && priorityMatch;
    });
  }

  function updateActionState(rowId, status) {
    actionStates[rowId] = status;
    selectedRowId = rowId;
    render();
  }

  function selectRow(rowId) {
    selectedRowId = rowId;
    actionStates[rowId] = actionStates[rowId] || "opened";
    render();
  }

  function render() {
    shell.innerHTML = "";
    const filteredRows = getFilteredRows();
    const selectedRow = quickCheckRows.find((row) => row.id === selectedRowId) || null;
    const actedCount = Object.keys(actionStates).length;
    const escalatedCount = Object.values(actionStates).filter((status) => status === "escalated").length;

    shell.appendChild(createCard({
      eyebrow: "Mistress Dashboard Utility",
      title: "Quick Check Zone",
      description: "A first-pass interactive daily control panel for messages, bookings, requests, confessions, secrets, contracts, fulfilment, Rolodex review, and contributions.",
      icon: "⚡",
    }));

    const stats = document.createElement("div");
    stats.className = "mx-grid mx-grid--cards";
    stats.appendChild(createStatCard({ label: "Attention Lanes", value: String(quickCheckLanes.length), helper: "Daily check sections", icon: "🧩", progress: 100 }));
    stats.appendChild(createStatCard({ label: "Signals", value: String(totalSignals), helper: "Demo activity count", icon: "🔔", progress: 65 }));
    stats.appendChild(createStatCard({ label: "Acted On", value: String(actedCount), helper: "Local placeholder state", icon: "✅", progress: Math.min(100, actedCount * 15) }));
    stats.appendChild(createStatCard({ label: "Escalated", value: String(escalatedCount), helper: "Needs Headmistress/Admin review", icon: "🛡️", progress: Math.min(100, escalatedCount * 25) }));
    stats.appendChild(createStatCard({ label: "Scaffolded", value: String(scaffoldedCount), helper: "Safe nearby routes exist", icon: "🧱", progress: 45 }));
    stats.appendChild(createStatCard({ label: "Safety Gated", value: String(gatedCount), helper: "Needs consent/audit controls", icon: "🛡️", progress: 30 }));
    shell.appendChild(stats);

    const filterRow = document.createElement("div");
    filterRow.className = "mx-button-row";
    [{ id: "all", label: "All Lanes" }, ...quickCheckLanes.map((lane) => ({ id: lane.id, label: lane.label }))].forEach((filter) => {
      filterRow.appendChild(createButton({
        label: filter.label,
        variant: activeLaneId === filter.id ? "gold" : "secondary",
        onClick: () => {
          activeLaneId = filter.id;
          selectedRowId = null;
          render();
        },
      }));
    });
    shell.appendChild(filterRow);

    const priorityRow = document.createElement("div");
    priorityRow.className = "mx-button-row";
    ["all", "urgent", "review", "gated", "standard"].forEach((priority) => {
      priorityRow.appendChild(createButton({
        label: priority === "all" ? "All Priorities" : priority,
        variant: activePriority === priority ? "gold" : "secondary",
        onClick: () => {
          activePriority = priority;
          selectedRowId = null;
          render();
        },
      }));
    });
    shell.appendChild(priorityRow);

    shell.appendChild(createLaneGrid(quickCheckLanes, activeLaneId, (laneId) => {
      activeLaneId = laneId;
      selectedRowId = null;
      render();
    }));

    shell.appendChild(createDetailPanel(
      selectedRow,
      selectedRow ? (actionStates[selectedRow.id] || "open") : "open",
      updateActionState,
      () => {
        selectedRowId = null;
        render();
      },
    ));

    shell.appendChild(createCard({
      eyebrow: "Action Queue",
      title: `${filteredRows.length} demo signals visible`,
      description: "Filtered signal rows now support local placeholder actions: open, mark review, resolve, or escalate.",
      icon: "🔔",
      children: [createSignalRows(filteredRows, actionStates, selectedRowId, updateActionState, selectRow)],
    }));

    appendStyles(shell);
  }

  render();
  return shell;
}

function appendStyles(shell) {
  const styles = document.createElement("style");
  styles.textContent = `
    .mx-quick-check-lane-detail {
      position: relative;
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-quick-check-lane-detail strong {
      color: var(--mx-text);
      font-size: var(--mx-text-2xl);
    }

    .mx-quick-check-lane-detail p {
      margin: 0;
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-quick-check-pill,
    .mx-quick-check-guard,
    .mx-quick-check-status {
      display: inline-flex;
      width: fit-content;
      align-items: center;
      justify-content: center;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      border: 1px solid var(--mx-border);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-quick-check-pill--scaffolded,
    .mx-quick-check-guard--account,
    .mx-quick-check-status--opened,
    .mx-quick-check-status--resolved {
      border-color: rgba(212, 175, 55, 0.4);
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
    }

    .mx-quick-check-pill--planned,
    .mx-quick-check-guard--moderation,
    .mx-quick-check-status--open,
    .mx-quick-check-status--in_review {
      border-color: rgba(255, 255, 255, 0.24);
      color: var(--mx-text);
      background: rgba(255, 255, 255, 0.07);
    }

    .mx-quick-check-pill--safety_gated,
    .mx-quick-check-guard--consent,
    .mx-quick-check-status--escalated {
      border-color: rgba(255, 176, 32, 0.42);
      color: #ffcf73;
      background: rgba(255, 176, 32, 0.1);
    }

    .mx-quick-check-detail-panel {
      display: grid;
      gap: var(--mx-space-3);
      margin-top: var(--mx-space-4);
    }

    .mx-quick-check-detail-panel p {
      margin: 0;
      color: var(--mx-text-muted);
      line-height: 1.55;
    }

    .mx-quick-check-detail-panel small {
      color: var(--mx-gold);
      line-height: 1.5;
    }

    .mx-quick-check-detail-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--mx-space-3);
    }

    .mx-quick-check-detail-grid span {
      padding: var(--mx-space-3);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-md);
      background: rgba(255, 255, 255, 0.045);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
    }

    .mx-quick-check-detail-grid strong {
      display: block;
      margin-bottom: 0.25rem;
      color: var(--mx-text);
      font-size: var(--mx-text-xs);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .mx-quick-check-table {
      display: grid;
      gap: var(--mx-space-2);
      margin-top: var(--mx-space-4);
    }

    .mx-quick-check-row {
      display: grid;
      grid-template-columns: 1.05fr 0.7fr 0.58fr 1.1fr 0.62fr 1.3fr;
      gap: var(--mx-space-3);
      align-items: start;
      padding: var(--mx-space-3);
      border: 1px solid var(--mx-border);
      border-radius: var(--mx-radius-md);
      background: rgba(255, 255, 255, 0.045);
      color: var(--mx-text-muted);
      font-size: var(--mx-text-sm);
      line-height: 1.5;
    }

    .mx-quick-check-row--header {
      color: var(--mx-gold);
      background: rgba(212, 175, 55, 0.08);
      font-size: var(--mx-text-xs);
      font-weight: 900;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }

    .mx-quick-check-row--urgent {
      border-color: rgba(212, 175, 55, 0.34);
      background: rgba(212, 175, 55, 0.045);
    }

    .mx-quick-check-row--gated {
      border-color: rgba(255, 176, 32, 0.36);
      background: rgba(255, 176, 32, 0.065);
    }

    .mx-quick-check-row--selected {
      outline: 2px solid rgba(212, 175, 55, 0.48);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.08);
    }

    .mx-quick-check-row small {
      display: block;
      margin-top: 0.25rem;
      color: var(--mx-text-soft);
      font-size: var(--mx-text-xs);
    }

    .mx-quick-check-controls {
      display: flex;
      flex-wrap: wrap;
      gap: var(--mx-space-2);
    }

    @media (max-width: 1100px) {
      .mx-quick-check-row,
      .mx-quick-check-row--header,
      .mx-quick-check-detail-grid {
        grid-template-columns: 1fr;
      }
    }
  `;
  shell.appendChild(styles);
}
