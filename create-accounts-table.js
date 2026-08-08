const pool = require('./db-mysql');

async function createAccountsTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('📋 Creating accounts table...');

    // Create accounts table with unique constraint on userId
    await connection.query(`
      CREATE TABLE IF NOT EXISTS accounts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL UNIQUE,
        balance DECIMAL(15, 2) NOT NULL DEFAULT 5000.00,
        status ENUM('active', 'frozen', 'closed') NOT NULL DEFAULT 'active',
        lastTransactionAt TIMESTAMP NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_userId (userId),
        INDEX idx_status (status)
      )
    `);

    console.log('✅ Accounts table created');

    // Migrate existing transactions to populate accounts with computed balances
    console.log('📊 Populating accounts from existing transactions...');
    const [users] = await connection.query('SELECT DISTINCT userId FROM transactions WHERE userId IS NOT NULL');
    
    for (const { userId } of users) {
      const [balanceResult] = await connection.query(
        `SELECT SUM(CASE WHEN type = 'credit' THEN amount ELSE -amount END) as balance 
         FROM transactions WHERE userId = ?`,
        [userId]
      );
      const computedBalance = (parseFloat(balanceResult[0]?.balance) || 0) + 5000;
      
      try {
        await connection.query(
          'INSERT INTO accounts (userId, balance, status) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE balance = ?',
          [userId, computedBalance.toFixed(2), 'active', computedBalance.toFixed(2)]
        );
        console.log(`  ✓ User ${userId}: balance = $${computedBalance.toFixed(2)}`);
      } catch (e) {
        console.log(`  ⚠️  User ${userId}: ${e.message}`);
      }
    }

    // Add accounts for all other users with default balance
    console.log('📋 Adding default accounts for remaining users...');
    await connection.query(`
      INSERT IGNORE INTO accounts (userId, balance, status)
      SELECT id, 5000.00, 'active' FROM users
    `);

    console.log('✅ Accounts table populated');

    // Verify
    const [count] = await connection.query('SELECT COUNT(*) as cnt FROM accounts');
    console.log(`📊 Total accounts: ${count[0].cnt}`);

    connection.release();
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (connection) connection.release();
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

createAccountsTable();
