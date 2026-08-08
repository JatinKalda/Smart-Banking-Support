const pool = require('./db-mysql');
const bcrypt = require('bcryptjs');

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    const email = 'testuser@example.com';
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Check if user exists
    const [rows] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (rows.length > 0) {
      await connection.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, email]);
      console.log(`✅ Updated password of existing user: ${email} to ${password}`);
    } else {
      await connection.query(
        'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
        ['Test', 'User', email, hashedPassword, 'user']
      );
      console.log(`✅ Created test user: ${email} with password ${password}`);
    }
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
