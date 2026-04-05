const Transaction = require('../models/Transaction');

const transactionService = {
  create: (transactionData) => {
    return Transaction.create(transactionData);
  },

  getById: (id) => {
    const transaction = Transaction.findById(id);
    if (!transaction) {
      const err = new Error('Transaction not found');
      err.status = 404;
      err.code = 'TRANSACTION_NOT_FOUND';
      throw err;
    }
    return transaction;
  },

  getAll: (filters, options) => {
    return Transaction.findAll(filters, options);
  },

  update: (id, transactionData) => {
    const updated = Transaction.update(id, transactionData);
    if (!updated) {
      const err = new Error('Transaction not found');
      err.status = 404;
      err.code = 'TRANSACTION_NOT_FOUND';
      throw err;
    }
    return true;
  },

  delete: (id) => {
    const deleted = Transaction.softDelete(id);
    if (!deleted) {
      const err = new Error('Transaction not found');
      err.status = 404;
      err.code = 'TRANSACTION_NOT_FOUND';
      throw err;
    }
    return true;
  },
};

module.exports = transactionService;
