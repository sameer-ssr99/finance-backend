const express = require('express');
const dashboardService = require('../services/dashboardService');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const { success } = require('../utils/response');

const router = express.Router();

// Analyst and Admin only routes
router.use(authMiddleware, roleGuard(['analyst', 'admin']));

// Summary: GET /api/dashboard/summary
router.get('/summary', (req, res, next) => {
  try {
    const summary = dashboardService.getSummary();
    return success(res, summary);
  } catch (err) {
    next(err);
  }
});

// By category: GET /api/dashboard/by-category
router.get('/by-category', (req, res, next) => {
  try {
    const categories = dashboardService.getByCategory();
    return success(res, categories);
  } catch (err) {
    next(err);
  }
});

// Trends: GET /api/dashboard/trends
router.get('/trends', (req, res, next) => {
  try {
    const trends = dashboardService.getTrends();
    return success(res, trends);
  } catch (err) {
    next(err);
  }
});

// Recent: GET /api/dashboard/recent
router.get('/recent', (req, res, next) => {
  try {
    const recent = dashboardService.getRecent();
    return success(res, recent);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
