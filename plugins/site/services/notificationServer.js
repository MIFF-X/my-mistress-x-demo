// ============================================================
// notificationServer.js — Mistress-X Real-Time Notification Server
// Stack: Node.js + Socket.io + Redis + PostgreSQL + SendGrid
// ============================================================

const { createServer } = require("http");
const { Server } = require("socket.io");
const { createClient } = require("redis");
const { Pool } = require("pg");
const sgMail = require("@sendgrid/mail");
const jwt = require("jsonwebtoken");

// ─── Config ──────────────────────────────────────────────────
const PORT = process.env.NOTIFY_PORT || 4001;
const JWT_SECRET = process.env.JWT_SECRET;
const SENDGRID_KEY = process.env.SENDGRID_API_KEY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

sgMail.setApiKey(SENDGRID_KEY);

// ─── PostgreSQL Pool ─────────────────────────────────────────
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

// ─── Redis Client ─────────────────────────────────────────────
const redis = createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
redis.on("error", (err) => console.error("[Redis Error]", err));

// ─── HTTP + Socket.io Server ──────────────────────────────────
const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ─── Notification Types & Priority Map ───────────────────────
const NOTIFICATION_TYPES = {
  // Blockchain-sourced
  auction_won:        { priority: "high",   template: "auction_won" },
  auction_outbid:     { priority: "medium", template: "auction_outbid" },
  nft_minted:         { priority: "medium", template: "nft_minted" },
  marketplace_sold:   { priority: "high",   template: "marketplace_sold" },

  // Backend logic
  badge_earned:       { priority: "high",   template: "badge_earned" },
  trophy_granted:     { priority: "high",   template: "trophy_granted" },
  spending_milestone: { priority: "medium", template: "spending_milestone" },
  login_streak:       { priority: "low",    template: "login_streak" },

  // User actions
  tribute_received:   { priority: "high",   template: "tribute_received" },
  new_message:        { priority: "medium", template: "new_message" },
  chat_unlocked:      { priority: "medium", template: "chat_unlocked" },
  sub_form_submitted: { priority: "high",   template: "sub_form_submitted" },
};

// ─── Email Templates ──────────────────────────────────────────
function buildEmailHtml(type, data) {
  const templates = {
    auction_won: `<h2>🏆 You won the auction!</h2><p>Token #${data.tokenId} is yours for <strong>${data.amount} MATIC</strong>.</p>`,
    trophy_granted: `<h2>🎖 Trophy Awarded!</h2><p>Your Mistress has granted you the <strong>${data.trophyName}</strong> trophy.</p>`,
    tribute_received: `<h2>💰 Tribute Received!</h2><p><strong>${data.fromUsername}</strong> sent you <strong>$${data.amount}</strong>.</p>`,
    badge_earned: `<h2>🥇 New Badge Unlocked!</h2><p>You've earned the <strong>${data.badgeName}</strong> badge — Tier ${data.tier}.</p>`,
    marketplace_sold: `<h2>🛒 Your NFT Sold!</h2><p>Token #${data.tokenId} sold for <strong>${data.price} MATIC</strong>. Royalty credited.</p>`,
    sub_form_submitted: `<h2>📋 New Sub Form Submitted</h2><p><strong>${data.subUsername}</strong> has submitted their detail card to your Rolodex.</p>`,
  };
  return templates[type] || `<p>${JSON.stringify(data)}</p>`;
}

// ─── Core Dispatch Function ───────────────────────────────────
/**
 * dispatch(userId, type, data)
 * 1. Looks up socket ID from Redis
 * 2. Pushes via Socket.io if online
 * 3. Queues in PostgreSQL if offline
 * 4. Sends email for high-priority events
 */
async function dispatch(userId, type, data = {}) {
  const meta = NOTIFICATION_TYPES[type];
  if (!meta) {
    console.warn(`[Notify] Unknown type: ${type}`);
    return;
  }

  const payload = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    type,
    priority: meta.priority,
    data,
    createdAt: new Date().toISOString(),
  };

  // 1. Persist to DB (always)
  await db.query(
    `INSERT INTO notifications (user_id, type, payload, priority, read, created_at)
     VALUES ($1, $2, $3, $4, false, NOW())`,
    [userId, type, JSON.stringify(payload), meta.priority]
  );

  // 2. Try live push via Socket.io
  const socketId = await redis.get(`socket:${userId}`);
  if (socketId) {
    io.to(socketId).emit("notification", payload);
    console.log(`[Notify] Live push → user ${userId} (${type})`);
  } else {
    console.log(`[Notify] User ${userId} offline — queued in DB`);
  }

  // 3. Email fallback for high-priority
  if (meta.priority === "high") {
    const user = await db.query(
      "SELECT email, username FROM users WHERE id = $1",
      [userId]
    );
    if (user.rows[0]?.email) {
      const { email, username } = user.rows[0];
      await sgMail.send({
        to: email,
        from: "noreply@mistress-x.com",
        subject: buildEmailSubject(type, data),
        html: `<p>Hi ${username},</p>${buildEmailHtml(type, data)}<br/><p>— The Mistress-X Team</p>`,
      });
      console.log(`[Notify] Email sent → ${email} (${type})`);
    }
  }
}

function buildEmailSubject(type, data) {
  const subjects = {
    auction_won:      `🏆 You won Auction #${data.auctionId}!`,
    trophy_granted:   `🎖 Trophy Granted: ${data.trophyName}`,
    tribute_received: `💰 New Tribute: $${data.amount} received`,
    badge_earned:     `🥇 Badge Unlocked: ${data.badgeName}`,
    marketplace_sold: `🛒 Your NFT Sold for ${data.price} MATIC`,
    sub_form_submitted: `📋 New Sub Form from ${data.subUsername}`,
  };
  return subjects[type] || "Mistress-X Notification";
}

// ─── Socket.io Auth Middleware ────────────────────────────────
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) return next(new Error("Authentication required"));
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.role = decoded.role; // 'mistress' | 'sub' | 'headmistress'
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

// ─── Socket.io Connection Handler ────────────────────────────
io.on("connection", async (socket) => {
  const { userId, role } = socket;
  console.log(`[Socket] Connected: user=${userId} role=${role} socket=${socket.id}`);

  // Register socket ID in Redis (TTL 24h)
  await redis.setEx(`socket:${userId}`, 86400, socket.id);

  // Join personal room
  socket.join(`user:${userId}`);

  // Mistresses also join their command room
  if (role === "mistress" || role === "headmistress") {
    socket.join(`mistress:${userId}`);
  }

  // Deliver queued (offline) notifications
  const queued = await db.query(
    `SELECT * FROM notifications
     WHERE user_id = $1 AND delivered = false
     ORDER BY created_at ASC LIMIT 50`,
    [userId]
  );
  if (queued.rows.length > 0) {
    socket.emit("notification_batch", queued.rows.map((r) => r.payload));
    await db.query(
      "UPDATE notifications SET delivered = true WHERE user_id = $1 AND delivered = false",
      [userId]
    );
    console.log(`[Socket] Delivered ${queued.rows.length} queued notifications → user ${userId}`);
  }

  // Mark notification as read
  socket.on("mark_read", async ({ notificationId }) => {
    await db.query(
      "UPDATE notifications SET read = true WHERE id = $1 AND user_id = $2",
      [notificationId, userId]
    );
  });

  // Mark all as read
  socket.on("mark_all_read", async () => {
    await db.query(
      "UPDATE notifications SET read = true WHERE user_id = $1",
      [userId]
    );
  });

  // Disconnect: remove from Redis
  socket.on("disconnect", async () => {
    await redis.del(`socket:${userId}`);
    console.log(`[Socket] Disconnected: user=${userId}`);
  });
});

// ─── Blockchain Event Listeners ───────────────────────────────
// Called from web3_integration_service.js when contract events fire
async function onAuctionSold({ auctionId, winnerId, sellerId, tokenId, amount }) {
  await dispatch(winnerId, "auction_won",      { auctionId, tokenId, amount });
  await dispatch(sellerId, "marketplace_sold", { auctionId, tokenId, price: amount });
}

async function onAuctionOutbid({ auctionId, previousBidderId, newAmount }) {
  await dispatch(previousBidderId, "auction_outbid", { auctionId, newAmount });
}

async function onNFTMinted({ userId, tokenId, tokenType }) {
  await dispatch(userId, "nft_minted", { tokenId, tokenType });
}

// ─── DB Schema Helper (run once) ─────────────────────────────
async function ensureNotificationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id          SERIAL PRIMARY KEY,
      user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      type        VARCHAR(64) NOT NULL,
      payload     JSONB NOT NULL,
      priority    VARCHAR(16) DEFAULT 'medium',
      read        BOOLEAN DEFAULT false,
      delivered   BOOLEAN DEFAULT false,
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, read);
  `);
  console.log("[DB] notifications table ready");
}

// ─── Boot ─────────────────────────────────────────────────────
(async () => {
  await redis.connect();
  await ensureNotificationsTable();
  httpServer.listen(PORT, () => {
    console.log(`[Mistress-X] Notification server running on :${PORT}`);
  });
})();

// ─── Exports (for use in other services) ─────────────────────
module.exports = { dispatch, onAuctionSold, onAuctionOutbid, onNFTMinted, io };
