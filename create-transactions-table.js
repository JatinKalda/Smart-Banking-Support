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

async function createTransactionsTable() {
    const connection = await pool.getConnection();
    try {
        console.log('Creating transactions table...');
        
        const createTableSQL = `
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
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_userId (userId),
                INDEX idx_createdAt (createdAt)
            );
        `;

        await connection.query(createTableSQL);
        console.log('✓ Transactions table created successfully!');

        // Check if table exists
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank' AND TABLE_NAME = 'transactions'"
        );

        if (tables.length > 0) {
            console.log('✓ Verified: transactions table exists');
        }

    } catch (error) {
        console.error('Error creating transactions table:', error.message);
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the function
createTransactionsTable().catch(console.error);
