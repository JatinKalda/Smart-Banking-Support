const mysql = require('mysql2/promise');

// Test connection directly
async function testConnection() {
  console.log('\n🔧 DIAGNOSTIC TEST - MySQL Connection\n');
  console.log('Testing connection parameters:');
  console.log('Host: localhost');
  console.log('User: hsbc_user');
  console.log('Password: hsbc123');
  console.log('Database: hsbc_bank\n');

  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'hsbc_user',
      password: 'hsbc123',
      database: 'hsbc_bank'
    });

    console.log('✅ Connection successful!\n');

    // Test 1: Check database
    console.log('--- TEST 1: Database Check ---');
    const [dbResult] = await connection.query('SELECT DATABASE() as current_db');
    console.log('Current Database:', dbResult[0].current_db);

    // Test 2: Check tables
    console.log('\n--- TEST 2: Tables Check ---');
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables in database:', tables);

    // Test 3: Check users table structure
    console.log('\n--- TEST 3: Users Table Structure ---');
    const [structure] = await connection.query('DESC users');
    console.log('Table structure:');
    structure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? '(NOT NULL)' : '(nullable)'}`);
    });

    // Test 4: Check existing data
    console.log('\n--- TEST 4: Existing Data ---');
    const [users] = await connection.query('SELECT * FROM users');
    console.log(`Total users: ${users.length}`);
    if (users.length > 0) {
      console.log('Users found:');
      users.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.firstName} ${user.lastName} (${user.email})`);
      });
    } else {
      console.log('❌ No users found in database!');
    }

    // Test 5: Test INSERT
    console.log('\n--- TEST 5: Test INSERT ---');
    const testEmail = `test_${Date.now()}@hsbc.com`;
    console.log(`Attempting to insert test user with email: ${testEmail}`);
    
    const [insertResult] = await connection.query(
      'INSERT INTO users (firstName, lastName, email, password) VALUES (?, ?, ?, ?)',
      ['Test', 'User', testEmail, 'testpass123']
    );
    
    console.log('✅ INSERT successful!');
    console.log('Inserted ID:', insertResult.insertId);

    // Test 6: Verify insert
    console.log('\n--- TEST 6: Verify Insert ---');
    const [verifyResult] = await connection.query(
      'SELECT * FROM users WHERE email = ?',
      [testEmail]
    );
    
    if (verifyResult.length > 0) {
      console.log('✅ Data retrieved from database:');
      console.log(verifyResult[0]);
    } else {
      console.log('❌ Could not retrieve inserted data!');
    }

    await connection.end();
    console.log('\n✅ All tests completed!\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Error code:', error.code);
    console.error('\nPossible causes:');
    console.error('1. MySQL service not running');
    console.error('2. Wrong credentials (user/password)');
    console.error('3. Database or table does not exist');
    console.error('4. Network/connection issue\n');
    process.exit(1);
  }
}

testConnection();
