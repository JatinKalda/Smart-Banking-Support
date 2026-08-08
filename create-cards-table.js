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

async function createCardsTable() {
    const connection = await pool.getConnection();
    try {
        console.log('Creating cards table...');
        
        const createTableSQL = `
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
                provider ENUM('Visa', 'Mastercard', 'AmEx') DEFAULT 'Visa',
                spendingLimit DECIMAL(10, 2),
                dailyLimit DECIMAL(10, 2),
                isDefault BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_userId (userId),
                INDEX idx_status (status)
            );
        `;

        await connection.query(createTableSQL);
        console.log('✓ Cards table created successfully!');

        // Check if table exists
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank' AND TABLE_NAME = 'cards'"
        );

        if (tables.length > 0) {
            console.log('✓ Verified: cards table exists');
        }

    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('✓ Cards table already exists');
        } else {
            console.error('Error creating cards table:', error.message);
        }
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the function
createCardsTable().catch(console.error);
