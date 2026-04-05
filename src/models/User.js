const db = require('../config/db');

const User = {
  create: (userData) => {
    const { name, email, password_hash, role = 'viewer', status = 'active' } = userData;
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, email, password_hash, role, status);
    return { id: info.lastInsertRowid, ...userData };
  },

  findByEmail: (email) => {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  },

  findById: (id) => {
    const stmt = db.prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  },

  findAll: () => {
    const stmt = db.prepare('SELECT id, name, email, role, status, created_at FROM users');
    return stmt.all();
  },

  updateRole: (id, role) => {
    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    const info = stmt.run(role, id);
    return info.changes > 0;
  },

  updateStatus: (id, status) => {
    const stmt = db.prepare('UPDATE users SET status = ? WHERE id = ?');
    const info = stmt.run(status, id);
    return info.changes > 0;
  },

  delete: (id) => {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    const info = stmt.run(id);
    return info.changes > 0;
  }
};

module.exports = User;
