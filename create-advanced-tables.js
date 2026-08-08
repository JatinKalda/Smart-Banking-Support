/**
 * Database Migration Script
 * Creates notification tables and adds new columns for extended features
 * 
 * Run with: node create-advanced-tables.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'hsbc_user',
    password: process.env.DB_PASSWORD || 'hsbc123',
    database: process.env.DB_NAME || 'hsbc_bank',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function createAdvancedTables() {
    const connection = await pool.getConnection();

    try {
        console.log('🔄 Creating advanced feature tables...\n');

        // 1. Add columns to users table for notifications
        console.log('📝 Adding notification columns to users table...');
        await connection.query(`
            ALTER TABLE users ADD COLUMN IF NOT EXISTS (
                phone VARCHAR(20),
                emailNotifications BOOLEAN DEFAULT TRUE,
                smsNotifications BOOLEAN DEFAULT TRUE,
                pushNotifications BOOLEAN DEFAULT FALSE,
                email2fa BOOLEAN DEFAULT TRUE,
                sms2fa BOOLEAN DEFAULT FALSE
            )
        `);
        console.log('✅ Users table updated\n');

        // 2. Create notifications table
        console.log('📝 Creating notifications table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                type ENUM('email', 'sms', 'push', 'in-app') DEFAULT 'in-app',
                title VARCHAR(255) NOT NULL,
                message TEXT,
                metadata JSON,
                isRead BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_createdAt (createdAt),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Notifications table created\n');

        // 3. Create chat sessions table
        console.log('📝 Creating chat sessions table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS chat_sessions (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                agentId INT,
                status ENUM('active', 'closed', 'waiting') DEFAULT 'active',
                startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                endTime TIMESTAMP NULL,
                rating INT,
                feedback TEXT,
                INDEX idx_userId (userId),
                INDEX idx_agentId (agentId),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (agentId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Chat sessions table created\n');

        // 4. Create audit logs table
        console.log('📝 Creating audit logs table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT,
                action VARCHAR(255) NOT NULL,
                details JSON,
                ipAddress VARCHAR(45),
                userAgent TEXT,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_createdAt (createdAt),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Audit logs table created\n');

        // 5. Create loans table
        console.log('📝 Creating loans table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS loans (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                rate DECIMAL(5, 2) NOT NULL,
                tenure INT NOT NULL,
                emiAmount DECIMAL(15, 2),
                paidAmount DECIMAL(15, 2) DEFAULT 0,
                status ENUM('pending', 'approved', 'rejected', 'active', 'closed', 'defaulted') DEFAULT 'pending',
                approvedBy INT,
                approvalDate TIMESTAMP NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (approvedBy) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Loans table created\n');

        // 6. Create bills table
        console.log('📝 Creating bills table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS bills (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                billName VARCHAR(255) NOT NULL,
                billAmount DECIMAL(15, 2) NOT NULL,
                dueDate DATE NOT NULL,
                billerName VARCHAR(255),
                billCategory ENUM('utility', 'credit_card', 'insurance', 'loan', 'other') DEFAULT 'other',
                status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
                paidOn TIMESTAMP NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_dueDate (dueDate),
                INDEX idx_status (status),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Bills table created\n');

        // 7. Create investments table
        console.log('📝 Creating investments table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS investments (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                investmentType ENUM('mutual_fund', 'stock', 'fd', 'bond', 'sip') DEFAULT 'mutual_fund',
                investmentName VARCHAR(255) NOT NULL,
                amount DECIMAL(15, 2) NOT NULL,
                currentValue DECIMAL(15, 2),
                returnPercentage DECIMAL(6, 2),
                riskLevel ENUM('low', 'medium', 'high') DEFAULT 'medium',
                purchaseDate DATE,
                targetDate DATE,
                status ENUM('active', 'matured', 'closed') DEFAULT 'active',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Investments table created\n');

        // 8. Create devices table (for device tracking)
        console.log('📝 Creating devices table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS devices (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                deviceName VARCHAR(255),
                deviceType ENUM('mobile', 'tablet', 'desktop') DEFAULT 'mobile',
                osType VARCHAR(50),
                ipAddress VARCHAR(45),
                isTrusted BOOLEAN DEFAULT FALSE,
                lastActiveAt TIMESTAMP,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Devices table created\n');

        // 9. Create feedback table
        console.log('📝 Creating feedback table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS feedback (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT,
                feedbackType ENUM('bug', 'feature_request', 'improvement', 'complaint', 'compliment') DEFAULT 'feedback',
                title VARCHAR(255) NOT NULL,
                description TEXT,
                rating INT,
                status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                resolvedAt TIMESTAMP NULL,
                INDEX idx_userId (userId),
                INDEX idx_status (status),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE SET NULL
            )
        `);
        console.log('✅ Feedback table created\n');

        // 10. Create beneficiaries table
        console.log('📝 Creating beneficiaries table...');
        await connection.query(`
            CREATE TABLE IF NOT EXISTS beneficiaries (
                id INT PRIMARY KEY AUTO_INCREMENT,
                userId INT NOT NULL,
                beneficiaryName VARCHAR(255) NOT NULL,
                beneficiaryEmail VARCHAR(255),
                beneficiaryPhone VARCHAR(20),
                accountNumber VARCHAR(50),
                bankCode VARCHAR(10),
                ifscCode VARCHAR(11),
                relationship VARCHAR(100),
                isVerified BOOLEAN DEFAULT FALSE,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_userId (userId),
                FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
            )
        `);
        console.log('✅ Beneficiaries table created\n');

        console.log('═══════════════════════════════════════');
        console.log('✅ All advanced tables created successfully!');
        console.log('═══════════════════════════════════════\n');

        console.log('📊 Created Tables:');
        console.log('  1. notifications - In-app/Email/SMS notification logs');
        console.log('  2. chat_sessions - Live chat session tracking');
        console.log('  3. audit_logs - User action audit trail');
        console.log('  4. loans - Loan management system');
        console.log('  5. bills - Bill payment system');
        console.log('  6. investments - Investment portfolio tracking');
        console.log('  7. devices - Device management & security');
        console.log('  8. feedback - Customer feedback system');
        console.log('  9. beneficiaries - Money transfer beneficiaries');
        console.log('  + Updated users table with notification preferences\n');

        console.log('🎉 Ready for Phase 4 Advanced Features!');

    } catch (error) {
        console.error('❌ Error creating tables:', error.message);
        process.exit(1);
    } finally {
        await connection.release();
        await pool.end();
    }
}

// Run the migration
createAdvancedTables();
