// moderationService.js
const { Pool } = require('pg');
const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function submitReport({ reporterId, reportedUserId, contentId, reason, details, severity = 2 }) {
  const res = await db.query(`INSERT INTO reports (reporter_id, reported_user_id, content_id, reason, details, severity) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`, [reporterId, reportedUserId, contentId, reason, details, severity]);
  return res.rows[0];
}

async function attachEvidence(reportId, s3Key) {
  const res = await db.query(`INSERT INTO report_attachments (report_id, s3_key) VALUES ($1,$2) RETURNING *`, [reportId, s3Key]);
  return res.rows[0];
}

async function getPendingReports(limit = 50) {
  const res = await db.query(`SELECT r.*, u.username AS reporter_username, ru.username AS reported_username FROM reports r LEFT JOIN users u ON u.id = r.reporter_id LEFT JOIN users ru ON ru.id = r.reported_user_id WHERE r.status = 'open' ORDER BY r.severity DESC, r.created_at ASC LIMIT $1`, [limit]);
  return res.rows;
}

async function takeModerationAction({ reportId, moderatorId, actionType, notes }) {
  // insert action
  const action = await db.query(`INSERT INTO moderation_actions (report_id, moderator_id, action_type, notes) VALUES ($1,$2,$3,$4) RETURNING *`, [reportId, moderatorId, actionType, notes]);
  // update report status
  await db.query(`UPDATE reports SET status = 'actioned' WHERE id = $1`, [reportId]);
  return action.rows[0];
}

async function submitAppeal({ actionId, userId, reason }) {
  const res = await db.query(`INSERT INTO appeals (action_id, user_id, reason) VALUES ($1,$2,$3) RETURNING *`, [actionId, userId, reason]);
  return res.rows[0];
}

module.exports = { submitReport, attachEvidence, getPendingReports, takeModerationAction, submitAppeal };
