// analyticsService.js
const { Pool } = require('pg');
const format = require('pg-format');

const db = new Pool({ connectionString: process.env.DATABASE_URL });

async function refreshMaterializedViews() {
  const views = [
    'mv_daily_revenue',
    'mv_monthly_revenue_by_mistress',
    'mv_daily_active_payers',
    'mv_paywalled_conversion',
    'mv_weekly_cohort_events'
  ];

  for (const v of views) {
    try {
      await db.query(`REFRESH MATERIALIZED VIEW CONCURRENTLY %I`, [v]);
    } catch (err) {
      // If CONCURRENTLY fails (e.g., first time or lacking index), fallback to non-concurrent
      console.warn(`Concurrent refresh failed for ${v}: ${err.message}. Falling back to non-concurrent refresh.`);
      await db.query(format('REFRESH MATERIALIZED VIEW %I', v));
    }
  }
}

async function getDailyRevenue({ startDate, endDate }) {
  const q = `SELECT day, gross_revenue, platform_fee, mistress_net
             FROM mv_daily_revenue
             WHERE day BETWEEN $1 AND $2
             ORDER BY day ASC`;
  const { rows } = await db.query(q, [startDate, endDate]);
  return rows;
}

async function getMonthlyRevenueByMistress({ monthStart, monthEnd, limit = 50 }) {
  const q = `SELECT month, mistress_id, mistress_username, gross, mistress_net, platform_fee
             FROM mv_monthly_revenue_by_mistress
             WHERE month BETWEEN $1 AND $2
             ORDER BY month DESC, gross DESC
             LIMIT $3`;
  const { rows } = await db.query(q, [monthStart, monthEnd, limit]);
  return rows;
}

// Cohort retention: returns matrix mapping cohort_week -> week_offset -> retention_count
async function getCohortRetention({ cohortsBack = 12, weeks = 12 }) {
  // Fetch recent cohorts
  const q = `SELECT cohort_week, event_week, active_users
             FROM mv_weekly_cohort_events
             ORDER BY cohort_week DESC, event_week ASC
             LIMIT 10000`;
  const { rows } = await db.query(q);

  // Transform into retention matrix
  const matrix = {};
  for (const r of rows) {
    const cohortKey = r.cohort_week.toISOString().slice(0,10);
    if (!matrix[cohortKey]) matrix[cohortKey] = {};
    const cohortWeek = new Date(r.cohort_week);
    const eventWeek = new Date(r.event_week);
    const weekOffset = Math.round((eventWeek - cohortWeek) / (1000 * 60 * 60 * 24 * 7));
    if (weekOffset >= 0 && weekOffset < weeks) {
      matrix[cohortKey][weekOffset] = parseInt(r.active_users, 10);
    }
  }
  return matrix;
}

// Basic KPI calculations
async function getPlatformKPIs({ since }) {
  const q = `SELECT
               COALESCE(SUM(amount_usd),0) AS gross_revenue,
               COALESCE(SUM(amount_usd),0) * 0.30 AS platform_fee,
               COUNT(DISTINCT user_id) FILTER (WHERE amount_usd > 0) AS unique_payers
             FROM payments
             WHERE created_at >= $1`;
  const { rows } = await db.query(q, [since]);
  const r = rows[0];
  return {
    grossRevenue: parseFloat(r.gross_revenue || 0),
    platformFee: parseFloat(r.platform_fee || 0),
    uniquePayers: parseInt(r.unique_payers || 0, 10),
    arpu: r.unique_payers > 0 ? parseFloat(r.gross_revenue) / parseInt(r.unique_payers,10) : 0
  };
}

module.exports = {
  refreshMaterializedViews,
  getDailyRevenue,
  getMonthlyRevenueByMistress,
  getCohortRetention,
  getPlatformKPIs
};

// Example usage (run manually from a script):
// (async () => {
//   const svc = require('./analyticsService');
//   await svc.refreshMaterializedViews();
//   console.log(await svc.getDailyRevenue({ startDate: '2026-03-01', endDate: '2026-03-31' }));
//   console.log(await svc.getPlatformKPIs({ since: '2026-03-01' }));
//   console.log(await svc.getCohortRetention({ weeks: 8 }));
//   process.exit(0);
// })();

