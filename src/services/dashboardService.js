const db = require('../config/db');

const dashboardService = {
  getSummary: () => {
    const income = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'income' AND is_deleted = 0").get().total || 0;
    const expenses = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE type = 'expense' AND is_deleted = 0").get().total || 0;
    const count = db.prepare('SELECT COUNT(*) as total FROM transactions WHERE is_deleted = 0').get().total || 0;

    return {
      total_income: income,
      total_expenses: expenses,
      net_balance: income - expenses,
      total_transactions: count,
    };
  },

  getByCategory: () => {
    return db.prepare(`
      SELECT category, SUM(amount) as total, COUNT(*) as count
      FROM transactions
      WHERE is_deleted = 0
      GROUP BY category
      ORDER BY total DESC
    `).all();
  },

  getTrends: () => {
    return db.prepare(`
      SELECT strftime('%Y-%m', date) as month,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE is_deleted = 0
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `).all().reverse();
  },

  getRecent: () => {
    return db.prepare(`
      SELECT t.*, u.name as creator_name
      FROM transactions t
      JOIN users u ON t.created_by = u.id
      WHERE t.is_deleted = 0
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all();
  },
};

module.exports = dashboardService;
