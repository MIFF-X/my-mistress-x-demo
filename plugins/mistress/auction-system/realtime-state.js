import { getAuctionPluginState, saveAuctionPluginState } from "./auction-store.js";

function matchesAuction(lot, auctionId) {
  return lot?.id === auctionId || lot?.serverId === auctionId;
}

export function applyAuctionBidUpdate(payload = {}) {
  const auctionId = payload.auctionId;
  if (!auctionId) return false;

  const amount = Number(payload.currentBid ?? payload.amount ?? 0);
  const bidder = payload.highBidderId || payload.bidderId || "Backend Bidder";
  const state = getAuctionPluginState();
  let changed = false;

  const auctions = state.auctions.map((lot) => {
    if (!matchesAuction(lot, auctionId)) return lot;
    changed = true;
    return {
      ...lot,
      status: lot.status === "draft" ? "live" : lot.status,
      currentBid: amount || lot.currentBid,
      highBidder: bidder,
      watchedBy: Number(payload.bidCount ?? lot.watchedBy ?? 0),
      bidHistory: [
        { bidder, amount: amount || lot.currentBid, note: "Realtime bid" },
        ...(lot.bidHistory || []),
      ].slice(0, 10),
    };
  });

  if (!changed) return false;
  saveAuctionPluginState({ ...state, auctions });
  return true;
}

export function applyAuctionEndedUpdate(payload = {}) {
  const auctionId = payload.auctionId;
  if (!auctionId) return false;

  const state = getAuctionPluginState();
  let changed = false;
  let soldLot = null;

  const auctions = state.auctions.map((lot) => {
    if (!matchesAuction(lot, auctionId)) return lot;
    changed = true;
    soldLot = {
      ...lot,
      status: "sold",
      currentBid: Number(payload.currentBid ?? lot.currentBid ?? 0),
      highBidder: payload.highBidderId || lot.highBidder,
      soldAt: payload.at || new Date().toISOString(),
    };
    return soldLot;
  });

  if (!changed) return false;
  const soldArchive = soldLot ? [soldLot, ...(state.soldArchive || [])].slice(0, 30) : state.soldArchive;
  saveAuctionPluginState({ ...state, auctions, soldArchive });
  return true;
}
