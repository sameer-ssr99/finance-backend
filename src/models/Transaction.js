const db = require('../config/db');

const Transaction = {
  create: (transactionData) => {
    const { amount, type, category, date, notes, created_by } = transactionData;
    const stmt = db.prepare(`
      INSERT INTO transactions (amount, type, category, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(amount, type, category, date, notes, created_by);
    return { id: info.lastInsertRowid, ...transactionData };
  },

  findById: (id) => {
    const stmt = db.prepare(`
      SELECT t.*, u.name as creator_name
      FROM transactions t
      JOIN users u ON t.created_by = u.id
      WHERE t.id = ? AND t.is_deleted = 0
    `);
    return stmt.get(id);
  },

  findAll: (filters = {}, options = {}) => {
    const { type, category, startDate, endDate, search } = filters;
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    let query = 'SELECT t.*, u.name as creator_name FROM transactions t JOIN users u ON t.created_by = u.id WHERE t.is_deleted = 0';
    let countQuery = 'SELECT COUNT(*) as total FROM transactions t WHERE t.is_deleted = 0';
    const params = [];
    const countParams = [];

    if (type) {
      query += ' AND t.type = ?';
      countQuery += ' AND t.type = ?';
      params.push(type);
      countParams.push(type);
    }

    if (category) {
      query += ' AND t.category = ?';
      countQuery += ' AND t.category = ?';
      params.push(category);
      countParams.push(category);
    }

    if (startDate) {
      query += ' AND t.date >= ?';
      countQuery += ' AND t.date >= ?';
      params.push(startDate);
      countParams.push(startDate);
    }

    if (endDate) {
      query += ' AND t.date <= ?';
      countQuery += ' AND t.date <= ?';
      params.push(endDate);
      countParams.push(endDate);
    }

    if (search) {
      query += ' AND (t.notes LIKE ? OR t.category LIKE ?)';
      countQuery += ' AND (t.notes LIKE ? OR t.category LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
      countParams.push(`%${search}%`, `%${search}%`);
    }

    // Pagination
    query += ' ORDER BY t.date DESC, t.id DESC LIMIT ? OFFSET ?';
    params.push(Number(limit), Number(offset));

    const total = db.prepare(countQuery).get(...countParams).total;
    const data = db.prepare(query).all(...params);

    return { data, total };
  },

  update: (id, transactionData) => {
    const { amount, type, category, date, notes } = transactionData;
    const stmt = db.prepare(`
      UPDATE transactions
      SET amount = ?, type = ?, category = ?, date = ?, notes = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND is_deleted = 0
    `);
    const info = stmt.run(amount, type, category, date, notes, id);
    return info.changes > 0;
  },

  softDelete: (id) => {
    const stmt = db.prepare('UPDATE transactions SET is_deleted = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
};

module.exports = Transaction;
