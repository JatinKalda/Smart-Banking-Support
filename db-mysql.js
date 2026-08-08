require('dotenv').config();
const mysql = require('mysql2/promise');

// MySQL Connection Pool Configuration
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'hsbc_user',
  password: process.env.DB_PASSWORD || 'hsbc123',
  database: process.env.DB_NAME || 'hsbc_bank',
  port: Number(process.env.DB_PORT || 3306),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection and verify database is ready
async function initializeDatabase() {
  let connection;
  try {
    connection = await pool.getConnection();
    
    // Test connection
    const result = await connection.query('SELECT 1');
    console.log('✅ MySQL Connection successful');
    
    // Verify users table exists
    const [tables] = await connection.query(
      `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank' AND TABLE_NAME = 'users'`
    );
    
    if (tables.length > 0) {
      console.log('✅ Users table verified');
    } else {
      console.log('⚠️  Users table not found - creating now...');
      
      await connection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          firstName VARCHAR(100) NOT NULL,
          lastName VARCHAR(100) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password VARCHAR(255) NOT NULL,
          role VARCHAR(20) DEFAULT 'user',
          createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      console.log('✅ Users table created');
    }
    
    console.log('✅ MySQL Database Ready');
    return true;
    
  } catch (error) {
    console.error('❌ Database Error:', error.message);
    console.error('Check your MySQL configuration:');
    console.error('- Host: localhost');
    console.error(`- User: ${process.env.DB_USER || 'hsbc_user'}`);
    console.error('- Password: configured in environment');
    console.error(`- Database: ${process.env.DB_NAME || 'hsbc_bank'}`);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

// Initialize on startup with delay
setTimeout(() => {
  initializeDatabase();
}, 1000);

module.exports = pool;
