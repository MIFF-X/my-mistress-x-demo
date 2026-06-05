-- trust_safety_schema.sql

-- 1. Reports table: user-submitted reports of content or users
CREATE TABLE IF NOT EXISTS reports (
  id SERIAL PRIMARY KEY,
  reporter_id INT REFERENCES users(id) ON DELETE SET NULL,
  reported_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  content_id INT REFERENCES content_posts(id) ON DELETE SET NULL,
  reason VARCHAR(128) NOT NULL,
  details TEXT,
  status VARCHAR(32) DEFAULT 'open', -- open, in_review, actioned, dismissed
  severity INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);

-- 2. report_attachments: evidence images/files
CREATE TABLE IF NOT EXISTS report_attachments (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE CASCADE,
  s3_key TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. moderation_actions: actions taken by moderators
CREATE TABLE IF NOT EXISTS moderation_actions (
  id SERIAL PRIMARY KEY,
  report_id INT REFERENCES reports(id) ON DELETE SET NULL,
  moderator_id INT REFERENCES users(id) ON DELETE SET NULL,
  action_type VARCHAR(64), -- warn, remove_content, suspend_user, ban_user, escalate
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. appeals: users can appeal moderation actions
CREATE TABLE IF NOT EXISTS appeals (
  id SERIAL PRIMARY KEY,
  action_id INT REFERENCES moderation_actions(id) ON DELETE CASCADE,
  user_id INT REFERENCES users(id) ON DELETE CASCADE,
  reason TEXT,
  status VARCHAR(32) DEFAULT 'pending', -- pending, accepted, rejected
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. automated_flags: records from auto-moderation engines
CREATE TABLE IF NOT EXISTS automated_flags (
  id SERIAL PRIMARY KEY,
  content_id INT REFERENCES content_posts(id) ON DELETE CASCADE,
  check_type VARCHAR(64), -- nsfw, toxicity, spam
  score DECIMAL(5,4),
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. moderation_queue: materialized view or table to combine signals for moderators
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_moderation_queue AS
SELECT r.id as report_id, r.reporter_id, r.reported_user_id, r.content_id, r.reason, r.severity, r.created_at as report_created_at,
  af.check_type, af.score as flag_score, af.payload as flag_payload
FROM reports r
LEFT JOIN automated_flags af ON af.content_id = r.content_id
WHERE r.status = 'open'
ORDER BY r.severity DESC, r.created_at ASC;

-- Note: Refresh mv_moderation_queue periodically or on demand by moderators
