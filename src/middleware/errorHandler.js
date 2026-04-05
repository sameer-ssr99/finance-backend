const { error } = require('../utils/response');

/**
 * Global error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error(err);

  const status = err.status || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'An unexpected error occurred';

  // Never expose stack traces in the response
  return error(res, code, message, status);
};

module.exports = errorHandler;
