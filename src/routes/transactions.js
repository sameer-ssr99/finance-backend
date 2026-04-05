const express = require('express');
const { body, query } = require('express-validator');
const transactionService = require('../services/transactionService');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { success, list } = require('../utils/response');

const router = express.Router();

// Auth required for all transaction routes
router.use(authMiddleware);

// List transactions: GET /api/transactions
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('type').optional().isIn(['income', 'expense']).withMessage('Invalid type'),
    query('startDate').optional().isISO8601().withMessage('Invalid start date'),
    query('endDate').optional().isISO8601().withMessage('Invalid end date'),
  ],
  validate,
  (req, res, next) => {
    try {
      const filters = {
        type: req.query.type,
        category: req.query.category,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        search: req.query.search,
      };

      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };

      const { data, total } = transactionService.getAll(filters, options);
      return list(res, data, { ...options, total });
    } catch (err) {
      next(err);
    }
  }
);

// Get single transaction: GET /api/transactions/:id
router.get('/:id', (req, res, next) => {
  try {
    const transaction = transactionService.getById(req.params.id);
    return success(res, transaction);
  } catch (err) {
    next(err);
  }
});

// Admin-only routes for modifications
const adminGuard = roleGuard(['admin']);

// Create transaction: POST /api/transactions
router.post(
  '/',
  adminGuard,
  [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').notEmpty().withMessage('Category is required'),
    body('date').isISO8601().withMessage('Date must be a valid ISO format'),
    body('notes').optional().isString(),
  ],
  validate,
  (req, res, next) => {
    try {
      const transactionData = {
        ...req.body,
        created_by: req.user.id,
      };
      const transaction = transactionService.create(transactionData);
      return success(res, transaction, 201);
    } catch (err) {
      next(err);
    }
  }
);

// Update transaction: PUT /api/transactions/:id
router.put(
  '/:id',
  adminGuard,
  [
    body('amount').optional().isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('type').optional().isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    body('category').optional().notEmpty().withMessage('Category is required'),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO format'),
    body('notes').optional().isString(),
  ],
  validate,
  (req, res, next) => {
    try {
      transactionService.update(req.params.id, req.body);
      return success(res, { message: 'Transaction updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// Soft delete: DELETE /api/transactions/:id
router.delete('/:id', adminGuard, (req, res, next) => {
  try {
    transactionService.delete(req.params.id);
    return success(res, { message: 'Transaction deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
