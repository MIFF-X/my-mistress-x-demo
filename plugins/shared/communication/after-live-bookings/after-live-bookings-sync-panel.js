import { getBookingActionSummary } from "./after-live-booking-action-summary.js";
import { hasBookingApiAuth } from "../api/booking-api-client.js";
import { getBookingCounts, syncAfterLiveBookingsFromApi } from "./after-live-bookings-store.js";

function countsText(counts) {
  return `${counts.pending} pending - ${counts.approved} approved - ${counts.declined} declined - ${counts.completed} completed`;
}

function getSyncMode() {
  return hasBookingApiAuth()
    ? {
        label: "API token ready",
        className: "is-api-ready",
        description: "API mode is available. This panel syncs backend records and keeps the manual retry as fallback."
      }
    : {
        label: "Local demo mode",
        className: "is-local-mode",
        description: "No API token is available yet. Local demo records stay active until auth/API are configured."
      };
}

function ensureSyncPanelStyles() {
  if (document.getElementById("after-live-bookings-sync-panel-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-bookings-sync-panel-styles";
  style.textContent = `
    .after-live-bookings-sync-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
    }

    .after-live-bookings-sync-header h3 {
      margin-bottom: 0;
    }

    .after-live-bookings-mode-pill {
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: rgba(255, 255, 255, 0.06);
      color: rgba(255, 255, 255, 0.74);
      font-size: 11px;
      font-weight: 900;
      padding: 5px 9px;
      white-space: nowrap;
    }

    .after-live-bookings-mode-pill.is-api-ready {
      border-color: rgba(29, 158, 117, 0.38);
      background: rgba(29, 158, 117, 0.12);
      color: #9ff5d3;
    }

    .after-live-bookings-prompt {
      margin-top: 10px;
      border-radius: 14px;
      padding: 10px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      background: rgba(255, 255, 255, 0.04);
      color: rgba(255, 255, 255, 0.74);
      font-size: 13px;
    }

    .after-live-bookings-prompt.is-attention {
      border-color: rgba(255, 193, 7, 0.36);
      background: rgba(255, 193, 7, 0.08);
    }

    .after-live-bookings-prompt.is-ready {
      border-color: rgba(29, 158, 117, 0.36);
      background: rgba(29, 158, 117, 0.08);
    }
  `;
  document.head.appendChild(style);
}

function updateModePill(pill) {
  const mode = getSyncMode();
  pill.className = `after-live-bookings-mode-pill ${mode.className}`;
  pill.innerText = mode.label;
  return mode;
}

function renderPrompt(prompt) {
  const summary = getBookingActionSummary();
  prompt.className = `after-live-bookings-prompt is-${summary.priority}`;
  prompt.innerHTML = `<strong>${summary.title}.</strong> ${summary.message}`;
}

async function runBookingSync({ button, status, helper, modePill, prompt, trigger }) {
  button.disabled = true;
  button.innerText = trigger === "auto" ? "Auto-syncing..." : "Syncing...";

  const result = await syncAfterLiveBookingsFromApi();
  const mode = updateModePill(modePill);

  status.innerHTML = `<strong>${result.ok ? "Backend API" : "Local fallback"}:</strong> ${countsText(result.counts)}`;
  helper.innerText = result.ok
    ? `${trigger === "auto" ? "Dashboard auto-sync complete." : "Backend booking records synced successfully."} ${mode.description}`
    : `Backend sync unavailable. Using local demo records. ${result.error || ""}`;

  renderPrompt(prompt);
  button.disabled = false;
  button.innerText = result.ok ? "Sync Again" : "Retry Sync";
  return result;
}

export function createAfterLiveBookingsSyncPanel({ autoSync = false } = {}) {
  ensureSyncPanelStyles();

  const panel = document.createElement("div");
  panel.className = "panel after-live-bookings-sync-panel";

  const counts = getBookingCounts();
  const header = document.createElement("div");
  header.className = "after-live-bookings-sync-header";

  const title = document.createElement("h3");
  title.innerText = "Booking API Sync";

  const modePill = document.createElement("span");
  const mode = updateModePill(modePill);

  const status = document.createElement("p");
  status.innerHTML = `<strong>Current:</strong> ${countsText(counts)}`;

  const helper = document.createElement("p");
  helper.innerText = mode.description;

  const prompt = document.createElement("div");
  renderPrompt(prompt);

  const button = document.createElement("button");
  button.className = "button-secondary";
  button.innerText = "Sync Bookings";
  button.onclick = () => runBookingSync({ button, status, helper, modePill, prompt, trigger: "manual" });

  header.appendChild(title);
  header.appendChild(modePill);
  panel.appendChild(header);
  panel.appendChild(status);
  panel.appendChild(helper);
  panel.appendChild(prompt);
  panel.appendChild(button);

  window.addEventListener("mistressx:after-live-bookings-updated", () => renderPrompt(prompt));

  if (autoSync && hasBookingApiAuth()) {
    window.setTimeout(() => {
      runBookingSync({ button, status, helper, modePill, prompt, trigger: "auto" });
    }, 0);
  }

  return panel;
}
