const express = require('express');
const { body } = require('express-validator');
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const roleGuard = require('../middleware/roleGuard');
const validate = require('../middleware/validate');
const { success } = require('../utils/response');

const router = express.Router();

// Admin only routes
router.use(authMiddleware, roleGuard(['admin']));

// List all users: GET /api/users
router.get('/', (req, res, next) => {
  try {
    const users = userService.getAllUsers();
    return success(res, users);
  } catch (err) {
    next(err);
  }
});

// Get single user: GET /api/users/:id
router.get('/:id', (req, res, next) => {
  try {
    const user = userService.getProfile(req.params.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
});

// Update role: PUT /api/users/:id/role
router.put(
  '/:id/role',
  [
    body('role').isIn(['admin', 'analyst', 'viewer']).withMessage('Invalid role'),
  ],
  validate,
  (req, res, next) => {
    try {
      userService.updateRole(req.params.id, req.body.role);
      return success(res, { message: 'Role updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// Toggle status: PUT /api/users/:id/status
router.put(
  '/:id/status',
  [
    body('status').isIn(['active', 'inactive']).withMessage('Invalid status'),
  ],
  validate,
  (req, res, next) => {
    try {
      userService.updateStatus(req.params.id, req.body.status);
      return success(res, { message: 'Status updated successfully' });
    } catch (err) {
      next(err);
    }
  }
);

// Delete user: DELETE /api/users/:id
router.delete('/:id', (req, res, next) => {
  try {
    userService.deleteUser(req.params.id);
    return success(res, { message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
