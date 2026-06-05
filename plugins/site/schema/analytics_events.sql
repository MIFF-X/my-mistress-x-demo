-- analytics_events.sql

-- 1. content_views: records when a user views a content post (for conversion funnel)
CREATE TABLE IF NOT EXISTS content_views (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  post_id INT REFERENCES content_posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. payment_starts: records when a user initiates a payment flow (checkout started)
CREATE TABLE IF NOT EXISTS payment_starts (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  post_id INT REFERENCES content_posts(id) ON DELETE SET NULL,
  tier_id INT REFERENCES subscription_tiers(id) ON DELETE SET NULL,
  source VARCHAR(64), -- ppv|subscription|checkout
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Example aggregation view for fast lookups (optional)
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_post_event_aggregates AS
SELECT
  post_id,
  COUNT(*) FILTER (WHERE event_type = 'view') AS views,
  COUNT(*) FILTER (WHERE event_type = 'start') AS starts,
  COUNT(*) FILTER (WHERE event_type = 'purchase') AS purchases
FROM (
  SELECT post_id, 'view'::text AS event_type, created_at FROM content_views
  UNION ALL
  SELECT post_id, 'start'::text AS event_type, created_at FROM payment_starts
  UNION ALL
  SELECT post_id, 'purchase'::text AS event_type, created_at FROM post_access
) x
GROUP BY post_id;

-- Backfill notes:
-- If you have raw event logs (e.g. events table or analytics stream), write a one-off ETL to populate content_views and payment_starts from the logs.
