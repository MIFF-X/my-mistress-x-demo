import {
  AUCTION_ADDONS,
  LOT_TYPES,
  addAuctionLot,
  archiveSoldLot,
  getAuctionPluginState,
  getLiveStageAuctionLoadout,
  saveLiveStageAuctionLoadout,
  updateAuctionLot,
} from "./auction-store.js";
import { createAuctionId, dispatchAuctionLiveAction, formatCredits, formatTimer, getLotTypeMeta } from "./auction-utils.js";
import { ensureAuctionStyles } from "./auction-styles.js";
import { auctionRequest, hasAuctionApiBase } from "./api-lite.js";

function make(tag, className = "", text = "") {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.innerText = text;
  return el;
}

function makeButton(label, className, onClick) {
  const btn = make("button", className, label);
  btn.type = "button";
  if (onClick) btn.onclick = onClick;
  return btn;
}

function makePill(label, active = false) {
  return make("span", active ? "mx-auction-pill is-active" : "mx-auction-pill", label);
}

function announce(kind, title, text, credits = 0) {
  dispatchAuctionLiveAction({ actionKind: kind, icon: "🔨", title, text, credits });
}

function buildAuctionPayload(lot) {
  const endsAt = new Date(Date.now() + Number(lot.timerSeconds || 1800) * 1000).toISOString();
  return {
    title: lot.title,
    description: lot.description,
    startPrice: Number(lot.startPrice || 1),
    buyNowPrice: Number(lot.buyNowPrice || 0) || null,
    reservePrice: Number(lot.reservePrice || 0) || null,
    endsAt,
    visibility: lot.visibility,
    mode: lot.auctionMode,
    lotType: lot.lotType,
    fulfilmentType: lot.lotType === "nft" ? "web3" : lot.lotType,
    nftMetadata: lot.nft || null,
    accessRules: { visibility: lot.visibility },
    addons: lot.addons || [],
    metadata: { localId: lot.id, tags: lot.tags || [] },
  };
}

async function tryApiCreateLot(lot) {
  if (!hasAuctionApiBase()) return lot;
  try {
    const created = await auctionRequest("/auctions", {
      method: "POST",
      body: JSON.stringify(buildAuctionPayload(lot)),
    });
    const serverId = created?.id || created?.auction?.id || null;
    if (!serverId) return lot;
    return {
      ...lot,
      id: serverId,
      serverId,
      status: created.status === "active" ? "live" : created.status || lot.status,
      currentBid: Number(created.current_bid ?? created.currentBid ?? lot.currentBid),
      highBidder: created.high_bidder_id || created.highBidderId || lot.highBidder,
      tags: [...(lot.tags || []), "backend"],
    };
  } catch (error) {
    announce("auction-api", "Backend unavailable", error instanceof Error ? error.message : String(error));
    return lot;
  }
}

async function createLotFromForm(form) {
  const data = new FormData(form);
  const lotType = data.get("lotType") || "digital";
  const startPrice = Number(data.get("startPrice") || 10);
  const addons = AUCTION_ADDONS.filter((addon) => data.get(`addon-${addon.id}`)).map((addon) => addon.id);
  const type = getLotTypeMeta(lotType);
  const localLot = {
    id: createAuctionId("lot"),
    title: String(data.get("title") || "New Auction Lot").trim(),
    creatorName: String(data.get("creatorName") || "Creator").trim(),
    visibility: data.get("visibility") || "public",
    auctionMode: data.get("auctionMode") || "normal",
    lotType,
    status: "draft",
    icon: type.icon,
    description: String(data.get("description") || "Auction lot created from the stage commerce plugin.").trim(),
    startPrice,
    currentBid: startPrice,
    reservePrice: Number(data.get("reservePrice") || 0),
    buyNowPrice: Number(data.get("buyNowPrice") || 0),
    bidIncrement: Number(data.get("bidIncrement") || 10),
    highBidder: "Opening Bid",
    timerSeconds: Number(data.get("timerMinutes") || 30) * 60,
    watchedBy: 0,
    quantity: 1,
    tags: [lotType, data.get("visibility") || "public", data.get("auctionMode") || "normal"],
    addons: addons.length ? addons : ["analytics", "fulfilment"],
    nft: lotType === "nft" ? {
      chain: String(data.get("nftChain") || "Polygon"),
      contract: String(data.get("nftContract") || "Pending"),
      tokenId: String(data.get("nftTokenId") || "Pending token"),
      royaltyPercent: Number(data.get("nftRoyalty") || 5),
      mintStatus: String(data.get("nftMintStatus") || "Draft metadata"),
    } : null,
    bidHistory: [{ bidder: "System", amount: startPrice, note: "Opening price" }],
  };
  const lot = await tryApiCreateLot(localLot);
  addAuctionLot(lot);
  announce("auction-created", lot.serverId ? "Backend auction created" : "Auction created", lot.title, lot.startPrice);
  return lot;
}

async function bidOnLot(lotId, fixedAmount = null) {
  let nextLot = null;
  let currentLot = null;
  const names = ["Bidder One", "VIP Collector", "Live Guest", "Top Bidder", "Vault Member"];

  updateAuctionLot(lotId, (lot) => {
    currentLot = lot;
    return lot;
  });

  if (!currentLot) return null;
  const amount = fixedAmount || Number(currentLot.currentBid || 0) + Number(currentLot.bidIncrement || 10);
  const serverId = currentLot.serverId || currentLot.id;

  if (currentLot.serverId && hasAuctionApiBase()) {
    try {
      const bid = await auctionRequest(`/auctions/${serverId}/bid`, {
        method: "POST",
        body: JSON.stringify({ amount }),
      });
      const bidder = bid.bidderId || bid.bidder_id || "Backend Bidder";
      updateAuctionLot(lotId, (lot) => {
        nextLot = {
          ...lot,
          status: lot.status === "draft" ? "live" : lot.status,
          currentBid: amount,
          highBidder: bidder,
          watchedBy: Number(lot.watchedBy || 0) + 1,
          bidHistory: [{ bidder, amount, note: "Backend bid" }, ...(lot.bidHistory || [])].slice(0, 10),
        };
        return nextLot;
      });
      announce("auction-bid", "Backend bid", `${nextLot.title} · ${formatCredits(nextLot.currentBid)}`, nextLot.currentBid);
      return nextLot;
    } catch (error) {
      announce("auction-api", "Bid fell back to demo", error instanceof Error ? error.message : String(error));
    }
  }

  updateAuctionLot(lotId, (lot) => {
    const bidder = names[Math.floor(Math.random() * names.length)];
    nextLot = {
      ...lot,
      status: lot.status === "draft" ? "live" : lot.status,
      currentBid: amount,
      highBidder: bidder,
      watchedBy: Number(lot.watchedBy || 0) + 1,
      bidHistory: [{ bidder, amount, note: "Demo bid" }, ...(lot.bidHistory || [])].slice(0, 10),
    };
    return nextLot;
  });
  if (nextLot) announce("auction-bid", "Auction bid", `${nextLot.title} · ${formatCredits(nextLot.currentBid)}`, nextLot.currentBid);
  return nextLot;
}

async function closeLot(lotId) {
  const state = getAuctionPluginState();
  const lot = state.auctions.find((item) => item.id === lotId);
  if (!lot) return null;
  if (lot.serverId && hasAuctionApiBase()) {
    try {
      await auctionRequest(`/auctions/${lot.serverId}/end`, {
        method: "POST",
        body: JSON.stringify({}),
      });
    } catch (error) {
      announce("auction-api", "Close fell back to demo", error instanceof Error ? error.message : String(error));
    }
  }
  archiveSoldLot(lotId);
  announce("auction-closed", lot.serverId ? "Backend auction closed" : "Auction closed", `${lot.title} · ${formatCredits(lot.currentBid)}`, lot.currentBid);
  return lot;
}

function attachLotToStage(stageId, lot) {
  const loadout = getLiveStageAuctionLoadout(stageId);
  const attached = new Set(loadout.attachedAuctionIds || []);
  attached.add(lot.id);
  saveLiveStageAuctionLoadout(stageId, {
    activeAuctionId: lot.id,
    attachedAuctionIds: Array.from(attached),
    visibility: lot.visibility,
    auctionMode: lot.auctionMode,
    nftLotsEnabled: lot.lotType === "nft" || loadout.nftLotsEnabled,
  });
  announce("auction-card", "Auction attached", lot.title, lot.currentBid);
}

function lotCard(lot, refresh, stageId, compact = false) {
  const card = make("article", compact ? "mx-auction-lot-card is-compact" : "mx-auction-lot-card");
  const type = getLotTypeMeta(lot.lotType);
  const reserveMet = Number(lot.currentBid || 0) >= Number(lot.reservePrice || 0);
  card.innerHTML = `
    <div class="mx-auction-lot-top">
      <div class="mx-auction-lot-icon">${lot.icon || type.icon}</div>
      <div><h3>${lot.title}</h3><p>${lot.creatorName || "Creator"} · ${type.label}</p></div>
      <span class="mx-auction-status mx-auction-status-${lot.status}">${lot.status}</span>
    </div>
    <p class="mx-auction-description">${lot.description}</p>
    <div class="mx-auction-bid-row">
      <div><small>Current</small><strong>${formatCredits(lot.currentBid)}</strong></div>
      <div><small>Leader</small><strong>${lot.highBidder}</strong></div>
      <div><small>Timer</small><strong>${formatTimer(lot.timerSeconds)}</strong></div>
    </div>
    <div class="mx-auction-pill-row"></div>
    ${lot.nft ? `<div class="mx-auction-nft-box"><strong>NFT:</strong> ${lot.nft.chain} · ${lot.nft.tokenId}<br><small>${lot.nft.mintStatus} · royalty ${lot.nft.royaltyPercent}%</small></div>` : ""}
    <div class="mx-auction-actions"></div>
    <div class="mx-auction-history"></div>`;
  const pills = card.querySelector(".mx-auction-pill-row");
  pills.appendChild(makePill(lot.visibility, lot.visibility === "public"));
  pills.appendChild(makePill(lot.auctionMode, lot.auctionMode === "live"));
  pills.appendChild(makePill(reserveMet ? "reserve met" : "reserve pending", reserveMet));
  if (lot.serverId) pills.appendChild(makePill("backend", true));
  (lot.addons || []).slice(0, compact ? 2 : 5).forEach((id) => {
    const addon = AUCTION_ADDONS.find((item) => item.id === id);
    if (addon) pills.appendChild(makePill(`${addon.icon} ${addon.label}`));
  });
  const actions = card.querySelector(".mx-auction-actions");
  actions.appendChild(makeButton(`Bid +${lot.bidIncrement || 10}`, "mx-auction-btn primary", async () => { await bidOnLot(lot.id); refresh(); }));
  const buy = makeButton(lot.buyNowPrice ? `Buy Now ${formatCredits(lot.buyNowPrice)}` : "Buy Now Off", "mx-auction-btn", async () => { await bidOnLot(lot.id, lot.buyNowPrice); await closeLot(lot.id); refresh(); });
  buy.disabled = !lot.buyNowPrice || lot.status === "sold";
  actions.appendChild(buy);
  actions.appendChild(makeButton("Attach", "mx-auction-btn", () => { attachLotToStage(stageId, lot); refresh(); }));
  actions.appendChild(makeButton("Close", "mx-auction-btn danger", async () => { await closeLot(lot.id); refresh(); }));
  card.querySelector(".mx-auction-history").innerHTML = `<strong>History</strong>${(lot.bidHistory || []).slice(0, compact ? 2 : 5).map((entry) => `<span>${entry.bidder}: ${formatCredits(entry.amount)} · ${entry.note}</span>`).join("")}`;
  return card;
}

function filterLots(lots, filter) {
  if (filter === "all") return lots;
  if (filter === "nft") return lots.filter((lot) => lot.lotType === "nft");
  if (filter === "sold") return lots.filter((lot) => lot.status === "sold");
  if (["public", "private"].includes(filter)) return lots.filter((lot) => lot.visibility === filter);
  if (["live", "normal"].includes(filter)) return lots.filter((lot) => lot.auctionMode === filter);
  return lots;
}

export function createAuctionCommerceToolTray({ stageId = "live-stage-zone", defaultExpanded = false, showOpenButton = true } = {}) {
  ensureAuctionStyles();
  let expanded = defaultExpanded;
  const tray = make("aside", "mx-auction-commerce-tray is-compact");
  const render = () => {
    const state = getAuctionPluginState();
    const loadout = getLiveStageAuctionLoadout(stageId);
    const attached = state.auctions.filter((lot) => (loadout.attachedAuctionIds || []).includes(lot.id));
    const active = state.auctions.find((lot) => lot.id === loadout.activeAuctionId) || attached[0] || state.auctions[0];
    tray.innerHTML = "";
    const header = makeButton("", "mx-auction-tray-header", () => { expanded = !expanded; render(); });
    header.innerHTML = `<span>🔨 <strong>Commerce Tool Tray</strong><small>Auctions · ${loadout.visibility} · ${loadout.auctionMode}</small></span><em>${expanded ? "Close" : "Open"}</em>`;
    tray.appendChild(header);
    if (!expanded) return;
    const body = make("div", "mx-auction-tray-body");
    body.innerHTML = `<div class="mx-auction-tray-active"><small>Active lot</small><strong>${active?.icon || "🔨"} ${active?.title || "No lot attached"}</strong><span>${active ? `${formatCredits(active.currentBid)} · ${active.highBidder}` : "Attach a lot below"}</span></div>`;
    const modeRow = make("div", "mx-auction-tray-mode-row");
    ["public", "private", "live", "normal"].forEach((mode) => modeRow.appendChild(makeButton(mode, loadout.visibility === mode || loadout.auctionMode === mode ? "mx-auction-mode-btn is-active" : "mx-auction-mode-btn", () => {
      if (["public", "private"].includes(mode)) saveLiveStageAuctionLoadout(stageId, { visibility: mode });
      if (["live", "normal"].includes(mode)) saveLiveStageAuctionLoadout(stageId, { auctionMode: mode });
      render();
    })));
    body.appendChild(modeRow);
    const selectRow = make("div", "mx-auction-stage-select-row");
    const select = document.createElement("select");
    state.auctions.filter((lot) => lot.status !== "sold").forEach((lot) => {
      const option = document.createElement("option");
      option.value = lot.id;
      option.textContent = `${lot.icon || "🔨"} ${lot.title} · ${lot.visibility}/${lot.auctionMode}${lot.lotType === "nft" ? " · NFT" : ""}${lot.serverId ? " · API" : ""}`;
      option.selected = lot.id === loadout.activeAuctionId;
      select.appendChild(option);
    });
    selectRow.appendChild(select);
    selectRow.appendChild(makeButton("Attach", "mx-auction-btn primary", () => { const chosen = state.auctions.find((lot) => lot.id === select.value); if (chosen) attachLotToStage(stageId, chosen); render(); }));
    body.appendChild(selectRow);
    const list = make("div", "mx-auction-stage-attached-list");
    list.innerHTML = `<small>Attached lots</small>${attached.map((lot) => `<span>${lot.icon || "🔨"} ${lot.title} <em>${lot.lotType === "nft" ? "NFT" : lot.auctionMode}</em></span>`).join("") || "<span>No lots attached yet.</span>"}`;
    body.appendChild(list);
    const actions = make("div", "mx-auction-actions");
    actions.appendChild(makeButton("Test Bid", "mx-auction-btn", async () => { if (active) await bidOnLot(active.id); render(); }));
    actions.appendChild(makeButton("Save Stage", "mx-auction-btn", () => saveLiveStageAuctionLoadout(stageId, getLiveStageAuctionLoadout(stageId))));
    if (showOpenButton) actions.appendChild(makeButton("Open Full Auctions", "mx-auction-btn primary", () => { const app = document.getElementById("app"); if (app) { app.innerHTML = ""; app.appendChild(createAuctionHouse({ stageId })); } }));
    body.appendChild(actions);
    tray.appendChild(body);
  };
  render();
  return tray;
}

export function createAuctionHouse(options = {}) {
  ensureAuctionStyles();
  const stageId = options.stageId || "live-stage-zone";
  let activeFilter = "all";
  const page = make("section", "mx-auction-page page-shell");
  const render = () => {
    const state = getAuctionPluginState();
    page.innerHTML = "";
    page.innerHTML = `<div class="mx-auction-hero"><div><small>Commerce Plugin</small><h2>🔨 MX Auctions</h2><p>One plugin for public, private, live, normal, VIP, rare vault, replay, chat cards, analytics, fulfilment, and NFT digital lots.</p></div><div class="mx-auction-hero-actions"></div></div>`;
    if (options.onBack) page.querySelector(".mx-auction-hero-actions").appendChild(makeButton("Back", "mx-auction-btn", options.onBack));
    const stats = make("div", "mx-auction-stats-grid");
    [["Lots", state.auctions.length, "🔨"], ["NFT", state.auctions.filter((lot) => lot.lotType === "nft").length, "🧬"], ["Private", state.auctions.filter((lot) => lot.visibility === "private").length, "🔐"], ["API Lots", state.auctions.filter((lot) => lot.serverId).length, "🌐"]].forEach(([label, value, icon]) => { const item = make("div", "mx-auction-stat"); item.innerHTML = `<span>${icon}</span><small>${label}</small><strong>${value}</strong>`; stats.appendChild(item); });
    page.appendChild(stats);
    const filters = make("div", "mx-auction-filter-row");
    ["all", "public", "private", "live", "normal", "nft", "sold"].forEach((filter) => filters.appendChild(makeButton(filter.toUpperCase(), activeFilter === filter ? "mx-auction-mode-btn is-active" : "mx-auction-mode-btn", () => { activeFilter = filter; render(); })));
    page.appendChild(filters);
    const trayPanel = make("section", "mx-auction-panel");
    trayPanel.innerHTML = `<div class="mx-auction-panel-heading"><div><small>Live Stage Commerce Tool Tray</small><h3>Saved stage tray</h3></div><span>${stageId}</span></div>`;
    trayPanel.appendChild(createAuctionCommerceToolTray({ stageId, defaultExpanded: true, showOpenButton: false }));
    page.appendChild(trayPanel);
    const grid = make("div", "mx-auction-manager-grid");
    const lotsPanel = make("section", "mx-auction-panel");
    lotsPanel.innerHTML = `<div class="mx-auction-panel-heading"><div><small>Auction Lobby</small><h3>${activeFilter.toUpperCase()} Lots</h3></div><span>Public + Private · Live + Normal</span></div>`;
    const lotGrid = make("div", "mx-auction-lot-grid");
    filterLots(state.auctions, activeFilter).forEach((lot) => lotGrid.appendChild(lotCard(lot, render, stageId)));
    lotsPanel.appendChild(lotGrid);
    grid.appendChild(lotsPanel);
    const formPanel = make("section", "mx-auction-panel");
    formPanel.innerHTML = `<div class="mx-auction-panel-heading"><div><small>Create Auction</small><h3>New lot</h3></div><span>${hasAuctionApiBase() ? "API-first" : "Local fallback"}</span></div><form class="mx-auction-form"><label>Title<input name="title" value="New Auction Lot"></label><label>Creator<input name="creatorName" value="Creator"></label><label>Visibility<select name="visibility"><option value="public">Public</option><option value="private">Private</option></select></label><label>Mode<select name="auctionMode"><option value="normal">Normal</option><option value="live">Live</option></select></label><label>Lot Type<select name="lotType">${LOT_TYPES.map((type) => `<option value="${type.id}">${type.icon} ${type.label}</option>`).join("")}</select></label><label>Start<input type="number" name="startPrice" value="50"></label><label>Reserve<input type="number" name="reservePrice" value="100"></label><label>Buy Now<input type="number" name="buyNowPrice" value="400"></label><label>Increment<input type="number" name="bidIncrement" value="25"></label><label>Timer Minutes<input type="number" name="timerMinutes" value="30"></label><label class="mx-auction-form-wide">Description<textarea name="description">Auction lot details.</textarea></label><label>Chain<input name="nftChain" value="Polygon"></label><label>Contract<input name="nftContract" value="Pending"></label><label>Token ID<input name="nftTokenId" value="MX-001"></label><label>Royalty %<input type="number" name="nftRoyalty" value="5"></label><label>Mint Status<input name="nftMintStatus" value="Draft metadata"></label><div class="mx-auction-form-wide mx-auction-addon-checks"><strong>Add-ons</strong>${AUCTION_ADDONS.map((addon) => `<label><input type="checkbox" name="addon-${addon.id}" checked> ${addon.icon} ${addon.label}</label>`).join("")}</div><button class="mx-auction-btn primary" type="submit">Create Lot</button></form>`;
    formPanel.querySelector("form").onsubmit = async (event) => { event.preventDefault(); await createLotFromForm(event.currentTarget); render(); };
    grid.appendChild(formPanel);
    page.appendChild(grid);
  };
  render();
  return page;
}
