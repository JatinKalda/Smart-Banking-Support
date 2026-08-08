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

async function addSampleTransactions() {
    const connection = await pool.getConnection();
    try {
        console.log('Adding sample transactions...');

        // Get first user ID (usually Pranit who is admin)
        const [users] = await connection.query('SELECT id FROM users LIMIT 1');
        
        if (users.length === 0) {
            console.log('No users found. Please create a user first.');
            return;
        }

        const userId = users[0].id;
        console.log('Adding transactions for userId:', userId);

        const sampleTransactions = [
            { type: 'credit', amount: 3500.00, description: 'Monthly Salary', recipientId: null },
            { type: 'debit', amount: 45.50, description: 'Grocery Store', recipientId: null },
            { type: 'debit', amount: 120.75, description: 'Online Shopping - Amazon', recipientId: null },
            { type: 'debit', amount: 60.00, description: 'Gas Station - Shell', recipientId: null },
            { type: 'debit', amount: 35.25, description: 'Restaurant - Pizza Palace', recipientId: null },
            { type: 'debit', amount: 85.00, description: 'Electricity Bill Payment', recipientId: null },
            { type: 'credit', amount: 250.00, description: 'Freelance Project Payment', recipientId: null },
            { type: 'debit', amount: 28.00, description: 'Movie Tickets', recipientId: null },
            { type: 'debit', amount: 100.00, description: 'Gym Membership', recipientId: null },
            { type: 'debit', amount: 75.00, description: 'Internet Bill', recipientId: null },
            { type: 'credit', amount: 500.00, description: 'Bonus Payment', recipientId: null },
            { type: 'debit', amount: 200.00, description: 'Car Insurance', recipientId: null },
            { type: 'transfer', amount: 150.00, description: 'Transfer to John', recipientId: null },
            { type: 'debit', amount: 50.00, description: 'Coffee & Snacks', recipientId: null },
            { type: 'payment', amount: 500.00, description: 'Credit Card Payment', recipientId: null }
        ];

        // Insert each transaction with different timestamps
        for (let i = 0; i < sampleTransactions.length; i++) {
            const txn = sampleTransactions[i];
            const daysAgo = Math.floor(Math.random() * 60) + 1; // Random within last 60 days
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            const [result] = await connection.query(
                `INSERT INTO transactions (userId, type, amount, description, recipientId, status, balanceAfter, createdAt)
                 VALUES (?, ?, ?, ?, ?, 'completed', 5000, ?)`,
                [userId, txn.type, txn.amount, txn.description, txn.recipientId, date]
            );

            console.log(`✓ Added transaction: ${txn.description}`);
        }

        console.log('\n✓ All sample transactions added successfully!');
        console.log(`Total transactions added: ${sampleTransactions.length}`);

    } catch (error) {
        console.error('Error adding sample transactions:', error.message);
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the function
addSampleTransactions().catch(console.error);
