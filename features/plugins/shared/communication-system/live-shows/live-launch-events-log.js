import { getLiveLaunchEvents } from "./live-launch-analytics-store.js";

function ensureLaunchEventsLogStyles() {
  if (document.getElementById("live-launch-events-log-styles")) return;

  const style = document.createElement("style");
  style.id = "live-launch-events-log-styles";
  style.textContent = `
    .live-launch-events-log {
      border: 1px solid rgba(255,255,255,0.1);
      background: linear-gradient(135deg, rgba(18,18,26,0.98), rgba(33,21,39,0.98));
      border-radius: 18px;
      padding: 16px;
      box-shadow: 0 14px 32px rgba(0,0,0,0.2);
    }

    .live-launch-events-list {
      display: grid;
      gap: 8px;
      margin-top: 12px;
      max-height: 320px;
      overflow: auto;
      padding-right: 4px;
    }

    .live-launch-event-row {
      border: 1px solid rgba(255,255,255,0.09);
      background: rgba(255,255,255,0.05);
      border-radius: 14px;
      padding: 10px;
    }

    .live-launch-event-row strong {
      display: block;
      color: #d4af37;
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }

    .live-launch-event-row small {
      display: block;
      margin-top: 4px;
      color: rgba(255,255,255,0.64);
    }
  `;
  document.head.appendChild(style);
}

function formatEventLabel(type) {
  return String(type || "unknown").replaceAll("_", " ");
}

function formatEventDetail(event) {
  const detail = event.detail || {};
  const parts = [];

  if (detail.setupId) parts.push(`setup: ${detail.setupId}`);
  if (detail.category) parts.push(`category: ${detail.category}`);
  if (detail.layout) parts.push(`layout: ${detail.layout}`);
  if (detail.freePreview) parts.push(`preview: ${detail.freePreview}`);
  if (typeof detail.hasDraft === "boolean") parts.push(`has draft: ${detail.hasDraft ? "yes" : "no"}`);

  return parts.length > 0 ? parts.join(" · ") : "No extra detail";
}

export function createLiveLaunchEventsLog() {
  ensureLaunchEventsLogStyles();

  const events = getLiveLaunchEvents();
  const panel = document.createElement("div");
  panel.className = "panel live-launch-events-log";

  const title = document.createElement("h3");
  title.innerText = "🧾 Launch Event Log";

  const helper = document.createElement("p");
  helper.innerText = "Recent local launch events for setup and go-live handoff auditing.";

  const list = document.createElement("div");
  list.className = "live-launch-events-list";

  if (events.length === 0) {
    const empty = document.createElement("p");
    empty.innerText = "No launch events recorded yet. Open the Go Live Handoff flow to record events.";
    list.appendChild(empty);
  } else {
    events.slice(0, 25).forEach((event) => {
      const row = document.createElement("div");
      row.className = "live-launch-event-row";
      row.innerHTML = `
        <strong>${formatEventLabel(event.type)}</strong>
        <small>${formatEventDetail(event)}</small>
        <small>${new Date(event.createdAt).toLocaleString()}</small>
      `;
      list.appendChild(row);
    });
  }

  panel.appendChild(title);
  panel.appendChild(helper);
  panel.appendChild(list);

  return panel;
}
