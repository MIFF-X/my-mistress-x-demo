import { auctionRequest, hasAuctionApiBase } from "./api-lite.js";

function make(tag, className = "", text = "") {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.innerText = text;
  return node;
}

export function createBackendSyncPanel({ onLoaded } = {}) {
  const panel = make("section", "mx-auction-panel");
  panel.innerHTML = `
    <div class="mx-auction-panel-heading">
      <div><small>Backend Sync</small><h3>Real API bridge</h3></div>
      <span>${hasAuctionApiBase() ? "Auth token detected" : "Demo fallback mode"}</span>
    </div>
    <p class="mx-auction-description">Use the authenticated backend when available. LocalStorage remains as fallback for previews.</p>
    <div class="mx-auction-actions"></div>
    <div class="mx-auction-history"></div>
  `;

  const actions = panel.querySelector(".mx-auction-actions");
  const log = panel.querySelector(".mx-auction-history");

  const loadButton = make("button", "mx-auction-btn primary", "Load Backend Lots");
  loadButton.onclick = async () => {
    log.innerHTML = "<strong>Backend Sync</strong><span>Loading...</span>";
    try {
      const response = await auctionRequest("/auctions");
      const items = response?.items || response || [];
      log.innerHTML = `<strong>Backend Sync</strong><span>Loaded ${Array.isArray(items) ? items.length : 0} backend lot(s).</span>`;
      onLoaded?.(items);
    } catch (error) {
      log.innerHTML = `<strong>Backend Sync</strong><span>Backend unavailable: ${error instanceof Error ? error.message : String(error)}</span>`;
    }
  };

  const statusButton = make("button", "mx-auction-btn", "Check Session");
  statusButton.onclick = () => {
    log.innerHTML = `<strong>Backend Sync</strong><span>${hasAuctionApiBase() ? "Authenticated backend mode is available." : "No auth token found. Local demo mode remains active."}</span>`;
  };

  actions.appendChild(loadButton);
  actions.appendChild(statusButton);
  return panel;
}
