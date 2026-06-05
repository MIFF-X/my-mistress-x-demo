import { getBookingActionSummary } from "./after-live-booking-action-summary.js";
import { getAfterLiveBookings } from "./after-live-bookings-store.js";

function ensureBookingDashboardCardStyles() {
  if (document.getElementById("after-live-booking-dashboard-card-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-dashboard-card-styles";
  style.textContent = `
    .after-live-dashboard-card {
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
    }

    .after-live-dashboard-card strong {
      color: #fff;
    }

    .after-live-dashboard-card p {
      color: rgba(255,255,255,0.72);
    }

    .after-live-dashboard-alert,
    .after-live-dashboard-attention {
      border-color: rgba(255, 193, 7, 0.38);
      background: rgba(255, 193, 7, 0.08);
    }

    .after-live-dashboard-ready {
      border-color: rgba(29, 158, 117, 0.38);
      background: rgba(29, 158, 117, 0.08);
    }

    .after-live-dashboard-clear {
      border-color: rgba(255, 255, 255, 0.12);
      background: rgba(255, 255, 255, 0.04);
    }
  `;

  document.head.appendChild(style);
}

function makeCard({ title, body, actionLabel, onAction, className = "" }) {
  ensureBookingDashboardCardStyles();
  const card = document.createElement("div");
  card.className = `panel after-live-dashboard-card ${className}`;

  const heading = document.createElement("h3");
  heading.innerText = title;

  const text = document.createElement("p");
  text.innerHTML = body;

  card.appendChild(heading);
  card.appendChild(text);

  if (actionLabel && onAction) {
    const button = document.createElement("button");
    button.className = "button-secondary";
    button.innerText = actionLabel;
    button.onclick = onAction;
    card.appendChild(button);
  }

  return card;
}

function createSummaryCard({ role, onAction, hideWhenClear = true }) {
  const bookings = getAfterLiveBookings();
  const summary = getBookingActionSummary(bookings, { role });
  if (hideWhenClear && summary.priority === "clear") return null;

  return makeCard({
    title: summary.priority === "attention" ? `⚠️ ${summary.title}` : summary.priority === "ready" ? `✅ ${summary.title}` : `📅 ${summary.title}`,
    className: `after-live-dashboard-${summary.priority}`,
    body: summary.message,
    actionLabel: summary.actionLabel,
    onAction,
  });
}

export function createMistressPendingBookingAlert(openInbox) {
  return createSummaryCard({ role: "mistress", onAction: openInbox, hideWhenClear: true });
}

export function createSubApprovedBookingAlert(openBookings) {
  const summary = getBookingActionSummary(getAfterLiveBookings(), { role: "sub" });
  if (summary.priority !== "ready") return null;
  return createSummaryCard({ role: "sub", onAction: openBookings, hideWhenClear: true });
}

export function createSubBookingPulseCard(openBookings) {
  const summary = getBookingActionSummary(getAfterLiveBookings(), { role: "sub" });
  if (summary.priority === "ready" || summary.priority === "clear") return null;
  return createSummaryCard({ role: "sub", onAction: openBookings, hideWhenClear: true });
}

export function createBookingDashboardSummaryCard({ role = "sub", onAction, hideWhenClear = false } = {}) {
  return createSummaryCard({ role, onAction, hideWhenClear });
}
