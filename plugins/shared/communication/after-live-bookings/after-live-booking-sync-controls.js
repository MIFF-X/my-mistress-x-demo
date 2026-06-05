import { syncAfterLiveBookingsFromApi } from "./after-live-bookings-store.js";

export function createAfterLiveBookingSyncControls({
  buttonLabel = "Sync Bookings",
  idleMessage = "Showing local booking records until backend sync is run.",
  onSynced,
} = {}) {
  const controls = document.createElement("div");
  controls.className = "after-live-booking-sync-controls";

  const status = document.createElement("p");
  status.className = "after-live-booking-sync-status";
  status.innerText = idleMessage;

  const button = document.createElement("button");
  button.className = "button-secondary";
  button.innerText = buttonLabel;

  button.onclick = async () => {
    button.disabled = true;
    button.innerText = "Syncing...";

    const result = await syncAfterLiveBookingsFromApi();
    status.innerText = result.ok
      ? `Synced ${result.bookings.length} booking(s) from backend API.`
      : `Backend unavailable. Showing local records. ${result.error || ""}`;
    button.innerText = result.ok ? "Synced" : "Retry Sync";
    button.disabled = false;

    if (onSynced) onSynced(result);
  };

  controls.appendChild(button);
  controls.appendChild(status);
  return controls;
}

export function ensureAfterLiveBookingSyncControlStyles() {
  if (document.getElementById("after-live-booking-sync-controls-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-sync-controls-styles";
  style.textContent = `
    .after-live-booking-sync-controls {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      margin: 12px 0;
    }

    .after-live-booking-sync-status {
      color: rgba(255, 255, 255, 0.72);
      font-size: 13px;
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}
