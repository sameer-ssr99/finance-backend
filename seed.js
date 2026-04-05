const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

/**
 * Database Seeder
 */
const seed = async () => {
  console.log('Starting database seeding...');

  try {
    // 1. Clear existing data
    db.prepare('DELETE FROM transactions').run();
    db.prepare('DELETE FROM users').run();
    db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('users', 'transactions')").run();

    console.log('Cleared existing data.');

    // 2. Create Users
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('Admin@123', salt);
    const analystPassword = await bcrypt.hash('Analyst@123', salt);
    const viewerPassword = await bcrypt.hash('Viewer@123', salt);

    const userStmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, status)
      VALUES (?, ?, ?, ?, ?)
    `);

    const admin = userStmt.run('Admin User', 'admin@finance.com', adminPassword, 'admin', 'active');
    const analyst = userStmt.run('Analyst User', 'analyst@finance.com', analystPassword, 'analyst', 'active');
    const viewer = userStmt.run('Viewer User', 'viewer@finance.com', viewerPassword, 'viewer', 'active');

    const adminId = admin.lastInsertRowid;

    console.log('Created users: admin, analyst, viewer.');

    // 3. Create 20 Transactions
    const categories = ['Salary', 'Rent', 'Food', 'Utilities', 'Investment', 'Healthcare', 'Freelance', 'Transport'];
    const types = ['income', 'expense'];
    
    const transactionStmt = db.prepare(`
      INSERT INTO transactions (amount, type, category, date, notes, created_by)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const today = new Date();
    for (let i = 0; i < 20; i++) {
      const type = i % 4 === 0 ? 'income' : 'expense'; // 1 income for every 3 expenses
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Fixed income categories for realism
      const finalCategory = type === 'income' ? (Math.random() > 0.5 ? 'Salary' : 'Freelance') : category;
      
      const amount = type === 'income' 
        ? Math.floor(Math.random() * 5000) + 2000 
        : Math.floor(Math.random() * 500) + 50;

      // Dates spread across last 6 months
      const date = new Date();
      date.setMonth(today.getMonth() - Math.floor(Math.random() * 6));
      date.setDate(Math.floor(Math.random() * 28) + 1);
      const dateString = date.toISOString().split('T')[0];

      transactionStmt.run(
        amount,
        type,
        finalCategory,
        dateString,
        `Sample ${type} for ${finalCategory}`,
        adminId
      );
    }

    console.log('Created 20 sample transactions.');
    console.log('Seeding completed successfully.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seed();
