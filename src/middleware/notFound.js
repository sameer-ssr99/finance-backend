const { error } = require('../utils/response');

/**
 * Middleware to handle unmatched routes
 */
const notFound = (req, res, next) => {
  return error(res, 'NOT_FOUND', 'Route not found', 404);
};

module.exports = notFound;
