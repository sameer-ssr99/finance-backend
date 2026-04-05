const jwt = require('jsonwebtoken');
const { error } = require('../utils/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return error(res, 'UNAUTHORIZED', 'Authentication token is missing or invalid', 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_super_secret_key_min_32_chars');
    req.user = decoded;
    next();
  } catch (err) {
    return error(res, 'UNAUTHORIZED', 'Invalid or expired authentication token', 401);
  }
};

module.exports = authMiddleware;
