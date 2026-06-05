const AUCTION_STORE_KEY = "mistressXAuctionsPluginState";
const STAGE_STORE_KEY = "mistressXLiveStageAuctionTray";

export const AUCTION_ADDONS = [
  { id: "live-studio", label: "Live Auction Studio", icon: "📡" },
  { id: "vip-rooms", label: "VIP Auction Rooms", icon: "🔐" },
  { id: "rare-vault", label: "Rare Item Vault", icon: "💎" },
  { id: "sealed-bids", label: "Sealed Bid Mode", icon: "🤫" },
  { id: "anti-snipe", label: "Anti-Snipe Timer", icon: "⏱️" },
  { id: "trophy-system", label: "Auction Trophy System", icon: "🏆" },
  { id: "replay-access", label: "Auction Replay", icon: "🎥" },
  { id: "chat-cards", label: "Auction-to-Chat Cards", icon: "💬" },
  { id: "analytics", label: "Auction Analytics", icon: "📊" },
  { id: "fulfilment", label: "Auction Fulfilment", icon: "📦" },
];

export const LOT_TYPES = [
  { id: "physical", label: "Physical Lot", icon: "📦" },
  { id: "digital", label: "Digital Lot", icon: "🎬" },
  { id: "nft", label: "NFT Digital Lot", icon: "🧬" },
  { id: "experience", label: "Experience Lot", icon: "📅" },
  { id: "status", label: "Status Lot", icon: "👑" },
];

const DEFAULT_AUCTIONS = [
  {
    id: "auction-live-public-vault",
    title: "Friday Live Vault Drop",
    creatorName: "Mistress Noir",
    visibility: "public",
    auctionMode: "live",
    lotType: "physical",
    status: "live",
    icon: "🔨",
    description: "Public live-room auction with rotating lots, anti-snipe timer, chat cards, and winner showcase.",
    startPrice: 50,
    currentBid: 175,
    reservePrice: 125,
    buyNowPrice: 420,
    bidIncrement: 25,
    highBidder: "Bidder One",
    timerSeconds: 165,
    watchedBy: 58,
    quantity: 1,
    tags: ["Live", "Public", "Rare Vault"],
    addons: ["live-studio", "anti-snipe", "chat-cards", "analytics", "fulfilment"],
    nft: null,
    bidHistory: [
      { bidder: "Bidder One", amount: 175, note: "High bid" },
      { bidder: "Collector 09", amount: 150, note: "Outbid" },
      { bidder: "VIP Guest", amount: 125, note: "Reserve met" },
    ],
  },
  {
    id: "auction-private-vip-nft",
    title: "NFT Sticker Crown Series #01",
    creatorName: "Mistress X",
    visibility: "private",
    auctionMode: "normal",
    lotType: "nft",
    status: "scheduled",
    icon: "🧬",
    description: "Private VIP digital collectible lot with NFT metadata, token handoff note, and collector album unlock.",
    startPrice: 80,
    currentBid: 120,
    reservePrice: 100,
    buyNowPrice: 555,
    bidIncrement: 20,
    highBidder: "Vault Bidder",
    timerSeconds: 86400,
    watchedBy: 21,
    quantity: 1,
    tags: ["NFT", "Private", "Digital"],
    addons: ["vip-rooms", "sealed-bids", "trophy-system", "fulfilment"],
    nft: {
      chain: "Polygon",
      contract: "0xMISTRESSX...DEMO",
      tokenId: "MX-CROWN-001",
      royaltyPercent: 7.5,
      mintStatus: "Ready to mint/transfer",
    },
    bidHistory: [
      { bidder: "Vault Bidder", amount: 120, note: "VIP bid" },
      { bidder: "Collector 09", amount: 100, note: "Reserve met" },
    ],
  },
  {
    id: "auction-private-live-aftershow",
    title: "After-Show Call Slot",
    creatorName: "Mistress Velvet",
    visibility: "private",
    auctionMode: "live",
    lotType: "experience",
    status: "draft",
    icon: "🎥",
    description: "Invite-only live auction for a 20-minute after-show call booking slot.",
    startPrice: 100,
    currentBid: 100,
    reservePrice: 150,
    buyNowPrice: 600,
    bidIncrement: 50,
    highBidder: "Opening Bid",
    timerSeconds: 900,
    watchedBy: 9,
    quantity: 1,
    tags: ["Experience", "Private", "Booking"],
    addons: ["live-studio", "vip-rooms", "anti-snipe", "fulfilment"],
    nft: null,
    bidHistory: [{ bidder: "System", amount: 100, note: "Opening price" }],
  },
];

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Embedded previews can disable localStorage.
  }
}

function createDefaultState() {
  return {
    auctions: DEFAULT_AUCTIONS,
    soldArchive: [],
    analytics: {
      watchedLots: 88,
      liveRevenue: 295,
      normalRevenue: 120,
      privateInvites: 12,
      nftLots: 1,
    },
  };
}

export function getAuctionPluginState() {
  const state = readJson(AUCTION_STORE_KEY, null);
  if (state?.auctions?.length) return state;
  const next = createDefaultState();
  writeJson(AUCTION_STORE_KEY, next);
  return next;
}

export function saveAuctionPluginState(state) {
  writeJson(AUCTION_STORE_KEY, state);
  return state;
}

export function getLiveStageAuctionLoadout(stageId = "default-live-stage") {
  const all = readJson(STAGE_STORE_KEY, {});
  return all[stageId] || {
    stageId,
    enabled: true,
    visibility: "public",
    auctionMode: "live",
    activeAuctionId: "auction-live-public-vault",
    attachedAuctionIds: ["auction-live-public-vault", "auction-private-vip-nft"],
    addons: ["live-studio", "anti-snipe", "chat-cards", "analytics", "fulfilment"],
    nftLotsEnabled: true,
    savedAt: null,
  };
}

export function saveLiveStageAuctionLoadout(stageId, loadout) {
  const all = readJson(STAGE_STORE_KEY, {});
  const next = {
    ...getLiveStageAuctionLoadout(stageId),
    ...loadout,
    stageId,
    savedAt: new Date().toISOString(),
  };
  all[stageId] = next;
  writeJson(STAGE_STORE_KEY, all);
  window.dispatchEvent(new CustomEvent("mistressx:auction-stage-saved", { detail: next }));
  return next;
}

export function addAuctionLot(lot) {
  const state = getAuctionPluginState();
  state.auctions = [lot, ...state.auctions];
  if (lot.lotType === "nft") state.analytics.nftLots += 1;
  return saveAuctionPluginState(state);
}

export function updateAuctionLot(auctionId, updater) {
  const state = getAuctionPluginState();
  state.auctions = state.auctions.map((lot) => (lot.id === auctionId ? updater({ ...lot }) : lot));
  return saveAuctionPluginState(state);
}

export function archiveSoldLot(auctionId) {
  const state = getAuctionPluginState();
  const lot = state.auctions.find((item) => item.id === auctionId);
  if (!lot) return state;
  const soldLot = { ...lot, status: "sold", soldAt: new Date().toISOString() };
  state.auctions = state.auctions.map((item) => (item.id === auctionId ? soldLot : item));
  state.soldArchive = [soldLot, ...(state.soldArchive || [])].slice(0, 30);
  state.analytics.liveRevenue += lot.auctionMode === "live" ? Number(lot.currentBid || 0) : 0;
  state.analytics.normalRevenue += lot.auctionMode === "normal" ? Number(lot.currentBid || 0) : 0;
  return saveAuctionPluginState(state);
}
