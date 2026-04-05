const express = require('express');
const { body } = require('express-validator');
const userService = require('../services/userService');
const authMiddleware = require('../middleware/auth');
const validate = require('../middleware/validate');
const { success } = require('../utils/response');

const router = express.Router();

// Register: POST /api/auth/register
router.post(
  '/register',
  [
    body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const user = await userService.register(req.body);
      return success(res, user, 201);
    } catch (err) {
      next(err);
    }
  }
);

// Login: POST /api/auth/login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validate,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await userService.login(email, password);
      return success(res, result);
    } catch (err) {
      next(err);
    }
  }
);

// Me: GET /api/auth/me
router.get('/me', authMiddleware, (req, res, next) => {
  try {
    const user = userService.getProfile(req.user.id);
    return success(res, user);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
