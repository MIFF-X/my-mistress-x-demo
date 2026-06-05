import { getAuctionPluginState } from "./auction-store.js";

function collectClosedLots() {
  const state = getAuctionPluginState();
  const closed = [
    ...(state.soldArchive || []),
    ...(state.auctions || []).filter((lot) => ["sold", "ended", "closed"].includes(lot.status)),
  ];
  const seen = new Set();
  return closed.filter((lot) => {
    if (!lot?.id || seen.has(lot.id)) return false;
    seen.add(lot.id);
    return true;
  });
}

function followupType(lot) {
  if (lot.lotType === "nft") return "Web3 handoff";
  if (lot.lotType === "experience") return "Booking follow-up";
  if (lot.lotType === "physical") return "Dispatch follow-up";
  if (lot.lotType === "status") return "Status award";
  return "Digital access";
}

export function createClosedLotsPanel() {
  const closedLots = collectClosedLots();
  const panel = document.createElement("section");
  panel.className = "mx-auction-panel";
  panel.innerHTML = `
    <div class="mx-auction-panel-heading">
      <div><small>Closed Lots</small><h3>Follow-up queue</h3></div>
      <span>${closedLots.length} item${closedLots.length === 1 ? "" : "s"}</span>
    </div>
    <p class="mx-auction-description">Closed auctions appear here for post-sale follow-up.</p>
    <div class="mx-auction-lot-grid"></div>
  `;

  const grid = panel.querySelector(".mx-auction-lot-grid");
  if (!closedLots.length) {
    const empty = document.createElement("article");
    empty.className = "mx-auction-lot-card";
    empty.innerHTML = `<h3>No closed lots yet</h3><p class="mx-auction-description">Buy-now, host-close, and realtime-ended auctions will appear here.</p>`;
    grid.appendChild(empty);
    return panel;
  }

  closedLots.slice(0, 12).forEach((lot) => {
    const card = document.createElement("article");
    card.className = "mx-auction-lot-card";
    const value = Number(lot.currentBid || 0);
    card.innerHTML = `
      <div class="mx-auction-lot-top">
        <div class="mx-auction-lot-icon">${lot.icon || "📦"}</div>
        <div><h3>${lot.title || "Closed Lot"}</h3><p>${lot.lotType || "auction"}</p></div>
        <span class="mx-auction-status mx-auction-status-sold">closed</span>
      </div>
      <div class="mx-auction-bid-row">
        <div><small>Final value</small><strong>${value.toLocaleString()} credits</strong></div>
        <div><small>Winner</small><strong>${lot.highBidder || "Pending"}</strong></div>
        <div><small>Source</small><strong>${lot.serverId ? "API" : "Local"}</strong></div>
      </div>
      <div class="mx-auction-pill-row">
        <span class="mx-auction-pill is-active">${followupType(lot)}</span>
        <span class="mx-auction-pill">pending review</span>
      </div>
    `;
    grid.appendChild(card);
  });

  return panel;
}
