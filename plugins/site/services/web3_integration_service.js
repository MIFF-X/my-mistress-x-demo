// ============================================================
// web3_integration_service.js — Blockchain Event → Notification Bridge
// Listens to on-chain events and dispatches to notificationServer
// ============================================================

const { ethers } = require("ethers");
const { dispatch, onAuctionSold, onAuctionOutbid, onNFTMinted } = require("./notificationServer");
const { Pool } = require("pg");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Provider (Alchemy WebSocket for real-time events) ─────────
const provider = new ethers.WebSocketProvider(
  process.env.ALCHEMY_WS_URL || "wss://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY"
);

// ── Contract ABIs (minimal — only events needed) ──────────────
const AUCTION_ABI = [
  "event AuctionCreated(uint256 indexed auctionId, address indexed seller, uint256 tokenId, uint256 startPrice)",
  "event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint256 amount)",
  "event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 amount)",
];

const MARKETPLACE_ABI = [
  "event TokenListed(uint256 indexed listingId, address indexed seller, uint256 tokenId, uint256 price)",
  "event TokenSold(uint256 indexed listingId, address indexed buyer, uint256 tokenId, uint256 price)",
];

const NFT_ABI = [
  "event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)",
];

// ── Contract instances ────────────────────────────────────────
const auctionContract = new ethers.Contract(
  process.env.AUCTION_CONTRACT_ADDRESS,
  AUCTION_ABI,
  provider
);

const marketplaceContract = new ethers.Contract(
  process.env.MARKETPLACE_CONTRACT_ADDRESS,
  MARKETPLACE_ABI,
  provider
);

const nftContract = new ethers.Contract(
  process.env.NFT_CONTRACT_ADDRESS,
  NFT_ABI,
  provider
);

// ── Helper: wallet address → platform userId ──────────────────
async function walletToUserId(walletAddress) {
  const res = await db.query(
    "SELECT id FROM users WHERE LOWER(wallet_address) = LOWER($1)",
    [walletAddress]
  );
  return res.rows[0]?.id || null;
}

// ── Auction Events ────────────────────────────────────────────
auctionContract.on("AuctionEnded", async (auctionId, winner, amount) => {
  console.log(`[Web3] AuctionEnded #${auctionId} — winner: ${winner}`);
  try {
    const winnerId = await walletToUserId(winner);

    // Get seller from DB
    const auction = await db.query(
      "SELECT seller_user_id, token_id FROM auctions WHERE contract_auction_id = $1",
      [auctionId.toString()]
    );
    const sellerId = auction.rows[0]?.seller_user_id;
    const tokenId  = auction.rows[0]?.token_id;

    if (winnerId) await onAuctionSold({
      auctionId: auctionId.toString(),
      winnerId,
      sellerId,
      tokenId,
      amount: ethers.formatEther(amount),
    });

    // Update DB
    await db.query(
      "UPDATE auctions SET status = $1, winner_wallet = $2, final_price = $3 WHERE contract_auction_id = $4",
      ["ended", winner, ethers.formatEther(amount), auctionId.toString()]
    );
  } catch (err) {
    console.error("[Web3] AuctionEnded handler error:", err);
  }
});

auctionContract.on("BidPlaced", async (auctionId, bidder, amount) => {
  console.log(`[Web3] BidPlaced #${auctionId} — bidder: ${bidder}`);
  try {
    // Find previous highest bidder to notify of outbid
    const prev = await db.query(
      "SELECT highest_bidder_wallet FROM auctions WHERE contract_auction_id = $1",
      [auctionId.toString()]
    );
    const prevWallet = prev.rows[0]?.highest_bidder_wallet;
    if (prevWallet && prevWallet.toLowerCase() !== bidder.toLowerCase()) {
      const prevUserId = await walletToUserId(prevWallet);
      if (prevUserId) await onAuctionOutbid({
        auctionId: auctionId.toString(),
        previousBidderId: prevUserId,
        newAmount: ethers.formatEther(amount),
      });
    }
    // Update highest bidder
    await db.query(
      "UPDATE auctions SET highest_bidder_wallet = $1, current_price = $2 WHERE contract_auction_id = $3",
      [bidder, ethers.formatEther(amount), auctionId.toString()]
    );
  } catch (err) {
    console.error("[Web3] BidPlaced handler error:", err);
  }
});

// ── NFT Mint Events ───────────────────────────────────────────
nftContract.on("TransferSingle", async (operator, from, to, id, value) => {
  // Only care about mints (from === zero address)
  if (from !== ethers.ZeroAddress) return;
  console.log(`[Web3] NFT Minted — tokenId: ${id} → ${to}`);
  try {
    const userId = await walletToUserId(to);
    if (userId) await onNFTMinted({
      userId,
      tokenId: id.toString(),
      tokenType: id < 1000 ? "badge" : id < 3000 ? "trophy" : "collectible",
    });
  } catch (err) {
    console.error("[Web3] TransferSingle handler error:", err);
  }
});

// ── Marketplace Events ────────────────────────────────────────
marketplaceContract.on("TokenSold", async (listingId, buyer, tokenId, price) => {
  console.log(`[Web3] TokenSold #${listingId} — buyer: ${buyer}`);
  try {
    const buyerId = await walletToUserId(buyer);
    if (buyerId) await dispatch(buyerId, "marketplace_sold", {
      listingId: listingId.toString(),
      tokenId: tokenId.toString(),
      price: ethers.formatEther(price),
    });
  } catch (err) {
    console.error("[Web3] TokenSold handler error:", err);
  }
});

provider.on("error", (err) => console.error("[Web3 Provider Error]", err));

console.log("[Web3 Bridge] Listening for on-chain events...");
module.exports = { provider };
