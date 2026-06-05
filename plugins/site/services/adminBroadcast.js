// ============================================================
// adminBroadcast.js — Headmistress Platform-Wide Broadcast
// Express router — mount at /api/admin/broadcast
// ============================================================

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const { io } = require("./notificationServer");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Auth middleware: headmistress only ────────────────────────
function requireHeadmistress(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== "headmistress") return res.status(403).json({ error: "Forbidden" });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

// ── POST /api/admin/broadcast ─────────────────────────────────
// Body: { title, message, targetRole?, priority? }
// targetRole: 'all' | 'mistress' | 'sub' | 'headmistress'
router.post("/", requireHeadmistress, async (req, res) => {
  const { title, message, targetRole = "all", priority = "medium" } = req.body;
  if (!title || !message) return res.status(400).json({ error: "title and message required" });

  const payload = {
    id: `broadcast-${Date.now()}`,
    type: "broadcast",
    title,
    message,
    targetRole,
    priority,
    sentBy: req.admin.userId,
    createdAt: new Date().toISOString(),
  };

  // Persist broadcast log
  await db.query(
    `INSERT INTO broadcast_log (title, message, target_role, priority, sent_by, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [title, message, targetRole, priority, req.admin.userId]
  );

  // Emit to correct room(s)
  if (targetRole === "all") {
    io.emit("broadcast", payload);
  } else {
    // Emit to all sockets in the role room
    io.to(`role:${targetRole}`).emit("broadcast", payload);
  }

  console.log(`[Broadcast] "${title}" → ${targetRole} by admin ${req.admin.userId}`);
  res.json({ success: true, delivered: targetRole, payload });
});

// ── GET /api/admin/broadcast/history ─────────────────────────
router.get("/history", requireHeadmistress, async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM broadcast_log ORDER BY created_at DESC LIMIT 50"
  );
  res.json(rows);
});

// ── DB Schema helper ──────────────────────────────────────────
async function ensureBroadcastTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS broadcast_log (
      id          SERIAL PRIMARY KEY,
      title       VARCHAR(255) NOT NULL,
      message     TEXT NOT NULL,
      target_role VARCHAR(32) DEFAULT 'all',
      priority    VARCHAR(16) DEFAULT 'medium',
      sent_by     INTEGER REFERENCES users(id),
      created_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureBroadcastTable();

// ── Socket.io: join role rooms on connect ─────────────────────
// Add this to notificationServer.js io.on("connection") handler:
// socket.join(`role:${role}`);
// (Already included in notificationServer.js above)

module.exports = router;
