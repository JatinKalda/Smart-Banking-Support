/**
 * Unified database setup — creates all required tables and seeds defaults.
 * Run: node setup-database.js
 */
require('dotenv').config();
const pool = require('./db-mysql');

async function columnExists(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return rows.length > 0;
}

async function setup() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Setting up HSBC Bank database...\n');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firstName VARCHAR(100) NOT NULL,
        lastName VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user',
        phone VARCHAR(20),
        twoFaEnabled BOOLEAN DEFAULT FALSE,
        emailNotifications BOOLEAN DEFAULT TRUE,
        smsNotifications BOOLEAN DEFAULT TRUE,
        pushNotifications BOOLEAN DEFAULT FALSE,
        email2fa BOOLEAN DEFAULT TRUE,
        sms2fa BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('users table ready');

    const userColumns = [
      ['role', "VARCHAR(20) DEFAULT 'user'"],
      ['phone', 'VARCHAR(20)'],
      ['twoFaEnabled', 'BOOLEAN DEFAULT FALSE'],
      ['emailNotifications', 'BOOLEAN DEFAULT TRUE'],
      ['smsNotifications', 'BOOLEAN DEFAULT TRUE'],
      ['pushNotifications', 'BOOLEAN DEFAULT FALSE'],
      ['email2fa', 'BOOLEAN DEFAULT TRUE'],
      ['sms2fa', 'BOOLEAN DEFAULT FALSE']
    ];
    for (const [col, def] of userColumns) {
      if (!(await columnExists(connection, 'users', col))) {
        await connection.query(`ALTER TABLE users ADD COLUMN ${col} ${def}`);
        console.log(`  added users.${col}`);
      }
    }

    // Drop legacy accounts table to clean up constraint
    await connection.query('DROP TABLE IF EXISTS chat_messages');
    await connection.query('DROP TABLE IF EXISTS transactions');
    await connection.query('DROP TABLE IF EXISTS cards');
    await connection.query('DROP TABLE IF EXISTS support_tickets');
    await connection.query('DROP TABLE IF EXISTS notifications');
    await connection.query('DROP TABLE IF EXISTS accounts');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        accountNumber VARCHAR(30) NOT NULL UNIQUE,
        accountType ENUM('savings', 'checking', 'fixed', 'recurring') NOT NULL DEFAULT 'savings',
        balance DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
        status ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
        lastTransactionAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('accounts table ready');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type ENUM('credit', 'debit', 'transfer', 'payment') NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        description VARCHAR(255),
        status ENUM('pending', 'completed', 'failed') DEFAULT 'completed',
        recipientId INT,
        balanceAfter DECIMAL(12, 2),
        reference VARCHAR(255),
        notes TEXT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('transactions table ready');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        cardType ENUM('debit', 'credit', 'virtual') DEFAULT 'debit',
        cardName VARCHAR(255),
        lastFour VARCHAR(4),
        cardNumber VARCHAR(19),
        expiryDate VARCHAR(5),
        cvv VARCHAR(4),
        cardholderName VARCHAR(255),
        status ENUM('active', 'blocked', 'expired', 'cancelled') DEFAULT 'active',
        provider VARCHAR(50) DEFAULT 'Visa',
        spendingLimit DECIMAL(10, 2),
        dailyLimit DECIMAL(10, 2),
        monthlyLimit DECIMAL(10, 2),
        isDefault BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    if (!(await columnExists(connection, 'cards', 'monthlyLimit'))) {
      await connection.query('ALTER TABLE cards ADD COLUMN monthlyLimit DECIMAL(10, 2)');
    }
    console.log('cards table ready');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        subject VARCHAR(255) NOT NULL,
        description TEXT,
        priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
        status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
        assignedTo INT,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        resolvedAt TIMESTAMP NULL,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('support_tickets table ready');

    await connection.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        type ENUM('email', 'sms', 'push', 'in-app') DEFAULT 'in-app',
        title VARCHAR(255) NOT NULL,
        message TEXT,
        metadata JSON,
        isRead BOOLEAN DEFAULT FALSE,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('notifications table ready');

    const [allUsers] = await connection.query('SELECT id, firstName FROM users');
    for (const u of allUsers) {
      const [accs] = await connection.query('SELECT id FROM accounts WHERE userId = ?', [u.id]);
      if (accs.length === 0) {
        let savBal = 545220.50;
        let curBal = 215000.00;
        let fixBal = 300000.00;
        let recBal = 85000.00;

        if (u.id !== 1 && !u.firstName.toLowerCase().includes('jatin')) {
          savBal = 12500.00;
          curBal = 3200.00;
          fixBal = 50000.00;
          recBal = 10000.00;
        }

        await connection.query(
          'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, ?, ?)',
          [u.id, `1234 5678 90${u.id} 3456`, 'savings', savBal, 'active']
        );
        await connection.query(
          'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, ?, ?)',
          [u.id, `2345 6789 90${u.id} 4567`, 'checking', curBal, 'active']
        );
        await connection.query(
          'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, ?, ?)',
          [u.id, `3456 7890 90${u.id} 5678`, 'fixed', fixBal, 'active']
        );
        await connection.query(
          'INSERT INTO accounts (userId, accountNumber, accountType, balance, status) VALUES (?, ?, ?, ?, ?)',
          [u.id, `4567 8901 90${u.id} 6789`, 'recurring', recBal, 'active']
        );
      }
    }

    const [admins] = await connection.query("SELECT id FROM users WHERE role = 'admin' LIMIT 1");
    if (admins.length === 0) {
      const [users] = await connection.query('SELECT id FROM users ORDER BY id ASC LIMIT 1');
      if (users.length > 0) {
        await connection.query("UPDATE users SET role = 'admin' WHERE id = ?", [users[0].id]);
        console.log(`Promoted user #${users[0].id} to admin`);
      }
    }

    const [ticketCount] = await connection.query('SELECT COUNT(*) as cnt FROM support_tickets');
    if (ticketCount[0].cnt === 0) {
      const [sampleUsers] = await connection.query('SELECT id, firstName, lastName FROM users LIMIT 2');
      if (sampleUsers.length >= 1) {
        await connection.query(
          `INSERT INTO support_tickets (userId, subject, description, priority, status) VALUES
           (?, 'Cannot login to account', 'Getting invalid password error after reset.', 'high', 'in-progress'),
           (?, 'Transaction issue', 'Transfer shows pending for 24 hours.', 'medium', 'open')`,
          [sampleUsers[0].id, sampleUsers.length > 1 ? sampleUsers[1].id : sampleUsers[0].id]
        );
        console.log('Seeded sample support tickets');
      }
    }

    const [counts] = await connection.query(`
      SELECT
        (SELECT COUNT(*) FROM users) as users,
        (SELECT COUNT(*) FROM accounts) as accounts,
        (SELECT COUNT(*) FROM transactions) as transactions,
        (SELECT COUNT(*) FROM cards) as cards,
        (SELECT COUNT(*) FROM support_tickets) as tickets
    `);
    console.log('\nDatabase ready:', counts[0]);
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
    process.exit(0);
  }
}

setup();
