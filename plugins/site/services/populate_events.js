// populate_events.js
// Simple ETL example: extract event logs from a generic events table and insert into content_views/payment_starts
// Run as a one-off. Assumes an `events` table with columns: id, user_id, event_type, payload JSON, created_at

const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function etl() {
  // Example 1: Backfill content_views from events where event_type = 'content_view'
  const viewRows = await db.query(`SELECT id, user_id, payload->>'post_id' AS post_id, created_at FROM events WHERE event_type = 'content_view' AND (payload->>'post_id') IS NOT NULL`);
  console.log(`Found ${viewRows.rowCount} content_view events`);
  for (const r of viewRows.rows) {
    try {
      await db.query(`INSERT INTO content_views (user_id, post_id, created_at) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING`, [r.user_id, r.post_id, r.created_at]);
    } catch (err) { console.warn('insert content_view failed', err.message); }
  }

  // Example 2: Backfill payment_starts from events with event_type = 'payment_start'
  const startRows = await db.query(`SELECT id, user_id, payload->>'post_id' AS post_id, payload->>'tier_id' AS tier_id, payload->>'source' AS source, created_at FROM events WHERE event_type = 'payment_start'`);
  console.log(`Found ${startRows.rowCount} payment_start events`);
  for (const r of startRows.rows) {
    try {
      await db.query(`INSERT INTO payment_starts (user_id, post_id, tier_id, source, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT DO NOTHING`, [r.user_id, r.post_id || null, r.tier_id || null, r.source || null, r.created_at]);
    } catch (err) { console.warn('insert payment_start failed', err.message); }
  }

  console.log('ETL completed');
  process.exit(0);
}

etl().catch(err => { console.error(err); process.exit(1); });
