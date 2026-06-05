import { createAfterShowConnectionSection } from "./live-show-after-show-section.js";
import { getAfterShowAvailabilitySource, syncAfterShowAvailabilityFromApi } from "./live-show-after-show-availability.js";
import {
  getLiveShowOfferSettings,
  getWishlistLinkLabel,
} from "./live-show-offer-settings-store.js";

function makeOfferButton({ label, sublabel, icon, onClick }) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "live-show-offer-button";
  button.onclick = onClick;

  const iconEl = document.createElement("span");
  iconEl.className = "live-show-offer-icon";
  iconEl.innerText = icon;

  const text = document.createElement("span");
  text.className = "live-show-offer-text";
  text.innerHTML = `<strong>${label}</strong><small>${sublabel}</small>`;

  button.appendChild(iconEl);
  button.appendChild(text);
  return button;
}

function dispatchOfferAction(detail) {
  window.dispatchEvent(new CustomEvent("mistressx:live-action", { detail }));
}

function openExternalWishlist(settings, status) {
  if (!settings.wishlistUrl) {
    status.innerText = "Wishlist link is not configured yet.";
    return;
  }

  window.open(settings.wishlistUrl, "_blank", "noopener,noreferrer");
  status.innerText = settings.deliveryCode
    ? `Wishlist opened. Delivery note/code: ${settings.deliveryCode}`
    : "Wishlist opened in a new tab.";

  dispatchOfferAction({
    actionKind: "wishlist",
    icon: "🎁",
    title: "Wishlist opened",
    text: settings.wishlistTitle || "Wishlist",
  });
}

export function createLiveShowOfferTray({ mistressId = "demo-mistress", showId = "demo-show", defaultExpanded = true } = {}) {
  ensureLiveShowOfferTrayStyles();
  const settings = getLiveShowOfferSettings(mistressId);
  let expanded = defaultExpanded;

  const tray = document.createElement("div");
  tray.className = "live-show-offer-tray";

  const header = document.createElement("button");
  header.type = "button";
  header.className = "live-show-offer-header";

  const title = document.createElement("span");
  title.innerHTML = "<strong>Live Offers</strong><small>Wishlist · after-show private message · voice · video</small>";

  const toggle = document.createElement("span");
  toggle.className = "live-show-offer-toggle";
  toggle.innerText = expanded ? "Close" : "Expand";

  header.appendChild(title);
  header.appendChild(toggle);

  const body = document.createElement("div");
  body.className = "live-show-offer-body";

  const status = document.createElement("p");
  status.className = "live-show-offer-status";
  status.innerText = settings.notes || "Choose an offer while the live show is running.";

  const renderBody = () => {
    body.innerHTML = "";

    if (settings.wishlistEnabled) {
      const topGrid = document.createElement("div");
      topGrid.className = "live-show-offer-top-grid";
      topGrid.appendChild(
        makeOfferButton({
          icon: "🎁",
          label: settings.wishlistTitle || "Wishlist",
          sublabel: getWishlistLinkLabel(settings),
          onClick: () => openExternalWishlist(settings, status),
        })
      );
      body.appendChild(topGrid);
    }

    body.appendChild(createAfterShowConnectionSection(settings, status));
  };

  const renderVisibility = () => {
    body.style.display = expanded ? "block" : "none";
    toggle.innerText = expanded ? "Close" : "Expand";
    tray.classList.toggle("is-collapsed", !expanded);
  };

  header.onclick = () => {
    expanded = !expanded;
    renderVisibility();
  };

  renderBody();

  syncAfterShowAvailabilityFromApi(showId).then((result) => {
    if (result.ok) {
      status.innerText = `After-show availability synced from ${getAfterShowAvailabilitySource()}.`;
      renderBody();
      renderVisibility();
    } else {
      status.innerText = settings.notes || "Using local demo after-show availability.";
    }
  });

  tray.appendChild(header);
  tray.appendChild(body);
  tray.appendChild(status);
  renderVisibility();
  return tray;
}

export function ensureLiveShowOfferTrayStyles() {
  if (document.getElementById("live-show-offer-tray-styles")) return;

  const style = document.createElement("style");
  style.id = "live-show-offer-tray-styles";
  style.textContent = `
    .live-show-offer-tray {
      position: absolute;
      right: 18px;
      bottom: 18px;
      width: min(460px, calc(100% - 36px));
      z-index: 30;
      background: rgba(10, 10, 14, 0.9);
      border: 1px solid rgba(222, 176, 56, 0.38);
      border-radius: 18px;
      padding: 10px;
      box-shadow: 0 18px 45px rgba(0,0,0,0.38);
      backdrop-filter: blur(12px);
    }

    .live-show-offer-tray.is-collapsed {
      width: min(300px, calc(100% - 36px));
    }

    .live-show-offer-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      background: transparent;
      border: 0;
      color: white;
      text-align: left;
      padding: 4px;
      cursor: pointer;
    }

    .live-show-offer-header strong,
    .live-show-offer-header small,
    .live-show-offer-text strong,
    .live-show-offer-text small,
    .live-show-offer-text em,
    .live-show-after-show-heading strong,
    .live-show-after-show-heading small {
      display: block;
    }

    .live-show-offer-header small,
    .live-show-offer-text small,
    .live-show-offer-status,
    .live-show-after-show-heading small {
      color: rgba(255,255,255,0.68);
      font-size: 11px;
    }

    .live-show-offer-toggle {
      border: 1px solid rgba(222, 176, 56, 0.45);
      color: #f2c94c;
      border-radius: 999px;
      padding: 5px 9px;
      font-size: 11px;
      font-weight: 900;
    }

    .live-show-offer-body {
      margin-top: 10px;
    }

    .live-show-offer-top-grid,
    .live-show-after-show-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(165px, 1fr));
      gap: 8px;
    }

    .live-show-after-show-section {
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid rgba(255,255,255,0.09);
    }

    .live-show-after-show-heading {
      margin-bottom: 9px;
      color: white;
    }

    .live-show-after-show-heading strong {
      color: #f2c94c;
      font-size: 13px;
    }

    .live-show-offer-button {
      display: flex;
      align-items: center;
      gap: 9px;
      min-height: 68px;
      padding: 10px;
      border-radius: 14px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.06);
      color: white;
      text-align: left;
      cursor: pointer;
    }

    .live-show-offer-button:hover:not(.is-sold-out) {
      border-color: rgba(222,176,56,0.55);
      background: rgba(222,176,56,0.12);
    }

    .live-show-offer-button.is-sold-out {
      cursor: not-allowed;
      opacity: 0.48;
      filter: grayscale(0.8);
    }

    .live-show-offer-icon {
      width: 32px;
      height: 32px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      background: rgba(222,176,56,0.16);
      flex: 0 0 auto;
    }

    .live-show-offer-text em {
      width: fit-content;
      margin-top: 5px;
      padding: 3px 7px;
      border-radius: 999px;
      background: rgba(242,201,76,0.12);
      border: 1px solid rgba(242,201,76,0.28);
      color: #f2c94c;
      font-size: 10px;
      font-style: normal;
      font-weight: 900;
    }

    .live-show-offer-button.is-sold-out .live-show-offer-text em {
      color: #ff8fa3;
      border-color: rgba(255,143,163,0.32);
      background: rgba(255,143,163,0.1);
    }

    .live-show-offer-status {
      margin: 8px 4px 0;
    }
  `;
  document.head.appendChild(style);
}
