// ============================================================
// rolodex.js — Mistress Sub Form & Digital Rolodex
// Express router — mount at /api/rolodex
// ============================================================

const express = require("express");
const router = express.Router();
const { Pool } = require("pg");
const { dispatch } = require("./notificationServer");
const crypto = require("crypto");

const db = new Pool({ connectionString: process.env.DATABASE_URL });

// ── POST /api/rolodex/submit ──────────────────────────────────
// Sub submits their detail card to a Mistress's Rolodex
router.post("/submit", async (req, res) => {
  const {
    subId, mistressId,
    // Personal details
    realName, age, location, occupation,
    // Financial (encrypted at rest)
    financialDetails,
    // Consent
    consentConditions,   // array of strings
    consentGranted,      // boolean
    // Expiry
    expiryType,          // 'forever' | 'custom'
    expiryDays,          // number (if custom)
  } = req.body;

  if (!consentGranted) {
    return res.status(400).json({ error: "Consent must be granted to submit" });
  }

  // Encrypt sensitive financial details
  const encryptedFinancial = encryptData(JSON.stringify(financialDetails));

  const expiresAt = expiryType === "forever"
    ? null
    : new Date(Date.now() + expiryDays * 86400000);

  const { rows } = await db.query(
    `INSERT INTO sub_detail_cards
      (sub_id, mistress_id, real_name, age, location, occupation,
       financial_details_enc, consent_conditions, consent_granted,
       expiry_type, expires_at, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,'active')
     RETURNING id, created_at, expires_at`,
    [
      subId, mistressId, realName, age, location, occupation,
      encryptedFinancial, JSON.stringify(consentConditions), consentGranted,
      expiryType, expiresAt,
    ]
  );

  // Notify Mistress
  const sub = await db.query("SELECT username FROM users WHERE id = $1", [subId]);
  await dispatch(mistressId, "sub_form_submitted", {
    subUsername: sub.rows[0]?.username,
    cardId: rows[0].id,
  });

  res.json({
    success: true,
    cardId: rows[0].id,
    expiresAt: rows[0].expires_at,
    message: "Your detail card has been added to Mistress's Rolodex",
  });
});

// ── GET /api/rolodex/:mistressId ──────────────────────────────
// Mistress views her Rolodex
router.get("/:mistressId", async (req, res) => {
  const { rows } = await db.query(
    `SELECT
       c.id, c.sub_id, u.username, u.avatar_url,
       c.real_name, c.age, c.location, c.occupation,
       c.consent_conditions, c.expiry_type, c.expires_at,
       c.status, c.created_at,
       CASE WHEN c.expires_at IS NULL THEN NULL
            ELSE EXTRACT(EPOCH FROM (c.expires_at - NOW())) / 86400
       END AS days_remaining
     FROM sub_detail_cards c
     JOIN users u ON u.id = c.sub_id
     WHERE c.mistress_id = $1
       AND c.status = 'active'
       AND (c.expires_at IS NULL OR c.expires_at > NOW())
     ORDER BY c.created_at DESC`,
    [req.params.mistressId]
  );
  res.json(rows);
});

// ── GET /api/rolodex/card/:cardId/financial ───────────────────
// Mistress decrypts financial details for a specific card
router.get("/card/:cardId/financial", async (req, res) => {
  const { rows } = await db.query(
    "SELECT financial_details_enc, mistress_id FROM sub_detail_cards WHERE id = $1",
    [req.params.cardId]
  );
  if (!rows[0]) return res.status(404).json({ error: "Card not found" });

  // Verify requesting user is the card's Mistress (middleware should handle this)
  const decrypted = decryptData(rows[0].financial_details_enc);
  res.json({ financialDetails: JSON.parse(decrypted) });
});

// ── POST /api/rolodex/card/:cardId/revoke ────────────────────
// Sub revokes their card
router.post("/card/:cardId/revoke", async (req, res) => {
  const { subId } = req.body;
  await db.query(
    "UPDATE sub_detail_cards SET status = 'revoked' WHERE id = $1 AND sub_id = $2",
    [req.params.cardId, subId]
  );
  res.json({ success: true, message: "Card revoked" });
});

// ── Cron: expire cards ────────────────────────────────────────
// Run this daily via a cron job or setInterval
async function expireCards() {
  const { rowCount } = await db.query(
    "UPDATE sub_detail_cards SET status = 'expired' WHERE expires_at < NOW() AND status = 'active'"
  );
  if (rowCount > 0) console.log(`[Rolodex] Expired ${rowCount} cards`);
}
setInterval(expireCards, 3600000); // Check every hour

// ── Encryption helpers (AES-256-GCM) ─────────────────────────
const ENCRYPT_KEY = Buffer.from(process.env.ENCRYPT_KEY || "0".repeat(64), "hex");

function encryptData(text) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", ENCRYPT_KEY, iv);
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, encrypted]).toString("base64");
}

function decryptData(encoded) {
  const buf = Buffer.from(encoded, "base64");
  const iv = buf.slice(0, 12);
  const tag = buf.slice(12, 28);
  const encrypted = buf.slice(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", ENCRYPT_KEY, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

// ── DB Schema ─────────────────────────────────────────────────
async function ensureRolodexTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS sub_detail_cards (
      id                    SERIAL PRIMARY KEY,
      sub_id                INTEGER REFERENCES users(id),
      mistress_id           INTEGER REFERENCES users(id),
      real_name             VARCHAR(128),
      age                   INTEGER,
      location              VARCHAR(128),
      occupation            VARCHAR(128),
      financial_details_enc TEXT,
      consent_conditions    JSONB,
      consent_granted       BOOLEAN DEFAULT false,
      expiry_type           VARCHAR(16) DEFAULT 'forever',
      expires_at            TIMESTAMPTZ,
      status                VARCHAR(16) DEFAULT 'active',
      created_at            TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS idx_rolodex_mistress ON sub_detail_cards(mistress_id, status);
  `);
}
ensureRolodexTable();

module.exports = router;
