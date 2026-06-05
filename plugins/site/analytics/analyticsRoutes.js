// analyticsRoutes.js
const express = require('express');
const router = express.Router();
const analytics = require('./analyticsService');

// TODO: Replace with your real auth middleware that sets req.user
function requireRole(role) {
  return (req, res, next) => {
    try {
      // Example: req.user is populated by your auth middleware (JWT/session)
      if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
      if (req.user.role !== role && req.user.role !== 'headmistress') {
        return res.status(403).json({ error: 'Forbidden' });
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

// GET /analytics/daily-revenue?start=2026-03-01&end=2026-03-31
router.get('/daily-revenue', async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
    const rows = await analytics.getDailyRevenue({ startDate: start, endDate: end });
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/monthly-revenue?start=2026-03-01&end=2026-04-01&limit=50
router.get('/monthly-revenue', async (req, res, next) => {
  try {
    const { start, end, limit } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
    const rows = await analytics.getMonthlyRevenueByMistress({ monthStart: start, monthEnd: end, limit: parseInt(limit || '50', 10) });
    res.json({ data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/cohort?weeks=12
router.get('/cohort', async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks || '12', 10);
    const matrix = await analytics.getCohortRetention({ weeks });
    res.json({ data: matrix });
  } catch (err) {
    next(err);
  }
});

// GET /analytics/kpis?since=2026-03-01
router.get('/kpis', async (req, res, next) => {
  try {
    const { since } = req.query;
    if (!since) return res.status(400).json({ error: 'since query param required (YYYY-MM-DD)' });
    const kpis = await analytics.getPlatformKPIs({ since });
    res.json({ data: kpis });
  } catch (err) {
    next(err);
  }
});

// POST /analytics/refresh (protected)
router.post('/refresh', requireRole('admin'), async (req, res, next) => {
  try {
    // Refresh materialized views (may take time). Consider running async & returning 202.
    await analytics.refreshMaterializedViews();
    res.json({ status: 'ok', message: 'Materialized views refreshed' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
