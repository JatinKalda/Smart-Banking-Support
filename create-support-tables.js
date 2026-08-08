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

async function createTables() {
    const connection = await pool.getConnection();
    try {
        console.log('Creating support tables...');
        
        // Support Tickets Table
        const ticketsSQL = `
            CREATE TABLE IF NOT EXISTS support_tickets (
                id INT AUTO_INCREMENT PRIMARY KEY,
                userId INT NOT NULL,
                subject VARCHAR(255) NOT NULL,
                description TEXT,
                priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
                status ENUM('open', 'in-progress', 'resolved', 'closed') DEFAULT 'open',
                assignedTo INT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolvedAt TIMESTAMP NULL,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                INDEX idx_priority (priority)
            );
        `;

        // Chat Messages Table
        const messagesSQL = `
            CREATE TABLE IF NOT EXISTS chat_messages (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ticketId INT,
                userId INT,
                agentId INT,
                senderType ENUM('user', 'agent', 'system') DEFAULT 'user',
                message TEXT NOT NULL,
                attachmentUrl VARCHAR(255),
                isRead BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ticketId) REFERENCES support_tickets(id) ON DELETE CASCADE,
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                INDEX idx_ticketId (ticketId),
                INDEX idx_userId (userId),
                INDEX idx_createdAt (createdAt)
            );
        `;

        await connection.query(ticketsSQL);
        console.log('✓ Support tickets table created successfully!');

        await connection.query(messagesSQL);
        console.log('✓ Chat messages table created successfully!');

        // Verify tables exist
        const [tables] = await connection.query(
            "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = 'hsbc_bank' AND TABLE_NAME IN ('support_tickets', 'chat_messages')"
        );

        if (tables.length > 0) {
            console.log(`✓ Verified: ${tables.length} tables exist`);
        }

    } catch (error) {
        if (error.code === 'ER_TABLE_EXISTS_ERROR') {
            console.log('✓ Tables already exist');
        } else {
            console.error('Error creating support tables:', error.message);
        }
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the function
createTables().catch(console.error);
