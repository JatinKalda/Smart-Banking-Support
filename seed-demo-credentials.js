const pool = require('./db-mysql');
const bcrypt = require('bcryptjs');

(async () => {
  let connection;
  try {
    connection = await pool.getConnection();

    const usersToSeed = [
      {
        firstName: 'Demo',
        lastName: 'User',
        email: 'user@smartbank.com',
        password: 'user1234',
        role: 'user'
      },
      {
        firstName: 'Admin',
        lastName: 'Manager',
        email: 'admin@smartbank.com',
        password: 'admin1234',
        role: 'admin'
      }
    ];

    for (const u of usersToSeed) {
      const hashedPassword = await bcrypt.hash(u.password, 10);
      const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [u.email]);

      if (existing.length > 0) {
        const userId = existing[0].id;
        await connection.query('UPDATE users SET firstName = ?, lastName = ?, password = ?, role = ? WHERE id = ?', [
          u.firstName,
          u.lastName,
          hashedPassword,
          u.role,
          userId
        ]);
        console.log(`✅ Updated existing ${u.role}: ${u.email} (Password: ${u.password})`);
      } else {
        const [inserted] = await connection.query(
          'INSERT INTO users (firstName, lastName, email, password, role) VALUES (?, ?, ?, ?, ?)',
          [u.firstName, u.lastName, u.email, hashedPassword, u.role]
        );
        const userId = inserted.insertId;
        console.log(`✅ Created ${u.role}: ${u.email} (Password: ${u.password})`);

        // Create initial checking & savings account for demo user if missing
        await connection.query(
          `INSERT INTO accounts (userId, accountNumber, accountType, balance, status) 
           VALUES (?, ?, 'checking', 215000.00, 'active'), (?, ?, 'savings', 545220.50, 'active')`,
          [userId, `ACC-${Date.now()}-1`, userId, `ACC-${Date.now()}-2`]
        );
      }
    }

    console.log('✅ Demo credentials successfully configured!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding credentials:', error);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
})();
