export function createAfterLiveBookingEmptyState({
  title = "No after-live bookings yet",
  message = "Booking requests will appear here after a live room follow-up is requested.",
  actionLabel,
  onAction,
} = {}) {
  ensureAfterLiveBookingEmptyStateStyles();

  const card = document.createElement("div");
  card.className = "panel after-live-booking-empty-state";

  const heading = document.createElement("h3");
  heading.innerText = title;

  const text = document.createElement("p");
  text.innerText = message;

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

export function ensureAfterLiveBookingEmptyStateStyles() {
  if (document.getElementById("after-live-booking-empty-state-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-empty-state-styles";
  style.textContent = `
    .after-live-booking-empty-state {
      border: 1px dashed rgba(255, 255, 255, 0.18);
      background: rgba(255, 255, 255, 0.04);
      border-radius: 18px;
      padding: 18px;
      text-align: left;
    }

    .after-live-booking-empty-state h3 {
      margin-top: 0;
    }

    .after-live-booking-empty-state p {
      color: rgba(255, 255, 255, 0.72);
      margin: 6px 0 12px;
    }
  `;
  document.head.appendChild(style);
}
