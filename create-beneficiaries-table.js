const pool = require('./db-mysql');

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('Creating beneficiaries table in MySQL...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS beneficiaries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        userId INT NOT NULL,
        name VARCHAR(255) NOT NULL,
        accountNumber VARCHAR(100) NOT NULL,
        accountType ENUM('savings', 'current', 'overdraft') NOT NULL DEFAULT 'savings',
        ifscCode VARCHAR(11) NOT NULL,
        beneficiaryType ENUM('within_bank', 'other_bank') NOT NULL DEFAULT 'other_bank',
        status ENUM('pending', 'active') DEFAULT 'pending',
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        activatedAt TIMESTAMP NULL,
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Beneficiaries table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  }
})();
