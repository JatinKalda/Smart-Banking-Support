const express = require('express');
const { pool } = require('./db-mysql');

const router = express.Router();

// Get all transactions for a user
router.get('/api/transactions', async (req, res) => {
    try {
        const user = req.body.user || req.session?.user;
        
        if (!user && !req.query.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const userId = req.query.userId || user?.id;
        
        const connection = await pool.getConnection();
        const [transactions] = await connection.query(
            'SELECT * FROM transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT 50',
            [userId]
        );
        connection.release();

        res.json({
            success: true,
            transactions: transactions
        });
    } catch (error) {
        console.error('Error fetching transactions:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching transactions',
            error: error.message 
        });
    }
});

// Get transaction by ID
router.get('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [transactions] = await connection.query(
            'SELECT * FROM transactions WHERE id = ?',
            [id]
        );
        connection.release();

        if (transactions.length === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({
            success: true,
            transaction: transactions[0]
        });
    } catch (error) {
        console.error('Error fetching transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching transaction',
            error: error.message 
        });
    }
});

// Create a new transaction (for transfers, payments)
router.post('/api/transactions', async (req, res) => {
    try {
        const { userId, type, amount, description, recipientId, reference } = req.body;

        if (!userId || !type || !amount || amount <= 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid transaction data' 
            });
        }

        const connection = await pool.getConnection();
        
        // Get current balance (simplified - in real app, track separate balance table)
        const [userTransactions] = await connection.query(
            'SELECT SUM(CASE WHEN type = "credit" THEN amount ELSE -amount END) as balance FROM transactions WHERE userId = ?',
            [userId]
        );

        const currentBalance = (userTransactions[0]?.balance || 0) + 5000; // Assume starting balance of $5000

        // Insert transaction
        const [result] = await connection.query(
            `INSERT INTO transactions (userId, type, amount, description, recipientId, reference, balanceAfter, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, 'completed')`,
            [userId, type, amount, description, recipientId, reference, currentBalance - amount]
        );

        connection.release();

        res.json({
            success: true,
            message: 'Transaction created successfully',
            transactionId: result.insertId
        });
    } catch (error) {
        console.error('Error creating transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error creating transaction',
            error: error.message 
        });
    }
});

// Get transaction statistics for a user
router.get('/api/transactions/stats/monthly', async (req, res) => {
    try {
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ success: false, message: 'userId required' });
        }

        const connection = await pool.getConnection();
        const [stats] = await connection.query(
            `SELECT 
                DATE_FORMAT(createdAt, '%Y-%m') as month,
                type,
                COUNT(*) as count,
                SUM(amount) as total
             FROM transactions 
             WHERE userId = ?
             GROUP BY month, type
             ORDER BY month DESC
             LIMIT 12`,
            [userId]
        );
        connection.release();

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching statistics',
            error: error.message 
        });
    }
});

// Delete transaction (admin only)
router.delete('/api/transactions/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const connection = await pool.getConnection();
        const [result] = await connection.query(
            'DELETE FROM transactions WHERE id = ?',
            [id]
        );
        connection.release();

        if (result.affectedRows === 0) {
            return res.status(404).json({ success: false, message: 'Transaction not found' });
        }

        res.json({
            success: true,
            message: 'Transaction deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting transaction:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting transaction',
            error: error.message 
        });
    }
});

module.exports = { router };
