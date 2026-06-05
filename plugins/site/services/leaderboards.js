// ============================================================
// leaderboards.js — Weekly Mistress vs. Mistress Leaderboards
// Express router — mount at /api/leaderboards
// ============================================================

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── GET /api/leaderboards/mistresses/weekly ───────────────────
router.get("/mistresses/weekly", async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      u.id, u.username, u.avatar_url, u.title AS mistress_title,
      COALESCE(SUM(t.amount), 0) AS weekly_earnings,
      COUNT(DISTINCT t.sub_id) AS active_subs,
      COUNT(DISTINCT ws.id) AS wheel_spins_hosted,
      RANK() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) AS rank,
      LAG(RANK() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC))
        OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) AS prev_rank
    FROM users u
    LEFT JOIN transactions t ON t.mistress_id = u.id
      AND t.created_at >= NOW() - INTERVAL '7 days'
    LEFT JOIN wheel_spins ws ON ws.mistress_id = u.id
      AND ws.created_at >= NOW() - INTERVAL '7 days'
    WHERE u.role = 'mistress'
    GROUP BY u.id, u.username, u.avatar_url, u.title
    ORDER BY weekly_earnings DESC
    LIMIT 50
  `);
  res.json(rows);
});

// ── GET /api/leaderboards/subs/weekly ────────────────────────
router.get("/subs/weekly", async (req, res) => {
  const { rows } = await db.query(`
    SELECT
      u.id, u.username, u.avatar_url,
      COALESCE(SUM(t.amount), 0) AS weekly_spent,
      COUNT(DISTINCT t.mistress_id) AS mistresses_served,
      COUNT(DISTINCT st.id) AS tasks_completed,
      RANK() OVER (ORDER BY COALESCE(SUM(t.amount), 0) DESC) AS rank
    FROM users u
    LEFT JOIN transactions t ON t.sub_id = u.id
      AND t.created_at >= NOW() - INTERVAL '7 days'
    LEFT JOIN sub_tasks st ON st.sub_id = u.id
      AND st.status = 'completed'
      AND st.completed_at >= NOW() - INTERVAL '7 days'
    WHERE u.role = 'sub'
    GROUP BY u.id, u.username, u.avatar_url
    ORDER BY weekly_spent DESC
    LIMIT 50
  `);
  res.json(rows);
});

// ── GET /api/leaderboards/status-shifts ──────────────────────
// Returns users who moved up/down in rank this week vs last
router.get("/status-shifts", async (req, res) => {
  const { rows } = await db.query(`
    WITH this_week AS (
      SELECT mistress_id, SUM(amount) AS earnings
      FROM transactions
      WHERE created_at >= NOW() - INTERVAL '7 days'
      GROUP BY mistress_id
    ),
    last_week AS (
      SELECT mistress_id, SUM(amount) AS earnings
      FROM transactions
      WHERE created_at BETWEEN NOW() - INTERVAL '14 days' AND NOW() - INTERVAL '7 days'
      GROUP BY mistress_id
    )
    SELECT
      u.id, u.username, u.avatar_url,
      RANK() OVER (ORDER BY tw.earnings DESC) AS current_rank,
      RANK() OVER (ORDER BY lw.earnings DESC) AS prev_rank,
      (RANK() OVER (ORDER BY lw.earnings DESC) - RANK() OVER (ORDER BY tw.earnings DESC)) AS rank_change
    FROM users u
    JOIN this_week tw ON tw.mistress_id = u.id
    LEFT JOIN last_week lw ON lw.mistress_id = u.id
    WHERE u.role = 'mistress'
    ORDER BY rank_change DESC
    LIMIT 20
  `);
  res.json(rows);
});

module.exports = router;
