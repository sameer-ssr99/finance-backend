/**
 * Standardized response formatters
 */

const success = (res, data, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
  });
};

const list = (res, data, meta, status = 200) => {
  return res.status(status).json({
    success: true,
    data,
    meta: {
      page: meta.page || 1,
      limit: meta.limit || 10,
      total: meta.total || 0,
    },
  });
};

const error = (res, code, message, status = 500) => {
  return res.status(status).json({
    success: false,
    error: {
      code,
      message,
    },
  });
};

module.exports = {
  success,
  list,
  error,
};
