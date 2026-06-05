// ============================================================
// bloggerAutomation.js — Head Mistress Blog Spot Auto-Publisher
// Publishes articles to Blogger via Google API
// ============================================================

const { google } = require("googleapis");
const { Pool } = require("pg");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

const BLOG_ID = process.env.BLOGGER_BLOG_ID;

// ── OAuth2 Client ─────────────────────────────────────────────
function getOAuthClient() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
  auth.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });
  return auth;
}

// ── Publish a post to Blogger ─────────────────────────────────
async function publishPost({ title, content, labels = [], isDraft = false }) {
  const auth = getOAuthClient();
  const blogger = google.blogger({ version: "v3", auth });

  const res = await blogger.posts.insert({
    blogId: BLOG_ID,
    isDraft,
    requestBody: {
      title,
      content,
      labels,
    },
  });

  // Log to DB
  await db.query(
    `INSERT INTO blog_posts (blogger_post_id, title, labels, status, published_at)
     VALUES ($1, $2, $3, $4, NOW())`,
    [res.data.id, title, JSON.stringify(labels), isDraft ? "draft" : "published"]
  );

  console.log(`[Blogger] Published: "${title}" → ${res.data.url}`);
  return res.data;
}

// ── Generate article from template ───────────────────────────
function generateWeeklyRoundupHtml({ topMistress, topSub, weeklyHighlight, newFeature }) {
  return `
<h2>🏆 This Week on Mistress-X</h2>
<p>Welcome back to the <strong>Head Mistress Blog Spot</strong> — your weekly roundup of power, devotion, and dominance.</p>

<h3>👑 Mistress of the Week</h3>
<p>This week's top-earning Mistress is <strong>${topMistress}</strong> — commanding loyalty and tribute like no other.</p>

<h3>🔗 Most Devoted Sub</h3>
<p>The sub who showed the most dedication this week: <strong>${topSub}</strong>. True service recognised.</p>

<h3>✨ Platform Highlight</h3>
<p>${weeklyHighlight}</p>

<h3>🚀 New Feature Spotlight</h3>
<p>${newFeature}</p>

<hr/>
<p><em>Join the Mistress-X community — where power is earned, not given.</em></p>
  `.trim();
}

// ── Express router ────────────────────────────────────────────
const express = require("express");
const router = express.Router();

// POST /api/blog/publish
router.post("/publish", async (req, res) => {
  const { title, content, labels, isDraft } = req.body;
  try {
    const post = await publishPost({ title, content, labels, isDraft });
    res.json({ success: true, url: post.url, id: post.id });
  } catch (err) {
    console.error("[Blogger] Publish error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/blog/weekly-roundup
router.post("/weekly-roundup", async (req, res) => {
  try {
    // Auto-fetch top mistress and sub from leaderboard
    const topMistressRow = await db.query(`
      SELECT u.username FROM users u
      JOIN transactions t ON t.mistress_id = u.id
      WHERE t.created_at >= NOW() - INTERVAL '7 days' AND u.role = 'mistress'
      GROUP BY u.username ORDER BY SUM(t.amount) DESC LIMIT 1
    `);
    const topSubRow = await db.query(`
      SELECT u.username FROM users u
      JOIN transactions t ON t.sub_id = u.id
      WHERE t.created_at >= NOW() - INTERVAL '7 days' AND u.role = 'sub'
      GROUP BY u.username ORDER BY SUM(t.amount) DESC LIMIT 1
    `);

    const content = generateWeeklyRoundupHtml({
      topMistress: topMistressRow.rows[0]?.username || "Anonymous",
      topSub: topSubRow.rows[0]?.username || "Anonymous",
      weeklyHighlight: req.body.highlight || "The Throne Games saw record participation this week!",
      newFeature: req.body.newFeature || "Spin the Wheel is now live — try your luck!",
    });

    const post = await publishPost({
      title: `Weekly Roundup — ${new Date().toDateString()}`,
      content,
      labels: ["Weekly Roundup", "Mistress-X", "Community"],
    });
    res.json({ success: true, url: post.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/blog/posts
router.get("/posts", async (req, res) => {
  const { rows } = await db.query(
    "SELECT * FROM blog_posts ORDER BY published_at DESC LIMIT 20"
  );
  res.json(rows);
});

async function ensureBlogTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS blog_posts (
      id              SERIAL PRIMARY KEY,
      blogger_post_id VARCHAR(64),
      title           VARCHAR(255),
      labels          JSONB,
      status          VARCHAR(16) DEFAULT 'published',
      published_at    TIMESTAMPTZ DEFAULT NOW()
    );
  `);
}
ensureBlogTable();

module.exports = { router, publishPost, generateWeeklyRoundupHtml };
