import { createAfterLiveBookingHandoffCard } from "./after-live-booking-handoff-card.js";
import { createAfterLiveHybridModeLegend } from "./after-live-hybrid-mode-legend.js";

function ensureScreenHeaderStyles() {
  if (document.getElementById("after-live-booking-screen-header-styles")) return;

  const style = document.createElement("style");
  style.id = "after-live-booking-screen-header-styles";
  style.textContent = `
    .after-live-booking-screen-header {
      display: grid;
      gap: 8px;
      margin-bottom: 14px;
    }

    .after-live-booking-screen-header h2 {
      margin: 0;
    }

    .after-live-booking-screen-header p {
      color: rgba(255, 255, 255, 0.72);
      margin: 0;
    }
  `;
  document.head.appendChild(style);
}

export function createAfterLiveBookingScreenHeader({
  role = "sub",
  title = "After-Live Bookings",
  intro = "Track after-live phone and video booking activity.",
  onAction,
  includeLegend = true,
} = {}) {
  ensureScreenHeaderStyles();

  const wrap = document.createElement("div");
  wrap.className = "after-live-booking-screen-header";

  const heading = document.createElement("h2");
  heading.innerText = title;

  const description = document.createElement("p");
  description.innerText = intro;

  wrap.appendChild(heading);
  wrap.appendChild(description);
  wrap.appendChild(createAfterLiveBookingHandoffCard({ role, onAction }));

  if (includeLegend) {
    wrap.appendChild(createAfterLiveHybridModeLegend());
  }

  return wrap;
}
