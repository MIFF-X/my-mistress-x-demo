// analyticsRoutesCached.js
const express = require('express');
const router = express.Router();
const analytics = require('./analyticsService');
const { cacheMiddleware } = require('./analytics_cache_middleware');

function requireRole(role) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    if (req.user.role !== role && req.user.role !== 'headmistress') return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

router.get('/daily-revenue', cacheMiddleware, async (req, res, next) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
    const rows = await analytics.getDailyRevenue({ startDate: start, endDate: end });
    res.json({ data: rows });
  } catch (err) { next(err); }
});

router.get('/monthly-revenue', cacheMiddleware, async (req, res, next) => {
  try {
    const { start, end, limit } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end query params required (YYYY-MM-DD)' });
    const rows = await analytics.getMonthlyRevenueByMistress({ monthStart: start, monthEnd: end, limit: parseInt(limit || '50', 10) });
    res.json({ data: rows });
  } catch (err) { next(err); }
});

router.get('/cohort', cacheMiddleware, async (req, res, next) => {
  try {
    const weeks = parseInt(req.query.weeks || '12', 10);
    const matrix = await analytics.getCohortRetention({ weeks });
    res.json({ data: matrix });
  } catch (err) { next(err); }
});

router.get('/kpis', cacheMiddleware, async (req, res, next) => {
  try {
    const { since } = req.query;
    if (!since) return res.status(400).json({ error: 'since query param required (YYYY-MM-DD)' });
    const kpis = await analytics.getPlatformKPIs({ since });
    res.json({ data: kpis });
  } catch (err) { next(err); }
});

router.post('/refresh', requireRole('admin'), async (req, res, next) => {
  try {
    // run refresh asynchronously so request returns quickly
    analytics.refreshMaterializedViews()
      .then(() => console.log('Analytics views refreshed'))
      .catch(err => console.error('Refresh failed', err));
    res.status(202).json({ status: 'accepted', message: 'Refresh started' });
  } catch (err) { next(err); }
});

module.exports = router;
