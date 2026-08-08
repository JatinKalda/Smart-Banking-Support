const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'hsbc_user',
    password: 'hsbc123',
    database: 'hsbc_bank',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function addTwoFAColumn() {
    const connection = await pool.getConnection();
    try {
        console.log('Adding 2FA column to users table...');
        
        // Check if column exists
        const [columns] = await connection.query(
            "SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'twoFaEnabled'"
        );

        if (columns.length === 0) {
            // Column doesn't exist, add it
            await connection.query(
                'ALTER TABLE users ADD COLUMN twoFaEnabled BOOLEAN DEFAULT FALSE'
            );
            console.log('✓ Added twoFaEnabled column');
        } else {
            console.log('✓ twoFaEnabled column already exists');
        }

    } catch (error) {
        console.error('Error adding 2FA column:', error.message);
    } finally {
        await connection.release();
        await pool.end();
    }
}

addTwoFAColumn().catch(console.error);
