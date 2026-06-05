import { createAuctionHouse } from "./auction-ui.js";
import { createBackendSyncPanel } from "./sync-panel.js";
import { createAuctionRealtimePanel } from "./realtime-panel.js";
import { createClosedLotsPanel } from "./closed-lots-panel.js";
import { getAuctionPluginState, saveAuctionPluginState } from "./auction-store.js";

function normalizeBackendLot(item) {
  const visibility = item.visibility || "public";
  const mode = item.mode || item.auctionMode || "normal";
  const lotType = item.lot_type || item.lotType || "digital";
  const endsAt = item.ends_at || item.endsAt;

  return {
    id: item.id,
    serverId: item.id,
    title: item.title || "Backend Auction Lot",
    creatorName: item.host_id || item.hostId || "Backend Host",
    visibility,
    auctionMode: mode,
    lotType,
    status: item.status === "active" ? "live" : item.status || "draft",
    icon: lotType === "nft" ? "🧬" : mode === "live" ? "🔨" : "📦",
    description: item.description || "Loaded from the backend auction API.",
    startPrice: Number(item.start_price ?? item.startPrice ?? 1),
    currentBid: Number(item.current_bid ?? item.currentBid ?? 0),
    reservePrice: Number(item.reserve_price ?? item.reservePrice ?? 0),
    buyNowPrice: Number(item.buy_now_price ?? item.buyNowPrice ?? 0),
    bidIncrement: 1,
    highBidder: item.high_bidder_id || item.highBidderId || "Opening Bid",
    timerSeconds: endsAt ? Math.max(0, Math.round((new Date(endsAt).getTime() - Date.now()) / 1000)) : 0,
    watchedBy: Number(item.bid_count ?? item.bidCount ?? 0),
    quantity: 1,
    tags: [visibility, mode, lotType, "backend"],
    addons: Array.isArray(item.addons) ? item.addons : [],
    nft: item.nft_metadata || item.nftMetadata || null,
    bidHistory: (item.recentBids || []).map((bid) => ({
      bidder: bid.bidderId || bid.bidder_id || "Bidder",
      amount: Number(bid.amount || 0),
      note: bid.isWinning ? "Winning" : "Bid",
    })),
  };
}

function mergeBackendLots(items = []) {
  const state = getAuctionPluginState();
  const backendLots = items.map(normalizeBackendLot);
  const existingWithoutLoaded = state.auctions.filter((lot) => !backendLots.some((backendLot) => backendLot.id === lot.id));
  const next = {
    ...state,
    auctions: [...backendLots, ...existingWithoutLoaded],
  };
  saveAuctionPluginState(next);
  return next;
}

function createLiveSyncShortcutsPanel() {
  const panel = document.createElement("section");
  panel.className = "mx-auction-panel";
  const state = getAuctionPluginState();
  const apiLots = state.auctions.filter((lot) => lot.serverId);

  panel.innerHTML = `
    <div class="mx-auction-panel-heading">
      <div><small>Live Sync Shortcuts</small><h3>One-click realtime room connect</h3></div>
      <span>${apiLots.length} API lot${apiLots.length === 1 ? "" : "s"}</span>
    </div>
    <p class="mx-auction-description">Connect the realtime monitor to an API-backed auction without typing its backend ID.</p>
    <div class="mx-auction-actions"></div>
  `;

  const actions = panel.querySelector(".mx-auction-actions");
  if (!apiLots.length) {
    const empty = document.createElement("span");
    empty.className = "mx-auction-pill";
    empty.innerText = "Load backend lots first";
    actions.appendChild(empty);
    return panel;
  }

  apiLots.forEach((lot) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mx-auction-btn primary";
    button.innerText = `Live Sync · ${lot.title}`;
    button.onclick = () => {
      window.dispatchEvent(new CustomEvent("mistressx:auction-realtime-connect", {
        detail: { auctionId: lot.serverId, title: lot.title },
      }));
    };
    actions.appendChild(button);
  });

  return panel;
}

export function createAuctionManagerScreen(options = {}) {
  const shell = document.createElement("section");
  shell.className = "mx-auction-page page-shell";

  const syncShortcutsSlot = document.createElement("div");
  const closedLotsSlot = document.createElement("div");
  const houseSlot = document.createElement("div");

  const renderSyncShortcuts = () => {
    syncShortcutsSlot.innerHTML = "";
    syncShortcutsSlot.appendChild(createLiveSyncShortcutsPanel());
  };

  const renderClosedLots = () => {
    closedLotsSlot.innerHTML = "";
    closedLotsSlot.appendChild(createClosedLotsPanel());
  };

  const renderHouse = () => {
    houseSlot.innerHTML = "";
    houseSlot.appendChild(createAuctionHouse(options));
  };

  const renderAll = () => {
    renderSyncShortcuts();
    renderClosedLots();
    renderHouse();
  };

  const realtimeAppliedHandler = (event) => {
    if (event.detail?.applied) renderAll();
  };

  window.addEventListener("mistressx:auction-realtime-state-applied", realtimeAppliedHandler);
  shell.cleanup = () => window.removeEventListener("mistressx:auction-realtime-state-applied", realtimeAppliedHandler);

  shell.appendChild(createBackendSyncPanel({
    onLoaded(items) {
      mergeBackendLots(Array.isArray(items) ? items : []);
      window.dispatchEvent(new CustomEvent("mistressx:auction-backend-lots-loaded", { detail: { items } }));
      renderAll();
    }
  }));
  shell.appendChild(createAuctionRealtimePanel());
  shell.appendChild(syncShortcutsSlot);
  shell.appendChild(closedLotsSlot);
  shell.appendChild(houseSlot);

  renderAll();
  return shell;
}
