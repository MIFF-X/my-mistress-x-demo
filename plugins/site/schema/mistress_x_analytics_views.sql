-- mistress_x_analytics_views.sql

-- Assumptions: The database contains the following tables or equivalents:
-- users(id, created_at)
-- payments(id, user_id, mistress_id, amount_usd, source, created_at)
-- subscriptions(id, sub_id, mistress_id, status, starts_at, expires_at)
-- content_posts(id, mistress_id, post_type, price_usd, created_at)
-- post_access(user_id, post_id, purchase_date, amount_paid)

-- 0. Ensure a payments table exists (create if missing)
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id) ON DELETE SET NULL,
  mistress_id INT REFERENCES users(id) ON DELETE SET NULL,
  amount_usd DECIMAL(12,2) NOT NULL,
  source VARCHAR(64),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  stripe_id VARCHAR(255)
);

-- 1. Daily revenue materialized view (platform gross, platform fee, mistress_net)
CREATE MATERIALIZED VIEW mv_daily_revenue AS
SELECT
  date_trunc('day', p.created_at) AS day,
  SUM(p.amount_usd) AS gross_revenue,
  SUM(p.amount_usd) * 0.30 AS platform_fee,
  SUM(p.amount_usd) * 0.70 AS mistress_net
FROM payments p
GROUP BY date_trunc('day', p.created_at)
ORDER BY day DESC;

CREATE INDEX IF NOT EXISTS mv_daily_revenue_day_idx ON mv_daily_revenue(day);

-- 2. Monthly revenue by mistress (top earning mistresses)
CREATE MATERIALIZED VIEW mv_monthly_revenue_by_mistress AS
SELECT
  date_trunc('month', p.created_at) AS month,
  p.mistress_id,
  u.username AS mistress_username,
  SUM(p.amount_usd) AS gross,
  SUM(p.amount_usd) * 0.70 AS mistress_net,
  SUM(p.amount_usd) * 0.30 AS platform_fee
FROM payments p
LEFT JOIN users u ON u.id = p.mistress_id
GROUP BY date_trunc('month', p.created_at), p.mistress_id, u.username
ORDER BY month DESC, gross DESC;

CREATE INDEX IF NOT EXISTS mv_monthly_revenue_by_mistress_month_idx ON mv_monthly_revenue_by_mistress(month);

-- 3. Daily active payers (unique paying users per day)
CREATE MATERIALIZED VIEW mv_daily_active_payers AS
SELECT
  date_trunc('day', p.created_at) AS day,
  COUNT(DISTINCT p.user_id) AS paying_users
FROM payments p
GROUP BY date_trunc('day', p.created_at)
ORDER BY day DESC;

CREATE INDEX IF NOT EXISTS mv_daily_active_payers_day_idx ON mv_daily_active_payers(day);

-- 4. Paywalled conversion funnel view (views -> starts -> purchases)
-- NOTE: This assumes an event table or logs exist; fallback: use content_views and payments if present.
-- For illustration we use payments + content_posts counts as baseline
CREATE MATERIALIZED VIEW mv_paywalled_conversion AS
SELECT
  cp.id AS post_id,
  cp.mistress_id,
  cp.title,
  cp.post_type,
  cp.price_usd,
  COALESCE(pa.views, 0) AS views,
  COALESCE(pa.starts, 0) AS payment_starts,
  COALESCE(pa.purchases, 0) AS purchases,
  CASE WHEN COALESCE(pa.views,0) = 0 THEN 0 ELSE (COALESCE(pa.purchases,0)::DECIMAL / pa.views) END AS conversion_rate
FROM content_posts cp
LEFT JOIN (
  SELECT
    post_id,
    SUM(views) AS views,
    SUM(starts) AS starts,
    SUM(purchases) AS purchases
  FROM (
    -- Replace these with your real event aggregation tables (content_views, payment_starts, post_access)
    SELECT post_id, COUNT(*) AS views, 0 AS starts, 0 AS purchases FROM content_views GROUP BY post_id
    UNION ALL
    SELECT post_id, 0 AS views, COUNT(*) AS starts, 0 AS purchases FROM payment_starts GROUP BY post_id
    UNION ALL
    SELECT post_id, 0 AS views, 0 AS starts, COUNT(*) AS purchases FROM post_access GROUP BY post_id
  ) x
  GROUP BY post_id
) pa ON pa.post_id = cp.id;

-- 5. Cohort retention materialized view (weekly cohorts)
CREATE MATERIALIZED VIEW mv_weekly_cohort_events AS
WITH cohorts AS (
  SELECT id AS user_id, date_trunc('week', created_at) AS cohort_week
  FROM users
), payments_week AS (
  SELECT user_id, date_trunc('week', created_at) AS event_week
  FROM payments
  GROUP BY user_id, date_trunc('week', created_at)
)
SELECT
  c.cohort_week,
  pw.event_week,
  COUNT(DISTINCT pw.user_id) AS active_users
FROM cohorts c
LEFT JOIN payments_week pw ON pw.user_id = c.user_id
GROUP BY c.cohort_week, pw.event_week
ORDER BY c.cohort_week DESC, pw.event_week;

CREATE INDEX IF NOT EXISTS mv_weekly_cohort_events_cohort_idx ON mv_weekly_cohort_events(cohort_week);

-- Helpful function: Refresh all analytics materialized views
-- NOTE: Run these concurrently in maintenance windows.
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_revenue;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_monthly_revenue_by_mistress;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_daily_active_payers;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_paywalled_conversion;
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_weekly_cohort_events;

