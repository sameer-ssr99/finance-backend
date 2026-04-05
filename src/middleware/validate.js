const { validationResult } = require('express-validator');
const { error } = require('../utils/response');

/**
 * Handle validation errors from express-validator
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: errors.array().map((err) => ({
          field: err.param,
          message: err.msg,
        })),
      },
    });
  }
  next();
};

module.exports = validate;
