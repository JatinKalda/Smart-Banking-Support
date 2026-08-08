const pool = require('./db-mysql');

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [users] = await connection.query('SELECT id, firstName, lastName, email, role FROM users');
    console.log('Registered Users in database:');
    console.log(JSON.stringify(users, null, 2));
    process.exit(0);
  } catch (error) {
    console.error('Error querying users:', error.message);
    process.exit(1);
  }
})();
