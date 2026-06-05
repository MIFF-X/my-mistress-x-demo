import { getBookingActionSummary } from "./after-live-booking-action-summary.js";
import { getAfterLiveBookings } from "./after-live-bookings-store.js";

function ensureStyles() {
  if (document.getElementById("after-live-booking-handoff-card-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-handoff-card-styles";
  style.textContent = `
    .after-live-booking-handoff-card {
      border: 1px solid rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
      border-radius: 16px;
      padding: 12px;
      margin: 10px 0;
    }

    .after-live-booking-handoff-card.is-attention {
      border-color: rgba(255, 193, 7, 0.38);
      background: rgba(255, 193, 7, 0.08);
    }

    .after-live-booking-handoff-card.is-ready {
      border-color: rgba(29, 158, 117, 0.38);
      background: rgba(29, 158, 117, 0.08);
    }

    .after-live-booking-handoff-card p {
      color: rgba(255, 255, 255, 0.72);
      margin: 6px 0 10px;
      font-size: 13px;
    }
  `;
  document.head.appendChild(style);
}

export function createAfterLiveBookingHandoffCard({ role = "sub", onAction, bookings = getAfterLiveBookings() } = {}) {
  ensureStyles();
  const summary = getBookingActionSummary(bookings, { role });
  const card = document.createElement("div");
  card.className = `after-live-booking-handoff-card is-${summary.priority}`;

  const title = document.createElement("strong");
  title.innerText = summary.title;

  const message = document.createElement("p");
  message.innerText = summary.message;

  card.appendChild(title);
  card.appendChild(message);

  if (onAction) {
    const button = document.createElement("button");
    button.className = summary.priority === "attention" ? "button-primary" : "button-secondary";
    button.innerText = summary.actionLabel || "Open Bookings";
    button.onclick = onAction;
    card.appendChild(button);
  }

  return card;
}
