// ============================================================
// throneGames.js — Throne Games Backend
// Spin the Wheel + Slave Task Generator
// Express router — mount at /api/games
// ============================================================

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { dispatch } = require("./notificationServer");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── Wheel Segment Types ───────────────────────────────────────
const DEFAULT_WHEEL_SEGMENTS = [
  { id: 1, label: "Tribute $5",     type: "tribute",   value: 5,    weight: 20 },
  { id: 2, label: "Tribute $10",    type: "tribute",   value: 10,   weight: 15 },
  { id: 3, label: "Tribute $25",    type: "tribute",   value: 25,   weight: 10 },
  { id: 4, label: "Task Assigned",  type: "task",      value: null, weight: 20 },
  { id: 5, label: "Badge Earned",   type: "badge",     value: null, weight: 10 },
  { id: 6, label: "Free Spin",      type: "free_spin", value: null, weight: 10 },
  { id: 7, label: "Punishment",     type: "punishment",value: null, weight: 10 },
  { id: 8, label: "Jackpot $100",   type: "tribute",   value: 100,  weight: 5  },
];

// Weighted random selection
function spinWheel(segments) {
  const totalWeight = segments.reduce((sum, s) => sum + s.weight, 0);
  let rand = Math.random() * totalWeight;
  for (const seg of segments) {
    rand -= seg.weight;
    if (rand <= 0) return seg;
  }
  return segments[segments.length - 1];
}

// ── GET /api/games/wheel/config/:mistressId ───────────────────
router.get("/wheel/config/:mistressId", async (req, res) => {
  const { mistressId } = req.params;
  const custom = await db.query(
    "SELECT segments FROM wheel_configs WHERE mistress_id = $1",
    [mistressId]
  );
  const segments = custom.rows[0]?.segments || DEFAULT_WHEEL_SEGMENTS;
  res.json({ segments });
});

// ── POST /api/games/wheel/spin ────────────────────────────────
// Body: { subId, mistressId }
router.post("/wheel/spin", async (req, res) => {
  const { subId, mistressId } = req.body;

  // Check cooldown (1 spin per hour)
  const lastSpin = await db.query(
    "SELECT created_at FROM wheel_spins WHERE sub_id = $1 AND mistress_id = $2 ORDER BY created_at DESC LIMIT 1",
    [subId, mistressId]
  );
  if (lastSpin.rows[0]) {
    const elapsed = Date.now() - new Date(lastSpin.rows[0].created_at).getTime();
    if (elapsed < 3600000) {
      return res.status(429).json({ error: "Cooldown active", nextSpinIn: 3600000 - elapsed });
    }
  }

  // Get wheel config
  const config = await db.query(
    "SELECT segments FROM wheel_configs WHERE mistress_id = $1",
    [mistressId]
  );
  const segments = config.rows[0]?.segments || DEFAULT_WHEEL_SEGMENTS;
  const result = spinWheel(segments);

  // Log spin
  await db.query(
    "INSERT INTO wheel_spins (sub_id, mistress_id, segment_id, segment_label, segment_type, segment_value) VALUES ($1,$2,$3,$4,$5,$6)",
    [subId, mistressId, result.id, result.label, result.type, result.value]
  );

  // Handle result
  if (result.type === "tribute" && result.value) {
    await dispatch(mistressId, "tribute_received", {
      fromUsername: `Sub #${subId}`,
      amount: result.value,
      source: "wheel_spin",
    });
  }
  if (result.type === "task") {
    const task = await assignRandomTask(subId, mistressId);
    result.task = task;
  }
  if (result.type === "badge") {
    await dispatch(subId, "badge_earned", { badgeName: "Wheel Winner", tier: 1 });
  }

  res.json({ result, spinId: Date.now() });
});

// ── Slave Task Generator ──────────────────────────────────────
const TASK_CATEGORIES = {
  financial: [
    "Send a tribute of $10 within the next 2 hours",
    "Purchase an item from Mistress's wishlist",
    "Top up your wallet by $25",
  ],
  obedience: [
    "Write 'I serve Mistress' 50 times and send a photo",
    "Wear your collar for the next 4 hours",
    "Send a voice message pledging your loyalty",
  ],
  creative: [
    "Write a poem about your devotion and post it",
    "Create a digital artwork for Mistress",
    "Record a 30-second video tribute",
  ],
  challenge: [
    "Complete 50 push-ups and send proof",
    "Fast for 12 hours and report back",
    "Stay silent in chat for 1 hour",
  ],
};

async function assignRandomTask(subId, mistressId) {
  const categories = Object.keys(TASK_CATEGORIES);
  const cat = categories[Math.floor(Math.random() * categories.length)];
  const tasks = TASK_CATEGORIES[cat];
  const description = tasks[Math.floor(Math.random() * tasks.length)];
  const dueAt = new Date(Date.now() + 24 * 3600 * 1000); // 24h deadline

  const res = await db.query(
    `INSERT INTO sub_tasks (sub_id, mistress_id, category, description, status, due_at)
     VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING id`,
    [subId, mistressId, cat, description, dueAt]
  );
  await dispatch(subId, "new_message", {
    fromUsername: "Mistress",
    preview: `New task: ${description.substring(0, 50)}...`,
  });
  return { id: res.rows[0].id, category: cat, description, dueAt };
}

// ── POST /api/games/tasks/generate ───────────────────────────
router.post("/tasks/generate", async (req, res) => {
  const { subId, mistressId, category } = req.body;
  const tasks = category ? TASK_CATEGORIES[category] : Object.values(TASK_CATEGORIES).flat();
  const description = tasks[Math.floor(Math.random() * tasks.length)];
  const dueAt = new Date(Date.now() + 24 * 3600 * 1000);

  const result = await db.query(
    `INSERT INTO sub_tasks (sub_id, mistress_id, category, description, status, due_at)
     VALUES ($1, $2, $3, $4, 'pending', $5) RETURNING *`,
    [subId, mistressId, category || "mixed", description, dueAt]
  );
  res.json(result.rows[0]);
});

// ── GET /api/games/tasks/:subId ───────────────────────────────
router.get("/tasks/:subId", async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM sub_tasks WHERE sub_id = $1 ORDER BY created_at DESC LIMIT 20",
    [req.params.subId]
  );
  res.json(rows);
});

// ── POST /api/games/tasks/:taskId/complete ────────────────────
router.post("/tasks/:taskId/complete", async (req, res) => {
  const { proof_url } = req.body;
  const { rows } = await db.query(
    "UPDATE sub_tasks SET status = 'completed', proof_url = $1, completed_at = NOW() WHERE id = $2 RETURNING *",
    [proof_url, req.params.taskId]
  );
  if (rows[0]) {
    await dispatch(rows[0].mistress_id, "new_message", {
      fromUsername: `Sub #${rows[0].sub_id}`,
      preview: "Task completed — awaiting your approval",
    });
  }
  res.json(rows[0]);
});

// ── DB Schema ─────────────────────────────────────────────────
async function ensureGamesTables() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS wheel_configs (
      id          SERIAL PRIMARY KEY,
      mistress_id INTEGER REFERENCES users(id),
      segments    JSONB NOT NULL,
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS wheel_spins (
      id             SERIAL PRIMARY KEY,
      sub_id         INTEGER REFERENCES users(id),
      mistress_id    INTEGER REFERENCES users(id),
      segment_id     INTEGER,
      segment_label  VARCHAR(128),
      segment_type   VARCHAR(64),
      segment_value  NUMERIC,
      created_at     TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS sub_tasks (
      id           SERIAL PRIMARY KEY,
      sub_id       INTEGER REFERENCES users(id),
      mistress_id  INTEGER REFERENCES users(id),
      category     VARCHAR(64),
      description  TEXT NOT NULL,
      status       VARCHAR(32) DEFAULT 'pending',
      proof_url    TEXT,
      due_at       TIMESTAMPTZ,
      completed_at TIMESTAMPTZ,
      created_at   TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureGamesTables();

module.exports = router;
