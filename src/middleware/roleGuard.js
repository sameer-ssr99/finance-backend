const { error } = require('../utils/response');

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of roles allowed to access the route
 */
const roleGuard = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return error(res, 'UNAUTHORIZED', 'User not authenticated', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return error(res, 'FORBIDDEN', 'You do not have permission to perform this action', 403);
    }

    if (req.user.status !== 'active') {
      return error(res, 'FORBIDDEN', 'User account is inactive', 403);
    }

    next();
  };
};

module.exports = roleGuard;
