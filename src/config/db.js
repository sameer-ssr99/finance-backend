const Database = require('better-sqlite3');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const dbPath = path.resolve(__dirname, '../../', process.env.DATABASE_URL || 'database.sqlite');
const db = new Database(dbPath);

/**
 * Initialize database schema
 */
const initDB = () => {
  // Users table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT CHECK(role IN ('admin','analyst','viewer')) DEFAULT 'viewer',
      status TEXT CHECK(status IN ('active','inactive')) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  // Transactions table
  db.prepare(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL CHECK(amount > 0),
      type TEXT CHECK(type IN ('income','expense')) NOT NULL,
      category TEXT NOT NULL,
      date TEXT NOT NULL,
      notes TEXT,
      created_by INTEGER REFERENCES users(id),
      is_deleted INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `).run();

  console.log('Database initialized successfully');
};

initDB();

module.exports = db;
