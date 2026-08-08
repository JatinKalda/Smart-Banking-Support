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

async function addSampleCards() {
    const connection = await pool.getConnection();
    try {
        console.log('Adding sample cards...');

        // Get first user ID
        const [users] = await connection.query('SELECT id FROM users LIMIT 1');
        
        if (users.length === 0) {
            console.log('No users found. Please create a user first.');
            return;
        }

        const userId = users[0].id;
        console.log('Adding cards for userId:', userId);

        const sampleCards = [
            {
                cardType: 'debit',
                cardName: 'HSBC Debit Card',
                lastFour: '4532',
                cardNumber: '4532123456784532',
                expiryDate: '12/26',
                cardholderName: 'Test User',
                provider: 'Visa',
                spendingLimit: 5000.00,
                dailyLimit: 500.00,
                isDefault: 1
            },
            {
                cardType: 'credit',
                cardName: 'HSBC Cash Back Credit',
                lastFour: '5678',
                cardNumber: '5678123456785678',
                expiryDate: '08/25',
                cardholderName: 'Test User',
                provider: 'Mastercard',
                spendingLimit: 20000.00,
                dailyLimit: 5000.00,
                isDefault: 0
            },
            {
                cardType: 'virtual',
                cardName: 'HSBC Virtual Card',
                lastFour: '9012',
                cardNumber: '3782822463100005',
                expiryDate: '06/27',
                cardholderName: 'Test User',
                provider: 'AmEx',
                spendingLimit: 1000.00,
                dailyLimit: 500.00,
                isDefault: 0
            }
        ];

        for (const card of sampleCards) {
            const [result] = await connection.query(
                `INSERT INTO cards (userId, cardType, cardName, lastFour, cardNumber, expiryDate, cardholderName, provider, spendingLimit, dailyLimit, isDefault)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [userId, card.cardType, card.cardName, card.lastFour, card.cardNumber, card.expiryDate, 
                 card.cardholderName, card.provider, card.spendingLimit, card.dailyLimit, card.isDefault]
            );

            console.log(`✓ Added card: ${card.cardName}`);
        }

        console.log('\n✓ All sample cards added successfully!');
        console.log(`Total cards added: ${sampleCards.length}`);

    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            console.log('Cards already exist');
        } else {
            console.error('Error adding sample cards:', error.message);
        }
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the function
addSampleCards().catch(console.error);
